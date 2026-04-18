import { Router } from 'express'
import { z } from 'zod'
import { query } from '../db.js'

const router = Router()

const DEPARTMENT_MAP = {
  accounts: 'Finance & Accounts',
  procurement: 'Procurement',
  store: 'Store / Warehouse',
}

function normalizeRisk(v) {
  const x = String(v || '').trim().toLowerCase()
  if (['low', 'medium', 'high', 'critical'].includes(x)) return x
  return 'medium'
}

function normalizeStatus(v, allowed, fallback) {
  const x = String(v || '').trim().toLowerCase()
  if (allowed.includes(x)) return x
  return fallback
}

router.get('/dashboard', async (_req, res, next) => {
  try {
    const [totals] = await query(
      `SELECT
         COUNT(*)::int AS findings_total,
         COUNT(*) FILTER (WHERE status IN ('open', 'in_progress'))::int AS findings_open,
         COUNT(*) FILTER (WHERE status = 'resolved')::int AS findings_resolved,
         COUNT(*) FILTER (WHERE risk_rating IN ('high', 'critical') AND status IN ('open', 'in_progress'))::int AS findings_high_open
       FROM ia_audit_findings`
    )

    const moduleRows = await query(
      `SELECT source_module,
              COUNT(*)::int AS finding_count,
              COUNT(*) FILTER (WHERE status IN ('open', 'in_progress'))::int AS open_count,
              COUNT(*) FILTER (WHERE risk_rating IN ('high', 'critical'))::int AS high_risk_count
       FROM ia_audit_findings
       GROUP BY source_module
       ORDER BY source_module`
    )

    const engagementRows = await query(
      `SELECT status, COUNT(*)::int AS count
       FROM ia_audit_engagements
       GROUP BY status`
    )

    const overdueRows = await query(
      `SELECT f.finding_ref,
              f.title,
              f.source_module,
              f.department_code,
              f.owner_name,
              f.due_date
       FROM ia_audit_findings f
       WHERE f.status IN ('open', 'in_progress')
         AND f.due_date IS NOT NULL
         AND f.due_date < CURRENT_DATE
       ORDER BY f.due_date ASC
       LIMIT 12`
    )

    const crossModuleSignals = {
      accounts: await query(
        `SELECT
           (SELECT COUNT(*)::int FROM fin_ap_invoices WHERE status IN ('pending', 'approved')) AS pending_ap_invoices,
           (SELECT COUNT(*)::int FROM fin_journal_entries WHERE status = 'draft') AS draft_journals`
      ),
      procurement: await query(
        `SELECT
           (SELECT COUNT(*)::int FROM proc_purchase_orders WHERE status = 'draft') AS po_draft,
           (SELECT COUNT(*)::int FROM proc_purchase_orders WHERE status = 'approved') AS po_approved,
           (SELECT COUNT(*)::int FROM proc_tenders WHERE status IN ('draft', 'evaluation')) AS tenders_active`
      ),
      store: await query(
        `SELECT
           (SELECT COUNT(*)::int FROM proc_goods_received) AS grn_count,
           (SELECT COUNT(*)::int FROM proc_po_items WHERE COALESCE(received_qty, 0) < quantity) AS po_items_pending_receipt`
      ),
    }

    res.json({
      totals: totals || {
        findingsTotal: 0,
        findingsOpen: 0,
        findingsResolved: 0,
        findingsHighOpen: 0,
      },
      modules: moduleRows.map((r) => ({
        module: r.source_module,
        department: DEPARTMENT_MAP[r.source_module] || 'Cross-functional',
        findingCount: r.finding_count,
        openCount: r.open_count,
        highRiskCount: r.high_risk_count,
      })),
      engagementsByStatus: engagementRows.map((r) => ({ status: r.status, count: r.count })),
      overdueFindings: overdueRows.map((r) => ({
        findingRef: r.finding_ref,
        title: r.title,
        sourceModule: r.source_module,
        departmentCode: r.department_code,
        ownerName: r.owner_name,
        dueDate: r.due_date,
      })),
      crossModuleSignals: {
        accounts: {
          pendingApInvoices: Number(crossModuleSignals.accounts?.[0]?.pending_ap_invoices || 0),
          draftJournals: Number(crossModuleSignals.accounts?.[0]?.draft_journals || 0),
        },
        procurement: {
          poDraft: Number(crossModuleSignals.procurement?.[0]?.po_draft || 0),
          poApproved: Number(crossModuleSignals.procurement?.[0]?.po_approved || 0),
          tendersActive: Number(crossModuleSignals.procurement?.[0]?.tenders_active || 0),
        },
        store: {
          grnCount: Number(crossModuleSignals.store?.[0]?.grn_count || 0),
          poItemsPendingReceipt: Number(crossModuleSignals.store?.[0]?.po_items_pending_receipt || 0),
        },
      },
    })
  } catch (e) {
    next(e)
  }
})

router.get('/engagements', async (req, res, next) => {
  try {
    const status = String(req.query.status || '').trim().toLowerCase()
    const fiscalYear = Number.parseInt(req.query.fiscalYear, 10)
    const departmentCode = String(req.query.departmentCode || '').trim().toUpperCase()

    const conditions = []
    const params = []

    if (status && status !== 'all') {
      params.push(status)
      conditions.push(`e.status = $${params.length}`)
    }
    if (Number.isFinite(fiscalYear)) {
      params.push(fiscalYear)
      conditions.push(`e.fiscal_year = $${params.length}`)
    }
    if (departmentCode) {
      params.push(departmentCode)
      conditions.push(`e.department_code = $${params.length}`)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const rows = await query(
      `SELECT e.*,
              (SELECT COUNT(*)::int FROM ia_audit_findings f WHERE f.engagement_id = e.id) AS findings_count,
              (SELECT COUNT(*)::int FROM ia_audit_findings f WHERE f.engagement_id = e.id AND f.status IN ('open', 'in_progress')) AS open_findings
       FROM ia_audit_engagements e
       ${where}
       ORDER BY e.created_at DESC`,
      params
    )

    res.json(
      rows.map((r) => ({
        id: r.id,
        engagementRef: r.engagement_ref,
        title: r.title,
        fiscalYear: r.fiscal_year,
        quarter: r.quarter,
        departmentCode: r.department_code,
        processArea: r.process_area,
        scope: r.scope,
        objective: r.objective,
        riskRating: r.risk_rating,
        status: r.status,
        leadAuditor: r.lead_auditor,
        teamMembers: r.team_members,
        startDate: r.start_date,
        endDate: r.end_date,
        issuedAt: r.issued_at,
        findingsCount: Number(r.findings_count || 0),
        openFindings: Number(r.open_findings || 0),
      }))
    )
  } catch (e) {
    next(e)
  }
})

router.post('/engagements', async (req, res, next) => {
  try {
    const data = z
      .object({
        title: z.string().min(4),
        fiscalYear: z.coerce.number().int().min(2000).max(2100),
        quarter: z.string().max(16).optional().default(''),
        departmentCode: z.string().min(2).max(32),
        processArea: z.string().min(2).max(120),
        scope: z.string().optional().default(''),
        objective: z.string().optional().default(''),
        riskRating: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
        status: z.enum(['planned', 'fieldwork', 'reporting', 'follow-up', 'closed']).optional().default('planned'),
        leadAuditor: z.string().min(2).optional().default('Internal Audit Team'),
        teamMembers: z.string().optional().default(''),
        startDate: z.string().optional().nullable(),
        endDate: z.string().optional().nullable(),
      })
      .parse(req.body)

    const seq = Date.now().toString(36).toUpperCase().slice(-6)
    const ref = `IA-${data.fiscalYear}-${seq}`

    const [row] = await query(
      `INSERT INTO ia_audit_engagements
        (engagement_ref, title, fiscal_year, quarter, department_code,
         process_area, scope, objective, risk_rating, status,
         lead_auditor, team_members, start_date, end_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [
        ref,
        data.title,
        data.fiscalYear,
        data.quarter || null,
        data.departmentCode.toUpperCase(),
        data.processArea,
        data.scope,
        data.objective,
        data.riskRating,
        data.status,
        data.leadAuditor,
        data.teamMembers,
        data.startDate || null,
        data.endDate || null,
      ]
    )

    res.status(201).json({ id: row.id, engagementRef: row.engagement_ref })
  } catch (e) {
    next(e)
  }
})

router.patch('/engagements/:id', async (req, res, next) => {
  try {
    const id = Number.parseInt(req.params.id, 10)
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' })

    const body = req.body || {}
    const sets = []
    const params = []

    const addSet = (sql, value) => {
      params.push(value)
      sets.push(`${sql} = $${params.length}`)
    }

    if (body.status != null) addSet('status', normalizeStatus(body.status, ['planned', 'fieldwork', 'reporting', 'follow-up', 'closed'], 'planned'))
    if (body.riskRating != null) addSet('risk_rating', normalizeRisk(body.riskRating))
    if (body.scope != null) addSet('scope', String(body.scope))
    if (body.objective != null) addSet('objective', String(body.objective))
    if (body.startDate !== undefined) addSet('start_date', body.startDate || null)
    if (body.endDate !== undefined) addSet('end_date', body.endDate || null)
    if (body.teamMembers !== undefined) addSet('team_members', body.teamMembers || '')
    if (body.issuedAt !== undefined) addSet('issued_at', body.issuedAt || null)

    if (!sets.length) return res.status(400).json({ error: 'Nothing to update' })

    sets.push('updated_at = NOW()')
    params.push(id)

    const [row] = await query(
      `UPDATE ia_audit_engagements
       SET ${sets.join(', ')}
       WHERE id = $${params.length}
       RETURNING *`,
      params
    )

    if (!row) return res.status(404).json({ error: 'Engagement not found' })
    res.json({ id: row.id, engagementRef: row.engagement_ref, status: row.status })
  } catch (e) {
    next(e)
  }
})

router.get('/findings', async (req, res, next) => {
  try {
    const status = String(req.query.status || '').trim().toLowerCase()
    const module = String(req.query.module || '').trim().toLowerCase()
    const risk = String(req.query.risk || '').trim().toLowerCase()

    const conditions = []
    const params = []

    if (status && status !== 'all') {
      params.push(status)
      conditions.push(`f.status = $${params.length}`)
    }
    if (module && module !== 'all') {
      params.push(module)
      conditions.push(`f.source_module = $${params.length}`)
    }
    if (risk && risk !== 'all') {
      params.push(risk)
      conditions.push(`f.risk_rating = $${params.length}`)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const rows = await query(
      `SELECT f.*, e.engagement_ref, e.title AS engagement_title
       FROM ia_audit_findings f
       LEFT JOIN ia_audit_engagements e ON e.id = f.engagement_id
       ${where}
       ORDER BY f.created_at DESC`,
      params
    )

    res.json(
      rows.map((r) => ({
        id: r.id,
        findingRef: r.finding_ref,
        engagementId: r.engagement_id,
        engagementRef: r.engagement_ref,
        engagementTitle: r.engagement_title,
        title: r.title,
        sourceModule: r.source_module,
        departmentCode: r.department_code,
        condition: r.condition_text,
        criteria: r.criteria_text,
        cause: r.cause_text,
        impact: r.impact_text,
        recommendation: r.recommendation,
        riskRating: r.risk_rating,
        controlType: r.control_type,
        status: r.status,
        ownerDepartment: r.owner_department,
        ownerName: r.owner_name,
        dueDate: r.due_date,
        closedAt: r.closed_at,
        createdAt: r.created_at,
      }))
    )
  } catch (e) {
    next(e)
  }
})

router.post('/findings', async (req, res, next) => {
  try {
    const data = z
      .object({
        engagementId: z.coerce.number().int().optional().nullable(),
        title: z.string().min(4),
        sourceModule: z.enum(['accounts', 'procurement', 'store', 'hr', 'ict', 'governance']),
        departmentCode: z.string().min(2).max(32),
        condition: z.string().min(4),
        criteria: z.string().optional().default(''),
        cause: z.string().optional().default(''),
        impact: z.string().optional().default(''),
        recommendation: z.string().min(4),
        riskRating: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
        controlType: z.enum(['preventive', 'detective', 'corrective']).optional().default('detective'),
        ownerDepartment: z.string().optional().default(''),
        ownerName: z.string().optional().default(''),
        dueDate: z.string().optional().nullable(),
        createdBy: z.string().optional().default('internal.audit'),
      })
      .parse(req.body)

    const seq = Date.now().toString(36).toUpperCase().slice(-6)
    const ref = `FND-${new Date().getFullYear()}-${seq}`

    const [row] = await query(
      `INSERT INTO ia_audit_findings
        (finding_ref, engagement_id, title, source_module, department_code,
         condition_text, criteria_text, cause_text, impact_text,
         recommendation, risk_rating, control_type,
         owner_department, owner_name, due_date, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [
        ref,
        data.engagementId || null,
        data.title,
        data.sourceModule,
        data.departmentCode.toUpperCase(),
        data.condition,
        data.criteria,
        data.cause,
        data.impact,
        data.recommendation,
        data.riskRating,
        data.controlType,
        data.ownerDepartment,
        data.ownerName,
        data.dueDate || null,
        data.createdBy,
      ]
    )

    res.status(201).json({ id: row.id, findingRef: row.finding_ref })
  } catch (e) {
    next(e)
  }
})

router.patch('/findings/:id', async (req, res, next) => {
  try {
    const id = Number.parseInt(req.params.id, 10)
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' })

    const body = req.body || {}
    const sets = []
    const params = []

    const addSet = (sql, value) => {
      params.push(value)
      sets.push(`${sql} = $${params.length}`)
    }

    if (body.status != null) {
      const status = normalizeStatus(body.status, ['open', 'in_progress', 'resolved', 'closed', 'accepted_risk'], 'open')
      addSet('status', status)
      if (status === 'closed') {
        sets.push('closed_at = NOW()')
      }
    }
    if (body.riskRating != null) addSet('risk_rating', normalizeRisk(body.riskRating))
    if (body.ownerDepartment !== undefined) addSet('owner_department', body.ownerDepartment || '')
    if (body.ownerName !== undefined) addSet('owner_name', body.ownerName || '')
    if (body.dueDate !== undefined) addSet('due_date', body.dueDate || null)
    if (body.recommendation !== undefined) addSet('recommendation', String(body.recommendation || ''))

    if (!sets.length) return res.status(400).json({ error: 'Nothing to update' })

    sets.push('updated_at = NOW()')
    params.push(id)

    const [row] = await query(
      `UPDATE ia_audit_findings
       SET ${sets.join(', ')}
       WHERE id = $${params.length}
       RETURNING *`,
      params
    )

    if (!row) return res.status(404).json({ error: 'Finding not found' })
    res.json({ id: row.id, findingRef: row.finding_ref, status: row.status })
  } catch (e) {
    next(e)
  }
})

router.get('/findings/:id/actions', async (req, res, next) => {
  try {
    const findingId = Number.parseInt(req.params.id, 10)
    if (!Number.isFinite(findingId)) return res.status(400).json({ error: 'Invalid finding id' })

    const rows = await query(
      `SELECT *
       FROM ia_finding_actions
       WHERE finding_id = $1
       ORDER BY created_at DESC`,
      [findingId]
    )

    res.json(
      rows.map((r) => ({
        id: r.id,
        findingId: r.finding_id,
        actionNote: r.action_note,
        actionType: r.action_type,
        actorName: r.actor_name,
        actorDepartment: r.actor_department,
        nextDueDate: r.next_due_date,
        createdAt: r.created_at,
      }))
    )
  } catch (e) {
    next(e)
  }
})

router.post('/findings/:id/actions', async (req, res, next) => {
  try {
    const findingId = Number.parseInt(req.params.id, 10)
    if (!Number.isFinite(findingId)) return res.status(400).json({ error: 'Invalid finding id' })

    const data = z
      .object({
        actionNote: z.string().min(3),
        actionType: z.enum(['update', 'remediation', 'evidence', 'closure', 'reopen']).optional().default('update'),
        actorName: z.string().min(2),
        actorDepartment: z.string().optional().default(''),
        nextDueDate: z.string().optional().nullable(),
      })
      .parse(req.body)

    const [action] = await query(
      `INSERT INTO ia_finding_actions
        (finding_id, action_note, action_type, actor_name, actor_department, next_due_date)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [findingId, data.actionNote, data.actionType, data.actorName, data.actorDepartment, data.nextDueDate || null]
    )

    if (data.nextDueDate) {
      await query(
        `UPDATE ia_audit_findings
         SET due_date = $1,
             updated_at = NOW()
         WHERE id = $2`,
        [data.nextDueDate, findingId]
      )
    }

    if (data.actionType === 'closure') {
      await query(
        `UPDATE ia_audit_findings
         SET status = 'closed',
             closed_at = NOW(),
             updated_at = NOW()
         WHERE id = $1`,
        [findingId]
      )
    }

    if (data.actionType === 'reopen') {
      await query(
        `UPDATE ia_audit_findings
         SET status = 'in_progress',
             closed_at = NULL,
             updated_at = NOW()
         WHERE id = $1`,
        [findingId]
      )
    }

    res.status(201).json({
      id: action.id,
      findingId: action.finding_id,
      actionType: action.action_type,
      createdAt: action.created_at,
    })
  } catch (e) {
    next(e)
  }
})

router.get('/cross-module/exceptions', async (req, res, next) => {
  try {
    const module = normalizeStatus(req.query.module, ['accounts', 'procurement', 'store'], 'accounts')
    const limit = Math.min(Number.parseInt(req.query.limit, 10) || 20, 100)

    if (module === 'accounts') {
      const rows = await query(
        `SELECT a.invoice_no AS ref,
                a.department_code,
                a.total_amount,
                a.status,
                a.created_at
         FROM fin_ap_invoices a
         WHERE a.status IN ('pending', 'approved')
         ORDER BY a.total_amount DESC NULLS LAST, a.created_at DESC
         LIMIT $1`,
        [limit]
      )
      return res.json(rows.map((r) => ({
        module: 'accounts',
        ref: r.ref,
        departmentCode: r.department_code,
        amount: Number(r.total_amount || 0),
        status: r.status,
        observedAt: r.created_at,
      })))
    }

    if (module === 'procurement') {
      const rows = await query(
        `SELECT p.po_number AS ref,
                p.total_amount,
                p.status,
                p.order_date,
                v.name AS vendor_name
         FROM proc_purchase_orders p
         LEFT JOIN proc_vendors v ON v.id = p.vendor_id
         WHERE p.status IN ('draft', 'approved')
         ORDER BY p.total_amount DESC NULLS LAST, p.created_at DESC
         LIMIT $1`,
        [limit]
      )
      return res.json(rows.map((r) => ({
        module: 'procurement',
        ref: r.ref,
        vendor: r.vendor_name,
        amount: Number(r.total_amount || 0),
        status: r.status,
        observedAt: r.order_date,
      })))
    }

    const rows = await query(
      `SELECT g.grn_number AS ref,
              g.received_by,
              g.received_date,
              po.po_number,
              po.status AS po_status
       FROM proc_goods_received g
       LEFT JOIN proc_purchase_orders po ON po.id = g.po_id
       ORDER BY g.received_date DESC
       LIMIT $1`,
      [limit]
    )

    res.json(rows.map((r) => ({
      module: 'store',
      ref: r.ref,
      linkedPo: r.po_number,
      receiver: r.received_by,
      poStatus: r.po_status,
      observedAt: r.received_date,
    })))
  } catch (e) {
    next(e)
  }
})

router.get('/collaboration-matrix', (_req, res) => {
  res.json([
    {
      sourceModule: 'accounts',
      collaboratingDepartments: ['Finance & Accounts', 'Internal Audit', 'Treasury', 'Management'],
      controls: ['Journal approval hierarchy', 'Invoice approval limits', 'Bank reconciliation cadence'],
    },
    {
      sourceModule: 'procurement',
      collaboratingDepartments: ['Procurement', 'Internal Audit', 'Legal', 'Finance & Accounts'],
      controls: ['Tender evaluation documentation', 'PO approval limits', '3-way match (PO/GRN/Invoice)'],
    },
    {
      sourceModule: 'store',
      collaboratingDepartments: ['Store / Warehouse', 'Procurement', 'Internal Audit', 'User Departments'],
      controls: ['Goods receipt confirmation', 'Stock variance reviews', 'Custody and issue logs'],
    },
  ])
})

export default router
