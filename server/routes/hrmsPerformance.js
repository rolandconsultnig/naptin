import { Router } from 'express'
import { z } from 'zod'
import { query } from '../db.js'

const router = Router()

// ─── Review Cycles ──────────────────────────────────────────────

router.get('/cycles', async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT rc.*,
              (SELECT COUNT(*)::int FROM hr_performance_reviews pr WHERE pr.review_cycle_id = rc.id) AS review_count
       FROM hr_review_cycles rc ORDER BY rc.start_date DESC`
    )
    res.json(rows.map(r => ({
      id: r.id, name: r.name, cycleType: r.cycle_type,
      startDate: r.start_date, endDate: r.end_date,
      status: r.status, reviewCount: r.review_count,
    })))
  } catch (e) { next(e) }
})

router.post('/cycles', async (req, res, next) => {
  try {
    const data = z.object({
      name: z.string().min(2),
      cycleType: z.enum(['annual', 'mid_year', 'quarterly', 'probation']).default('annual'),
      startDate: z.string(),
      endDate: z.string(),
    }).parse(req.body)

    const [row] = await query(
      `INSERT INTO hr_review_cycles (name, cycle_type, start_date, end_date, created_by)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [data.name, data.cycleType, data.startDate, data.endDate, req.body.createdBy || 'system']
    )
    res.status(201).json({ id: row.id, name: row.name, status: row.status })
  } catch (e) { next(e) }
})

// ─── Goals ──────────────────────────────────────────────────────

router.get('/goals', async (req, res, next) => {
  try {
    const empId = req.query.employeeId ? parseInt(req.query.employeeId) : null
    const cycleId = req.query.cycleId ? parseInt(req.query.cycleId) : null

    const conditions = []
    const params = []
    let idx = 1

    if (empId) {
      conditions.push(`g.employee_id = $${idx}`)
      params.push(empId)
      idx++
    }
    if (cycleId) {
      conditions.push(`g.review_cycle_id = $${idx}`)
      params.push(cycleId)
      idx++
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''

    const rows = await query(
      `SELECT g.*,
              e.first_name || ' ' || e.last_name AS employee_name,
              rc.name AS cycle_name
       FROM hr_goals g
       JOIN hr_employees e ON e.id = g.employee_id
       LEFT JOIN hr_review_cycles rc ON rc.id = g.review_cycle_id
       ${where}
       ORDER BY g.created_at DESC`,
      params
    )

    res.json(rows.map(r => ({
      id: r.id,
      employeeId: r.employee_id,
      employeeName: r.employee_name,
      cycleName: r.cycle_name,
      title: r.title,
      description: r.description,
      category: r.category,
      weightPct: r.weight_pct,
      targetValue: r.target_value,
      actualValue: r.actual_value,
      status: r.status,
      selfRating: r.self_rating,
      managerRating: r.manager_rating,
    })))
  } catch (e) { next(e) }
})

router.post('/goals', async (req, res, next) => {
  try {
    const data = z.object({
      employeeId: z.number().int(),
      reviewCycleId: z.number().int().optional().nullable(),
      title: z.string().min(2),
      description: z.string().optional().default(''),
      category: z.string().optional().nullable(),
      weightPct: z.number().int().min(0).max(100).default(20),
      targetValue: z.string().optional().nullable(),
    }).parse(req.body)

    const [row] = await query(
      `INSERT INTO hr_goals
        (employee_id, review_cycle_id, title, description, category, weight_pct, target_value)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [data.employeeId, data.reviewCycleId, data.title, data.description,
       data.category, data.weightPct, data.targetValue]
    )
    res.status(201).json({ id: row.id, title: row.title })
  } catch (e) { next(e) }
})

router.patch('/goals/:id', async (req, res, next) => {
  try {
    const allowed = ['title', 'description', 'category', 'weightPct', 'targetValue',
                     'actualValue', 'status', 'selfRating', 'managerRating']
    const fieldMap = {
      title: 'title', description: 'description', category: 'category',
      weightPct: 'weight_pct', targetValue: 'target_value', actualValue: 'actual_value',
      status: 'status', selfRating: 'self_rating', managerRating: 'manager_rating',
    }

    const sets = []
    const params = []
    let idx = 1

    for (const key of allowed) {
      if (key in req.body) {
        sets.push(`${fieldMap[key]} = $${idx}`)
        params.push(req.body[key])
        idx++
      }
    }

    if (!sets.length) return res.status(400).json({ error: 'No fields to update' })

    sets.push(`updated_at = NOW()`)
    params.push(req.params.id)

    const [row] = await query(
      `UPDATE hr_goals SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    )
    if (!row) return res.status(404).json({ error: 'Goal not found' })
    res.json({ id: row.id, status: row.status })
  } catch (e) { next(e) }
})

// ─── Performance Reviews ────────────────────────────────────────

router.get('/reviews', async (req, res, next) => {
  try {
    const cycleId = req.query.cycleId ? parseInt(req.query.cycleId) : null

    const cond = cycleId ? 'WHERE pr.review_cycle_id = $1' : ''
    const params = cycleId ? [cycleId] : []

    const rows = await query(
      `SELECT pr.*,
              e.first_name || ' ' || e.last_name AS employee_name,
              e.employee_id AS employee_code,
              d.name AS department_name,
              rv.first_name || ' ' || rv.last_name AS reviewer_name,
              rc.name AS cycle_name
       FROM hr_performance_reviews pr
       JOIN hr_employees e ON e.id = pr.employee_id
       LEFT JOIN hr_departments d ON d.id = e.department_id
       LEFT JOIN hr_employees rv ON rv.id = pr.reviewer_id
       JOIN hr_review_cycles rc ON rc.id = pr.review_cycle_id
       ${cond}
       ORDER BY pr.created_at DESC`,
      params
    )

    res.json(rows.map(r => ({
      id: r.id,
      employeeName: r.employee_name,
      employeeCode: r.employee_code,
      department: r.department_name,
      reviewerName: r.reviewer_name,
      cycleName: r.cycle_name,
      overallRating: r.overall_rating ? parseFloat(r.overall_rating) : null,
      selfAssessment: r.self_assessment,
      managerAssessment: r.manager_assessment,
      developmentPlan: r.development_plan,
      status: r.status,
      submittedAt: r.submitted_at,
      completedAt: r.completed_at,
    })))
  } catch (e) { next(e) }
})

router.post('/reviews', async (req, res, next) => {
  try {
    const data = z.object({
      employeeId: z.number().int(),
      reviewCycleId: z.number().int(),
      reviewerId: z.number().int().optional().nullable(),
      overallRating: z.number().optional().nullable(),
      selfAssessment: z.string().optional().default(''),
      managerAssessment: z.string().optional().default(''),
      developmentPlan: z.string().optional().default(''),
    }).parse(req.body)

    const [row] = await query(
      `INSERT INTO hr_performance_reviews
        (employee_id, review_cycle_id, reviewer_id, overall_rating,
         self_assessment, manager_assessment, development_plan, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'submitted')
       ON CONFLICT (employee_id, review_cycle_id) DO UPDATE
       SET overall_rating = EXCLUDED.overall_rating,
           self_assessment = EXCLUDED.self_assessment,
           manager_assessment = EXCLUDED.manager_assessment,
           development_plan = EXCLUDED.development_plan,
           submitted_at = NOW()
       RETURNING *`,
      [data.employeeId, data.reviewCycleId, data.reviewerId, data.overallRating,
       data.selfAssessment, data.managerAssessment, data.developmentPlan]
    )
    res.status(201).json({ id: row.id, status: row.status })
  } catch (e) { next(e) }
})

export default router
