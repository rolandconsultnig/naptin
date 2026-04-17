import { Router } from 'express'
import { z } from 'zod'
import { query } from '../db.js'

const router = Router()

// ─── Job Openings ───────────────────────────────────────────────

const jobSchema = z.object({
  title: z.string().min(2),
  departmentId: z.number().int().optional().nullable(),
  gradeLevel: z.string().optional().nullable(),
  employmentType: z.enum(['permanent', 'contract', 'secondment', 'intern']).default('permanent'),
  vacancies: z.number().int().min(1).default(1),
  description: z.string().optional().default(''),
  requirements: z.string().optional().default(''),
  closingDate: z.string().optional().nullable(),
})

router.get('/jobs', async (req, res, next) => {
  try {
    const status = (req.query.status || '').trim()
    const conditions = status && status !== 'all' ? [`j.status = $1`] : []
    const params = status && status !== 'all' ? [status] : []

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''
    const rows = await query(
      `SELECT j.*, d.name AS department_name,
              (SELECT COUNT(*)::int FROM hr_candidates c WHERE c.job_opening_id = j.id) AS applicant_count
       FROM hr_job_openings j
       LEFT JOIN hr_departments d ON d.id = j.department_id
       ${where}
       ORDER BY j.created_at DESC`,
      params
    )

    res.json(rows.map(r => ({
      id: r.id,
      title: r.title,
      department: r.department_name,
      departmentId: r.department_id,
      gradeLevel: r.grade_level,
      employmentType: r.employment_type,
      vacancies: r.vacancies,
      description: r.description,
      requirements: r.requirements,
      closingDate: r.closing_date,
      status: r.status,
      applicantCount: r.applicant_count,
      createdAt: r.created_at,
    })))
  } catch (e) { next(e) }
})

router.post('/jobs', async (req, res, next) => {
  try {
    const data = jobSchema.parse(req.body)
    const [row] = await query(
      `INSERT INTO hr_job_openings
        (title, department_id, grade_level, employment_type, vacancies,
         description, requirements, closing_date, posted_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [data.title, data.departmentId, data.gradeLevel, data.employmentType,
       data.vacancies, data.description, data.requirements,
       data.closingDate, req.body.postedBy || 'system']
    )
    res.status(201).json({ id: row.id, title: row.title, status: row.status })
  } catch (e) { next(e) }
})

router.patch('/jobs/:id', async (req, res, next) => {
  try {
    const { status } = req.body
    if (status) {
      const [row] = await query(
        `UPDATE hr_job_openings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [status, req.params.id]
      )
      if (!row) return res.status(404).json({ error: 'Job not found' })
      return res.json({ id: row.id, status: row.status })
    }
    res.status(400).json({ error: 'No fields to update' })
  } catch (e) { next(e) }
})

// ─── Candidates ─────────────────────────────────────────────────

const candidateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  source: z.string().optional().default('portal'),
})

router.get('/jobs/:jobId/candidates', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT * FROM hr_candidates WHERE job_opening_id = $1 ORDER BY created_at DESC`,
      [req.params.jobId]
    )
    res.json(rows.map(r => ({
      id: r.id,
      jobOpeningId: r.job_opening_id,
      firstName: r.first_name,
      lastName: r.last_name,
      name: `${r.first_name} ${r.last_name}`,
      email: r.email,
      phone: r.phone,
      pipelineStage: r.pipeline_stage,
      rating: r.rating,
      notes: r.notes,
      source: r.source,
      createdAt: r.created_at,
    })))
  } catch (e) { next(e) }
})

router.post('/jobs/:jobId/candidates', async (req, res, next) => {
  try {
    const data = candidateSchema.parse(req.body)
    const [row] = await query(
      `INSERT INTO hr_candidates (job_opening_id, first_name, last_name, email, phone, source)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.params.jobId, data.firstName, data.lastName, data.email, data.phone, data.source]
    )
    res.status(201).json({ id: row.id, name: `${row.first_name} ${row.last_name}`, pipelineStage: row.pipeline_stage })
  } catch (e) { next(e) }
})

router.patch('/candidates/:id/stage', async (req, res, next) => {
  try {
    const stages = ['applied', 'screening', 'interview', 'assessment', 'offer', 'hired', 'rejected']
    const { stage, notes, rating } = req.body
    if (!stages.includes(stage)) return res.status(400).json({ error: 'Invalid pipeline stage' })

    const sets = [`pipeline_stage = $1`, `updated_at = NOW()`]
    const params = [stage]
    let idx = 2

    if (notes !== undefined) {
      sets.push(`notes = $${idx}`)
      params.push(notes)
      idx++
    }
    if (rating !== undefined) {
      sets.push(`rating = $${idx}`)
      params.push(rating)
      idx++
    }

    params.push(req.params.id)
    const [row] = await query(
      `UPDATE hr_candidates SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    )
    if (!row) return res.status(404).json({ error: 'Candidate not found' })
    res.json({ id: row.id, pipelineStage: row.pipeline_stage })
  } catch (e) { next(e) }
})

// ─── Interviews ─────────────────────────────────────────────────

const interviewSchema = z.object({
  interviewerName: z.string().min(2),
  interviewType: z.enum(['panel', 'technical', 'hr', 'final']).default('panel'),
  scheduledAt: z.string(),
  durationMinutes: z.number().int().default(60),
  location: z.string().optional().nullable(),
})

router.post('/candidates/:candidateId/interviews', async (req, res, next) => {
  try {
    const data = interviewSchema.parse(req.body)
    const [row] = await query(
      `INSERT INTO hr_interviews
        (candidate_id, interviewer_name, interview_type, scheduled_at, duration_minutes, location)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.params.candidateId, data.interviewerName, data.interviewType,
       data.scheduledAt, data.durationMinutes, data.location]
    )
    res.status(201).json({ id: row.id, scheduledAt: row.scheduled_at, status: row.status })
  } catch (e) { next(e) }
})

router.get('/interviews', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT i.*, c.first_name || ' ' || c.last_name AS candidate_name, j.title AS job_title
       FROM hr_interviews i
       JOIN hr_candidates c ON c.id = i.candidate_id
       JOIN hr_job_openings j ON j.id = c.job_opening_id
       ORDER BY i.scheduled_at DESC
       LIMIT 100`
    )
    res.json(rows.map(r => ({
      id: r.id,
      candidateId: r.candidate_id,
      candidateName: r.candidate_name,
      jobTitle: r.job_title,
      interviewerName: r.interviewer_name,
      interviewType: r.interview_type,
      scheduledAt: r.scheduled_at,
      durationMinutes: r.duration_minutes,
      location: r.location,
      status: r.status,
      feedback: r.feedback,
      score: r.score,
    })))
  } catch (e) { next(e) }
})

export default router
