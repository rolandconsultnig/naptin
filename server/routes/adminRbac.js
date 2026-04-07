import { Router } from 'express'
import { z } from 'zod'
import { query, withTx } from '../db.js'

const router = Router()

const userCreateSchema = z.object({
  employeeId: z.string().min(2),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  departmentCode: z.string().optional().nullable(),
  primaryRoleCode: z.string().optional().nullable(),
  supervisorUserId: z.number().int().optional().nullable(),
  employmentStatus: z.enum(['active', 'on_leave', 'terminated', 'suspended']).default('active'),
  accountStatus: z.enum(['active', 'inactive', 'pending', 'suspended']).default('active'),
  mfaEnabled: z.boolean().default(false),
  accountExpiry: z.string().optional().nullable(),
})

const userUpdateSchema = userCreateSchema.partial()

const roleCreateSchema = z.object({
  roleCode: z.string().min(2),
  roleName: z.string().min(2),
  description: z.string().optional().nullable(),
  departmentCode: z.string().optional().nullable(),
  roleLevel: z.number().int().min(1).max(10).default(4),
  supervisorRoleCode: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
})

const rolePermissionUpdateSchema = z.object({
  permissionCodes: z.array(z.string()).default([]),
})

const secondaryRoleAssignSchema = z.object({
  roleCode: z.string().min(2),
  startsOn: z.string().optional().nullable(),
  endsOn: z.string().optional().nullable(),
})

const moduleCreateSchema = z.object({
  moduleCode: z.string().min(2),
  moduleName: z.string().min(2),
  status: z.enum(['active', 'inactive']).default('active'),
  displayOrder: z.number().int().default(100),
})

const featureCreateSchema = z.object({
  featureCode: z.string().min(2),
  featureName: z.string().min(2),
  status: z.enum(['active', 'inactive']).default('active'),
})

function mapUserRow(row) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    firstName: row.first_name,
    lastName: row.last_name,
    name: `${row.first_name} ${row.last_name}`,
    email: row.email,
    phone: row.phone,
    departmentCode: row.department_code,
    departmentName: row.department_name,
    primaryRoleCode: row.primary_role_code,
    primaryRoleName: row.primary_role_name,
    secondaryRoleCodes: row.secondary_role_codes ? row.secondary_role_codes.split(',').filter(Boolean) : [],
    employmentStatus: row.employment_status,
    accountStatus: row.account_status,
    mfaEnabled: !!row.mfa_enabled,
    accountExpiry: row.account_expiry,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
  }
}

async function appendAudit(actionCode, entityType, entityId, detail, payload = {}, actorEmail = 'system@naptin.gov.ng') {
  await query(
    `INSERT INTO adm_audit_log (actor_email, action_code, entity_type, entity_id, detail, payload)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [actorEmail, actionCode, entityType, entityId, detail, JSON.stringify(payload || {})]
  )
}

router.get('/users', async (req, res, next) => {
  try {
    const q = (req.query.q || '').toString().trim().toLowerCase()
    const department = (req.query.department || '').toString().trim()
    const role = (req.query.role || '').toString().trim()
    const status = (req.query.status || '').toString().trim()

    const rows = await query(
      `SELECT
        u.*,
        d.code AS department_code,
        d.name AS department_name,
        r.role_code AS primary_role_code,
        r.role_name AS primary_role_name,
        (
          SELECT STRING_AGG(sr.role_code, ',')
          FROM adm_user_secondary_roles usr
          JOIN adm_roles sr ON sr.id = usr.role_id
          WHERE usr.user_id = u.id
        ) AS secondary_role_codes
      FROM adm_users u
      LEFT JOIN adm_departments d ON d.id = u.department_id
      LEFT JOIN adm_roles r ON r.id = u.primary_role_id
      WHERE
        ($1 = '' OR LOWER(u.first_name || ' ' || u.last_name) LIKE '%' || $1 || '%' OR LOWER(u.email) LIKE '%' || $1 || '%')
        AND ($2 = '' OR d.code = $2)
        AND ($3 = '' OR r.role_code = $3)
        AND ($4 = '' OR u.account_status = $4)
      ORDER BY u.id DESC`,
      [q, department, role, status]
    )

    res.json({ items: rows.map(mapUserRow) })
  } catch (e) {
    next(e)
  }
})

router.post('/users/:id/secondary-roles', async (req, res, next) => {
  try {
    const userId = Number(req.params.id)
    const payload = secondaryRoleAssignSchema.parse(req.body || {})

    const inserted = await withTx(async (client) => {
      const roleRes = await client.query('SELECT id FROM adm_roles WHERE role_code = $1', [payload.roleCode])
      const roleId = roleRes.rows[0]?.id
      if (!roleId) return null

      const row = await client.query(
        `INSERT INTO adm_user_secondary_roles (user_id, role_id, starts_on, ends_on)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, role_id)
         DO UPDATE SET starts_on = EXCLUDED.starts_on, ends_on = EXCLUDED.ends_on
         RETURNING *`,
        [userId, roleId, payload.startsOn || null, payload.endsOn || null]
      )

      return row.rows[0]
    })

    if (!inserted) {
      res.status(404).json({ error: 'Role not found' })
      return
    }

    await appendAudit('USER_SECONDARY_ROLE_ASSIGN', 'user', String(userId), 'Assigned secondary role', payload)
    res.status(201).json(inserted)
  } catch (e) {
    next(e)
  }
})

router.delete('/users/:id/secondary-roles/:roleCode', async (req, res, next) => {
  try {
    const userId = Number(req.params.id)
    const roleCode = (req.params.roleCode || '').toString().trim()

    const deleted = await withTx(async (client) => {
      const roleRes = await client.query('SELECT id FROM adm_roles WHERE role_code = $1', [roleCode])
      const roleId = roleRes.rows[0]?.id
      if (!roleId) return 0

      const result = await client.query('DELETE FROM adm_user_secondary_roles WHERE user_id = $1 AND role_id = $2', [userId, roleId])
      return result.rowCount || 0
    })

    if (!deleted) {
      res.status(404).json({ error: 'Secondary role assignment not found' })
      return
    }

    await appendAudit('USER_SECONDARY_ROLE_REMOVE', 'user', String(userId), 'Removed secondary role', { roleCode })
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

router.post('/users', async (req, res, next) => {
  try {
    const payload = userCreateSchema.parse(req.body || {})

    const created = await withTx(async (client) => {
      const depRes = payload.departmentCode
        ? await client.query('SELECT id FROM adm_departments WHERE code = $1', [payload.departmentCode])
        : { rows: [] }
      const roleRes = payload.primaryRoleCode
        ? await client.query('SELECT id FROM adm_roles WHERE role_code = $1', [payload.primaryRoleCode])
        : { rows: [] }

      const row = await client.query(
        `INSERT INTO adm_users (
          employee_id, first_name, last_name, email, phone, department_id, primary_role_id,
          supervisor_user_id, employment_status, account_status, mfa_enabled, account_expiry
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        RETURNING *`,
        [
          payload.employeeId,
          payload.firstName,
          payload.lastName,
          payload.email.toLowerCase(),
          payload.phone || null,
          depRes.rows[0]?.id || null,
          roleRes.rows[0]?.id || null,
          payload.supervisorUserId || null,
          payload.employmentStatus,
          payload.accountStatus,
          payload.mfaEnabled,
          payload.accountExpiry || null,
        ]
      )

      return row.rows[0]
    })

    await appendAudit('USER_CREATE', 'user', String(created.id), 'Created user account', payload)

    res.status(201).json(created)
  } catch (e) {
    next(e)
  }
})

router.patch('/users/:id', async (req, res, next) => {
  try {
    const userId = Number(req.params.id)
    const payload = userUpdateSchema.parse(req.body || {})

    const updated = await withTx(async (client) => {
      if (payload.departmentCode !== undefined) {
        const depRes = payload.departmentCode
          ? await client.query('SELECT id FROM adm_departments WHERE code = $1', [payload.departmentCode])
          : { rows: [{ id: null }] }
        payload.departmentId = depRes.rows[0]?.id || null
      }

      if (payload.primaryRoleCode !== undefined) {
        const roleRes = payload.primaryRoleCode
          ? await client.query('SELECT id FROM adm_roles WHERE role_code = $1', [payload.primaryRoleCode])
          : { rows: [{ id: null }] }
        payload.primaryRoleId = roleRes.rows[0]?.id || null
      }

      const row = await client.query(
        `UPDATE adm_users
         SET
          employee_id = COALESCE($1, employee_id),
          first_name = COALESCE($2, first_name),
          last_name = COALESCE($3, last_name),
          email = COALESCE($4, email),
          phone = COALESCE($5, phone),
          department_id = COALESCE($6, department_id),
          primary_role_id = COALESCE($7, primary_role_id),
          supervisor_user_id = COALESCE($8, supervisor_user_id),
          employment_status = COALESCE($9, employment_status),
          account_status = COALESCE($10, account_status),
          mfa_enabled = COALESCE($11, mfa_enabled),
          account_expiry = COALESCE($12, account_expiry),
          updated_at = NOW()
         WHERE id = $13
         RETURNING *`,
        [
          payload.employeeId,
          payload.firstName,
          payload.lastName,
          payload.email?.toLowerCase(),
          payload.phone,
          payload.departmentId,
          payload.primaryRoleId,
          payload.supervisorUserId,
          payload.employmentStatus,
          payload.accountStatus,
          payload.mfaEnabled,
          payload.accountExpiry,
          userId,
        ]
      )
      return row.rows[0]
    })

    if (!updated) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    await appendAudit('USER_UPDATE', 'user', String(userId), 'Updated user account', payload)
    res.json(updated)
  } catch (e) {
    next(e)
  }
})

router.post('/users/:id/disable', async (req, res, next) => {
  try {
    const userId = Number(req.params.id)
    const [row] = await query(
      `UPDATE adm_users
       SET account_status = 'inactive', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [userId]
    )

    if (!row) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    await appendAudit('USER_DISABLE', 'user', String(userId), 'Disabled user account')
    res.json(row)
  } catch (e) {
    next(e)
  }
})

router.get('/roles', async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT r.*, d.code AS department_code, d.name AS department_name, sr.role_code AS supervisor_role_code,
        (SELECT COUNT(*)::int FROM adm_users u WHERE u.primary_role_id = r.id) AS user_count
       FROM adm_roles r
       LEFT JOIN adm_departments d ON d.id = r.department_id
       LEFT JOIN adm_roles sr ON sr.id = r.supervisor_role_id
       ORDER BY r.role_level DESC, r.role_name ASC`
    )
    res.json({ items: rows })
  } catch (e) {
    next(e)
  }
})

router.post('/roles', async (req, res, next) => {
  try {
    const payload = roleCreateSchema.parse(req.body || {})
    const created = await withTx(async (client) => {
      const depRes = payload.departmentCode
        ? await client.query('SELECT id FROM adm_departments WHERE code = $1', [payload.departmentCode])
        : { rows: [] }
      const supRes = payload.supervisorRoleCode
        ? await client.query('SELECT id FROM adm_roles WHERE role_code = $1', [payload.supervisorRoleCode])
        : { rows: [] }

      const row = await client.query(
        `INSERT INTO adm_roles (role_code, role_name, description, department_id, role_level, supervisor_role_id, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING *`,
        [
          payload.roleCode,
          payload.roleName,
          payload.description || null,
          depRes.rows[0]?.id || null,
          payload.roleLevel,
          supRes.rows[0]?.id || null,
          payload.status,
        ]
      )
      return row.rows[0]
    })

    await appendAudit('ROLE_CREATE', 'role', String(created.id), 'Created role', payload)
    res.status(201).json(created)
  } catch (e) {
    next(e)
  }
})

router.patch('/roles/:id', async (req, res, next) => {
  try {
    const roleId = Number(req.params.id)
    const payload = roleCreateSchema.partial().parse(req.body || {})

    const updated = await withTx(async (client) => {
      let departmentId
      let supervisorRoleId

      if (payload.departmentCode !== undefined) {
        const depRes = payload.departmentCode
          ? await client.query('SELECT id FROM adm_departments WHERE code = $1', [payload.departmentCode])
          : { rows: [{ id: null }] }
        departmentId = depRes.rows[0]?.id || null
      }

      if (payload.supervisorRoleCode !== undefined) {
        const supRes = payload.supervisorRoleCode
          ? await client.query('SELECT id FROM adm_roles WHERE role_code = $1', [payload.supervisorRoleCode])
          : { rows: [{ id: null }] }
        supervisorRoleId = supRes.rows[0]?.id || null
      }

      const row = await client.query(
        `UPDATE adm_roles
         SET
           role_code = COALESCE($1, role_code),
           role_name = COALESCE($2, role_name),
           description = COALESCE($3, description),
           department_id = COALESCE($4, department_id),
           role_level = COALESCE($5, role_level),
           supervisor_role_id = COALESCE($6, supervisor_role_id),
           status = COALESCE($7, status),
           updated_at = NOW()
         WHERE id = $8
         RETURNING *`,
        [
          payload.roleCode,
          payload.roleName,
          payload.description,
          departmentId,
          payload.roleLevel,
          supervisorRoleId,
          payload.status,
          roleId,
        ]
      )
      return row.rows[0]
    })

    if (!updated) {
      res.status(404).json({ error: 'Role not found' })
      return
    }

    await appendAudit('ROLE_UPDATE', 'role', String(roleId), 'Updated role', payload)
    res.json(updated)
  } catch (e) {
    next(e)
  }
})

router.get('/permissions', async (req, res, next) => {
  try {
    const moduleCode = (req.query.module || '').toString().trim()
    const rows = await query(
      `SELECT * FROM adm_permissions
       WHERE ($1 = '' OR module_code = $1)
       ORDER BY module_code, feature_code, action_code`,
      [moduleCode]
    )
    res.json({ items: rows })
  } catch (e) {
    next(e)
  }
})

router.get('/roles/:id/permissions', async (req, res, next) => {
  try {
    const roleId = Number(req.params.id)
    const rows = await query(
      `SELECT p.*, COALESCE(rp.granted, FALSE) AS granted
       FROM adm_permissions p
       LEFT JOIN adm_role_permissions rp ON rp.permission_id = p.id AND rp.role_id = $1
       ORDER BY p.module_code, p.feature_code, p.action_code`,
      [roleId]
    )
    res.json({ items: rows })
  } catch (e) {
    next(e)
  }
})

router.put('/roles/:id/permissions', async (req, res, next) => {
  try {
    const roleId = Number(req.params.id)
    const { permissionCodes } = rolePermissionUpdateSchema.parse(req.body || {})

    await withTx(async (client) => {
      await client.query('DELETE FROM adm_role_permissions WHERE role_id = $1', [roleId])
      if (permissionCodes.length) {
        await client.query(
          `INSERT INTO adm_role_permissions (role_id, permission_id, granted)
           SELECT $1, p.id, TRUE
           FROM adm_permissions p
           WHERE p.permission_code = ANY($2::text[])`,
          [roleId, permissionCodes]
        )
      }
    })

    await appendAudit('ROLE_PERMISSION_UPDATE', 'role', String(roleId), 'Updated role permissions', { permissionCodes })

    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

router.get('/matrix', async (req, res, next) => {
  try {
    const moduleCode = (req.query.module || '').toString().trim()
    const roles = await query(`SELECT id, role_code, role_name FROM adm_roles WHERE status = 'active' ORDER BY role_level DESC, role_name`)
    const permissions = await query(
      `SELECT * FROM adm_permissions
       WHERE ($1 = '' OR module_code = $1)
       ORDER BY module_code, feature_code, action_code`,
      [moduleCode]
    )
    const grants = await query('SELECT role_id, permission_id, granted FROM adm_role_permissions WHERE granted = TRUE')

    const byRole = {}
    for (const role of roles) byRole[role.id] = new Set()
    for (const grant of grants) {
      if (!byRole[grant.role_id]) byRole[grant.role_id] = new Set()
      byRole[grant.role_id].add(grant.permission_id)
    }

    const matrix = permissions.map((perm) => ({
      permissionCode: perm.permission_code,
      moduleCode: perm.module_code,
      featureCode: perm.feature_code,
      actionCode: perm.action_code,
      roles: roles.reduce((acc, role) => {
        acc[role.role_code] = byRole[role.id]?.has(perm.id) || false
        return acc
      }, {}),
    }))

    res.json({ roles, items: matrix })
  } catch (e) {
    next(e)
  }
})

router.get('/modules', async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT m.*,
        (
          SELECT COUNT(*)::int
          FROM adm_module_features f
          WHERE f.module_id = m.id
        ) AS feature_count
       FROM adm_modules m
       ORDER BY m.display_order, m.module_name`
    )
    res.json({ items: rows })
  } catch (e) {
    next(e)
  }
})

router.post('/modules', async (req, res, next) => {
  try {
    const payload = moduleCreateSchema.parse(req.body || {})
    const [row] = await query(
      `INSERT INTO adm_modules (module_code, module_name, status, display_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [payload.moduleCode, payload.moduleName, payload.status, payload.displayOrder]
    )

    await appendAudit('RBAC_MODULE_CREATE', 'module', String(row.id), 'Created RBAC module', payload)
    res.status(201).json(row)
  } catch (e) {
    next(e)
  }
})

router.patch('/modules/:id', async (req, res, next) => {
  try {
    const moduleId = Number(req.params.id)
    const payload = moduleCreateSchema.partial().parse(req.body || {})

    const [row] = await query(
      `UPDATE adm_modules
       SET
        module_code = COALESCE($1, module_code),
        module_name = COALESCE($2, module_name),
        status = COALESCE($3, status),
        display_order = COALESCE($4, display_order)
       WHERE id = $5
       RETURNING *`,
      [payload.moduleCode, payload.moduleName, payload.status, payload.displayOrder, moduleId]
    )

    if (!row) {
      res.status(404).json({ error: 'Module not found' })
      return
    }

    await appendAudit('RBAC_MODULE_UPDATE', 'module', String(moduleId), 'Updated RBAC module', payload)
    res.json(row)
  } catch (e) {
    next(e)
  }
})

router.get('/modules/:id/features', async (req, res, next) => {
  try {
    const moduleId = Number(req.params.id)
    const rows = await query(
      `SELECT f.*, m.module_code
       FROM adm_module_features f
       JOIN adm_modules m ON m.id = f.module_id
       WHERE f.module_id = $1
       ORDER BY f.feature_name`,
      [moduleId]
    )
    res.json({ items: rows })
  } catch (e) {
    next(e)
  }
})

router.post('/modules/:id/features', async (req, res, next) => {
  try {
    const moduleId = Number(req.params.id)
    const payload = featureCreateSchema.parse(req.body || {})
    const [row] = await query(
      `INSERT INTO adm_module_features (module_id, feature_code, feature_name, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [moduleId, payload.featureCode, payload.featureName, payload.status]
    )

    await appendAudit('RBAC_FEATURE_CREATE', 'module_feature', String(row.id), 'Created module feature', payload)
    res.status(201).json(row)
  } catch (e) {
    next(e)
  }
})

router.patch('/modules/:moduleId/features/:featureId', async (req, res, next) => {
  try {
    const moduleId = Number(req.params.moduleId)
    const featureId = Number(req.params.featureId)
    const payload = featureCreateSchema.partial().parse(req.body || {})

    const [row] = await query(
      `UPDATE adm_module_features
       SET
        feature_code = COALESCE($1, feature_code),
        feature_name = COALESCE($2, feature_name),
        status = COALESCE($3, status)
       WHERE id = $4 AND module_id = $5
       RETURNING *`,
      [payload.featureCode, payload.featureName, payload.status, featureId, moduleId]
    )

    if (!row) {
      res.status(404).json({ error: 'Feature not found' })
      return
    }

    await appendAudit('RBAC_FEATURE_UPDATE', 'module_feature', String(featureId), 'Updated module feature', payload)
    res.json(row)
  } catch (e) {
    next(e)
  }
})

router.get('/audit', async (req, res, next) => {
  try {
    const limit = Math.max(1, Math.min(Number(req.query.limit || 100), 500))
    const rows = await query('SELECT * FROM adm_audit_log ORDER BY created_at DESC LIMIT $1', [limit])
    res.json({ items: rows })
  } catch (e) {
    next(e)
  }
})

router.get('/sod/check/user/:id', async (req, res, next) => {
  try {
    const userId = Number(req.params.id)
    const rows = await query(
      `WITH effective_permissions AS (
        SELECT DISTINCT rp.permission_id
        FROM adm_users u
        JOIN adm_role_permissions rp ON rp.role_id = u.primary_role_id AND rp.granted = TRUE
        WHERE u.id = $1

        UNION

        SELECT DISTINCT rp.permission_id
        FROM adm_user_secondary_roles usr
        JOIN adm_role_permissions rp ON rp.role_id = usr.role_id AND rp.granted = TRUE
        WHERE usr.user_id = $1
      )
      SELECT
        s.code,
        s.severity,
        s.description,
        p1.permission_code AS left_permission,
        p2.permission_code AS right_permission
      FROM adm_sod_rules s
      JOIN adm_permissions p1 ON p1.id = s.left_permission_id
      JOIN adm_permissions p2 ON p2.id = s.right_permission_id
      WHERE s.active = TRUE
        AND EXISTS (SELECT 1 FROM effective_permissions e1 WHERE e1.permission_id = s.left_permission_id)
        AND EXISTS (SELECT 1 FROM effective_permissions e2 WHERE e2.permission_id = s.right_permission_id)
      ORDER BY s.severity DESC, s.code`,
      [userId]
    )

    res.json({ items: rows })
  } catch (e) {
    next(e)
  }
})

export default router
