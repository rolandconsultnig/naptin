import { Router } from 'express'
import { z } from 'zod'
import { query } from '../db.js'

const router = Router()

// ─── Leave Types ────────────────────────────────────────────────

router.get('/types', async (_req, res, next) => {
  try {
    const rows = await query(`SELECT * FROM hr_leave_types WHERE status = 'active' ORDER BY name`)
    res.json(rows.map(r => ({
      id: r.id, code: r.code, name: r.name,
      defaultDaysPerYear: r.default_days_per_year,
      carryOverMax: r.carry_over_max,
      requiresDocument: r.requires_document,
      isPaid: r.is_paid,
    })))
  } catch (e) { next(e) }
})

// ─── Leave Balances ─────────────────────────────────────────────

router.get('/balances/:employeeId', async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear()
    const rows = await query(
      `SELECT lb.*, lt.name AS leave_type_name, lt.code AS leave_type_code
       FROM hr_leave_balances lb
       JOIN hr_leave_types lt ON lt.id = lb.leave_type_id
       WHERE lb.employee_id = $1 AND lb.year = $2
       ORDER BY lt.name`,
      [req.params.employeeId, year]
    )
    res.json(rows.map(r => ({
      id: r.id,
      leaveType: r.leave_type_name,
      leaveTypeCode: r.leave_type_code,
      year: r.year,
      entitled: r.entitled_days,
      used: r.used_days,
      carriedOver: r.carried_over,
      adjusted: r.adjusted,
      remaining: r.entitled_days + r.carried_over + r.adjusted - r.used_days,
    })))
  } catch (e) { next(e) }
})

// ─── Leave Requests ─────────────────────────────────────────────

const leaveRequestSchema = z.object({
  employeeId: z.number().int(),
  leaveTypeId: z.number().int(),
  startDate: z.string(),
  endDate: z.string(),
  daysRequested: z.number().int().min(1),
  reason: z.string().optional().default(''),
  reliefOfficerId: z.number().int().optional().nullable(),
})

router.get('/requests', async (req, res, next) => {
  try {
    const employeeId = req.query.employeeId ? parseInt(req.query.employeeId) : null
    const status = (req.query.status || '').trim()
    const limit = Math.min(parseInt(req.query.limit) || 50, 200)

    const conditions = []
    const params = []
    let idx = 1

    if (employeeId) {
      conditions.push(`lr.employee_id = $${idx}`)
      params.push(employeeId)
      idx++
    }
    if (status && status !== 'all') {
      conditions.push(`lr.status = $${idx}`)
      params.push(status)
      idx++
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''

    const rows = await query(
      `SELECT lr.*,
              e.first_name || ' ' || e.last_name AS employee_name,
              e.employee_id AS employee_code,
              d.name AS department_name,
              lt.name AS leave_type_name,
              rv.first_name || ' ' || rv.last_name AS reviewer_name,
              rl.first_name || ' ' || rl.last_name AS relief_officer_name
       FROM hr_leave_requests lr
       JOIN hr_employees e ON e.id = lr.employee_id
       LEFT JOIN hr_departments d ON d.id = e.department_id
       JOIN hr_leave_types lt ON lt.id = lr.leave_type_id
       LEFT JOIN hr_employees rv ON rv.id = lr.reviewed_by
       LEFT JOIN hr_employees rl ON rl.id = lr.relief_officer_id
       ${where}
       ORDER BY lr.created_at DESC
       LIMIT $${idx}`,
      [...params, limit]
    )

    res.json(rows.map(r => ({
      id: r.id,
      employeeId: r.employee_id,
      employeeName: r.employee_name,
      employeeCode: r.employee_code,
      department: r.department_name,
      leaveType: r.leave_type_name,
      startDate: r.start_date,
      endDate: r.end_date,
      daysRequested: r.days_requested,
      reason: r.reason,
      reliefOfficer: r.relief_officer_name,
      status: r.status,
      reviewerName: r.reviewer_name,
      reviewComment: r.review_comment,
      reviewedAt: r.reviewed_at,
      createdAt: r.created_at,
    })))
  } catch (e) { next(e) }
})

router.post('/requests', async (req, res, next) => {
  try {
    const data = leaveRequestSchema.parse(req.body)

    // check balance
    const [balance] = await query(
      `SELECT entitled_days + carried_over + adjusted - used_days AS remaining
       FROM hr_leave_balances
       WHERE employee_id = $1 AND leave_type_id = $2 AND year = $3`,
      [data.employeeId, data.leaveTypeId, new Date().getFullYear()]
    )
    if (balance && balance.remaining < data.daysRequested) {
      return res.status(400).json({ error: `Insufficient leave balance. ${balance.remaining} days remaining.` })
    }

    const [row] = await query(
      `INSERT INTO hr_leave_requests
        (employee_id, leave_type_id, start_date, end_date, days_requested, reason, relief_officer_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [data.employeeId, data.leaveTypeId, data.startDate, data.endDate,
       data.daysRequested, data.reason, data.reliefOfficerId]
    )
    res.status(201).json({ id: row.id, status: row.status })
  } catch (e) { next(e) }
})

router.patch('/requests/:id/review', async (req, res, next) => {
  try {
    const { status, reviewComment, reviewedBy } = req.body
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' })
    }

    const [lr] = await query(`SELECT * FROM hr_leave_requests WHERE id = $1`, [req.params.id])
    if (!lr) return res.status(404).json({ error: 'Leave request not found' })
    if (lr.status !== 'pending') return res.status(400).json({ error: 'Request already reviewed' })

    const [updated] = await query(
      `UPDATE hr_leave_requests
       SET status = $1, review_comment = $2, reviewed_by = $3, reviewed_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [status, reviewComment || null, reviewedBy || null, req.params.id]
    )

    // deduct balance on approval
    if (status === 'approved') {
      await query(
        `UPDATE hr_leave_balances
         SET used_days = used_days + $1, updated_at = NOW()
         WHERE employee_id = $2 AND leave_type_id = $3 AND year = $4`,
        [lr.days_requested, lr.employee_id, lr.leave_type_id, new Date().getFullYear()]
      )
    }

    res.json({ id: updated.id, status: updated.status })
  } catch (e) { next(e) }
})

export default router
