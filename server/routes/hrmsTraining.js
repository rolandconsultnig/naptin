import { Router } from 'express'
import { z } from 'zod'
import { query } from '../db.js'

const router = Router()

// ─── Courses ────────────────────────────────────────────────────

const courseSchema = z.object({
  code: z.string().min(2),
  title: z.string().min(2),
  category: z.string().min(1),
  deliveryMode: z.enum(['classroom', 'virtual', 'elearning', 'blended']).default('classroom'),
  durationHours: z.number().int().min(1).default(8),
  description: z.string().optional().default(''),
  facilitator: z.string().optional().nullable(),
  maxParticipants: z.number().int().optional().nullable(),
  isMandatory: z.boolean().default(false),
  certificationRequired: z.boolean().default(false),
})

router.get('/courses', async (req, res, next) => {
  try {
    const category = (req.query.category || '').trim()
    const q = (req.query.q || '').trim().toLowerCase()

    const conditions = []
    const params = []
    let idx = 1

    if (category && category !== 'all') {
      conditions.push(`c.category = $${idx}`)
      params.push(category)
      idx++
    }
    if (q) {
      conditions.push(`(LOWER(c.title) LIKE $${idx} OR LOWER(c.code) LIKE $${idx})`)
      params.push(`%${q}%`)
      idx++
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''

    const rows = await query(
      `SELECT c.*,
              (SELECT COUNT(*)::int FROM hr_training_sessions s WHERE s.course_id = c.id) AS session_count,
              (SELECT COUNT(*)::int FROM hr_training_enrollments te
               JOIN hr_training_sessions ts ON ts.id = te.session_id
               WHERE ts.course_id = c.id) AS total_enrollments
       FROM hr_training_courses c
       ${where}
       ORDER BY c.title`,
      params
    )

    res.json(rows.map(r => ({
      id: r.id, code: r.code, title: r.title, category: r.category,
      deliveryMode: r.delivery_mode, durationHours: r.duration_hours,
      description: r.description, facilitator: r.facilitator,
      maxParticipants: r.max_participants, isMandatory: r.is_mandatory,
      certificationRequired: r.certification_required, status: r.status,
      sessionCount: r.session_count, totalEnrollments: r.total_enrollments,
    })))
  } catch (e) { next(e) }
})

router.post('/courses', async (req, res, next) => {
  try {
    const data = courseSchema.parse(req.body)
    const [row] = await query(
      `INSERT INTO hr_training_courses
        (code, title, category, delivery_mode, duration_hours, description,
         facilitator, max_participants, is_mandatory, certification_required)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [data.code, data.title, data.category, data.deliveryMode, data.durationHours,
       data.description, data.facilitator, data.maxParticipants,
       data.isMandatory, data.certificationRequired]
    )
    res.status(201).json({ id: row.id, code: row.code, title: row.title })
  } catch (e) { next(e) }
})

// ─── Sessions ───────────────────────────────────────────────────

router.get('/courses/:courseId/sessions', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT s.*,
              c.title AS course_title,
              (SELECT COUNT(*)::int FROM hr_training_enrollments te WHERE te.session_id = s.id) AS enrolled
       FROM hr_training_sessions s
       JOIN hr_training_courses c ON c.id = s.course_id
       WHERE s.course_id = $1
       ORDER BY s.start_date DESC`,
      [req.params.courseId]
    )
    res.json(rows.map(r => ({
      id: r.id, courseId: r.course_id, courseTitle: r.course_title,
      venue: r.venue, startDate: r.start_date, endDate: r.end_date,
      facilitator: r.facilitator, capacity: r.capacity,
      enrolledCount: r.enrolled, status: r.status,
    })))
  } catch (e) { next(e) }
})

router.post('/courses/:courseId/sessions', async (req, res, next) => {
  try {
    const data = z.object({
      venue: z.string().optional().nullable(),
      startDate: z.string(),
      endDate: z.string(),
      facilitator: z.string().optional().nullable(),
      capacity: z.number().int().optional().nullable(),
    }).parse(req.body)

    const [row] = await query(
      `INSERT INTO hr_training_sessions (course_id, venue, start_date, end_date, facilitator, capacity)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.params.courseId, data.venue, data.startDate, data.endDate, data.facilitator, data.capacity]
    )
    res.status(201).json({ id: row.id, status: row.status })
  } catch (e) { next(e) }
})

// ─── Enrollments ────────────────────────────────────────────────

router.post('/sessions/:sessionId/enroll', async (req, res, next) => {
  try {
    const { employeeId } = req.body
    if (!employeeId) return res.status(400).json({ error: 'employeeId required' })

    // check capacity
    const [session] = await query(`SELECT * FROM hr_training_sessions WHERE id = $1`, [req.params.sessionId])
    if (!session) return res.status(404).json({ error: 'Session not found' })

    if (session.capacity) {
      const [count] = await query(
        `SELECT COUNT(*)::int AS cnt FROM hr_training_enrollments WHERE session_id = $1`,
        [req.params.sessionId]
      )
      if (count.cnt >= session.capacity) {
        return res.status(400).json({ error: 'Session is full' })
      }
    }

    const [row] = await query(
      `INSERT INTO hr_training_enrollments (session_id, employee_id)
       VALUES ($1, $2)
       ON CONFLICT (session_id, employee_id) DO NOTHING
       RETURNING *`,
      [req.params.sessionId, employeeId]
    )

    if (row) {
      await query(
        `UPDATE hr_training_sessions SET enrolled_count = enrolled_count + 1 WHERE id = $1`,
        [req.params.sessionId]
      )
    }

    res.status(201).json({ enrolled: true })
  } catch (e) { next(e) }
})

router.get('/enrollments', async (req, res, next) => {
  try {
    const empId = req.query.employeeId ? parseInt(req.query.employeeId) : null

    const cond = empId ? 'WHERE te.employee_id = $1' : ''
    const params = empId ? [empId] : []

    const rows = await query(
      `SELECT te.*,
              e.first_name || ' ' || e.last_name AS employee_name,
              c.title AS course_title,
              c.category AS course_category,
              s.start_date, s.end_date, s.venue
       FROM hr_training_enrollments te
       JOIN hr_employees e ON e.id = te.employee_id
       JOIN hr_training_sessions s ON s.id = te.session_id
       JOIN hr_training_courses c ON c.id = s.course_id
       ${cond}
       ORDER BY s.start_date DESC`,
      params
    )

    res.json(rows.map(r => ({
      id: r.id, employeeName: r.employee_name,
      courseTitle: r.course_title, courseCategory: r.course_category,
      startDate: r.start_date, endDate: r.end_date, venue: r.venue,
      status: r.status, attendanceConfirmed: r.attendance_confirmed,
      score: r.score ? parseFloat(r.score) : null,
      completedAt: r.completed_at,
    })))
  } catch (e) { next(e) }
})

// ─── Certifications ─────────────────────────────────────────────

router.get('/certifications/:employeeId', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT * FROM hr_certifications WHERE employee_id = $1 ORDER BY expiry_date ASC NULLS LAST`,
      [req.params.employeeId]
    )
    res.json(rows.map(r => ({
      id: r.id, name: r.name, issuer: r.issuer,
      issuedDate: r.issued_date, expiryDate: r.expiry_date,
      certificateUrl: r.certificate_url, status: r.status,
    })))
  } catch (e) { next(e) }
})

export default router
