import { Router } from 'express'
import { z } from 'zod'
import { query, withTx } from '../db.js'

const router = Router()

// ─── Validation Schemas ─────────────────────────────────────────

const employeeCreateSchema = z.object({
  employeeId: z.string().min(2),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  otherNames: z.string().optional().nullable(),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  maritalStatus: z.string().optional().nullable(),
  stateOfOrigin: z.string().optional().nullable(),
  lga: z.string().optional().nullable(),
  residentialAddress: z.string().optional().nullable(),
  departmentId: z.number().int().optional().nullable(),
  positionId: z.number().int().optional().nullable(),
  gradeLevel: z.string().optional().nullable(),
  step: z.number().int().optional().default(1),
  employmentType: z.enum(['permanent', 'contract', 'secondment', 'intern']).default('permanent'),
  employmentStatus: z.enum(['active', 'on_leave', 'suspended', 'terminated', 'retired']).default('active'),
  dateOfFirstAppointment: z.string().optional().nullable(),
  supervisorId: z.number().int().optional().nullable(),
  bankName: z.string().optional().nullable(),
  bankAccountNo: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
  pensionPin: z.string().optional().nullable(),
  profilePhotoUrl: z.string().optional().nullable(),
  portalDisplayName: z.string().optional().nullable(),
  portalBio: z.string().optional().nullable(),
  officeLocation: z.string().optional().nullable(),
})

const employeeUpdateSchema = employeeCreateSchema.partial()

const portalSelfSchema = z.object({
  email: z.string().email(),
  displayName: z.string().optional(),
  phone: z.union([z.string(), z.null()]).optional(),
  location: z.union([z.string(), z.null()]).optional(),
  bio: z.string().optional(),
  profilePhotoUrl: z.union([z.string(), z.null()]).optional(),
})
const employeeDocumentSchema = z.object({
  docType: z.string().min(1),
  title: z.string().min(1),
  fileUrl: z.string().min(1),
  fileSizeBytes: z.number().int().optional().nullable(),
  uploadedBy: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
})

function mapEmployee(row) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    firstName: row.first_name,
    lastName: row.last_name,
    otherNames: row.other_names,
    name: [row.first_name, row.other_names, row.last_name].filter(Boolean).join(' '),
    email: row.email,
    phone: row.phone,
    gender: row.gender,
    dateOfBirth: row.date_of_birth,
    maritalStatus: row.marital_status,
    stateOfOrigin: row.state_of_origin,
    lga: row.lga,
    residentialAddress: row.residential_address,
    departmentId: row.department_id,
    departmentName: row.department_name || null,
    positionId: row.position_id,
    positionTitle: row.position_title || null,
    gradeLevel: row.grade_level,
    step: row.step,
    employmentType: row.employment_type,
    employmentStatus: row.employment_status,
    dateOfFirstAppointment: row.date_of_first_appointment,
    dateOfCurrentAppointment: row.date_of_current_appointment,
    dateOfConfirmation: row.date_of_confirmation,
    retirementDate: row.retirement_date,
    supervisorId: row.supervisor_id,
    supervisorName: row.supervisor_name || null,
    bankName: row.bank_name,
    bankAccountNo: row.bank_account_no,
    taxId: row.tax_id,
    pensionPin: row.pension_pin,
    nhfNumber: row.nhf_number,
    profilePhotoUrl: row.profile_photo_url,
    portalDisplayName: row.portal_display_name,
    portalBio: row.portal_bio,
    officeLocation: row.office_location,
    portalUsername: row.portal_username,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapEmployeeDocument(row) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    docType: row.doc_type,
    title: row.title,
    fileUrl: row.file_url,
    fileSizeBytes: row.file_size_bytes,
    uploadedBy: row.uploaded_by,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  }
}

// ─── Employees ──────────────────────────────────────────────────

/** Self-service portal profile: updates hr_employees by email (username is not writable here). */
router.patch('/profile/me', async (req, res, next) => {
  try {
    const data = portalSelfSchema.parse(req.body)
    const [row] = await query(
      `SELECT id FROM hr_employees WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))`,
      [data.email]
    )
    if (!row) return res.status(404).json({ error: 'No employee record for this email' })

    const sets = []
    const params = []
    let idx = 1

    if (data.displayName !== undefined) {
      sets.push(`portal_display_name = $${idx++}`)
      params.push(data.displayName)
    }
    if (data.phone !== undefined) {
      sets.push(`phone = $${idx++}`)
      params.push(data.phone)
    }
    if (data.location !== undefined) {
      sets.push(`office_location = $${idx++}`)
      params.push(data.location)
    }
    if (data.bio !== undefined) {
      sets.push(`portal_bio = $${idx++}`)
      params.push(data.bio)
    }
    if (data.profilePhotoUrl !== undefined) {
      sets.push(`profile_photo_url = $${idx++}`)
      params.push(data.profilePhotoUrl)
    }

    if (!sets.length) return res.status(400).json({ error: 'No fields to update' })

    sets.push('updated_at = NOW()')
    params.push(row.id)

    await query(
      `UPDATE hr_employees SET ${sets.join(', ')} WHERE id = $${idx}`,
      params
    )

    const [full] = await query(
      `SELECT e.*,
              d.name AS department_name,
              p.title AS position_title,
              s.first_name || ' ' || s.last_name AS supervisor_name
       FROM hr_employees e
       LEFT JOIN hr_departments d ON d.id = e.department_id
       LEFT JOIN hr_positions p ON p.id = e.position_id
       LEFT JOIN hr_employees s ON s.id = e.supervisor_id
       WHERE e.id = $1`,
      [row.id]
    )
    res.json(mapEmployee(full))
  } catch (e) { next(e) }
})

router.get('/employees', async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim().toLowerCase()
    const dept = (req.query.department || '').trim()
    const status = (req.query.status || '').trim()
    const limit = Math.min(parseInt(req.query.limit) || 50, 200)
    const offset = parseInt(req.query.offset) || 0

    const conditions = []
    const params = []
    let idx = 1

    if (q) {
      conditions.push(`(LOWER(e.first_name || ' ' || e.last_name) LIKE $${idx} OR LOWER(e.employee_id) LIKE $${idx} OR LOWER(e.email) LIKE $${idx})`)
      params.push(`%${q}%`)
      idx++
    }
    if (dept) {
      conditions.push(`d.code = $${idx}`)
      params.push(dept)
      idx++
    }
    if (status) {
      conditions.push(`e.employment_status = $${idx}`)
      params.push(status)
      idx++
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''

    const rows = await query(
      `SELECT e.*,
              d.name AS department_name,
              p.title AS position_title,
              s.first_name || ' ' || s.last_name AS supervisor_name
       FROM hr_employees e
       LEFT JOIN hr_departments d ON d.id = e.department_id
       LEFT JOIN hr_positions p ON p.id = e.position_id
       LEFT JOIN hr_employees s ON s.id = e.supervisor_id
       ${where}
       ORDER BY e.last_name, e.first_name
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset]
    )

    const [countRow] = await query(
      `SELECT COUNT(*)::int AS total FROM hr_employees e
       LEFT JOIN hr_departments d ON d.id = e.department_id
       ${where}`,
      params
    )

    res.json({ employees: rows.map(mapEmployee), total: countRow?.total || 0 })
  } catch (e) { next(e) }
})

router.get('/employees/:id', async (req, res, next) => {
  try {
    const [row] = await query(
      `SELECT e.*,
              d.name AS department_name,
              p.title AS position_title,
              s.first_name || ' ' || s.last_name AS supervisor_name
       FROM hr_employees e
       LEFT JOIN hr_departments d ON d.id = e.department_id
       LEFT JOIN hr_positions p ON p.id = e.position_id
       LEFT JOIN hr_employees s ON s.id = e.supervisor_id
       WHERE e.id = $1`,
      [req.params.id]
    )
    if (!row) return res.status(404).json({ error: 'Employee not found' })
    res.json(mapEmployee(row))
  } catch (e) { next(e) }
})

router.post('/employees', async (req, res, next) => {
  try {
    const data = employeeCreateSchema.parse(req.body)
    const [row] = await query(
      `INSERT INTO hr_employees
        (employee_id, first_name, last_name, other_names, email, phone, gender, date_of_birth,
         marital_status, state_of_origin, lga, residential_address, department_id, position_id,
         grade_level, step, employment_type, employment_status, date_of_first_appointment,
         supervisor_id, bank_name, bank_account_no, tax_id, pension_pin)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
       RETURNING *`,
      [
        data.employeeId, data.firstName, data.lastName, data.otherNames,
        data.email, data.phone, data.gender, data.dateOfBirth,
        data.maritalStatus, data.stateOfOrigin, data.lga, data.residentialAddress,
        data.departmentId, data.positionId, data.gradeLevel, data.step,
        data.employmentType, data.employmentStatus, data.dateOfFirstAppointment,
        data.supervisorId, data.bankName, data.bankAccountNo, data.taxId, data.pensionPin,
      ]
    )
    res.status(201).json(mapEmployee(row))
  } catch (e) { next(e) }
})

router.patch('/employees/:id', async (req, res, next) => {
  try {
    const data = employeeUpdateSchema.parse(req.body)
    const sets = []
    const params = []
    let idx = 1

    const fieldMap = {
      firstName: 'first_name', lastName: 'last_name', otherNames: 'other_names',
      email: 'email', phone: 'phone', gender: 'gender', dateOfBirth: 'date_of_birth',
      maritalStatus: 'marital_status', stateOfOrigin: 'state_of_origin', lga: 'lga',
      residentialAddress: 'residential_address', departmentId: 'department_id',
      positionId: 'position_id', gradeLevel: 'grade_level', step: 'step',
      employmentType: 'employment_type', employmentStatus: 'employment_status',
      dateOfFirstAppointment: 'date_of_first_appointment', supervisorId: 'supervisor_id',
      bankName: 'bank_name', bankAccountNo: 'bank_account_no', taxId: 'tax_id',
      pensionPin: 'pension_pin',
      profilePhotoUrl: 'profile_photo_url',
      portalDisplayName: 'portal_display_name',
      portalBio: 'portal_bio',
      officeLocation: 'office_location',
    }

    for (const [jsKey, dbCol] of Object.entries(fieldMap)) {
      if (jsKey in data) {
        sets.push(`${dbCol} = $${idx}`)
        params.push(data[jsKey])
        idx++
      }
    }

    if (!sets.length) return res.status(400).json({ error: 'No fields to update' })

    sets.push(`updated_at = NOW()`)
    params.push(req.params.id)

    const [row] = await query(
      `UPDATE hr_employees SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    )
    if (!row) return res.status(404).json({ error: 'Employee not found' })
    res.json(mapEmployee(row))
  } catch (e) { next(e) }
})

router.get('/employees/:id/documents', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT *
       FROM hr_employee_documents
       WHERE employee_id = $1
       ORDER BY created_at DESC`,
      [req.params.id]
    )
    res.json(rows.map(mapEmployeeDocument))
  } catch (e) { next(e) }
})

router.post('/employees/:id/documents', async (req, res, next) => {
  try {
    const data = employeeDocumentSchema.parse(req.body)
    const [row] = await query(
      `INSERT INTO hr_employee_documents
        (employee_id, doc_type, title, file_url, file_size_bytes, uploaded_by, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        req.params.id,
        data.docType,
        data.title,
        data.fileUrl,
        data.fileSizeBytes ?? null,
        data.uploadedBy ?? null,
        data.expiresAt ?? null,
      ]
    )
    res.status(201).json(mapEmployeeDocument(row))
  } catch (e) { next(e) }
})

// ─── Departments ────────────────────────────────────────────────

router.get('/departments', async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT d.*, p.name AS parent_name,
              (SELECT COUNT(*)::int FROM hr_employees WHERE department_id = d.id AND employment_status = 'active') AS headcount
       FROM hr_departments d
       LEFT JOIN hr_departments p ON p.id = d.parent_department_id
       ORDER BY d.name`
    )
    res.json(rows.map(r => ({
      id: r.id,
      code: r.code,
      name: r.name,
      parentDepartmentId: r.parent_department_id,
      parentName: r.parent_name,
      headcount: r.headcount,
      status: r.status,
    })))
  } catch (e) { next(e) }
})

// ─── Org Chart ──────────────────────────────────────────────────

router.get('/org-chart', async (_req, res, next) => {
  try {
    const depts = await query(
      `SELECT d.id, d.code, d.name, d.parent_department_id,
              h.first_name || ' ' || h.last_name AS head_name,
              h.grade_level AS head_grade,
              (SELECT COUNT(*)::int FROM hr_employees WHERE department_id = d.id AND employment_status = 'active') AS staff_count
       FROM hr_departments d
       LEFT JOIN hr_employees h ON h.id = d.head_employee_id
       WHERE d.status = 'active'
       ORDER BY d.name`
    )

    function buildTree(parentId) {
      return depts
        .filter(d => d.parent_department_id === parentId)
        .map(d => ({
          id: d.id,
          code: d.code,
          name: d.name,
          headName: d.head_name,
          headGrade: d.head_grade,
          staffCount: d.staff_count,
          children: buildTree(d.id),
        }))
    }

    const tree = buildTree(null)
    res.json(tree)
  } catch (e) { next(e) }
})

export default router
