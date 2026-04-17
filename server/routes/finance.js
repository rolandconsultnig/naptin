import { Router } from 'express'
import { z } from 'zod'
import { query, withTx } from '../db.js'

const router = Router()

// ─── Fiscal Years ───────────────────────────────────────────────

router.get('/fiscal-years', async (_req, res, next) => {
  try {
    const rows = await query(`SELECT * FROM fin_fiscal_years ORDER BY start_date DESC`)
    res.json(rows.map(r => ({
      id: r.id, label: r.label, startDate: r.start_date,
      endDate: r.end_date, isClosed: r.is_closed,
    })))
  } catch (e) { next(e) }
})

// ─── Chart of Accounts ──────────────────────────────────────────

router.get('/accounts', async (req, res, next) => {
  try {
    const accType = (req.query.type || '').trim()
    const cond = accType && accType !== 'all' ? `WHERE c.account_type = $1` : ''
    const params = accType && accType !== 'all' ? [accType] : []

    const rows = await query(
      `SELECT c.*, p.account_code AS parent_code, p.name AS parent_name
       FROM fin_chart_of_accounts c
       LEFT JOIN fin_chart_of_accounts p ON p.id = c.parent_account_id
       ${cond}
       ORDER BY c.account_code`,
      params
    )
    res.json(rows.map(r => ({
      id: r.id, accountCode: r.account_code, name: r.name,
      accountType: r.account_type, parentCode: r.parent_code,
      parentName: r.parent_name, departmentCode: r.department_code,
      normalBalance: r.normal_balance, isActive: r.is_active,
      description: r.description,
    })))
  } catch (e) { next(e) }
})

router.post('/accounts', async (req, res, next) => {
  try {
    const data = z.object({
      accountCode: z.string().min(2),
      name: z.string().min(2),
      accountType: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
      parentAccountId: z.number().int().optional().nullable(),
      departmentCode: z.string().optional().nullable(),
      normalBalance: z.enum(['debit', 'credit']).default('debit'),
      description: z.string().optional().default(''),
    }).parse(req.body)

    const [row] = await query(
      `INSERT INTO fin_chart_of_accounts
        (account_code, name, account_type, parent_account_id, department_code, normal_balance, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [data.accountCode, data.name, data.accountType, data.parentAccountId,
       data.departmentCode, data.normalBalance, data.description]
    )
    res.status(201).json({ id: row.id, accountCode: row.account_code })
  } catch (e) { next(e) }
})

// ─── Journal Entries ────────────────────────────────────────────

router.get('/journals', async (req, res, next) => {
  try {
    const status = (req.query.status || '').trim()
    const limit = Math.min(parseInt(req.query.limit) || 50, 200)
    const cond = status && status !== 'all' ? `WHERE j.status = $1` : ''
    const params = status && status !== 'all' ? [status, limit] : [limit]
    const limitIdx = params.length

    const rows = await query(
      `SELECT j.*
       FROM fin_journal_entries j
       ${cond}
       ORDER BY j.entry_date DESC, j.id DESC
       LIMIT $${limitIdx}`,
      params
    )

    const entries = []
    for (const r of rows) {
      const lines = await query(
        `SELECT jl.*, a.account_code, a.name AS account_name
         FROM fin_journal_lines jl
         JOIN fin_chart_of_accounts a ON a.id = jl.account_id
         WHERE jl.journal_entry_id = $1
         ORDER BY jl.id`,
        [r.id]
      )

      entries.push({
        id: r.id, entryRef: r.entry_ref, entryDate: r.entry_date,
        description: r.description, sourceModule: r.source_module,
        sourceRef: r.source_ref, status: r.status,
        preparedBy: r.prepared_by, approvedBy: r.approved_by,
        postedAt: r.posted_at,
        lines: lines.map(l => ({
          id: l.id, accountCode: l.account_code, accountName: l.account_name,
          description: l.description, debit: parseFloat(l.debit_amount),
          credit: parseFloat(l.credit_amount), department: l.department_code,
          costCenter: l.cost_center,
        })),
        totalDebit: lines.reduce((s, l) => s + parseFloat(l.debit_amount), 0),
        totalCredit: lines.reduce((s, l) => s + parseFloat(l.credit_amount), 0),
      })
    }

    res.json(entries)
  } catch (e) { next(e) }
})

router.post('/journals', async (req, res, next) => {
  try {
    const data = z.object({
      entryDate: z.string(),
      description: z.string().min(2),
      sourceModule: z.string().optional().nullable(),
      sourceRef: z.string().optional().nullable(),
      preparedBy: z.string().default('system'),
      lines: z.array(z.object({
        accountId: z.number().int(),
        description: z.string().optional().default(''),
        debit: z.number().min(0).default(0),
        credit: z.number().min(0).default(0),
        departmentCode: z.string().optional().nullable(),
        costCenter: z.string().optional().nullable(),
      })).min(2),
    }).parse(req.body)

    // verify debits = credits
    const totalDebit = data.lines.reduce((s, l) => s + l.debit, 0)
    const totalCredit = data.lines.reduce((s, l) => s + l.credit, 0)
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return res.status(400).json({ error: `Debits (${totalDebit}) must equal credits (${totalCredit})` })
    }

    const result = await withTx(async (client) => {
      const seq = Date.now().toString(36).toUpperCase()
      const entryRef = `JE-${new Date().getFullYear()}-${seq}`

      const { rows: [je] } = await client.query(
        `INSERT INTO fin_journal_entries
          (entry_ref, entry_date, description, source_module, source_ref, prepared_by)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING *`,
        [entryRef, data.entryDate, data.description, data.sourceModule,
         data.sourceRef, data.preparedBy]
      )

      for (const line of data.lines) {
        await client.query(
          `INSERT INTO fin_journal_lines
            (journal_entry_id, account_id, description, debit_amount, credit_amount,
             department_code, cost_center)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [je.id, line.accountId, line.description, line.debit, line.credit,
           line.departmentCode, line.costCenter]
        )
      }

      return { id: je.id, entryRef: je.entry_ref, status: je.status }
    })

    res.status(201).json(result)
  } catch (e) { next(e) }
})

router.post('/journals/:id/post', async (req, res, next) => {
  try {
    const [je] = await query(
      `UPDATE fin_journal_entries
       SET status = 'posted', posted_at = NOW(), approved_by = $1
       WHERE id = $2 AND status = 'draft'
       RETURNING *`,
      [req.body.approvedBy || 'system', req.params.id]
    )
    if (!je) return res.status(400).json({ error: 'Journal not in draft state' })
    res.json({ id: je.id, status: je.status, postedAt: je.posted_at })
  } catch (e) { next(e) }
})

router.post('/journals/:id/reverse', async (req, res, next) => {
  try {
    const jeId = parseInt(req.params.id)
    const [original] = await query(`SELECT * FROM fin_journal_entries WHERE id = $1`, [jeId])
    if (!original) return res.status(404).json({ error: 'Journal not found' })
    if (original.status !== 'posted') return res.status(400).json({ error: 'Can only reverse posted entries' })

    const result = await withTx(async (client) => {
      const origLines = (await client.query(
        `SELECT * FROM fin_journal_lines WHERE journal_entry_id = $1`, [jeId]
      )).rows

      const seq = Date.now().toString(36).toUpperCase()
      const ref = `JE-REV-${new Date().getFullYear()}-${seq}`

      const { rows: [rev] } = await client.query(
        `INSERT INTO fin_journal_entries
          (entry_ref, entry_date, description, source_module, source_ref, prepared_by, status, posted_at)
         VALUES ($1, $2, $3, 'reversal', $4, $5, 'posted', NOW())
         RETURNING *`,
        [ref, new Date().toISOString().slice(0, 10),
         `Reversal of ${original.entry_ref}`, original.entry_ref,
         req.body.preparedBy || 'system']
      )

      for (const line of origLines) {
        await client.query(
          `INSERT INTO fin_journal_lines
            (journal_entry_id, account_id, description, debit_amount, credit_amount, department_code)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [rev.id, line.account_id, `Reversal: ${line.description || ''}`,
           line.credit_amount, line.debit_amount, line.department_code]
        )
      }

      await client.query(
        `UPDATE fin_journal_entries SET reversed_by_entry_id = $1 WHERE id = $2`,
        [rev.id, jeId]
      )

      return { id: rev.id, entryRef: rev.entry_ref }
    })

    res.json(result)
  } catch (e) { next(e) }
})

// ─── AP Invoices ────────────────────────────────────────────────

router.get('/ap/invoices', async (req, res, next) => {
  try {
    const status = (req.query.status || '').trim()
    const cond = status && status !== 'all' ? `WHERE i.status = $1` : ''
    const params = status && status !== 'all' ? [status] : []

    const rows = await query(
      `SELECT i.*, v.name AS vendor_name
       FROM fin_ap_invoices i
       JOIN fin_vendors v ON v.id = i.vendor_id
       ${cond}
       ORDER BY i.invoice_date DESC`,
      params
    )
    res.json(rows.map(r => ({
      id: r.id, invoiceNo: r.invoice_no, vendorName: r.vendor_name,
      vendorId: r.vendor_id, poNumber: r.po_number,
      invoiceDate: r.invoice_date, dueDate: r.due_date,
      currency: r.currency, subtotal: parseFloat(r.subtotal),
      taxAmount: parseFloat(r.tax_amount), totalAmount: parseFloat(r.total_amount),
      amountPaid: parseFloat(r.amount_paid), status: r.status,
      department: r.department_code, description: r.description,
    })))
  } catch (e) { next(e) }
})

router.post('/ap/invoices', async (req, res, next) => {
  try {
    const data = z.object({
      vendorId: z.number().int(),
      poNumber: z.string().optional().nullable(),
      invoiceDate: z.string(),
      dueDate: z.string(),
      currency: z.string().default('NGN'),
      subtotal: z.number().min(0),
      taxAmount: z.number().min(0).default(0),
      departmentCode: z.string().optional().nullable(),
      description: z.string().optional().default(''),
      glAccountId: z.number().int().optional().nullable(),
    }).parse(req.body)

    const total = data.subtotal + data.taxAmount
    const seq = Date.now().toString(36).toUpperCase()
    const invoiceNo = `INV-AP-${seq}`

    const [row] = await query(
      `INSERT INTO fin_ap_invoices
        (invoice_no, vendor_id, po_number, invoice_date, due_date, currency,
         subtotal, tax_amount, total_amount, department_code, description, gl_account_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [invoiceNo, data.vendorId, data.poNumber, data.invoiceDate, data.dueDate,
       data.currency, data.subtotal, data.taxAmount, total,
       data.departmentCode, data.description, data.glAccountId]
    )
    res.status(201).json({ id: row.id, invoiceNo: row.invoice_no })
  } catch (e) { next(e) }
})

router.post('/ap/invoices/:id/approve', async (req, res, next) => {
  try {
    const [row] = await query(
      `UPDATE fin_ap_invoices SET status = 'approved', approved_by = $1, approved_at = NOW()
       WHERE id = $2 AND status = 'pending' RETURNING *`,
      [req.body.approvedBy || 'system', req.params.id]
    )
    if (!row) return res.status(400).json({ error: 'Invoice not in pending state' })
    res.json({ id: row.id, status: row.status })
  } catch (e) { next(e) }
})

router.post('/ap/invoices/:id/pay', async (req, res, next) => {
  try {
    const data = z.object({
      amount: z.number().min(0.01),
      paymentMethod: z.string().default('bank_transfer'),
      bankReference: z.string().optional().nullable(),
    }).parse(req.body)

    const result = await withTx(async (client) => {
      const { rows: [inv] } = await client.query(
        `SELECT * FROM fin_ap_invoices WHERE id = $1`, [req.params.id]
      )
      if (!inv) throw new Error('Invoice not found')

      const newPaid = parseFloat(inv.amount_paid) + data.amount
      const totalAmt = parseFloat(inv.total_amount)
      const newStatus = newPaid >= totalAmt ? 'paid' : 'partial'

      const seq = Date.now().toString(36).toUpperCase()
      await client.query(
        `INSERT INTO fin_ap_payments (payment_ref, invoice_id, payment_date, amount, payment_method, bank_reference)
         VALUES ($1,$2,CURRENT_DATE,$3,$4,$5)`,
        [`PMT-${seq}`, inv.id, data.amount, data.paymentMethod, data.bankReference]
      )

      await client.query(
        `UPDATE fin_ap_invoices SET amount_paid = $1, status = $2 WHERE id = $3`,
        [newPaid, newStatus, inv.id]
      )

      return { invoiceId: inv.id, amountPaid: newPaid, status: newStatus }
    })

    res.json(result)
  } catch (e) { next(e) }
})

// ─── AR Invoices ────────────────────────────────────────────────

router.get('/ar/invoices', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT i.*, c.name AS customer_name
       FROM fin_ar_invoices i
       JOIN fin_customers c ON c.id = i.customer_id
       ORDER BY i.invoice_date DESC`
    )
    res.json(rows.map(r => ({
      id: r.id, invoiceNo: r.invoice_no, customerName: r.customer_name,
      invoiceDate: r.invoice_date, dueDate: r.due_date,
      totalAmount: parseFloat(r.total_amount),
      amountReceived: parseFloat(r.amount_received),
      status: r.status, description: r.description,
    })))
  } catch (e) { next(e) }
})

router.post('/ar/invoices', async (req, res, next) => {
  try {
    const data = z.object({
      customerId: z.number().int(),
      invoiceDate: z.string(),
      dueDate: z.string(),
      subtotal: z.number().min(0),
      taxAmount: z.number().min(0).default(0),
      description: z.string().optional().default(''),
    }).parse(req.body)

    const total = data.subtotal + data.taxAmount
    const seq = Date.now().toString(36).toUpperCase()

    const [row] = await query(
      `INSERT INTO fin_ar_invoices
        (invoice_no, customer_id, invoice_date, due_date, subtotal, tax_amount, total_amount, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [`INV-AR-${seq}`, data.customerId, data.invoiceDate, data.dueDate,
       data.subtotal, data.taxAmount, total, data.description]
    )
    res.status(201).json({ id: row.id, invoiceNo: row.invoice_no })
  } catch (e) { next(e) }
})

// ─── Budget ─────────────────────────────────────────────────────

router.get('/budget', async (req, res, next) => {
  try {
    const fyId = parseInt(req.query.fiscalYearId) || 0

    const rows = await query(
      `SELECT b.*, a.account_code, a.name AS account_name, a.account_type,
              fy.label AS fiscal_year_label
       FROM fin_budget_heads b
       JOIN fin_chart_of_accounts a ON a.id = b.account_id
       JOIN fin_fiscal_years fy ON fy.id = b.fiscal_year_id
       ${fyId ? 'WHERE b.fiscal_year_id = $1' : ''}
       ORDER BY a.account_code`,
      fyId ? [fyId] : []
    )

    res.json(rows.map(r => ({
      id: r.id, fiscalYear: r.fiscal_year_label,
      accountCode: r.account_code, accountName: r.account_name,
      accountType: r.account_type, department: r.department_code,
      original: parseFloat(r.original_amount),
      revised: parseFloat(r.revised_amount),
      actual: parseFloat(r.actual_amount),
      committed: parseFloat(r.committed_amount),
      available: parseFloat(r.revised_amount) - parseFloat(r.actual_amount) - parseFloat(r.committed_amount),
      utilisation: parseFloat(r.revised_amount) > 0
        ? Math.round(((parseFloat(r.actual_amount) + parseFloat(r.committed_amount)) / parseFloat(r.revised_amount)) * 100)
        : 0,
      status: r.status,
    })))
  } catch (e) { next(e) }
})

router.post('/budget', async (req, res, next) => {
  try {
    const data = z.object({
      fiscalYearId: z.number().int(),
      accountId: z.number().int(),
      departmentCode: z.string(),
      originalAmount: z.number().min(0),
    }).parse(req.body)

    const [row] = await query(
      `INSERT INTO fin_budget_heads (fiscal_year_id, account_id, department_code, original_amount, revised_amount)
       VALUES ($1,$2,$3,$4,$4)
       ON CONFLICT (fiscal_year_id, account_id, department_code) DO UPDATE
       SET original_amount = EXCLUDED.original_amount, revised_amount = EXCLUDED.original_amount
       RETURNING *`,
      [data.fiscalYearId, data.accountId, data.departmentCode, data.originalAmount]
    )
    res.status(201).json({ id: row.id })
  } catch (e) { next(e) }
})

// ─── Budget Workbench: Consolidation & Virement ─────────────────

router.get('/budget-workbench/submissions', async (req, res, next) => {
  try {
    const fiscalYearLabel = (req.query.fiscalYearLabel || 'FY 2026').trim()
    const [fy] = await query(`SELECT id, label FROM fin_fiscal_years WHERE label = $1 LIMIT 1`, [fiscalYearLabel])
    if (!fy) return res.status(404).json({ error: `Fiscal year not found: ${fiscalYearLabel}` })

    const rows = await query(
      `SELECT *
       FROM fin_budget_submissions
       WHERE fiscal_year_id = $1
       ORDER BY department_name`,
      [fy.id]
    )

    res.json({
      fiscalYear: fy.label,
      isLocked: rows.some((r) => r.status === 'locked'),
      items: rows.map((r) => ({
        id: r.id,
        departmentCode: r.department_code,
        departmentName: r.department_name,
        submitted: r.submission_date,
        amount: r.amount != null ? parseFloat(r.amount) : null,
        prevYear: r.prev_year_amount != null ? parseFloat(r.prev_year_amount) : null,
        variancePct: r.variance_pct != null ? parseFloat(r.variance_pct) : null,
        status: r.status,
        justification: r.justification,
        reviewNote: r.review_note,
      })),
    })
  } catch (e) { next(e) }
})

router.post('/budget-workbench/submissions/:id/approve', async (req, res, next) => {
  try {
    const data = z.object({
      actor: z.string().optional().default('system'),
      note: z.string().optional().nullable(),
    }).parse(req.body || {})

    const result = await withTx(async (client) => {
      const { rows: [row] } = await client.query(
        `UPDATE fin_budget_submissions
         SET status = 'approved', reviewed_by = $1, reviewed_at = NOW(),
             review_note = COALESCE($2, review_note), updated_at = NOW()
         WHERE id = $3 AND status IN ('submitted', 'flagged')
         RETURNING *`,
        [data.actor, data.note || null, req.params.id]
      )

      if (!row) throw new Error('Submission not in approvable state')

      await client.query(
        `INSERT INTO fin_budget_submission_actions (submission_id, action, note, actor)
         VALUES ($1, 'approve', $2, $3)`,
        [row.id, data.note || null, data.actor]
      )

      return row
    })

    res.json({ id: result.id, status: result.status })
  } catch (e) { next(e) }
})

router.post('/budget-workbench/submissions/:id/return', async (req, res, next) => {
  try {
    const data = z.object({
      actor: z.string().optional().default('system'),
      note: z.string().min(2),
    }).parse(req.body || {})

    const result = await withTx(async (client) => {
      const { rows: [row] } = await client.query(
        `UPDATE fin_budget_submissions
         SET status = 'returned', reviewed_by = $1, reviewed_at = NOW(),
             review_note = $2, updated_at = NOW()
         WHERE id = $3 AND status IN ('submitted', 'flagged')
         RETURNING *`,
        [data.actor, data.note, req.params.id]
      )

      if (!row) throw new Error('Submission not in returnable state')

      await client.query(
        `INSERT INTO fin_budget_submission_actions (submission_id, action, note, actor)
         VALUES ($1, 'return', $2, $3)`,
        [row.id, data.note, data.actor]
      )

      return row
    })

    res.json({ id: result.id, status: result.status })
  } catch (e) { next(e) }
})

router.post('/budget-workbench/submissions/approve-all', async (req, res, next) => {
  try {
    const data = z.object({
      fiscalYearLabel: z.string().optional().default('FY 2026'),
      actor: z.string().optional().default('system'),
    }).parse(req.body || {})

    const result = await withTx(async (client) => {
      const { rows: [fy] } = await client.query(
        `SELECT id FROM fin_fiscal_years WHERE label = $1 LIMIT 1`,
        [data.fiscalYearLabel]
      )
      if (!fy) throw new Error(`Fiscal year not found: ${data.fiscalYearLabel}`)

      const { rows } = await client.query(
        `UPDATE fin_budget_submissions
         SET status = 'approved', reviewed_by = $1, reviewed_at = NOW(), updated_at = NOW()
         WHERE fiscal_year_id = $2 AND status IN ('submitted', 'flagged')
         RETURNING id`,
        [data.actor, fy.id]
      )

      for (const row of rows) {
        await client.query(
          `INSERT INTO fin_budget_submission_actions (submission_id, action, note, actor)
           VALUES ($1, 'approve_all', 'Bulk approval', $2)`,
          [row.id, data.actor]
        )
      }

      return rows.length
    })

    res.json({ updated: result })
  } catch (e) { next(e) }
})

router.post('/budget-workbench/submissions/lock', async (req, res, next) => {
  try {
    const data = z.object({
      fiscalYearLabel: z.string().optional().default('FY 2026'),
      actor: z.string().optional().default('system'),
    }).parse(req.body || {})

    const result = await withTx(async (client) => {
      const { rows: [fy] } = await client.query(
        `SELECT id FROM fin_fiscal_years WHERE label = $1 LIMIT 1`,
        [data.fiscalYearLabel]
      )
      if (!fy) throw new Error(`Fiscal year not found: ${data.fiscalYearLabel}`)

      const { rows: blockers } = await client.query(
        `SELECT id FROM fin_budget_submissions
         WHERE fiscal_year_id = $1 AND status IN ('submitted', 'flagged')
         LIMIT 1`,
        [fy.id]
      )
      if (blockers.length) throw new Error('Cannot lock: flagged or submitted budgets still exist')

      const { rows: lockedRows } = await client.query(
        `UPDATE fin_budget_submissions
         SET status = CASE WHEN status = 'approved' THEN 'locked' ELSE status END,
             reviewed_by = $1, reviewed_at = NOW(), updated_at = NOW()
         WHERE fiscal_year_id = $2
         RETURNING id`,
        [data.actor, fy.id]
      )

      for (const row of lockedRows) {
        await client.query(
          `INSERT INTO fin_budget_submission_actions (submission_id, action, note, actor)
           VALUES ($1, 'lock', 'Fiscal year budget locked', $2)`,
          [row.id, data.actor]
        )
      }

      return lockedRows.length
    })

    res.json({ locked: true, updated: result })
  } catch (e) { next(e) }
})

router.get('/budget-workbench/virements', async (req, res, next) => {
  try {
    const fiscalYearLabel = (req.query.fiscalYearLabel || 'FY 2026').trim()
    const [fy] = await query(`SELECT id, label FROM fin_fiscal_years WHERE label = $1 LIMIT 1`, [fiscalYearLabel])
    if (!fy) return res.status(404).json({ error: `Fiscal year not found: ${fiscalYearLabel}` })

    const rows = await query(
      `SELECT *
       FROM fin_budget_virements
       WHERE fiscal_year_id = $1
       ORDER BY created_at DESC, id DESC`,
      [fy.id]
    )

    res.json({
      fiscalYear: fy.label,
      items: rows.map((r) => ({
        id: r.id,
        virementRef: r.virement_ref,
        fromLine: r.from_line,
        toLine: r.to_line,
        amount: parseFloat(r.amount),
        reason: r.reason,
        status: r.status,
        requestedBy: r.requested_by,
        approvalLevel: r.approval_level,
        approver: r.approver,
      })),
    })
  } catch (e) { next(e) }
})

router.post('/budget-workbench/virements', async (req, res, next) => {
  try {
    const data = z.object({
      fiscalYearLabel: z.string().optional().default('FY 2026'),
      fromLine: z.string().min(2),
      toLine: z.string().min(2),
      amount: z.number().positive(),
      reason: z.string().min(5),
      requestedBy: z.string().optional().default('Current User'),
    }).parse(req.body || {})

    const [fy] = await query(`SELECT id FROM fin_fiscal_years WHERE label = $1 LIMIT 1`, [data.fiscalYearLabel])
    if (!fy) return res.status(404).json({ error: `Fiscal year not found: ${data.fiscalYearLabel}` })

    const approvalLevel = data.amount >= 5000000
      ? 'DG + Finance Director'
      : data.amount >= 1000000
        ? 'Finance Director'
        : 'Finance Officer'

    const [row] = await query(
      `INSERT INTO fin_budget_virements
        (virement_ref, fiscal_year_id, from_line, to_line, amount, reason, status, requested_by, approval_level)
       VALUES (
         CONCAT('VIR-', EXTRACT(YEAR FROM NOW())::text, '-', LPAD((FLOOR(RANDOM() * 1000) + 1)::text, 3, '0')),
         $1,$2,$3,$4,$5,'pending',$6,$7
       )
       RETURNING *`,
      [fy.id, data.fromLine, data.toLine, data.amount, data.reason, data.requestedBy, approvalLevel]
    )

    res.status(201).json({
      id: row.id,
      virementRef: row.virement_ref,
      status: row.status,
      approvalLevel: row.approval_level,
    })
  } catch (e) { next(e) }
})

router.post('/budget-workbench/virements/:id/approve', async (req, res, next) => {
  try {
    const data = z.object({
      approver: z.string().optional().default('system'),
      note: z.string().optional().nullable(),
    }).parse(req.body || {})

    const [row] = await query(
      `UPDATE fin_budget_virements
       SET status = 'approved', approver = $1, decision_note = COALESCE($2, decision_note),
           approved_at = NOW(), updated_at = NOW()
       WHERE id = $3 AND status = 'pending'
       RETURNING *`,
      [data.approver, data.note || null, req.params.id]
    )

    if (!row) return res.status(400).json({ error: 'Virement not in pending state' })
    res.json({ id: row.id, status: row.status })
  } catch (e) { next(e) }
})

router.post('/budget-workbench/virements/:id/reject', async (req, res, next) => {
  try {
    const data = z.object({
      approver: z.string().optional().default('system'),
      note: z.string().min(2),
    }).parse(req.body || {})

    const [row] = await query(
      `UPDATE fin_budget_virements
       SET status = 'rejected', approver = $1, decision_note = $2,
           rejected_at = NOW(), updated_at = NOW()
       WHERE id = $3 AND status = 'pending'
       RETURNING *`,
      [data.approver, data.note, req.params.id]
    )

    if (!row) return res.status(400).json({ error: 'Virement not in pending state' })
    res.json({ id: row.id, status: row.status })
  } catch (e) { next(e) }
})

// ─── Treasury / Bank Accounts ───────────────────────────────────

router.get('/treasury/bank-accounts', async (_req, res, next) => {
  try {
    const rows = await query(`SELECT * FROM fin_bank_accounts ORDER BY account_name`)
    res.json(rows.map(r => ({
      id: r.id, accountName: r.account_name, bankName: r.bank_name,
      accountNumber: r.account_number, accountType: r.account_type,
      currency: r.currency, currentBalance: parseFloat(r.current_balance),
      status: r.status,
    })))
  } catch (e) { next(e) }
})

router.get('/treasury/bank-accounts/:id/transactions', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT * FROM fin_bank_transactions
       WHERE bank_account_id = $1
       ORDER BY transaction_date DESC
       LIMIT 100`,
      [req.params.id]
    )
    res.json(rows.map(r => ({
      id: r.id, transactionDate: r.transaction_date,
      description: r.description, reference: r.reference,
      debit: parseFloat(r.debit_amount), credit: parseFloat(r.credit_amount),
      runningBalance: r.running_balance ? parseFloat(r.running_balance) : null,
      isReconciled: r.is_reconciled,
    })))
  } catch (e) { next(e) }
})

router.post('/treasury/bank-accounts/:id/transactions', async (req, res, next) => {
  try {
    const bankAccountId = parseInt(req.params.id, 10)
    if (!Number.isFinite(bankAccountId)) {
      return res.status(400).json({ error: 'Invalid bank account id' })
    }

    const data = z.object({
      transactionDate: z.string(),
      description: z.string().min(2),
      reference: z.string().optional().nullable(),
      debit: z.number().min(0).default(0),
      credit: z.number().min(0).default(0),
      valueDate: z.string().optional().nullable(),
    }).parse(req.body)

    if (data.debit <= 0 && data.credit <= 0) {
      return res.status(400).json({ error: 'Enter a debit or credit amount' })
    }

    const acctRows = await query(
      `SELECT id, current_balance FROM fin_bank_accounts WHERE id = $1`,
      [bankAccountId]
    )
    const acct = acctRows[0]
    if (!acct) return res.status(404).json({ error: 'Bank account not found' })

    const result = await withTx(async (client) => {
      const { rows: [txn] } = await client.query(
        `INSERT INTO fin_bank_transactions
          (bank_account_id, transaction_date, value_date, description, reference, debit_amount, credit_amount, running_balance)
         VALUES ($1,$2::date,$3::date,$4,$5,$6,$7,$8)
         RETURNING *`,
        [
          bankAccountId,
          data.transactionDate,
          data.valueDate || data.transactionDate,
          data.description,
          data.reference || null,
          data.debit,
          data.credit,
          null,
        ]
      )
      const delta = parseFloat(txn.credit_amount) - parseFloat(txn.debit_amount)
      const newBal = parseFloat(acct.current_balance) + delta
      await client.query(
        `UPDATE fin_bank_accounts SET current_balance = $1 WHERE id = $2`,
        [newBal, bankAccountId]
      )
      await client.query(
        `UPDATE fin_bank_transactions SET running_balance = $1 WHERE id = $2`,
        [newBal, txn.id]
      )
      return { txn, newBal }
    })

    const t = result.txn
    res.status(201).json({
      id: t.id,
      transactionDate: t.transaction_date,
      description: t.description,
      reference: t.reference,
      debit: parseFloat(t.debit_amount),
      credit: parseFloat(t.credit_amount),
      runningBalance: parseFloat(t.running_balance),
      accountBalance: result.newBal,
    })
  } catch (e) { next(e) }
})

// ─── Vendors & Customers ────────────────────────────────────────

router.get('/vendors', async (_req, res, next) => {
  try {
    const rows = await query(`SELECT * FROM fin_vendors WHERE status = 'active' ORDER BY name`)
    res.json(rows.map(r => ({
      id: r.id, vendorCode: r.vendor_code, name: r.name,
      contactPerson: r.contact_person, email: r.email,
      phone: r.phone, paymentTerms: r.payment_terms_days,
    })))
  } catch (e) { next(e) }
})

router.get('/customers', async (_req, res, next) => {
  try {
    const rows = await query(`SELECT * FROM fin_customers WHERE status = 'active' ORDER BY name`)
    res.json(rows.map(r => ({
      id: r.id, customerCode: r.customer_code, name: r.name,
      contactPerson: r.contact_person, email: r.email,
      creditLimit: parseFloat(r.credit_limit),
    })))
  } catch (e) { next(e) }
})

// ─── Fixed Assets ───────────────────────────────────────────────

router.get('/assets', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT * FROM fin_fixed_assets ORDER BY asset_code`
    )
    res.json(rows.map(r => ({
      id: r.id, assetCode: r.asset_code, name: r.name, category: r.category,
      department: r.department_code, acquisitionDate: r.acquisition_date,
      acquisitionCost: parseFloat(r.acquisition_cost),
      accumulatedDepreciation: parseFloat(r.accumulated_depreciation),
      netBookValue: parseFloat(r.net_book_value),
      usefulLifeMonths: r.useful_life_months, status: r.status,
      location: r.location, custodian: r.custodian,
    })))
  } catch (e) { next(e) }
})

router.post('/assets', async (req, res, next) => {
  try {
    const data = z.object({
      assetCode: z.string().min(2),
      name: z.string().min(2),
      category: z.string().min(1),
      departmentCode: z.string().optional().nullable(),
      acquisitionDate: z.string(),
      acquisitionCost: z.number().min(0),
      usefulLifeMonths: z.number().int().min(1),
      salvageValue: z.number().min(0).default(0),
      depreciationMethod: z.string().default('straight_line'),
      location: z.string().optional().nullable(),
      custodian: z.string().optional().nullable(),
    }).parse(req.body)

    const nbv = data.acquisitionCost
    const [row] = await query(
      `INSERT INTO fin_fixed_assets
        (asset_code, name, category, department_code, acquisition_date,
         acquisition_cost, useful_life_months, salvage_value, net_book_value,
         depreciation_method, location, custodian)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [data.assetCode, data.name, data.category, data.departmentCode,
       data.acquisitionDate, data.acquisitionCost, data.usefulLifeMonths,
       data.salvageValue, nbv, data.depreciationMethod,
       data.location, data.custodian]
    )
    res.status(201).json({ id: row.id, assetCode: row.asset_code })
  } catch (e) { next(e) }
})

// ─── Executive overview (dashboard KPIs + chart inputs) ─────────

router.get('/overview-summary', async (_req, res, next) => {
  try {
    const [fy] = await query(
      `SELECT id, label FROM fin_fiscal_years WHERE is_closed = FALSE ORDER BY start_date DESC LIMIT 1`
    )
    const fiscalYearId = fy?.id ?? null
    const fiscalYearLabel = fy?.label ?? null

    let totalBudgetNgn = 0
    let spentYtdNgn = 0
    let committedNgn = 0
    if (fiscalYearId) {
      const [b] = await query(
        `SELECT COALESCE(SUM(revised_amount), 0)::numeric AS tb,
                COALESCE(SUM(actual_amount), 0)::numeric AS ta,
                COALESCE(SUM(committed_amount), 0)::numeric AS tc
         FROM fin_budget_heads
         WHERE fiscal_year_id = $1`,
        [fiscalYearId]
      )
      totalBudgetNgn = parseFloat(b.tb)
      spentYtdNgn = parseFloat(b.ta)
      committedNgn = parseFloat(b.tc)
    }

    const denom = totalBudgetNgn > 0 ? totalBudgetNgn : 0
    const budgetUtilisationPct =
      denom > 0 ? Math.min(100, Math.round((100 * (spentYtdNgn + committedNgn)) / denom)) : null

    const [liq] = await query(
      `SELECT COALESCE(SUM(current_balance), 0)::numeric AS t
       FROM fin_bank_accounts WHERE status = 'active'`
    )
    const liquidityNgn = parseFloat(liq.t)

    const [ap] = await query(
      `SELECT COUNT(*)::int AS c FROM fin_ap_invoices
       WHERE status IS NULL OR LOWER(status) NOT IN ('paid', 'cancelled', 'void')`
    )
    const openApCount = ap.c

    const spendRows = await query(
      `SELECT TRIM(TO_CHAR(je.entry_date, 'Mon')) AS month_label,
              EXTRACT(MONTH FROM je.entry_date)::int AS month_num,
              SUM(jl.debit_amount - jl.credit_amount)::numeric AS spend
       FROM fin_journal_lines jl
       JOIN fin_journal_entries je ON je.id = jl.journal_entry_id AND je.status = 'posted'
       JOIN fin_chart_of_accounts a ON a.id = jl.account_id AND a.account_type = 'expense'
       WHERE EXTRACT(YEAR FROM je.entry_date) = EXTRACT(YEAR FROM CURRENT_DATE)
       GROUP BY 1, 2 ORDER BY month_num`
    )

    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const spendMap = Object.fromEntries(
      spendRows.map((r) => [String(r.month_label || '').trim(), Math.max(0, parseFloat(r.spend) || 0)])
    )
    const spendByMonth = monthOrder.map((m) => ({
      month: m,
      amount: Math.round(((spendMap[m] || 0) / 1e6) * 10) / 10,
    }))

    let pieBudget = []
    if (fiscalYearId) {
      const pieRows = await query(
        `SELECT bh.department_code AS name, SUM(bh.revised_amount)::numeric AS v
         FROM fin_budget_heads bh
         JOIN fin_chart_of_accounts a ON a.id = bh.account_id AND a.account_type = 'expense'
         WHERE bh.fiscal_year_id = $1
         GROUP BY bh.department_code
         ORDER BY v DESC
         LIMIT 8`,
        [fiscalYearId]
      )
      const colors = ['#006838', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#0ea5e9', '#64748b', '#eab308']
      pieBudget = pieRows.map((r, i) => ({
        name: r.name,
        value: Math.round((parseFloat(r.v) / 1e6) * 10) / 10,
        color: colors[i % colors.length],
      }))
    }

    res.json({
      fiscalYearLabel,
      totalBudgetNgn,
      spentYtdNgn,
      committedNgn,
      budgetUtilisationPct,
      liquidityNgn,
      openApCount,
      spendByMonth,
      pieBudget,
    })
  } catch (e) {
    next(e)
  }
})

// ─── Reports ────────────────────────────────────────────────────

router.get('/reports/trial-balance', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT a.account_code, a.name, a.account_type, a.normal_balance,
              COALESCE(SUM(jl.debit_amount), 0)::numeric AS total_debit,
              COALESCE(SUM(jl.credit_amount), 0)::numeric AS total_credit
       FROM fin_chart_of_accounts a
       LEFT JOIN fin_journal_lines jl ON jl.account_id = a.id
       LEFT JOIN fin_journal_entries je ON je.id = jl.journal_entry_id AND je.status = 'posted'
       WHERE a.is_active = TRUE
       GROUP BY a.id, a.account_code, a.name, a.account_type, a.normal_balance
       HAVING COALESCE(SUM(jl.debit_amount), 0) != 0 OR COALESCE(SUM(jl.credit_amount), 0) != 0
       ORDER BY a.account_code`
    )

    res.json(rows.map(r => {
      const debit = parseFloat(r.total_debit)
      const credit = parseFloat(r.total_credit)
      const balance = debit - credit
      return {
        accountCode: r.account_code, name: r.name,
        accountType: r.account_type, debit, credit,
        balance: Math.abs(balance),
        balanceSide: balance >= 0 ? 'debit' : 'credit',
      }
    }))
  } catch (e) { next(e) }
})

router.get('/reports/income-statement', async (req, res, next) => {
  try {
    const revenue = await query(
      `SELECT a.account_code, a.name,
              COALESCE(SUM(jl.credit_amount) - SUM(jl.debit_amount), 0)::numeric AS amount
       FROM fin_chart_of_accounts a
       LEFT JOIN fin_journal_lines jl ON jl.account_id = a.id
       LEFT JOIN fin_journal_entries je ON je.id = jl.journal_entry_id AND je.status = 'posted'
       WHERE a.account_type = 'revenue' AND a.is_active = TRUE
       GROUP BY a.id ORDER BY a.account_code`
    )

    const expense = await query(
      `SELECT a.account_code, a.name,
              COALESCE(SUM(jl.debit_amount) - SUM(jl.credit_amount), 0)::numeric AS amount
       FROM fin_chart_of_accounts a
       LEFT JOIN fin_journal_lines jl ON jl.account_id = a.id
       LEFT JOIN fin_journal_entries je ON je.id = jl.journal_entry_id AND je.status = 'posted'
       WHERE a.account_type = 'expense' AND a.is_active = TRUE
       GROUP BY a.id ORDER BY a.account_code`
    )

    const totalRevenue = revenue.reduce((s, r) => s + parseFloat(r.amount), 0)
    const totalExpense = expense.reduce((s, r) => s + parseFloat(r.amount), 0)

    res.json({
      revenue: revenue.map(r => ({ accountCode: r.account_code, name: r.name, amount: parseFloat(r.amount) })),
      expenses: expense.map(r => ({ accountCode: r.account_code, name: r.name, amount: parseFloat(r.amount) })),
      totalRevenue, totalExpense,
      netIncome: totalRevenue - totalExpense,
    })
  } catch (e) { next(e) }
})

router.get('/reports/balance-sheet', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT a.account_type,
              a.account_code, a.name, a.normal_balance,
              COALESCE(SUM(jl.debit_amount), 0)::numeric AS total_debit,
              COALESCE(SUM(jl.credit_amount), 0)::numeric AS total_credit
       FROM fin_chart_of_accounts a
       LEFT JOIN fin_journal_lines jl ON jl.account_id = a.id
       LEFT JOIN fin_journal_entries je ON je.id = jl.journal_entry_id AND je.status = 'posted'
       WHERE a.account_type IN ('asset', 'liability', 'equity') AND a.is_active = TRUE
       GROUP BY a.id ORDER BY a.account_code`
    )

    const categorize = (type) => rows
      .filter(r => r.account_type === type)
      .map(r => {
        const bal = type === 'asset'
          ? parseFloat(r.total_debit) - parseFloat(r.total_credit)
          : parseFloat(r.total_credit) - parseFloat(r.total_debit)
        return { accountCode: r.account_code, name: r.name, balance: bal }
      })

    const assets = categorize('asset')
    const liabilities = categorize('liability')
    const equity = categorize('equity')

    res.json({
      assets, liabilities, equity,
      totalAssets: assets.reduce((s, a) => s + a.balance, 0),
      totalLiabilities: liabilities.reduce((s, l) => s + l.balance, 0),
      totalEquity: equity.reduce((s, e) => s + e.balance, 0),
    })
  } catch (e) { next(e) }
})

export default router
