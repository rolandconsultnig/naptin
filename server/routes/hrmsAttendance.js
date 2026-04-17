import { Router } from 'express'
import { z } from 'zod'
import { query } from '../db.js'

const router = Router()

// ─── Clock In / Clock Out ───────────────────────────────────────

router.post('/clock-in', async (req, res, next) => {
  try {
    const { employeeId } = req.body
    if (!employeeId) return res.status(400).json({ error: 'employeeId required' })

    const today = new Date().toISOString().slice(0, 10)
    const [existing] = await query(
      `SELECT id, clock_in FROM hr_attendance WHERE employee_id = $1 AND work_date = $2`,
      [employeeId, today]
    )

    if (existing?.clock_in) {
      return res.status(400).json({ error: 'Already clocked in today' })
    }

    if (existing) {
      const [row] = await query(
        `UPDATE hr_attendance SET clock_in = NOW(), status = 'present' WHERE id = $1 RETURNING *`,
        [existing.id]
      )
      return res.json({ id: row.id, clockIn: row.clock_in })
    }

    const [row] = await query(
      `INSERT INTO hr_attendance (employee_id, work_date, clock_in, status)
       VALUES ($1, $2, NOW(), 'present')
       RETURNING *`,
      [employeeId, today]
    )
    res.status(201).json({ id: row.id, clockIn: row.clock_in })
  } catch (e) { next(e) }
})

router.post('/clock-out', async (req, res, next) => {
  try {
    const { employeeId } = req.body
    if (!employeeId) return res.status(400).json({ error: 'employeeId required' })

    const today = new Date().toISOString().slice(0, 10)
    const [existing] = await query(
      `SELECT id, clock_in FROM hr_attendance WHERE employee_id = $1 AND work_date = $2`,
      [employeeId, today]
    )
    if (!existing) return res.status(400).json({ error: 'No clock-in record for today' })
    if (!existing.clock_in) return res.status(400).json({ error: 'Must clock in first' })

    const [row] = await query(
      `UPDATE hr_attendance SET clock_out = NOW() WHERE id = $1 RETURNING *`,
      [existing.id]
    )

    // calculate overtime if > 8 hours
    const hoursWorked = (new Date(row.clock_out) - new Date(row.clock_in)) / 3600000
    const overtime = Math.max(0, Math.round((hoursWorked - 8) * 10) / 10)

    if (overtime > 0) {
      await query(`UPDATE hr_attendance SET overtime_hours = $1 WHERE id = $2`, [overtime, row.id])
    }

    res.json({ id: row.id, clockOut: row.clock_out, hoursWorked: Math.round(hoursWorked * 10) / 10, overtime })
  } catch (e) { next(e) }
})

// ─── Attendance List ────────────────────────────────────────────

router.get('/', async (req, res, next) => {
  try {
    const employeeId = req.query.employeeId ? parseInt(req.query.employeeId) : null
    const department = (req.query.department || '').trim()
    const startDate = req.query.startDate || null
    const endDate = req.query.endDate || null
    const limit = Math.min(parseInt(req.query.limit) || 50, 200)

    const conditions = []
    const params = []
    let idx = 1

    if (employeeId) {
      conditions.push(`a.employee_id = $${idx}`)
      params.push(employeeId)
      idx++
    }
    if (department) {
      conditions.push(`d.code = $${idx}`)
      params.push(department)
      idx++
    }
    if (startDate) {
      conditions.push(`a.work_date >= $${idx}`)
      params.push(startDate)
      idx++
    }
    if (endDate) {
      conditions.push(`a.work_date <= $${idx}`)
      params.push(endDate)
      idx++
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''

    const rows = await query(
      `SELECT a.*,
              e.first_name || ' ' || e.last_name AS employee_name,
              e.employee_id AS employee_code,
              d.name AS department_name
       FROM hr_attendance a
       JOIN hr_employees e ON e.id = a.employee_id
       LEFT JOIN hr_departments d ON d.id = e.department_id
       ${where}
       ORDER BY a.work_date DESC, e.last_name
       LIMIT $${idx}`,
      [...params, limit]
    )

    res.json(rows.map(r => ({
      id: r.id,
      employeeId: r.employee_id,
      employeeName: r.employee_name,
      employeeCode: r.employee_code,
      department: r.department_name,
      workDate: r.work_date,
      clockIn: r.clock_in,
      clockOut: r.clock_out,
      status: r.status,
      overtimeHours: parseFloat(r.overtime_hours) || 0,
      source: r.source,
      notes: r.notes,
    })))
  } catch (e) { next(e) }
})

// ─── Attendance Summary (for dashboard) ─────────────────────────

router.get('/summary', async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10)
    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1)
    const weekStart = startOfWeek.toISOString().slice(0, 10)

    const [todayStats] = await query(
      `SELECT
        COUNT(*)::int AS total_today,
        COUNT(CASE WHEN status = 'present' THEN 1 END)::int AS present,
        COUNT(CASE WHEN status = 'absent' THEN 1 END)::int AS absent,
        COUNT(CASE WHEN status = 'late' THEN 1 END)::int AS late
       FROM hr_attendance WHERE work_date = $1`,
      [today]
    )

    const weeklyAvg = await query(
      `SELECT work_date::text AS day,
              COUNT(CASE WHEN status = 'present' THEN 1 END)::int AS present_count,
              COUNT(*)::int AS total_count
       FROM hr_attendance
       WHERE work_date >= $1 AND work_date <= $2
       GROUP BY work_date
       ORDER BY work_date`,
      [weekStart, today]
    )

    const [overtimeTotal] = await query(
      `SELECT COALESCE(SUM(overtime_hours), 0)::numeric AS total_overtime
       FROM hr_attendance WHERE work_date >= $1`,
      [weekStart]
    )

    res.json({
      today: todayStats || { total_today: 0, present: 0, absent: 0, late: 0 },
      weeklyAttendance: weeklyAvg,
      totalOvertimeThisWeek: parseFloat(overtimeTotal?.total_overtime) || 0,
    })
  } catch (e) { next(e) }
})

export default router
