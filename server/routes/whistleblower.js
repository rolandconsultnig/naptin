import { Router } from 'express'
import { z } from 'zod'
import { query } from '../db.js'
import crypto from 'node:crypto'

const router = Router()

// ─── Submit Report (Anonymous) ──────────────────────────────────

router.post('/reports', async (req, res, next) => {
  try {
    const data = z.object({
      category: z.string().min(1),
      subject: z.string().min(5),
      description: z.string().min(10),
      involvedPersons: z.string().optional().default(''),
      department: z.string().optional().nullable(),
      dateOfIncident: z.string().optional().nullable(),
      evidenceDescription: z.string().optional().default(''),
    }).parse(req.body)

    // Generate anonymous tracking code
    const trackingCode = `WB-${crypto.randomBytes(4).toString('hex').toUpperCase()}`

    const [row] = await query(
      `INSERT INTO wb_cases
        (tracking_code, category, subject, description, involved_persons,
         department, date_of_incident, evidence_description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING tracking_code, status, created_at`,
      [trackingCode, data.category, data.subject, data.description,
       data.involvedPersons, data.department, data.dateOfIncident,
       data.evidenceDescription]
    )

    res.status(201).json({
      trackingCode: row.tracking_code,
      message: 'Report submitted anonymously. Use your tracking code to check status.',
    })
  } catch (e) { next(e) }
})

// ─── Track Report (Anonymous) ───────────────────────────────────

router.get('/reports/track/:trackingCode', async (req, res, next) => {
  try {
    const code = req.params.trackingCode.trim()
    const [row] = await query(
      `SELECT tracking_code, category, subject, status, created_at
       FROM wb_cases
       WHERE tracking_code = $1`,
      [code]
    )

    if (!row) return res.status(404).json({ error: 'No report found with this tracking code' })

    // Also get timeline entries visible to reporter
    const timeline = await query(
      `SELECT action, note, created_at
       FROM wb_case_timeline
       WHERE case_id = (SELECT id FROM wb_cases WHERE tracking_code = $1)
         AND visible_to_reporter = TRUE
       ORDER BY created_at`,
      [code]
    )

    res.json({
      trackingCode: row.tracking_code,
      category: row.category,
      subject: row.subject,
      status: row.status,
      submittedAt: row.created_at,
      timeline: timeline.map(t => ({
        action: t.action, note: t.note, date: t.created_at,
      })),
    })
  } catch (e) { next(e) }
})

// ─── Admin: List Cases ──────────────────────────────────────────

router.get('/cases', async (req, res, next) => {
  try {
    const status = (req.query.status || '').trim()
    const cond = status && status !== 'all' ? `WHERE c.status = $1` : ''
    const params = status && status !== 'all' ? [status] : []

    const rows = await query(
      `SELECT c.* FROM wb_cases c ${cond} ORDER BY c.created_at DESC`,
      params
    )

    res.json(rows.map(r => ({
      id: r.id, trackingCode: r.tracking_code,
      category: r.category, subject: r.subject,
      description: r.description,
      involvedPersons: r.involved_persons,
      department: r.department, dateOfIncident: r.date_of_incident,
      status: r.status, priority: r.priority,
      assignedTo: r.assigned_to, createdAt: r.created_at,
    })))
  } catch (e) { next(e) }
})

router.get('/cases/:id', async (req, res, next) => {
  try {
    const [row] = await query(`SELECT * FROM wb_cases WHERE id = $1`, [req.params.id])
    if (!row) return res.status(404).json({ error: 'Case not found' })

    const timeline = await query(
      `SELECT * FROM wb_case_timeline WHERE case_id = $1 ORDER BY created_at`,
      [row.id]
    )

    res.json({
      id: row.id, trackingCode: row.tracking_code,
      category: row.category, subject: row.subject,
      description: row.description,
      involvedPersons: row.involved_persons,
      department: row.department,
      dateOfIncident: row.date_of_incident,
      evidenceDescription: row.evidence_description,
      status: row.status, priority: row.priority,
      assignedTo: row.assigned_to,
      createdAt: row.created_at,
      timeline: timeline.map(t => ({
        id: t.id, action: t.action, performedBy: t.performed_by,
        note: t.note, visibleToReporter: t.visible_to_reporter,
        date: t.created_at,
      })),
    })
  } catch (e) { next(e) }
})

// ─── Admin: Case Actions ────────────────────────────────────────

router.post('/cases/:id/assign', async (req, res, next) => {
  try {
    const data = z.object({
      assignedTo: z.string().min(1),
      performedBy: z.string().default('admin'),
    }).parse(req.body)

    const [row] = await query(
      `UPDATE wb_cases SET assigned_to = $1, status = 'under_investigation'
       WHERE id = $2 RETURNING *`,
      [data.assignedTo, req.params.id]
    )
    if (!row) return res.status(404).json({ error: 'Case not found' })

    await query(
      `INSERT INTO wb_case_timeline (case_id, action, performed_by, note, visible_to_reporter)
       VALUES ($1, 'assigned', $2, $3, TRUE)`,
      [row.id, data.performedBy, `Case assigned to investigator`]
    )

    res.json({ id: row.id, status: row.status, assignedTo: row.assigned_to })
  } catch (e) { next(e) }
})

router.post('/cases/:id/update-status', async (req, res, next) => {
  try {
    const data = z.object({
      status: z.enum(['submitted', 'under_review', 'under_investigation', 'action_taken', 'closed', 'dismissed']),
      note: z.string().optional().default(''),
      performedBy: z.string().default('admin'),
      visibleToReporter: z.boolean().default(true),
    }).parse(req.body)

    const [row] = await query(
      `UPDATE wb_cases SET status = $1 WHERE id = $2 RETURNING *`,
      [data.status, req.params.id]
    )
    if (!row) return res.status(404).json({ error: 'Case not found' })

    await query(
      `INSERT INTO wb_case_timeline (case_id, action, performed_by, note, visible_to_reporter)
       VALUES ($1, $2, $3, $4, $5)`,
      [row.id, `status_${data.status}`, data.performedBy, data.note, data.visibleToReporter]
    )

    res.json({ id: row.id, status: row.status })
  } catch (e) { next(e) }
})

router.post('/cases/:id/add-note', async (req, res, next) => {
  try {
    const data = z.object({
      note: z.string().min(1),
      performedBy: z.string().default('admin'),
      visibleToReporter: z.boolean().default(false),
    }).parse(req.body)

    const [row] = await query(
      `INSERT INTO wb_case_timeline (case_id, action, performed_by, note, visible_to_reporter)
       VALUES ($1, 'note', $2, $3, $4) RETURNING *`,
      [req.params.id, data.performedBy, data.note, data.visibleToReporter]
    )

    res.json({ id: row.id, action: row.action })
  } catch (e) { next(e) }
})

// ─── Dashboard ──────────────────────────────────────────────────

router.get('/summary', async (_req, res, next) => {
  try {
    const [total] = await query(`SELECT COUNT(*) AS c FROM wb_cases`)
    const [open] = await query(
      `SELECT COUNT(*) AS c FROM wb_cases WHERE status NOT IN ('closed','dismissed')`
    )
    const [byCategory] = await query(
      `SELECT category, COUNT(*) AS c FROM wb_cases GROUP BY category ORDER BY c DESC`
    )

    const statusBreakdown = await query(
      `SELECT status, COUNT(*) AS c FROM wb_cases GROUP BY status`
    )

    res.json({
      totalCases: parseInt(total.c),
      openCases: parseInt(open.c),
      statusBreakdown: statusBreakdown.reduce((acc, r) => {
        acc[r.status] = parseInt(r.c)
        return acc
      }, {}),
    })
  } catch (e) { next(e) }
})

export default router
