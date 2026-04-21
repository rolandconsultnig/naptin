import { Router } from 'express'
import { z } from 'zod'
import { createHmac } from 'crypto'
import { performance } from 'node:perf_hooks'
import { query, withTx } from '../db.js'

const router = Router()
const routeRateWindowMs = 60_000
const routeRateBuckets = new Map()

const userCreateSchema = z.object({
  employeeId: z.string().min(2),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  departmentCode: z.string().optional().nullable(),
  unitCode: z.string().optional().nullable(),
  jobTitle: z.string().optional().nullable(),
  jobSummary: z.string().optional().nullable(),
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

const jobDescriptionSchema = z.object({
  jobCode: z.string().min(3),
  title: z.string().min(3),
  departmentCode: z.string().optional().nullable(),
  unitCode: z.string().optional().nullable(),
  summary: z.string().min(5),
  responsibilities: z.string().min(5),
  requirements: z.string().min(5),
  status: z.enum(['active', 'inactive']).default('active'),
})

const userOverrideUpdateSchema = z.object({
  overrides: z.array(
    z.object({
      permissionCode: z.string().min(3),
      effect: z.enum(['allow', 'deny']),
      reason: z.string().min(5),
      approverEmail: z.string().email().optional().nullable(),
      expiresAt: z.string().optional().nullable(),
    })
  ),
})

const userAccessReviewSchema = z.object({
  reviewType: z.enum(['urgent_item', 'access_exception', 'sod_conflict', 'stale_override']).default('urgent_item'),
  reviewNote: z.string().optional().nullable(),
  staleDays: z.number().int().min(30).max(365).optional(),
  status: z.enum(['open', 'in_review', 'resolved', 'reversed']).optional(),
  assignedTo: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  dueAt: z.string().optional().nullable(),
})

const riskPolicyUpdateSchema = z.object({
  staleOverrideDays: z.number().int().min(30).max(365),
  weightSodConflict: z.number().int().min(1).max(20),
  weightStaleOverride: z.number().int().min(1).max(20),
  weightMissingReason: z.number().int().min(1).max(20),
  weightOverrideCount: z.number().int().min(1).max(20),
  inactivityDaysHighPrivilege: z.number().int().min(7).max(365),
})

const reviewAssignSchema = z.object({
  assignedTo: z.string().min(3),
  dueAt: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  slaHours: z.number().int().min(1).max(720).default(24),
})

const reviewCommentSchema = z.object({
  comment: z.string().min(2),
})

const reportScheduleSchema = z.object({
  scheduleCode: z.string().min(3),
  reportType: z.string().min(3),
  frequency: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'manual']),
  status: z.enum(['active', 'inactive']).default('active'),
  config: z.record(z.any()).optional().default({}),
  recipients: z.array(z.string().email()).default([]),
  nextRunAt: z.string().optional().nullable(),
})

const attestationPackSchema = z.object({
  reviewType: z.string().optional().nullable(),
  reviewer: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  from: z.string().optional().nullable(),
  to: z.string().optional().nullable(),
  includeComments: z.boolean().default(true),
})

const overrideApprovalDecisionSchema = z.object({
  approverNote: z.string().optional().nullable(),
})

const perfIncidentUpdateSchema = z.object({
  action: z.enum(['acknowledge', 'resolve', 'reopen', 'assign_owner']),
  ownerEmail: z.string().email().optional().nullable(),
  note: z.string().max(500).optional().nullable(),
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
    unitCode: row.unit_code,
    unitName: row.unit_name,
    jobTitle: row.job_title,
    jobSummary: row.job_summary,
    jobDescriptionCode: row.job_description_code,
    jobDescriptionTitle: row.job_description_title,
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

function readActor(req) {
  const actorEmail = (req.header('x-user-email') || '').trim() || 'system@naptin.gov.ng'
  const actorRoleKey = (req.header('x-role-key') || '').trim().toLowerCase()
  const actorRoleLevel = Number(req.header('x-role-level') || 0)
  return { actorEmail, actorRoleKey, actorRoleLevel }
}

function requireSuperAdminLevel5(req, res, next) {
  const { actorRoleKey, actorRoleLevel } = readActor(req)
  if (actorRoleKey !== 'super_admin' || actorRoleLevel < 5) {
    res.status(403).json({ error: 'Only level 5 super admins can access enterprise user management' })
    return
  }
  next()
}

function enforceRouteRateLimit(req, res, next) {
  const { actorEmail } = readActor(req)
  const key = `${actorEmail || 'unknown'}:${req.ip || 'ip'}:${req.method}`
  const now = Date.now()
  const windowStart = now - routeRateWindowMs
  const bucket = (routeRateBuckets.get(key) || []).filter((ts) => ts >= windowStart)
  const limit = req.method === 'GET' ? 240 : 120
  if (bucket.length >= limit) {
    res.status(429).json({ error: 'Rate limit exceeded for admin RBAC operations' })
    return
  }
  bucket.push(now)
  routeRateBuckets.set(key, bucket)
  next()
}

function parseEmailList(value) {
  return (value || '')
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean)
}

const MAX_DELIVERY_ATTEMPTS = 5
const RETRY_BACKOFF_MINUTES = [5, 15, 30, 60, 180]
const DASHBOARD_CACHE_TTL_MS = Math.max(5_000, Number(process.env.ACCESS_DASHBOARD_CACHE_TTL_MS || 60_000))
const RISK_INCREMENTAL_BATCH_SIZE = Math.max(100, Math.min(Number(process.env.ACCESS_RISK_INCREMENTAL_BATCH_SIZE || 2000), 10_000))
const PERF_LOG_THRESHOLD_MS = Math.max(50, Number(process.env.ACCESS_QUERY_PERF_LOG_THRESHOLD_MS || 250))
const PERF_THRESHOLD_REFRESH_MS = Math.max(15_000, Number(process.env.ACCESS_QUERY_PERF_THRESHOLD_REFRESH_MS || 60_000))
const PERF_AUTO_TUNE_INTERVAL_MS = Math.max(60_000, Number(process.env.ACCESS_QUERY_PERF_AUTO_TUNE_INTERVAL_MS || 900_000))
const PERF_DRIFT_ALERT_RATIO = Math.max(1.05, Number(process.env.ACCESS_QUERY_PERF_DRIFT_ALERT_RATIO || 1.25))
const PERF_INCIDENT_EVAL_INTERVAL_MS = Math.max(30_000, Number(process.env.ACCESS_QUERY_PERF_INCIDENT_EVAL_INTERVAL_MS || 120_000))
const PERF_INCIDENT_MIN_SAMPLES = Math.max(3, Number(process.env.ACCESS_QUERY_PERF_INCIDENT_MIN_SAMPLES || 8))
const PERF_INCIDENT_DRIFT_RATIO = Math.max(1.1, Number(process.env.ACCESS_QUERY_PERF_INCIDENT_DRIFT_RATIO || 1.35))
const PERF_INCIDENT_SPIKE_RATIO = Math.max(1.2, Number(process.env.ACCESS_QUERY_PERF_INCIDENT_SPIKE_RATIO || 1.7))
const PERF_INCIDENT_NEW_SLOW_P95_MS = Math.max(100, Number(process.env.ACCESS_QUERY_PERF_INCIDENT_NEW_SLOW_P95_MS || 600))
const PERF_INCIDENT_SLOW_HIT_COUNT = Math.max(1, Number(process.env.ACCESS_QUERY_PERF_INCIDENT_SLOW_HIT_COUNT || 3))
const PERF_INCIDENT_CRITICAL_SLA_MINUTES = Math.max(1, Number(process.env.ACCESS_QUERY_PERF_INCIDENT_CRITICAL_SLA_MINUTES || 30))
const PERF_INCIDENT_WARNING_SLA_MINUTES = Math.max(1, Number(process.env.ACCESS_QUERY_PERF_INCIDENT_WARNING_SLA_MINUTES || 240))
const PERF_INCIDENT_SLA_SUSTAINED_DRIFT_MINUTES = Math.max(1, Number(process.env.ACCESS_QUERY_PERF_INCIDENT_SLA_SUSTAINED_DRIFT_MINUTES || 60))
const PERF_INCIDENT_SLA_SPIKE_PERSISTENCE_MINUTES = Math.max(1, Number(process.env.ACCESS_QUERY_PERF_INCIDENT_SLA_SPIKE_PERSISTENCE_MINUTES || 30))
const PERF_INCIDENT_SLA_NEWLY_SLOW_QUERY_MINUTES = Math.max(1, Number(process.env.ACCESS_QUERY_PERF_INCIDENT_SLA_NEWLY_SLOW_QUERY_MINUTES || 120))
const PERF_INCIDENT_ESCALATION_COOLDOWN_MINUTES = Math.max(1, Number(process.env.ACCESS_QUERY_PERF_INCIDENT_ESCALATION_COOLDOWN_MINUTES || 30))
const PERF_INCIDENT_ESCALATION_MAX_LEVEL = Math.max(1, Number(process.env.ACCESS_QUERY_PERF_INCIDENT_ESCALATION_MAX_LEVEL || 3))
const PERF_INCIDENT_ESCALATION_INTERVAL_MS = Math.max(30_000, Number(process.env.ACCESS_QUERY_PERF_INCIDENT_ESCALATION_INTERVAL_MS || 120_000))
const PERF_INCIDENT_ESCALATION_LEVEL_COOLDOWNS = (process.env.ACCESS_QUERY_PERF_INCIDENT_ESCALATION_LEVEL_COOLDOWNS || '30,60,120')
  .split(',')
  .map((v) => Number(v.trim()))
  .filter((v) => Number.isFinite(v) && v > 0)
const PERF_INCIDENT_NOTIFICATION_SUPPRESSION_MINUTES = Math.max(1, Number(process.env.ACCESS_QUERY_PERF_INCIDENT_NOTIFICATION_SUPPRESSION_MINUTES || 20))
const PERF_LOG_RETENTION_DAYS = Math.max(1, Number(process.env.ACCESS_QUERY_PERF_LOG_RETENTION_DAYS || 30))
const PERF_INCIDENT_RETENTION_DAYS = Math.max(7, Number(process.env.ACCESS_QUERY_PERF_INCIDENT_RETENTION_DAYS || 180))
const PERF_INCIDENT_EVENT_RETENTION_DAYS = Math.max(7, Number(process.env.ACCESS_QUERY_PERF_INCIDENT_EVENT_RETENTION_DAYS || 365))
const dashboardSummaryCache = new Map()
const perfThresholdCache = { map: new Map(), loadedAt: 0 }
let lastPerfAutoTuneAt = 0
let lastPerfIncidentEvalAt = 0
let lastPerfIncidentEscalationAt = 0

function computeNextRetryAt(attempts) {
  const idx = Math.max(0, Math.min((Number(attempts) || 1) - 1, RETRY_BACKOFF_MINUTES.length - 1))
  const minutes = RETRY_BACKOFF_MINUTES[idx]
  return new Date(Date.now() + minutes * 60_000).toISOString()
}

function readDashboardCache(cacheKey, forceRefresh = false) {
  if (forceRefresh) return null
  const current = dashboardSummaryCache.get(cacheKey)
  if (!current) return null
  if (Date.now() - current.ts > DASHBOARD_CACHE_TTL_MS) {
    dashboardSummaryCache.delete(cacheKey)
    return null
  }
  return current.value
}

function writeDashboardCache(cacheKey, value) {
  dashboardSummaryCache.set(cacheKey, { ts: Date.now(), value })
}

function clearDashboardCache() {
  dashboardSummaryCache.clear()
}

async function refreshPerfThresholdCache(force = false) {
  if (!force && Date.now() - perfThresholdCache.loadedAt < PERF_THRESHOLD_REFRESH_MS) return
  try {
    const rows = await query(
      `SELECT route_code, query_code, dynamic_threshold_ms
       FROM adm_query_perf_tuning`
    )
    const nextMap = new Map()
    for (const row of rows) {
      const key = `${row.route_code}:${row.query_code}`
      nextMap.set(key, Number(row.dynamic_threshold_ms || PERF_LOG_THRESHOLD_MS))
    }
    perfThresholdCache.map = nextMap
  } catch {
    perfThresholdCache.map = new Map()
  }
  perfThresholdCache.loadedAt = Date.now()
}

function readDynamicThreshold(routeCode, queryCode) {
  const key = `${routeCode}:${queryCode}`
  return perfThresholdCache.map.get(key)
}

async function autoTunePerfThresholds({
  routeCode = 'users.dashboard-summary',
  hours = 24,
  minSamples = 5,
  actorEmail = 'system@naptin.gov.ng',
} = {}) {
  try {
    const rows = await query(
    `WITH current_window AS (
       SELECT query_code, elapsed_ms
       FROM adm_query_perf_log
       WHERE route_code = $1
         AND created_at >= NOW() - make_interval(hours => $2::int)
     ),
     previous_window AS (
       SELECT query_code, elapsed_ms
       FROM adm_query_perf_log
       WHERE route_code = $1
         AND created_at >= NOW() - make_interval(hours => ($2::int * 2))
         AND created_at < NOW() - make_interval(hours => $2::int)
     ),
     cur AS (
       SELECT
         query_code,
         COUNT(*)::int AS cur_samples,
         COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY elapsed_ms), 0)::numeric(10,2) AS cur_p95
       FROM current_window
       GROUP BY query_code
     ),
     prev AS (
       SELECT
         query_code,
         COUNT(*)::int AS prev_samples,
         COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY elapsed_ms), 0)::numeric(10,2) AS prev_p95
       FROM previous_window
       GROUP BY query_code
     )
     SELECT
       COALESCE(cur.query_code, prev.query_code) AS query_code,
       COALESCE(cur.cur_samples, 0) AS cur_samples,
       COALESCE(prev.prev_samples, 0) AS prev_samples,
       COALESCE(cur.cur_p95, 0) AS cur_p95,
       COALESCE(prev.prev_p95, 0) AS prev_p95
     FROM cur
     FULL OUTER JOIN prev ON prev.query_code = cur.query_code`,
    [routeCode, hours]
  )

    const applied = []
    for (const row of rows) {
      const curSamples = Number(row.cur_samples || 0)
      const prevSamples = Number(row.prev_samples || 0)
      if (curSamples < minSamples && prevSamples < minSamples) continue

      const curP95 = Number(row.cur_p95 || 0)
      const prevP95 = Number(row.prev_p95 || 0)
      const baseline = prevP95 > 0 ? prevP95 : curP95
      const driftRatio = prevP95 > 0 ? curP95 / prevP95 : 1
      const driftWeight = driftRatio >= PERF_DRIFT_ALERT_RATIO ? 1.05 : 1.20
      const dynamicThreshold = Math.max(
        PERF_LOG_THRESHOLD_MS,
        Number((Math.max(baseline, curP95) * driftWeight).toFixed(2))
      )

      await query(
      `INSERT INTO adm_query_perf_tuning (
         route_code, query_code, dynamic_threshold_ms,
         last_window_p95_ms, previous_window_p95_ms, drift_ratio, sample_count, updated_by, updated_at
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
       ON CONFLICT (route_code, query_code)
       DO UPDATE SET
         dynamic_threshold_ms = EXCLUDED.dynamic_threshold_ms,
         last_window_p95_ms = EXCLUDED.last_window_p95_ms,
         previous_window_p95_ms = EXCLUDED.previous_window_p95_ms,
         drift_ratio = EXCLUDED.drift_ratio,
         sample_count = EXCLUDED.sample_count,
         updated_by = EXCLUDED.updated_by,
         updated_at = NOW()`,
      [
        routeCode,
        row.query_code,
        dynamicThreshold,
        curP95,
        prevP95,
        Number(driftRatio.toFixed(4)),
        curSamples,
        actorEmail,
      ]
    )

      applied.push({
        queryCode: row.query_code,
        dynamicThresholdMs: dynamicThreshold,
        curP95Ms: curP95,
        prevP95Ms: prevP95,
        driftRatio: Number(driftRatio.toFixed(4)),
        curSamples,
      })
    }

    await refreshPerfThresholdCache(true)
    return applied
  } catch {
    return []
  }
}

function toIncidentSeverity(incidentType, driftRatio = 0) {
  if (incidentType === 'sustained_drift' && driftRatio >= 2) return 'critical'
  if (incidentType === 'spike_persistence' && driftRatio >= 2) return 'critical'
  if (incidentType === 'newly_slow_query' && driftRatio >= 1.5) return 'critical'
  return 'warning'
}

function perfIncidentSlaMinutes(severity = 'warning', incidentType = '') {
  const type = String(incidentType || '').toLowerCase()
  if (type === 'spike_persistence') return PERF_INCIDENT_SLA_SPIKE_PERSISTENCE_MINUTES
  if (type === 'sustained_drift') return PERF_INCIDENT_SLA_SUSTAINED_DRIFT_MINUTES
  if (type === 'newly_slow_query') return PERF_INCIDENT_SLA_NEWLY_SLOW_QUERY_MINUTES
  return severity === 'critical' ? PERF_INCIDENT_CRITICAL_SLA_MINUTES : PERF_INCIDENT_WARNING_SLA_MINUTES
}

function perfEscalationCooldownMinutes(level = 1) {
  const idx = Math.max(0, Number(level || 1) - 1)
  if (PERF_INCIDENT_ESCALATION_LEVEL_COOLDOWNS[idx]) return PERF_INCIDENT_ESCALATION_LEVEL_COOLDOWNS[idx]
  return PERF_INCIDENT_ESCALATION_COOLDOWN_MINUTES
}

function readEscalationRecipients(severity = 'warning', level = 1) {
  const lvl = Math.max(1, Number(level || 1))
  const sev = String(severity || 'warning').toLowerCase()
  const bySeverity = parseEmailList(process.env[`ACCESS_QUERY_PERF_ESCALATION_${sev.toUpperCase()}_L${lvl}_EMAILS`] || '')
  const byLevel = parseEmailList(process.env[`ACCESS_QUERY_PERF_ESCALATION_L${lvl}_EMAILS`] || '')
  const fallback = parseEmailList(
    process.env.ACCESS_QUERY_PERF_INCIDENT_ESCALATION_EMAILS || process.env.ACCESS_GOVERNANCE_ALERT_EMAILS || ''
  )
  return [...new Set([...bySeverity, ...byLevel, ...fallback])]
}

async function isEscalationNotificationSuppressed(incidentId, escalationLevel) {
  const [row] = await query(
    `SELECT id
     FROM adm_notification_events
     WHERE event_code = 'PERF_INCIDENT_SLA_ESCALATED'
       AND created_at >= NOW() - make_interval(mins => $1::int)
       AND COALESCE(payload->>'incidentId', '') ~ '^[0-9]+$'
       AND (payload->>'incidentId')::bigint = $2::bigint
       AND COALESCE((payload->>'escalationLevel')::int, 0) = $3::int
     ORDER BY created_at DESC
     LIMIT 1`,
    [PERF_INCIDENT_NOTIFICATION_SUPPRESSION_MINUTES, incidentId, escalationLevel]
  )
  return !!row
}

async function appendPerfIncidentEvent({
  incidentId,
  eventType,
  actorEmail = 'system@naptin.gov.ng',
  note = null,
  payload = {},
}) {
  try {
    await query(
      `INSERT INTO adm_query_perf_incident_events (
        incident_id, event_type, actor_email, note, payload
      ) VALUES ($1,$2,$3,$4,$5::jsonb)`,
      [incidentId, eventType, actorEmail, note, JSON.stringify(payload || {})]
    )
  } catch {
    // non-blocking
  }
}

function buildIncidentText(incidentType, queryCode, currentP95, previousP95, thresholdMs, driftRatio, slowCount) {
  if (incidentType === 'sustained_drift') {
    return {
      title: `Sustained drift detected: ${queryCode}`,
      summary: `P95 drift is ${driftRatio.toFixed(2)}x (${currentP95.toFixed(1)}ms vs ${previousP95.toFixed(1)}ms).`,
    }
  }
  if (incidentType === 'spike_persistence') {
    return {
      title: `Spike persistence: ${queryCode}`,
      summary: `${slowCount} slow samples breached threshold ${thresholdMs.toFixed(1)}ms; current P95 is ${currentP95.toFixed(1)}ms.`,
    }
  }
  return {
    title: `Newly slow query: ${queryCode}`,
    summary: `Query crossed new-slow threshold at P95 ${currentP95.toFixed(1)}ms (policy floor ${PERF_INCIDENT_NEW_SLOW_P95_MS.toFixed(1)}ms).`,
  }
}

async function fetchActivePerfIncidents(routeCode, limit = 20) {
  return query(
    `SELECT
      id,
      route_code,
      query_code,
      incident_type,
      severity,
      status,
      title,
      summary,
      owner_email,
      acknowledged_by,
      acknowledged_at,
      resolved_by,
      resolved_at,
      resolution_note,
      sla_due_at,
      escalation_level,
      last_escalated_at,
      escalation_note,
      first_detected_at,
      last_detected_at,
      detected_count,
      current_p95_ms,
      previous_p95_ms,
      current_p99_ms,
      threshold_ms,
      drift_ratio,
      slow_event_count,
      details
     FROM adm_query_perf_incidents
     WHERE route_code = $1
       AND status IN ('open', 'acknowledged')
     ORDER BY
       CASE severity WHEN 'critical' THEN 1 WHEN 'warning' THEN 2 ELSE 3 END,
       last_detected_at DESC
     LIMIT $2`,
    [routeCode, Math.max(1, Math.min(Number(limit || 20), 200))]
  )
}

async function processPerfIncidentEscalations({
  routeCode = 'users.dashboard-summary',
  actorEmail = 'system@naptin.gov.ng',
  emitNotifications = true,
  applyEscalation = true,
} = {}) {
  try {
    const rows = applyEscalation
      ? await query(
          `SELECT *
           FROM adm_query_perf_incidents
           WHERE route_code = $1
             AND status IN ('open', 'acknowledged')
             AND sla_due_at IS NOT NULL
             AND NOW() >= sla_due_at
             AND escalation_level < $2
           ORDER BY
             CASE severity WHEN 'critical' THEN 1 WHEN 'warning' THEN 2 ELSE 3 END,
             sla_due_at ASC
           LIMIT 50`,
          [routeCode, PERF_INCIDENT_ESCALATION_MAX_LEVEL]
        )
      : []

    let escalated = 0
    for (const row of rows) {
      const nextLevel = Math.min(PERF_INCIDENT_ESCALATION_MAX_LEVEL, Number(row.escalation_level || 0) + 1)
      const cooldownMinutes = perfEscalationCooldownMinutes(nextLevel)
      if (row.last_escalated_at) {
        const elapsedSinceLastEscalation = Date.now() - new Date(row.last_escalated_at).getTime()
        if (elapsedSinceLastEscalation < cooldownMinutes * 60_000) {
          continue
        }
      }
      const breachMinutes = Math.max(
        0,
        Math.floor((Date.now() - new Date(row.sla_due_at).getTime()) / 60000)
      )
      const [updated] = await query(
        `UPDATE adm_query_perf_incidents
         SET
           escalation_level = $2,
           last_escalated_at = NOW(),
           escalation_note = $3,
           last_action_by = $4,
           last_action_at = NOW(),
           updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [
          row.id,
          nextLevel,
          `Escalated to level ${nextLevel} after SLA breach of ${breachMinutes} minute(s)`,
          actorEmail,
        ]
      )
      if (!updated) continue
      escalated += 1
      await appendPerfIncidentEvent({
        incidentId: updated.id,
        eventType: 'incident_escalated',
        actorEmail,
        note: `Escalated to level ${nextLevel}`,
        payload: { escalationLevel: nextLevel, breachMinutes, cooldownMinutes },
      })
      const eventPayload = {
        incidentId: updated.id,
        routeCode: updated.route_code,
        queryCode: updated.query_code,
        incidentType: updated.incident_type,
        severity: updated.severity,
        escalationLevel: nextLevel,
        breachMinutes,
        ownerEmail: updated.owner_email || null,
      }

      if (emitNotifications) {
        const suppressed = await isEscalationNotificationSuppressed(updated.id, nextLevel)
        if (suppressed) continue
        await appendNotificationEvent({
          eventCode: 'PERF_INCIDENT_SLA_ESCALATED',
          severity: updated.severity === 'critical' ? 'critical' : 'warning',
          channel: 'in_app',
          recipient: updated.owner_email || null,
          title: `Perf incident escalated (L${nextLevel})`,
          body: `${updated.query_code} breached SLA by ${breachMinutes} minute(s)`,
          payload: eventPayload,
          deliveryStatus: 'sent',
          deliveryAttempts: 1,
          sentAt: new Date().toISOString(),
          processedAt: new Date().toISOString(),
        })
        await emitGovernanceWebhook('PERF_INCIDENT_SLA_ESCALATED', eventPayload, updated.severity === 'critical' ? 'critical' : 'warning')
        const fanout = new Set(readEscalationRecipients(updated.severity, nextLevel))
        if (updated.owner_email) fanout.add(String(updated.owner_email).toLowerCase())
        for (const email of fanout) {
          await sendGovernanceEmail({
            recipient: email,
            subject: `[Perf Incident Escalation L${nextLevel}] ${updated.query_code}`,
            body: `${updated.title}\n\n${updated.summary}\n\nSLA breached by ${breachMinutes} minute(s). Incident ID: ${updated.id}.`,
            payload: eventPayload,
            severity: updated.severity === 'critical' ? 'critical' : 'warning',
          })
        }
      }
    }

    const [summary] = await query(
      `SELECT
        COUNT(*) FILTER (WHERE status IN ('open','acknowledged'))::int AS active_incidents,
        COUNT(*) FILTER (
          WHERE status IN ('open','acknowledged')
            AND sla_due_at IS NOT NULL
            AND NOW() >= sla_due_at
        )::int AS overdue_incidents,
        COUNT(*) FILTER (
          WHERE status IN ('open','acknowledged')
            AND severity = 'critical'
            AND sla_due_at IS NOT NULL
            AND NOW() >= sla_due_at
        )::int AS critical_overdue
       FROM adm_query_perf_incidents
       WHERE route_code = $1`,
      [routeCode]
    )

    return {
      escalated,
      activeIncidents: Number(summary?.active_incidents || 0),
      overdueIncidents: Number(summary?.overdue_incidents || 0),
      criticalOverdue: Number(summary?.critical_overdue || 0),
      escalationCooldownMinutes: PERF_INCIDENT_ESCALATION_COOLDOWN_MINUTES,
      escalationLevelCooldowns: PERF_INCIDENT_ESCALATION_LEVEL_COOLDOWNS,
      maxLevel: PERF_INCIDENT_ESCALATION_MAX_LEVEL,
    }
  } catch {
    return {
      escalated: 0,
      activeIncidents: 0,
      overdueIncidents: 0,
      criticalOverdue: 0,
      escalationCooldownMinutes: PERF_INCIDENT_ESCALATION_COOLDOWN_MINUTES,
      escalationLevelCooldowns: PERF_INCIDENT_ESCALATION_LEVEL_COOLDOWNS,
      maxLevel: PERF_INCIDENT_ESCALATION_MAX_LEVEL,
    }
  }
}

async function buildPerfIncidentAnalytics(routeCode = 'users.dashboard-summary', hours = 24) {
  const [summary] = await query(
    `WITH scoped AS (
       SELECT *
       FROM adm_query_perf_incidents
       WHERE route_code = $1
         AND updated_at >= NOW() - make_interval(hours => $2::int)
     )
     SELECT
       COUNT(*)::int AS total_incidents,
       COUNT(*) FILTER (WHERE status IN ('open','acknowledged'))::int AS active_incidents,
       COUNT(*) FILTER (WHERE status = 'resolved')::int AS resolved_incidents,
       COUNT(*) FILTER (WHERE severity = 'critical')::int AS critical_incidents,
       COALESCE(AVG(EXTRACT(EPOCH FROM (acknowledged_at - first_detected_at)) / 60.0) FILTER (WHERE acknowledged_at IS NOT NULL), 0)::numeric(10,2) AS avg_mtta_minutes,
       COALESCE(AVG(EXTRACT(EPOCH FROM (resolved_at - first_detected_at)) / 60.0) FILTER (WHERE resolved_at IS NOT NULL), 0)::numeric(10,2) AS avg_mttr_minutes,
       COUNT(*) FILTER (
         WHERE sla_due_at IS NOT NULL
           AND (
             (resolved_at IS NOT NULL AND resolved_at > sla_due_at)
             OR (resolved_at IS NULL AND NOW() > sla_due_at)
           )
       )::int AS sla_breaches
     FROM scoped`,
    [routeCode, hours]
  )
  const byType = await query(
    `SELECT incident_type, COUNT(*)::int AS count
     FROM adm_query_perf_incidents
     WHERE route_code = $1
       AND updated_at >= NOW() - make_interval(hours => $2::int)
     GROUP BY incident_type
     ORDER BY count DESC`,
    [routeCode, hours]
  )
  const timeline = await query(
    `SELECT
      TO_CHAR(DATE_TRUNC('day', updated_at), 'YYYY-MM-DD') AS day_bucket,
      COUNT(*) FILTER (WHERE status IN ('open','acknowledged'))::int AS active,
      COUNT(*) FILTER (WHERE status = 'resolved')::int AS resolved
     FROM adm_query_perf_incidents
     WHERE route_code = $1
       AND updated_at >= NOW() - make_interval(hours => $2::int)
     GROUP BY DATE_TRUNC('day', updated_at)
     ORDER BY DATE_TRUNC('day', updated_at)`,
    [routeCode, hours]
  )
  const topOwners = await query(
    `SELECT COALESCE(owner_email, 'unassigned') AS owner, COUNT(*)::int AS count
     FROM adm_query_perf_incidents
     WHERE route_code = $1
       AND status IN ('open','acknowledged')
     GROUP BY COALESCE(owner_email, 'unassigned')
     ORDER BY count DESC
     LIMIT 10`,
    [routeCode]
  )
  const total = Number(summary?.total_incidents || 0)
  const breaches = Number(summary?.sla_breaches || 0)
  return {
    totalIncidents: total,
    activeIncidents: Number(summary?.active_incidents || 0),
    resolvedIncidents: Number(summary?.resolved_incidents || 0),
    criticalIncidents: Number(summary?.critical_incidents || 0),
    avgMttaMinutes: Number(summary?.avg_mtta_minutes || 0),
    avgMttrMinutes: Number(summary?.avg_mttr_minutes || 0),
    slaBreaches: breaches,
    slaBreachRatePct: total > 0 ? Number(((breaches / total) * 100).toFixed(2)) : 0,
    byType,
    timeline,
    topOwners,
  }
}

async function applyPerfRetention({ actorEmail = 'system@naptin.gov.ng' } = {}) {
  const prunedPerfLogs = await query(
    `DELETE FROM adm_query_perf_log
     WHERE created_at < NOW() - make_interval(days => $1::int)
     RETURNING id`,
    [PERF_LOG_RETENTION_DAYS]
  )
  const prunedIncidentEvents = await query(
    `DELETE FROM adm_query_perf_incident_events
     WHERE created_at < NOW() - make_interval(days => $1::int)
     RETURNING id`,
    [PERF_INCIDENT_EVENT_RETENTION_DAYS]
  )
  const prunedIncidents = await query(
    `DELETE FROM adm_query_perf_incidents
     WHERE status = 'resolved'
       AND resolved_at IS NOT NULL
       AND resolved_at < NOW() - make_interval(days => $1::int)
     RETURNING id`,
    [PERF_INCIDENT_RETENTION_DAYS]
  )
  await appendAudit(
    'ACCESS_PERF_RETENTION_APPLIED',
    'performance',
    null,
    'Applied performance log and incident retention',
    {
      perfLogRetentionDays: PERF_LOG_RETENTION_DAYS,
      incidentRetentionDays: PERF_INCIDENT_RETENTION_DAYS,
      incidentEventRetentionDays: PERF_INCIDENT_EVENT_RETENTION_DAYS,
      prunedPerfLogs: prunedPerfLogs.length,
      prunedIncidentEvents: prunedIncidentEvents.length,
      prunedIncidents: prunedIncidents.length,
    },
    actorEmail
  )
  return {
    prunedPerfLogs: prunedPerfLogs.length,
    prunedIncidentEvents: prunedIncidentEvents.length,
    prunedIncidents: prunedIncidents.length,
  }
}

async function generatePerfIncidents({
  routeCode = 'users.dashboard-summary',
  hours = 24,
  actorEmail = 'system@naptin.gov.ng',
  emitNotifications = true,
} = {}) {
  try {
    const findings = await query(
      `WITH current_window AS (
         SELECT query_code, elapsed_ms
         FROM adm_query_perf_log
         WHERE route_code = $1
           AND created_at >= NOW() - make_interval(hours => $2::int)
       ),
       previous_window AS (
         SELECT query_code, elapsed_ms
         FROM adm_query_perf_log
         WHERE route_code = $1
           AND created_at >= NOW() - make_interval(hours => ($2::int * 2))
           AND created_at < NOW() - make_interval(hours => $2::int)
       ),
       cur AS (
         SELECT
           query_code,
           COUNT(*)::int AS current_samples,
           COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY elapsed_ms), 0)::numeric(10,2) AS current_p95_ms,
           COALESCE(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY elapsed_ms), 0)::numeric(10,2) AS current_p99_ms
         FROM current_window
         GROUP BY query_code
       ),
       prev AS (
         SELECT
           query_code,
           COUNT(*)::int AS previous_samples,
           COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY elapsed_ms), 0)::numeric(10,2) AS previous_p95_ms
         FROM previous_window
         GROUP BY query_code
       ),
       tuning AS (
         SELECT query_code, dynamic_threshold_ms
         FROM adm_query_perf_tuning
         WHERE route_code = $1
       ),
       slow_counts AS (
         SELECT
           l.query_code,
           COUNT(*)::int AS slow_event_count
         FROM adm_query_perf_log l
         LEFT JOIN tuning t ON t.query_code = l.query_code
         WHERE l.route_code = $1
           AND l.created_at >= NOW() - make_interval(hours => $2::int)
           AND l.elapsed_ms >= COALESCE(t.dynamic_threshold_ms, $3::numeric)
         GROUP BY l.query_code
       ),
       merged AS (
         SELECT
           COALESCE(cur.query_code, prev.query_code) AS query_code,
           COALESCE(cur.current_samples, 0) AS current_samples,
           COALESCE(prev.previous_samples, 0) AS previous_samples,
           COALESCE(cur.current_p95_ms, 0)::numeric(10,2) AS current_p95_ms,
           COALESCE(prev.previous_p95_ms, 0)::numeric(10,2) AS previous_p95_ms,
           COALESCE(cur.current_p99_ms, 0)::numeric(10,2) AS current_p99_ms,
           COALESCE(t.dynamic_threshold_ms, $3::numeric)::numeric(10,2) AS threshold_ms,
           COALESCE(sc.slow_event_count, 0)::int AS slow_event_count,
           CASE
             WHEN COALESCE(prev.previous_p95_ms, 0) <= 0 THEN NULL
             ELSE ROUND((COALESCE(cur.current_p95_ms, 0) / prev.previous_p95_ms)::numeric, 4)
           END AS drift_ratio
         FROM cur
         FULL OUTER JOIN prev ON prev.query_code = cur.query_code
         LEFT JOIN tuning t ON t.query_code = COALESCE(cur.query_code, prev.query_code)
         LEFT JOIN slow_counts sc ON sc.query_code = COALESCE(cur.query_code, prev.query_code)
       ),
       expanded AS (
         SELECT
           query_code, 'sustained_drift'::text AS incident_type, current_samples, previous_samples, current_p95_ms, previous_p95_ms,
           current_p99_ms, threshold_ms, slow_event_count, drift_ratio
         FROM merged
         WHERE previous_samples >= $4::int
           AND current_samples >= $4::int
           AND drift_ratio IS NOT NULL
           AND drift_ratio >= $5::numeric
         UNION ALL
         SELECT
           query_code, 'spike_persistence'::text AS incident_type, current_samples, previous_samples, current_p95_ms, previous_p95_ms,
           current_p99_ms, threshold_ms, slow_event_count, drift_ratio
         FROM merged
         WHERE current_samples >= $4::int
           AND threshold_ms > 0
           AND current_p99_ms >= (threshold_ms * $6::numeric)
           AND slow_event_count >= $7::int
         UNION ALL
         SELECT
           query_code, 'newly_slow_query'::text AS incident_type, current_samples, previous_samples, current_p95_ms, previous_p95_ms,
           current_p99_ms, threshold_ms, slow_event_count, drift_ratio
         FROM merged
         WHERE previous_samples < $4::int
           AND current_samples >= $4::int
           AND current_p95_ms >= GREATEST($8::numeric, threshold_ms)
       )
       SELECT *
       FROM expanded
       ORDER BY query_code, incident_type`,
      [
        routeCode,
        hours,
        PERF_LOG_THRESHOLD_MS,
        PERF_INCIDENT_MIN_SAMPLES,
        PERF_INCIDENT_DRIFT_RATIO,
        PERF_INCIDENT_SPIKE_RATIO,
        PERF_INCIDENT_SLOW_HIT_COUNT,
        PERF_INCIDENT_NEW_SLOW_P95_MS,
      ]
    )

    const activeKeys = new Set()
    let created = 0
    let updated = 0

    for (const row of findings) {
      const queryCode = String(row.query_code || '')
      const incidentType = String(row.incident_type || '')
      if (!queryCode || !incidentType) continue
      const currentP95 = Number(row.current_p95_ms || 0)
      const previousP95 = Number(row.previous_p95_ms || 0)
      const thresholdMs = Number(row.threshold_ms || PERF_LOG_THRESHOLD_MS)
      const driftRatio = Number(row.drift_ratio || 0)
      const slowCount = Number(row.slow_event_count || 0)
      const severity = toIncidentSeverity(incidentType, driftRatio)
      const { title, summary } = buildIncidentText(
        incidentType,
        queryCode,
        currentP95,
        previousP95,
        thresholdMs,
        driftRatio,
        slowCount
      )

      const [result] = await query(
        `INSERT INTO adm_query_perf_incidents (
           route_code, query_code, incident_type, severity, status, title, summary,
           first_detected_at, last_detected_at, detected_count, current_p95_ms, previous_p95_ms,
           current_p99_ms, threshold_ms, drift_ratio, slow_event_count, details, created_by,
           last_action_by, last_action_at, sla_due_at, escalation_level, created_at, updated_at
         )
         VALUES (
           $1,$2,$3,$4,'open',$5,$6,NOW(),NOW(),1,$7,$8,$9,$10,$11,$12,$13::jsonb,$14,$14,NOW(),
           NOW() + make_interval(mins => $15::int),
           0,
           NOW(),NOW()
         )
         ON CONFLICT (route_code, query_code, incident_type) WHERE status IN ('open','acknowledged')
         DO UPDATE SET
           severity = EXCLUDED.severity,
           title = EXCLUDED.title,
           summary = EXCLUDED.summary,
           last_detected_at = NOW(),
           detected_count = adm_query_perf_incidents.detected_count + 1,
           current_p95_ms = EXCLUDED.current_p95_ms,
           previous_p95_ms = EXCLUDED.previous_p95_ms,
           current_p99_ms = EXCLUDED.current_p99_ms,
           threshold_ms = EXCLUDED.threshold_ms,
           drift_ratio = EXCLUDED.drift_ratio,
           slow_event_count = EXCLUDED.slow_event_count,
           details = EXCLUDED.details,
           resolved_by = NULL,
           resolved_at = NULL,
           resolution_note = NULL,
           sla_due_at = CASE
             WHEN adm_query_perf_incidents.sla_due_at IS NULL THEN NOW() + make_interval(mins => $15::int)
             WHEN adm_query_perf_incidents.severity <> EXCLUDED.severity THEN NOW() + make_interval(mins => $15::int)
             ELSE adm_query_perf_incidents.sla_due_at
           END,
           last_action_by = $14,
           last_action_at = NOW(),
           updated_at = NOW()
         RETURNING id, (xmax = 0) AS inserted`,
        [
          routeCode,
          queryCode,
          incidentType,
          severity,
          title,
          summary,
          currentP95,
          previousP95,
          Number(row.current_p99_ms || 0),
          thresholdMs,
          driftRatio > 0 ? Number(driftRatio.toFixed(4)) : null,
          slowCount,
          JSON.stringify({
            currentSamples: Number(row.current_samples || 0),
            previousSamples: Number(row.previous_samples || 0),
            policy: {
              minSamples: PERF_INCIDENT_MIN_SAMPLES,
              driftRatio: PERF_INCIDENT_DRIFT_RATIO,
              spikeRatio: PERF_INCIDENT_SPIKE_RATIO,
              newlySlowP95Ms: PERF_INCIDENT_NEW_SLOW_P95_MS,
              slowHitCount: PERF_INCIDENT_SLOW_HIT_COUNT,
            },
          }),
          actorEmail,
          perfIncidentSlaMinutes(severity, incidentType),
        ]
      )
      activeKeys.add(`${queryCode}:${incidentType}`)
      if (result?.inserted) {
        created += 1
        await appendPerfIncidentEvent({
          incidentId: result.id,
          eventType: 'incident_opened',
          actorEmail,
          note: `Created incident ${incidentType}`,
          payload: { queryCode, incidentType, severity },
        })
        if (emitNotifications) {
          await appendNotificationEvent({
            eventCode: 'PERF_REGRESSION_INCIDENT_OPENED',
            severity,
            channel: 'in_app',
            title,
            body: summary,
            payload: { routeCode, queryCode, incidentType, driftRatio, thresholdMs, slowCount },
            deliveryStatus: 'sent',
            deliveryAttempts: 1,
            sentAt: new Date().toISOString(),
          })
        }
      } else {
        updated += 1
        await appendPerfIncidentEvent({
          incidentId: result.id,
          eventType: 'incident_refreshed',
          actorEmail,
          note: `Refreshed incident ${incidentType}`,
          payload: { queryCode, incidentType, severity },
        })
      }
    }

    const openRows = await query(
      `SELECT id, query_code, incident_type
       FROM adm_query_perf_incidents
       WHERE route_code = $1
         AND status IN ('open', 'acknowledged')`,
      [routeCode]
    )
    const staleIds = openRows
      .filter((row) => !activeKeys.has(`${row.query_code}:${row.incident_type}`))
      .map((row) => row.id)

    let resolved = 0
    if (staleIds.length) {
      const rows = await query(
        `UPDATE adm_query_perf_incidents
         SET
           status = 'resolved',
           resolved_by = $2,
           resolved_at = NOW(),
           resolution_note = 'Auto-resolved: condition no longer detected',
           last_action_by = $2,
           last_action_at = NOW(),
           updated_at = NOW()
         WHERE id = ANY($1::bigint[])
         RETURNING id`,
        [staleIds, actorEmail]
      )
      resolved = rows.length
      for (const row of rows) {
        await appendPerfIncidentEvent({
          incidentId: row.id,
          eventType: 'incident_auto_resolved',
          actorEmail,
          note: 'Condition no longer detected',
          payload: { reason: 'condition_cleared' },
        })
      }
    }

    const incidents = await fetchActivePerfIncidents(routeCode, 20)

    return { incidents, created, updated, resolved }
  } catch {
    return { incidents: [], created: 0, updated: 0, resolved: 0 }
  }
}

async function writePerfLog({ routeCode, queryCode, elapsedMs, rowCount = 0, actorEmail = null, metadata = {} }) {
  try {
    await query(
      `INSERT INTO adm_query_perf_log (route_code, query_code, elapsed_ms, row_count, actor_email, metadata)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb)`,
      [routeCode, queryCode, Number(elapsedMs || 0), Number(rowCount || 0), actorEmail, JSON.stringify(metadata || {})]
    )
  } catch {
    // non-blocking instrumentation
  }
}

async function timedQuery(routeCode, queryCode, sql, params = [], perfBucket = null, actorEmail = null) {
  await refreshPerfThresholdCache(false)
  const start = performance.now()
  const rows = await query(sql, params)
  const elapsedMs = performance.now() - start
  const thresholdMs = readDynamicThreshold(routeCode, queryCode) || PERF_LOG_THRESHOLD_MS
  const entry = { queryCode, elapsedMs: Number(elapsedMs.toFixed(2)), rowCount: rows.length }
  if (Array.isArray(perfBucket)) perfBucket.push(entry)
  if (elapsedMs >= thresholdMs) {
    await writePerfLog({
      routeCode,
      queryCode,
      elapsedMs,
      rowCount: rows.length,
      actorEmail,
      metadata: { slow: true, thresholdMs, usedDynamicThreshold: thresholdMs !== PERF_LOG_THRESHOLD_MS },
    })
  }
  return rows
}

async function appendAudit(actionCode, entityType, entityId, detail, payload = {}, actorEmail = 'system@naptin.gov.ng') {
  const [prev] = await query('SELECT audit_hash FROM adm_audit_log ORDER BY id DESC LIMIT 1')
  const prevHash = prev?.audit_hash || ''
  const payloadJson = JSON.stringify(payload || {})
  const hashMaterial = [prevHash, actorEmail, actionCode, entityType, entityId || '', detail || '', payloadJson].join('|')
  const auditHash = createHmac('sha256', process.env.ACCESS_AUDIT_HASH_SECRET || 'naptin-audit-chain').update(hashMaterial).digest('hex')
  await query(
    `INSERT INTO adm_audit_log (actor_email, action_code, entity_type, entity_id, detail, prev_hash, audit_hash, payload)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [actorEmail, actionCode, entityType, entityId, detail, prevHash || null, auditHash, payloadJson]
  )
  if (entityType !== 'dashboard_cache') {
    clearDashboardCache()
  }
}

async function appendNotificationEvent({
  eventCode,
  severity = 'info',
  channel = 'in_app',
  recipient = null,
  title,
  body = null,
  payload = {},
  deliveryStatus = 'sent',
  deliveryAttempts = 0,
  lastError = null,
  nextRetryAt = null,
  sentAt = null,
  processedAt = null,
}) {
  const [row] = await query(
    `INSERT INTO adm_notification_events (
       event_code, severity, channel, recipient, title, body, payload,
       delivery_status, delivery_attempts, last_error, next_retry_at, sent_at, processed_at
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10,$11,$12,$13)
     RETURNING *`,
    [
      eventCode,
      severity,
      channel,
      recipient,
      title,
      body,
      JSON.stringify(payload || {}),
      deliveryStatus,
      deliveryAttempts,
      lastError,
      nextRetryAt,
      sentAt,
      processedAt,
    ]
  )
  return row
}

async function deliverWebhook({ webhookUrl, eventCode, severity, payload }) {
  const secret = (process.env.ACCESS_GOVERNANCE_WEBHOOK_SECRET || '').trim()
  const body = JSON.stringify({
    eventCode,
    severity,
    occurredAt: new Date().toISOString(),
    payload: payload || {},
  })
  const signature = secret ? createHmac('sha256', secret).update(body).digest('hex') : null
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(signature ? { 'x-naptin-signature': `sha256=${signature}` } : {}),
    },
    body,
  })
  return { ok: response.ok, status: response.status, signed: !!signature }
}

async function deliverEmail({
  webhookUrl,
  apiKey,
  recipientEmail,
  subject,
  body,
  payload = {},
}) {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      to: recipientEmail,
      subject,
      text: body,
      payload: payload || {},
    }),
  })
  return { ok: response.ok, status: response.status }
}

async function retryNotificationDelivery(row) {
  const attempts = Number(row.delivery_attempts || 0) + 1
  const payloadData = row.payload?.data || row.payload || {}
  let sent = false
  let responseStatus = null
  let errorText = null
  try {
    if (row.channel === 'webhook') {
      const result = await deliverWebhook({
        webhookUrl: row.recipient,
        eventCode: row.event_code,
        severity: row.payload?.requestSeverity || row.severity || 'info',
        payload: payloadData,
      })
      sent = result.ok
      responseStatus = result.status
      if (!sent) errorText = `Webhook returned HTTP ${result.status}`
    } else if (row.channel === 'email') {
      const webhookUrl = (process.env.ACCESS_GOVERNANCE_EMAIL_WEBHOOK_URL || '').trim()
      const apiKey = (process.env.ACCESS_GOVERNANCE_EMAIL_API_KEY || '').trim()
      if (!webhookUrl) {
        errorText = 'ACCESS_GOVERNANCE_EMAIL_WEBHOOK_URL not configured'
      } else {
        const result = await deliverEmail({
          webhookUrl,
          apiKey,
          recipientEmail: row.recipient,
          subject: row.payload?.subject || row.title || 'Governance email',
          body: row.payload?.emailBody || row.body || '',
          payload: payloadData,
        })
        sent = result.ok
        responseStatus = result.status
        if (!sent) errorText = `Email webhook returned HTTP ${result.status}`
      }
    } else {
      errorText = `Unsupported retry channel: ${row.channel || 'unknown'}`
    }
  } catch (error) {
    errorText = error?.message || 'Delivery retry failed'
  }

  await query(
    `UPDATE adm_notification_events
     SET
      delivery_attempts = $2,
      delivery_status = $3,
      last_error = $4,
      next_retry_at = $5,
      sent_at = CASE WHEN $3 = 'sent' THEN NOW() ELSE sent_at END,
      processed_at = NOW(),
      payload = jsonb_set(payload, '{responseStatus}', to_jsonb($6::int), true)
     WHERE id = $1`,
    [
      row.id,
      attempts,
      sent ? 'sent' : (attempts >= MAX_DELIVERY_ATTEMPTS ? 'dead_letter' : 'failed'),
      sent ? null : errorText,
      sent || attempts >= MAX_DELIVERY_ATTEMPTS ? null : computeNextRetryAt(attempts + 1),
      responseStatus || null,
    ]
  )
  return { sent, attempts }
}

async function emitGovernanceWebhook(eventCode, payload, severity = 'info') {
  const webhookUrl = (process.env.ACCESS_GOVERNANCE_WEBHOOK_URL || process.env.ACCESS_REVIEW_WEBHOOK_URL || '').trim()
  if (!webhookUrl) return

  let sent = false
  let responseStatus = null
  let errorText = null
  let signed = false
  try {
    const result = await deliverWebhook({
      webhookUrl,
      eventCode,
      severity,
      payload: payload || {},
    })
    responseStatus = result.status
    signed = result.signed
    sent = result.ok
    if (!result.ok) {
      errorText = `Webhook returned HTTP ${result.status}`
    }
  } catch (error) {
    errorText = error?.message || 'Webhook dispatch failed'
  }

  await appendNotificationEvent({
    eventCode,
    severity: sent ? severity : 'error',
    channel: 'webhook',
    recipient: webhookUrl,
    title: sent ? 'Governance webhook delivered' : 'Governance webhook failed',
    body: sent ? `${eventCode} sent` : errorText,
    payload: {
      eventCode,
      responseStatus,
      sent,
      signed,
      requestSeverity: severity,
      data: payload || {},
    },
    deliveryStatus: sent ? 'sent' : 'failed',
    deliveryAttempts: 1,
    lastError: sent ? null : errorText,
    nextRetryAt: sent ? null : computeNextRetryAt(1),
    sentAt: sent ? new Date().toISOString() : null,
    processedAt: new Date().toISOString(),
  })
}

async function sendGovernanceEmail({
  recipient,
  subject,
  body,
  payload = {},
  severity = 'info',
}) {
  const recipientEmail = (recipient || '').trim().toLowerCase()
  if (!recipientEmail) return

  const webhookUrl = (process.env.ACCESS_GOVERNANCE_EMAIL_WEBHOOK_URL || '').trim()
  const apiKey = (process.env.ACCESS_GOVERNANCE_EMAIL_API_KEY || '').trim()
  let sent = false
  let responseStatus = null
  let errorText = null

  if (webhookUrl) {
    try {
      const result = await deliverEmail({
        webhookUrl,
        apiKey,
        recipientEmail,
        subject,
        body,
        payload: payload || {},
      })
      responseStatus = result.status
      sent = result.ok
      if (!result.ok) errorText = `Email webhook returned HTTP ${result.status}`
    } catch (error) {
      errorText = error?.message || 'Email webhook dispatch failed'
    }
  } else {
    // No transport configured: keep an explicit event trail so ops can verify intent.
    sent = false
    errorText = 'ACCESS_GOVERNANCE_EMAIL_WEBHOOK_URL not configured'
  }

  await appendNotificationEvent({
    eventCode: 'ACCESS_GOVERNANCE_EMAIL',
    severity: sent ? severity : 'warning',
    channel: 'email',
    recipient: recipientEmail,
    title: sent ? `Email sent: ${subject}` : `Email queued: ${subject}`,
    body: sent ? body : errorText,
    payload: {
      subject,
      responseStatus,
      sent,
      emailBody: body,
      data: payload || {},
    },
    deliveryStatus: sent ? 'sent' : 'failed',
    deliveryAttempts: 1,
    lastError: sent ? null : errorText,
    nextRetryAt: sent ? null : computeNextRetryAt(1),
    sentAt: sent ? new Date().toISOString() : null,
    processedAt: new Date().toISOString(),
  })
}

async function getRiskPolicy() {
  const [policy] = await query(
    `SELECT
      policy_code,
      stale_override_days,
      weight_sod_conflict,
      weight_stale_override,
      weight_missing_reason,
      weight_override_count,
      inactivity_days_high_privilege,
      updated_by,
      updated_at
     FROM adm_risk_policy
     WHERE policy_code = 'DEFAULT'
     LIMIT 1`
  )
  return (
    policy || {
      policy_code: 'DEFAULT',
      stale_override_days: 90,
      weight_sod_conflict: 5,
      weight_stale_override: 3,
      weight_missing_reason: 2,
      weight_override_count: 1,
      inactivity_days_high_privilege: 60,
      updated_by: 'system',
      updated_at: null,
    }
  )
}

async function executeReportSchedule(schedule, actorEmail = 'system@naptin.gov.ng') {
  let reportRows = []
  if (schedule.report_type === 'access_review_summary') {
    reportRows = await query(
      `SELECT
        r.id AS review_id,
        r.review_type,
        r.status,
        r.priority,
        r.assigned_to,
        r.due_at,
        r.reviewed_at,
        u.email AS reviewed_user_email,
        u.first_name,
        u.last_name
       FROM adm_access_reviews r
       JOIN adm_users u ON u.id = r.user_id
       ORDER BY r.reviewed_at DESC
       LIMIT 500`
    )
  } else if (schedule.report_type === 'sod_exposure') {
    reportRows = await query(
      `WITH effective_permissions AS (
        SELECT u.id AS user_id, rp.permission_id
        FROM adm_users u
        JOIN adm_role_permissions rp ON rp.role_id = u.primary_role_id AND rp.granted = TRUE
        WHERE u.account_status = 'active'
        UNION
        SELECT u.id AS user_id, rp.permission_id
        FROM adm_users u
        JOIN adm_user_secondary_roles usr ON usr.user_id = u.id
        JOIN adm_role_permissions rp ON rp.role_id = usr.role_id AND rp.granted = TRUE
        WHERE u.account_status = 'active'
      )
      SELECT
        u.id AS user_id,
        u.first_name,
        u.last_name,
        u.email,
        s.code AS sod_code,
        s.severity,
        p1.permission_code AS left_permission,
        p2.permission_code AS right_permission
      FROM effective_permissions ep
      JOIN adm_sod_rules s ON s.active = TRUE AND s.left_permission_id = ep.permission_id
      JOIN effective_permissions ep2 ON ep2.user_id = ep.user_id AND ep2.permission_id = s.right_permission_id
      JOIN adm_users u ON u.id = ep.user_id
      JOIN adm_permissions p1 ON p1.id = s.left_permission_id
      JOIN adm_permissions p2 ON p2.id = s.right_permission_id
      ORDER BY CASE LOWER(COALESCE(s.severity, 'high')) WHEN 'critical' THEN 1 WHEN 'high' THEN 2 ELSE 3 END, u.id DESC
      LIMIT 1000`
    )
  } else if (schedule.report_type === 'review_reminder_batch') {
    const hoursAhead = Number(schedule.config?.hoursAhead || 24)
    const includeOverdue = schedule.config?.includeOverdue !== false
    const rows = await query(
      `SELECT id, assigned_to, due_at, priority
       FROM adm_access_reviews
       WHERE status <> 'resolved'
         AND assigned_to IS NOT NULL
         AND (
           (due_at IS NOT NULL AND due_at >= NOW() AND due_at <= NOW() + make_interval(hours => $1::int))
           OR ($2::boolean = TRUE AND due_at IS NOT NULL AND due_at < NOW())
         )
       ORDER BY due_at ASC NULLS LAST
       LIMIT 500`,
      [hoursAhead, includeOverdue]
    )
    for (const row of rows) {
      await appendNotificationEvent({
        eventCode: 'ACCESS_REVIEW_REMINDER',
        severity: row.due_at && new Date(row.due_at).getTime() < Date.now() ? 'warning' : 'info',
        channel: 'in_app',
        recipient: row.assigned_to,
        title: 'Scheduled access review reminder',
        body: `Review #${row.id} requires action`,
        payload: { reviewId: row.id, dueAt: row.due_at, priority: row.priority, scheduleCode: schedule.schedule_code },
      })
    }
    reportRows = rows
  } else if (schedule.report_type === 'delivery_retry_batch') {
    const retryRows = await query(
      `SELECT *
       FROM adm_notification_events
       WHERE channel IN ('webhook', 'email')
         AND delivery_status IN ('failed', 'queued')
         AND delivery_attempts < $1
         AND (next_retry_at IS NULL OR next_retry_at <= NOW())
       ORDER BY created_at ASC
       LIMIT 200`,
      [MAX_DELIVERY_ATTEMPTS]
    )
    for (const row of retryRows) {
      await retryNotificationDelivery(row)
    }
    reportRows = retryRows.map((r) => ({ id: r.id, event_code: r.event_code, channel: r.channel, recipient: r.recipient }))
  }

  const csv = reportRows.length
    ? (() => {
        const keys = Object.keys(reportRows[0])
        const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
        return [keys.join(','), ...reportRows.map((row) => keys.map((k) => esc(row[k])).join(','))].join('\n')
      })()
    : ''

  const updateSql = (() => {
    switch (schedule.frequency) {
      case 'hourly':
        return "NOW() + INTERVAL '1 hour'"
      case 'daily':
        return "NOW() + INTERVAL '1 day'"
      case 'weekly':
        return "NOW() + INTERVAL '7 days'"
      case 'monthly':
        return "NOW() + INTERVAL '30 days'"
      default:
        return 'next_run_at'
    }
  })()
  await query(
    `UPDATE adm_report_schedules
     SET last_run_at = NOW(), next_run_at = ${updateSql}, updated_at = NOW()
     WHERE id = $1`,
    [schedule.id]
  )

  await appendAudit('ACCESS_REPORT_RUN_NOW', 'report_schedule', String(schedule.id), 'Executed report schedule', {
    reportType: schedule.report_type,
    rows: reportRows.length,
    scheduleCode: schedule.schedule_code,
  }, actorEmail)

  return { rows: reportRows.length, items: reportRows, csv }
}

async function processReviewReminders({ hoursAhead = 24, includeOverdue = true }) {
  const rows = await query(
    `SELECT id, assigned_to, due_at, priority, status
     FROM adm_access_reviews
     WHERE status <> 'resolved'
       AND assigned_to IS NOT NULL
       AND (
         (due_at IS NOT NULL AND due_at >= NOW() AND due_at <= NOW() + make_interval(hours => $1::int))
         OR ($2::boolean = TRUE AND due_at IS NOT NULL AND due_at < NOW())
       )
     ORDER BY due_at ASC NULLS LAST
     LIMIT 500`,
    [hoursAhead, includeOverdue]
  )

  for (const row of rows) {
    const overdue = row.due_at && new Date(row.due_at).getTime() < Date.now()
    await appendNotificationEvent({
      eventCode: 'ACCESS_REVIEW_REMINDER',
      severity: overdue ? 'warning' : 'info',
      channel: 'in_app',
      recipient: row.assigned_to,
      title: overdue ? 'Access review overdue reminder' : 'Access review due reminder',
      body: `Review #${row.id} is ${overdue ? 'overdue' : 'due soon'} (${row.priority || 'medium'} priority).`,
      payload: { reviewId: row.id, dueAt: row.due_at, priority: row.priority, overdue },
    })
    await sendGovernanceEmail({
      recipient: row.assigned_to,
      subject: overdue ? `NAPTIN Review Overdue (#${row.id})` : `NAPTIN Review Due Soon (#${row.id})`,
      body: `Review #${row.id} is ${overdue ? 'overdue' : 'due soon'}. Please complete required access attestation.`,
      payload: { reviewId: row.id, dueAt: row.due_at, priority: row.priority, overdue },
      severity: overdue ? 'warning' : 'info',
    })
  }
  return rows
}

async function processOverrideExpiryMaintenance({ daysAhead = 7 }) {
  const soonToExpire = await query(
    `SELECT
      upo.id,
      upo.user_id,
      upo.expires_at,
      upo.requested_by,
      upo.requested_approver_email,
      p.permission_code,
      u.email AS user_email
     FROM adm_user_permission_overrides upo
     JOIN adm_permissions p ON p.id = upo.permission_id
     JOIN adm_users u ON u.id = upo.user_id
     WHERE upo.approval_status = 'approved'
       AND upo.expires_at IS NOT NULL
       AND upo.expires_at >= NOW()
       AND upo.expires_at <= NOW() + make_interval(days => $1::int)
     ORDER BY upo.expires_at ASC
     LIMIT 500`,
    [daysAhead]
  )

  for (const row of soonToExpire) {
    const recipient = row.requested_approver_email || row.requested_by || row.user_email
    await appendNotificationEvent({
      eventCode: 'USER_PERMISSION_OVERRIDE_EXPIRY_REMINDER',
      severity: 'warning',
      channel: 'in_app',
      recipient: recipient || null,
      title: 'Permission override nearing expiry',
      body: `${row.permission_code} for user #${row.user_id} expires soon`,
      payload: { overrideId: row.id, userId: row.user_id, permissionCode: row.permission_code, expiresAt: row.expires_at },
    })
    if (recipient) {
      await sendGovernanceEmail({
        recipient,
        subject: `NAPTIN Override Expiry Reminder (${row.permission_code})`,
        body: `Override ${row.permission_code} for user #${row.user_id} expires on ${new Date(row.expires_at).toISOString()}.`,
        payload: { overrideId: row.id, userId: row.user_id, permissionCode: row.permission_code, expiresAt: row.expires_at },
        severity: 'warning',
      })
    }
  }

  const expired = await query(
    `UPDATE adm_user_permission_overrides
     SET
      approval_status = 'expired',
      reviewed_at = NOW()
     WHERE approval_status = 'approved'
       AND expires_at IS NOT NULL
       AND expires_at < NOW()
     RETURNING id, user_id`
  )

  return { soonToExpire, expired }
}

async function getRiskCursor() {
  const [cursor] = await query(
    `SELECT last_incremental_at, last_full_at
     FROM adm_risk_refresh_cursor
     WHERE id = 1
     LIMIT 1`
  )
  return cursor || { last_incremental_at: null, last_full_at: null }
}

async function upsertDepartmentSnapshots(departmentIds = []) {
  const ids = Array.isArray(departmentIds) ? departmentIds.map((x) => Number(x)).filter((x) => Number.isFinite(x) && x > 0) : []
  if (!ids.length) return 0
  await query(
    `DELETE FROM adm_department_risk_snapshot
     WHERE department_id = ANY($1::int[])`,
    [ids]
  )
  await query(
    `INSERT INTO adm_department_risk_snapshot (
       department_id,
       department_code,
       department_name,
       users_count,
       override_count,
       sod_conflicts,
       risk_score,
       refreshed_at
     )
     SELECT
       d.id AS department_id,
       d.code AS department_code,
       d.name AS department_name,
       COUNT(s.user_id)::int AS users_count,
       COALESCE(SUM(s.override_count), 0)::int AS override_count,
       COALESCE(SUM(s.sod_conflicts), 0)::int AS sod_conflicts,
       COALESCE(SUM(s.risk_score), 0)::int AS risk_score,
       NOW() AS refreshed_at
     FROM adm_departments d
     LEFT JOIN adm_user_risk_snapshot s ON s.department_id = d.id
     WHERE d.id = ANY($1::int[])
     GROUP BY d.id, d.code, d.name`,
    [ids]
  )
  return ids.length
}

async function refreshRiskSnapshots({ forceFull = false } = {}) {
  const nowIso = new Date().toISOString()
  if (forceFull) {
    await query('DELETE FROM adm_user_risk_snapshot')
    await query(
      `INSERT INTO adm_user_risk_snapshot (
         user_id, department_id, sod_conflicts, override_count, overrides_without_reason, stale_overrides, risk_score, refreshed_at
       )
       WITH effective_permissions AS (
         SELECT u.id AS user_id, rp.permission_id
         FROM adm_users u
         JOIN adm_role_permissions rp ON rp.role_id = u.primary_role_id AND rp.granted = TRUE
         WHERE u.account_status = 'active'
         UNION
         SELECT u.id AS user_id, rp.permission_id
         FROM adm_users u
         JOIN adm_user_secondary_roles usr ON usr.user_id = u.id
         JOIN adm_role_permissions rp ON rp.role_id = usr.role_id AND rp.granted = TRUE
         WHERE u.account_status = 'active'
       ),
       sod_per_user AS (
         SELECT ep.user_id, COUNT(*)::int AS sod_conflicts
         FROM effective_permissions ep
         JOIN adm_sod_rules s ON s.active = TRUE AND s.left_permission_id = ep.permission_id
         JOIN effective_permissions ep2 ON ep2.user_id = ep.user_id AND ep2.permission_id = s.right_permission_id
         GROUP BY ep.user_id
       ),
       override_per_user AS (
         SELECT
           user_id,
           COUNT(*)::int AS override_count,
           COUNT(*) FILTER (WHERE COALESCE(TRIM(reason), '') = '')::int AS overrides_without_reason,
           COUNT(*) FILTER (WHERE created_at < (NOW() - INTERVAL '90 days'))::int AS stale_overrides
         FROM adm_user_permission_overrides
         WHERE approval_status = 'approved'
         GROUP BY user_id
       )
       SELECT
         u.id AS user_id,
         u.department_id,
         COALESCE(spu.sod_conflicts, 0) AS sod_conflicts,
         COALESCE(opu.override_count, 0) AS override_count,
         COALESCE(opu.overrides_without_reason, 0) AS overrides_without_reason,
         COALESCE(opu.stale_overrides, 0) AS stale_overrides,
         (
           COALESCE(spu.sod_conflicts, 0) * 5
           + COALESCE(opu.stale_overrides, 0) * 3
           + COALESCE(opu.overrides_without_reason, 0) * 2
           + COALESCE(opu.override_count, 0) * 1
         )::int AS risk_score,
         NOW() AS refreshed_at
       FROM adm_users u
       LEFT JOIN sod_per_user spu ON spu.user_id = u.id
       LEFT JOIN override_per_user opu ON opu.user_id = u.id
       WHERE u.account_status = 'active'`
    )
    const departments = await query('SELECT id FROM adm_departments')
    await query('DELETE FROM adm_department_risk_snapshot')
    await upsertDepartmentSnapshots(departments.map((d) => d.id))
    await query(
      `UPDATE adm_risk_refresh_cursor
       SET last_full_at = $1::timestamptz, last_incremental_at = $1::timestamptz, updated_at = NOW()
       WHERE id = 1`,
      [nowIso]
    )
    return { mode: 'full', usersRefreshed: null, departmentsRefreshed: departments.length }
  }

  const cursor = await getRiskCursor()
  const since = cursor.last_incremental_at || '1970-01-01T00:00:00.000Z'
  const changedUserRows = await query(
    `WITH changed AS (
      SELECT u.id AS user_id
      FROM adm_users u
      WHERE u.updated_at >= $1::timestamptz OR u.created_at >= $1::timestamptz
      UNION
      SELECT upo.user_id
      FROM adm_user_permission_overrides upo
      WHERE upo.created_at >= $1::timestamptz
         OR COALESCE(upo.requested_at, upo.created_at) >= $1::timestamptz
         OR COALESCE(upo.approved_at, upo.created_at) >= $1::timestamptz
         OR COALESCE(upo.reviewed_at, upo.created_at) >= $1::timestamptz
      UNION
      SELECT ar.user_id
      FROM adm_access_reviews ar
      WHERE ar.updated_at >= $1::timestamptz OR ar.created_at >= $1::timestamptz
      UNION
      SELECT usr.user_id
      FROM adm_user_secondary_roles usr
      WHERE usr.created_at >= $1::timestamptz
    )
    SELECT DISTINCT user_id
    FROM changed
    LIMIT $2`,
    [since, RISK_INCREMENTAL_BATCH_SIZE]
  )
  const userIds = changedUserRows.map((row) => Number(row.user_id)).filter((x) => Number.isFinite(x) && x > 0)
  if (!userIds.length) {
    await query(
      `UPDATE adm_risk_refresh_cursor
       SET last_incremental_at = $1::timestamptz, updated_at = NOW()
       WHERE id = 1`,
      [nowIso]
    )
    return { mode: 'incremental', usersRefreshed: 0, departmentsRefreshed: 0 }
  }

  await query(
    `DELETE FROM adm_user_risk_snapshot s
     WHERE s.user_id = ANY($1::int[])
       AND NOT EXISTS (
         SELECT 1 FROM adm_users u WHERE u.id = s.user_id AND u.account_status = 'active'
       )`,
    [userIds]
  )

  await query(
    `WITH candidate_users AS (
       SELECT id AS user_id, department_id
       FROM adm_users
       WHERE id = ANY($1::int[])
         AND account_status = 'active'
     ),
     effective_permissions AS (
       SELECT cu.user_id, rp.permission_id
       FROM candidate_users cu
       JOIN adm_users u ON u.id = cu.user_id
       JOIN adm_role_permissions rp ON rp.role_id = u.primary_role_id AND rp.granted = TRUE
       UNION
       SELECT cu.user_id, rp.permission_id
       FROM candidate_users cu
       JOIN adm_user_secondary_roles usr ON usr.user_id = cu.user_id
       JOIN adm_role_permissions rp ON rp.role_id = usr.role_id AND rp.granted = TRUE
     ),
     sod_per_user AS (
       SELECT ep.user_id, COUNT(*)::int AS sod_conflicts
       FROM effective_permissions ep
       JOIN adm_sod_rules s ON s.active = TRUE AND s.left_permission_id = ep.permission_id
       JOIN effective_permissions ep2 ON ep2.user_id = ep.user_id AND ep2.permission_id = s.right_permission_id
       GROUP BY ep.user_id
     ),
     override_per_user AS (
       SELECT
         upo.user_id,
         COUNT(*)::int AS override_count,
         COUNT(*) FILTER (WHERE COALESCE(TRIM(upo.reason), '') = '')::int AS overrides_without_reason,
         COUNT(*) FILTER (WHERE upo.created_at < (NOW() - INTERVAL '90 days'))::int AS stale_overrides
       FROM adm_user_permission_overrides upo
       WHERE upo.approval_status = 'approved'
         AND upo.user_id = ANY($1::int[])
       GROUP BY upo.user_id
     )
     INSERT INTO adm_user_risk_snapshot (
       user_id, department_id, sod_conflicts, override_count, overrides_without_reason, stale_overrides, risk_score, refreshed_at
     )
     SELECT
       cu.user_id,
       cu.department_id,
       COALESCE(spu.sod_conflicts, 0) AS sod_conflicts,
       COALESCE(opu.override_count, 0) AS override_count,
       COALESCE(opu.overrides_without_reason, 0) AS overrides_without_reason,
       COALESCE(opu.stale_overrides, 0) AS stale_overrides,
       (
         COALESCE(spu.sod_conflicts, 0) * 5
         + COALESCE(opu.stale_overrides, 0) * 3
         + COALESCE(opu.overrides_without_reason, 0) * 2
         + COALESCE(opu.override_count, 0) * 1
       )::int AS risk_score,
       NOW() AS refreshed_at
     FROM candidate_users cu
     LEFT JOIN sod_per_user spu ON spu.user_id = cu.user_id
     LEFT JOIN override_per_user opu ON opu.user_id = cu.user_id
     ON CONFLICT (user_id)
     DO UPDATE SET
       department_id = EXCLUDED.department_id,
       sod_conflicts = EXCLUDED.sod_conflicts,
       override_count = EXCLUDED.override_count,
       overrides_without_reason = EXCLUDED.overrides_without_reason,
       stale_overrides = EXCLUDED.stale_overrides,
       risk_score = EXCLUDED.risk_score,
       refreshed_at = NOW()`,
    [userIds]
  )

  const affectedDeptRows = await query(
    `SELECT DISTINCT department_id
     FROM adm_users
     WHERE id = ANY($1::int[])
       AND department_id IS NOT NULL`,
    [userIds]
  )
  const departmentsRefreshed = await upsertDepartmentSnapshots(affectedDeptRows.map((row) => row.department_id))

  await query(
    `UPDATE adm_risk_refresh_cursor
     SET last_incremental_at = $1::timestamptz, updated_at = NOW()
     WHERE id = 1`,
    [nowIso]
  )

  return { mode: 'incremental', usersRefreshed: userIds.length, departmentsRefreshed }
}

router.use('/users', requireSuperAdminLevel5)
router.use('/departments', requireSuperAdminLevel5)
router.use('/job-descriptions', requireSuperAdminLevel5)
router.use('/policies', requireSuperAdminLevel5)
router.use('/reports', requireSuperAdminLevel5)
router.use('/notifications', requireSuperAdminLevel5)
router.use('/maintenance', requireSuperAdminLevel5)
router.use(enforceRouteRateLimit)

router.get('/policies/risk', async (_req, res, next) => {
  try {
    const policy = await getRiskPolicy()
    res.json({
      policyCode: policy.policy_code,
      staleOverrideDays: policy.stale_override_days,
      weightSodConflict: policy.weight_sod_conflict,
      weightStaleOverride: policy.weight_stale_override,
      weightMissingReason: policy.weight_missing_reason,
      weightOverrideCount: policy.weight_override_count,
      inactivityDaysHighPrivilege: policy.inactivity_days_high_privilege,
      updatedBy: policy.updated_by,
      updatedAt: policy.updated_at,
    })
  } catch (e) {
    next(e)
  }
})

router.put('/policies/risk', async (req, res, next) => {
  try {
    const payload = riskPolicyUpdateSchema.parse(req.body || {})
    const { actorEmail } = readActor(req)
    const [row] = await query(
      `INSERT INTO adm_risk_policy (
          policy_code,
          stale_override_days,
          weight_sod_conflict,
          weight_stale_override,
          weight_missing_reason,
          weight_override_count,
          inactivity_days_high_privilege,
          updated_by,
          updated_at
       ) VALUES ('DEFAULT', $1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (policy_code)
       DO UPDATE SET
         stale_override_days = EXCLUDED.stale_override_days,
         weight_sod_conflict = EXCLUDED.weight_sod_conflict,
         weight_stale_override = EXCLUDED.weight_stale_override,
         weight_missing_reason = EXCLUDED.weight_missing_reason,
         weight_override_count = EXCLUDED.weight_override_count,
         inactivity_days_high_privilege = EXCLUDED.inactivity_days_high_privilege,
         updated_by = EXCLUDED.updated_by,
         updated_at = NOW()
       RETURNING *`,
      [
        payload.staleOverrideDays,
        payload.weightSodConflict,
        payload.weightStaleOverride,
        payload.weightMissingReason,
        payload.weightOverrideCount,
        payload.inactivityDaysHighPrivilege,
        actorEmail,
      ]
    )

    await appendAudit('RISK_POLICY_UPDATE', 'risk_policy', row.policy_code, 'Updated enterprise risk policy', payload, actorEmail)
    await emitGovernanceWebhook('RISK_POLICY_UPDATE', { updatedBy: actorEmail, policy: payload }, 'warning')
    const governanceEmails = parseEmailList(process.env.ACCESS_GOVERNANCE_ALERT_EMAILS)
    for (const recipient of governanceEmails) {
      await sendGovernanceEmail({
        recipient,
        subject: 'NAPTIN Access Governance: Risk Policy Updated',
        body: `Risk policy was updated by ${actorEmail}.`,
        payload: { updatedBy: actorEmail, policy: payload },
        severity: 'warning',
      })
    }
    res.json({
      policyCode: row.policy_code,
      staleOverrideDays: row.stale_override_days,
      weightSodConflict: row.weight_sod_conflict,
      weightStaleOverride: row.weight_stale_override,
      weightMissingReason: row.weight_missing_reason,
      weightOverrideCount: row.weight_override_count,
      inactivityDaysHighPrivilege: row.inactivity_days_high_privilege,
      updatedBy: row.updated_by,
      updatedAt: row.updated_at,
    })
  } catch (e) {
    next(e)
  }
})

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
        du.code AS unit_code,
        du.name AS unit_name,
        jd.job_code AS job_description_code,
        jd.title AS job_description_title,
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
      LEFT JOIN adm_department_units du ON du.id = u.unit_id
      LEFT JOIN adm_job_descriptions jd ON jd.id = u.job_description_id
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
    const { actorEmail } = readActor(req)

    const created = await withTx(async (client) => {
      const depRes = payload.departmentCode
        ? await client.query('SELECT id FROM adm_departments WHERE code = $1', [payload.departmentCode])
        : { rows: [] }
      const unitRes = payload.unitCode
        ? await client.query(
            `SELECT id FROM adm_department_units
             WHERE code = $1
               AND ($2::int IS NULL OR department_id = $2::int)`,
            [payload.unitCode, depRes.rows[0]?.id || null]
          )
        : { rows: [] }
      const roleRes = payload.primaryRoleCode
        ? await client.query('SELECT id FROM adm_roles WHERE role_code = $1', [payload.primaryRoleCode])
        : { rows: [] }
      const jobRes = payload.jobTitle
        ? await client.query(
            `SELECT id FROM adm_job_descriptions
             WHERE LOWER(TRIM(title)) = LOWER(TRIM($1))
             LIMIT 1`,
            [payload.jobTitle]
          )
        : { rows: [] }

      const row = await client.query(
        `INSERT INTO adm_users (
          employee_id, first_name, last_name, email, phone, department_id, unit_id, job_title, job_summary, job_description_id, primary_role_id,
          supervisor_user_id, employment_status, account_status, mfa_enabled, account_expiry
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
        RETURNING *`,
        [
          payload.employeeId,
          payload.firstName,
          payload.lastName,
          payload.email.toLowerCase(),
          payload.phone || null,
          depRes.rows[0]?.id || null,
          unitRes.rows[0]?.id || null,
          payload.jobTitle || null,
          payload.jobSummary || null,
          jobRes.rows[0]?.id || null,
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

    await appendAudit('USER_CREATE', 'user', String(created.id), 'Created user account', payload, actorEmail)

    res.status(201).json(created)
  } catch (e) {
    next(e)
  }
})

router.patch('/users/:id', async (req, res, next) => {
  try {
    const userId = Number(req.params.id)
    const payload = userUpdateSchema.parse(req.body || {})
    const { actorEmail } = readActor(req)

    const updated = await withTx(async (client) => {
      if (payload.departmentCode !== undefined) {
        const depRes = payload.departmentCode
          ? await client.query('SELECT id FROM adm_departments WHERE code = $1', [payload.departmentCode])
          : { rows: [{ id: null }] }
        payload.departmentId = depRes.rows[0]?.id || null
      }

      if (payload.unitCode !== undefined) {
        const unitRes = payload.unitCode
          ? await client.query(
              `SELECT id FROM adm_department_units
               WHERE code = $1
                 AND ($2::int IS NULL OR department_id = $2::int)`,
              [payload.unitCode, payload.departmentId ?? null]
            )
          : { rows: [{ id: null }] }
        payload.unitId = unitRes.rows[0]?.id || null
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
          unit_id = COALESCE($7, unit_id),
          primary_role_id = COALESCE($8, primary_role_id),
          supervisor_user_id = COALESCE($9, supervisor_user_id),
          employment_status = COALESCE($10, employment_status),
          account_status = COALESCE($11, account_status),
          mfa_enabled = COALESCE($12, mfa_enabled),
          account_expiry = COALESCE($13, account_expiry),
          job_title = COALESCE($14, job_title),
          job_summary = COALESCE($15, job_summary),
          updated_at = NOW()
         WHERE id = $16
         RETURNING *`,
        [
          payload.employeeId,
          payload.firstName,
          payload.lastName,
          payload.email?.toLowerCase(),
          payload.phone,
          payload.departmentId,
          payload.unitId,
          payload.primaryRoleId,
          payload.supervisorUserId,
          payload.employmentStatus,
          payload.accountStatus,
          payload.mfaEnabled,
          payload.accountExpiry,
          payload.jobTitle,
          payload.jobSummary,
          userId,
        ]
      )
      return row.rows[0]
    })

    if (!updated) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    await appendAudit('USER_UPDATE', 'user', String(userId), 'Updated user account', payload, actorEmail)
    res.json(updated)
  } catch (e) {
    next(e)
  }
})

router.post('/users/:id/disable', async (req, res, next) => {
  try {
    const userId = Number(req.params.id)
    const { actorEmail } = readActor(req)
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

    await appendAudit('USER_DISABLE', 'user', String(userId), 'Disabled user account', {}, actorEmail)
    res.json(row)
  } catch (e) {
    next(e)
  }
})

router.post('/users/:id/review-completed', async (req, res, next) => {
  try {
    const userId = Number(req.params.id)
    const { actorEmail } = readActor(req)
    const payload = userAccessReviewSchema.parse(req.body || {})

    const [userRow] = await query(
      `SELECT id, first_name, last_name, email
       FROM adm_users
       WHERE id = $1`,
      [userId]
    )

    if (!userRow) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const review = await withTx(async (client) => {
      const inserted = await client.query(
        `INSERT INTO adm_access_reviews (
          user_id, review_type, status, reviewer_email, assigned_to, priority, due_at, reviewed_at, review_note, metadata, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),$8,$9::jsonb,NOW())
        RETURNING *`,
        [
          userId,
          payload.reviewType,
          payload.status || 'resolved',
          actorEmail,
          payload.assignedTo || null,
          payload.priority || 'medium',
          payload.dueAt || null,
          payload.reviewNote || null,
          JSON.stringify({
            staleDays: payload.staleDays || null,
            reviewedUser: {
              id: userRow.id,
              email: userRow.email,
              name: `${userRow.first_name} ${userRow.last_name}`,
            },
          }),
        ]
      )

      await client.query(
        `UPDATE adm_user_permission_overrides
         SET reviewed_at = NOW(), reviewer_email = $2
         WHERE user_id = $1`,
        [userId, actorEmail]
      )

      return inserted.rows[0]
    })

    await appendAudit(
      'USER_ACCESS_REVIEW_COMPLETE',
      'access_review',
      String(review.id),
      `Completed ${payload.reviewType} review`,
      {
        reviewId: review.id,
        userId,
        reviewType: payload.reviewType,
        reviewNote: payload.reviewNote || null,
        staleDays: payload.staleDays || null,
        reviewedUser: {
          id: userRow.id,
          email: userRow.email,
          name: `${userRow.first_name} ${userRow.last_name}`,
        },
      },
      actorEmail
    )

    res.json({ ok: true, reviewId: review.id })
  } catch (e) {
    next(e)
  }
})

router.get('/users/:id/access-profile', async (req, res, next) => {
  try {
    const userId = Number(req.params.id)

    const [userRow] = await query(
      `SELECT u.id, u.first_name, u.last_name, u.email, r.role_code AS primary_role_code, r.role_level AS primary_role_level
       FROM adm_users u
       LEFT JOIN adm_roles r ON r.id = u.primary_role_id
       WHERE u.id = $1`,
      [userId]
    )
    if (!userRow) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const secondaryRoles = await query(
      `SELECT r.role_code, r.role_name, r.role_level
       FROM adm_user_secondary_roles usr
       JOIN adm_roles r ON r.id = usr.role_id
       WHERE usr.user_id = $1
       ORDER BY r.role_level DESC, r.role_name`,
      [userId]
    )

    const permissions = await query(
      `WITH effective_roles AS (
        SELECT u.primary_role_id AS role_id
        FROM adm_users u
        WHERE u.id = $1 AND u.primary_role_id IS NOT NULL
        UNION
        SELECT usr.role_id
        FROM adm_user_secondary_roles usr
        WHERE usr.user_id = $1
      )
      SELECT DISTINCT p.permission_code, p.module_code, p.feature_code, p.action_code, p.description
      FROM effective_roles er
      JOIN adm_role_permissions rp ON rp.role_id = er.role_id AND rp.granted = TRUE
      JOIN adm_permissions p ON p.id = rp.permission_id
      ORDER BY p.module_code, p.feature_code, p.action_code`,
      [userId]
    )

    const overrides = await query(
      `SELECT
        p.permission_code,
        upo.effect,
        upo.reason,
        upo.created_at,
        upo.approval_status,
        upo.requested_by,
        upo.requested_at,
        upo.requested_approver_email,
        upo.expires_at,
        upo.approved_by,
        upo.approved_at,
        upo.approver_note
       FROM adm_user_permission_overrides upo
       JOIN adm_permissions p ON p.id = upo.permission_id
       WHERE upo.user_id = $1
         AND upo.approval_status IN ('approved', 'pending')
       ORDER BY p.permission_code`,
      [userId]
    )

    res.json({
      user: {
        id: userRow.id,
        name: `${userRow.first_name} ${userRow.last_name}`,
        email: userRow.email,
        primaryRoleCode: userRow.primary_role_code,
        primaryRoleLevel: userRow.primary_role_level,
      },
      secondaryRoles,
      permissions,
      overrides,
    })
  } catch (e) {
    next(e)
  }
})

router.get('/users/dashboard-summary', async (req, res, next) => {
  try {
    const { actorEmail } = readActor(req)
    const routeCode = 'users.dashboard-summary'
    const perfEnabled = String(req.query.perf || 'false').toLowerCase() === 'true'
    const perfBucket = perfEnabled ? [] : null
    const policy = await getRiskPolicy()
    const staleDaysRaw = Number(req.query.staleDays || policy.stale_override_days || 90)
    const staleDays = Number.isFinite(staleDaysRaw) ? Math.max(30, Math.min(staleDaysRaw, 365)) : (policy.stale_override_days || 90)
    const forceRefresh = String(req.query.refresh || 'false').toLowerCase() === 'true'
    const cacheKey = JSON.stringify({ staleDays })
    const cached = readDashboardCache(cacheKey, forceRefresh)
    if (cached) {
      res.json({ ...cached, cache: { hit: true, ttlMs: DASHBOARD_CACHE_TTL_MS } })
      return
    }
    const snapshotRefresh = await refreshRiskSnapshots({ forceFull: false })
    const weightSod = Number(policy.weight_sod_conflict || 5)
    const weightStale = Number(policy.weight_stale_override || 3)
    const weightMissingReason = Number(policy.weight_missing_reason || 2)
    const weightOverrideCount = Number(policy.weight_override_count || 1)

    const [userTotals] = await timedQuery(
      routeCode,
      'userTotals',
      `SELECT
        COUNT(*)::int AS total_users,
        COUNT(*) FILTER (WHERE account_status = 'active')::int AS active_users,
        COUNT(*) FILTER (WHERE account_status IN ('inactive', 'suspended'))::int AS inactive_or_suspended_users
       FROM adm_users`,
      [],
      perfBucket,
      actorEmail
    )

    const [overrideTotals] = await timedQuery(
      routeCode,
      'overrideTotals',
      `SELECT
        COUNT(*)::int AS total_overrides,
        COUNT(DISTINCT user_id)::int AS users_with_overrides,
        COUNT(*) FILTER (WHERE COALESCE(TRIM(reason), '') = '')::int AS overrides_without_reason
       FROM adm_user_permission_overrides
       WHERE approval_status = 'approved'`,
      [],
      perfBucket,
      actorEmail
    )

    const [staleOverrideTotals] = await timedQuery(
      routeCode,
      'staleOverrideTotals',
      `SELECT
        COUNT(*)::int AS stale_overrides,
        COUNT(DISTINCT user_id)::int AS users_with_stale_overrides
       FROM adm_user_permission_overrides
       WHERE approval_status = 'approved'
         AND created_at < (NOW() - make_interval(days => $1::int))`,
      [staleDays],
      perfBucket,
      actorEmail
    )

    const [sodTotals] = await timedQuery(
      routeCode,
      'sodTotals',
      `WITH effective_permissions AS (
        SELECT u.id AS user_id, rp.permission_id
        FROM adm_users u
        JOIN adm_role_permissions rp ON rp.role_id = u.primary_role_id AND rp.granted = TRUE
        WHERE u.account_status = 'active'

        UNION

        SELECT u.id AS user_id, rp.permission_id
        FROM adm_users u
        JOIN adm_user_secondary_roles usr ON usr.user_id = u.id
        JOIN adm_role_permissions rp ON rp.role_id = usr.role_id AND rp.granted = TRUE
        WHERE u.account_status = 'active'
      ),
      conflicts AS (
        SELECT
          ep.user_id,
          s.id AS sod_rule_id,
          LOWER(COALESCE(s.severity, 'high')) AS severity
        FROM effective_permissions ep
        JOIN adm_sod_rules s
          ON s.active = TRUE
         AND s.left_permission_id = ep.permission_id
        JOIN effective_permissions ep2
          ON ep2.user_id = ep.user_id
         AND ep2.permission_id = s.right_permission_id
      )
      SELECT
        COUNT(DISTINCT user_id)::int AS users_with_sod_conflicts,
        COUNT(*)::int AS total_sod_conflicts,
        COUNT(*) FILTER (WHERE severity = 'critical')::int AS critical_sod_conflicts,
        COUNT(*) FILTER (WHERE severity = 'high')::int AS high_sod_conflicts
      FROM conflicts`,
      [],
      perfBucket,
      actorEmail
    )

    const overrideAging = await timedQuery(
      routeCode,
      'overrideAging',
      `SELECT bucket, count(*)::int AS count
       FROM (
         SELECT
           CASE
             WHEN created_at >= NOW() - INTERVAL '30 days' THEN '0_30_days'
             WHEN created_at >= NOW() - INTERVAL '90 days' THEN '31_90_days'
             ELSE '90_plus_days'
           END AS bucket
         FROM adm_user_permission_overrides
         WHERE approval_status = 'approved'
       ) x
       GROUP BY bucket
       ORDER BY bucket`,
      [],
      perfBucket,
      actorEmail
    )

    const departmentRisk = await timedQuery(
      routeCode,
      'departmentRiskSnapshot',
      `SELECT
        department_code,
        department_name,
        users_count,
        users_count AS active_users_count,
        override_count AS users_with_overrides,
        sod_conflicts AS users_with_sod_conflicts,
        risk_score
       FROM adm_department_risk_snapshot
       ORDER BY risk_score DESC, users_count DESC
       LIMIT 50`,
      [],
      perfBucket,
      actorEmail
    )

    const urgentItems = await query(
      `WITH sod_per_user AS (
        WITH effective_permissions AS (
          SELECT u.id AS user_id, rp.permission_id
          FROM adm_users u
          JOIN adm_role_permissions rp ON rp.role_id = u.primary_role_id AND rp.granted = TRUE
          WHERE u.account_status = 'active'
          UNION
          SELECT u.id AS user_id, rp.permission_id
          FROM adm_users u
          JOIN adm_user_secondary_roles usr ON usr.user_id = u.id
          JOIN adm_role_permissions rp ON rp.role_id = usr.role_id AND rp.granted = TRUE
          WHERE u.account_status = 'active'
        )
        SELECT ep.user_id, COUNT(*)::int AS sod_conflicts
        FROM effective_permissions ep
        JOIN adm_sod_rules s ON s.active = TRUE AND s.left_permission_id = ep.permission_id
        JOIN effective_permissions ep2 ON ep2.user_id = ep.user_id AND ep2.permission_id = s.right_permission_id
        GROUP BY ep.user_id
      ),
      override_per_user AS (
        SELECT
          user_id,
          COUNT(*)::int AS override_count,
          COUNT(*) FILTER (WHERE COALESCE(TRIM(reason), '') = '')::int AS overrides_without_reason,
          COUNT(*) FILTER (WHERE created_at < (NOW() - make_interval(days => $1::int)))::int AS stale_overrides
        FROM adm_user_permission_overrides
        WHERE approval_status = 'approved'
        GROUP BY user_id
      )
      SELECT
        u.id AS user_id,
        u.first_name,
        u.last_name,
        u.email,
        d.name AS department_name,
        COALESCE(spu.sod_conflicts, 0) AS sod_conflicts,
        COALESCE(opu.override_count, 0) AS override_count,
        COALESCE(opu.stale_overrides, 0) AS stale_overrides,
        COALESCE(opu.overrides_without_reason, 0) AS overrides_without_reason,
        (
          COALESCE(spu.sod_conflicts, 0) * $2::int
          + COALESCE(opu.stale_overrides, 0) * $3::int
          + COALESCE(opu.overrides_without_reason, 0) * $4::int
          + COALESCE(opu.override_count, 0) * $5::int
        )::int AS risk_score
      FROM adm_users u
      LEFT JOIN adm_departments d ON d.id = u.department_id
      LEFT JOIN sod_per_user spu ON spu.user_id = u.id
      LEFT JOIN override_per_user opu ON opu.user_id = u.id
      WHERE
        COALESCE(spu.sod_conflicts, 0) > 0
        OR COALESCE(opu.stale_overrides, 0) > 0
        OR COALESCE(opu.overrides_without_reason, 0) > 0
      ORDER BY risk_score DESC, u.id DESC
      LIMIT 20`,
      [staleDays, weightSod, weightStale, weightMissingReason, weightOverrideCount]
    )

    const accessExceptions = await query(
      `SELECT
        upo.id,
        upo.effect,
        upo.reason,
        upo.created_at,
        p.permission_code,
        u.id AS user_id,
        u.first_name,
        u.last_name,
        u.email,
        d.name AS department_name
      FROM adm_user_permission_overrides upo
      JOIN adm_users u ON u.id = upo.user_id
      JOIN adm_permissions p ON p.id = upo.permission_id
      LEFT JOIN adm_departments d ON d.id = u.department_id
      WHERE upo.approval_status = 'approved'
      ORDER BY upo.created_at DESC
      LIMIT 20`
    )

    const staleOverrides = await query(
      `SELECT
        upo.id,
        upo.effect,
        upo.reason,
        upo.created_at,
        p.permission_code,
        u.id AS user_id,
        u.first_name,
        u.last_name,
        u.email,
        d.name AS department_name
      FROM adm_user_permission_overrides upo
      JOIN adm_users u ON u.id = upo.user_id
      JOIN adm_permissions p ON p.id = upo.permission_id
      LEFT JOIN adm_departments d ON d.id = u.department_id
      WHERE upo.approval_status = 'approved'
        AND upo.created_at < (NOW() - make_interval(days => $1::int))
      ORDER BY upo.created_at ASC
      LIMIT 20`,
      [staleDays]
    )

    const sodConflicts = await query(
      `WITH effective_permissions AS (
        SELECT u.id AS user_id, rp.permission_id
        FROM adm_users u
        JOIN adm_role_permissions rp ON rp.role_id = u.primary_role_id AND rp.granted = TRUE
        WHERE u.account_status = 'active'

        UNION

        SELECT u.id AS user_id, rp.permission_id
        FROM adm_users u
        JOIN adm_user_secondary_roles usr ON usr.user_id = u.id
        JOIN adm_role_permissions rp ON rp.role_id = usr.role_id AND rp.granted = TRUE
        WHERE u.account_status = 'active'
      )
      SELECT
        u.id AS user_id,
        u.first_name,
        u.last_name,
        u.email,
        d.name AS department_name,
        s.code AS sod_code,
        s.severity,
        s.description,
        p1.permission_code AS left_permission_code,
        p2.permission_code AS right_permission_code
      FROM effective_permissions ep
      JOIN adm_sod_rules s ON s.active = TRUE AND s.left_permission_id = ep.permission_id
      JOIN effective_permissions ep2 ON ep2.user_id = ep.user_id AND ep2.permission_id = s.right_permission_id
      JOIN adm_users u ON u.id = ep.user_id
      LEFT JOIN adm_departments d ON d.id = u.department_id
      JOIN adm_permissions p1 ON p1.id = s.left_permission_id
      JOIN adm_permissions p2 ON p2.id = s.right_permission_id
      ORDER BY
        CASE LOWER(COALESCE(s.severity, 'high'))
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          ELSE 4
        END,
        u.id DESC
      LIMIT 30`
    )

    const topRiskUsers = await timedQuery(
      routeCode,
      'topRiskUsersSnapshot',
      `SELECT
        s.user_id,
        u.first_name,
        u.last_name,
        u.email,
        d.name AS department_name,
        s.sod_conflicts,
        s.override_count,
        s.stale_overrides,
        s.overrides_without_reason,
        s.risk_score
      FROM adm_user_risk_snapshot s
      JOIN adm_users u ON u.id = s.user_id
      LEFT JOIN adm_departments d ON d.id = u.department_id
      ORDER BY s.risk_score DESC, s.user_id DESC
      LIMIT 10`,
      [],
      perfBucket,
      actorEmail
    )
    for (const row of topRiskUsers) {
      const score = Number(row.risk_score || 0)
      row.risk_band = score >= 20 ? 'critical' : score >= 12 ? 'high' : score >= 6 ? 'medium' : 'low'
    }
    const riskBandCounts = topRiskUsers.reduce(
      (acc, row) => {
        const key = row.risk_band || 'low'
        acc[key] = (acc[key] || 0) + 1
        return acc
      },
      { low: 0, medium: 0, high: 0, critical: 0 }
    )

    const expiringAccounts = await query(
      `SELECT
        u.id AS user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.account_expiry,
        d.name AS department_name,
        (u.account_expiry - CURRENT_DATE)::int AS days_to_expiry
       FROM adm_users u
       LEFT JOIN adm_departments d ON d.id = u.department_id
       WHERE u.account_status = 'active'
         AND u.account_expiry IS NOT NULL
         AND u.account_expiry <= (CURRENT_DATE + INTERVAL '30 days')
       ORDER BY u.account_expiry ASC
       LIMIT 50`
    )

    const dormantHighPrivilege = await query(
      `SELECT
        u.id AS user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.last_login_at,
        r.role_code,
        r.role_level
       FROM adm_users u
       JOIN adm_roles r ON r.id = u.primary_role_id
       WHERE u.account_status = 'active'
         AND r.role_level >= 7
         AND (
           u.last_login_at IS NULL
           OR u.last_login_at < (NOW() - make_interval(days => $1::int))
         )
       ORDER BY u.last_login_at ASC NULLS FIRST
       LIMIT 50`,
      [Number(policy.inactivity_days_high_privilege || 60)]
    )

    const orphanRoles = await query(
      `WITH role_usage AS (
        SELECT role_id FROM adm_users WHERE primary_role_id IS NOT NULL
        UNION ALL
        SELECT role_id FROM adm_user_secondary_roles
      )
      SELECT
        r.id,
        r.role_code,
        r.role_name,
        r.role_level
      FROM adm_roles r
      LEFT JOIN role_usage ru ON ru.role_id = r.id
      WHERE ru.role_id IS NULL
      ORDER BY r.role_level DESC, r.role_name`
    )

    const usersWithoutPrimaryRole = await query(
      `SELECT id AS user_id, first_name, last_name, email
       FROM adm_users
       WHERE primary_role_id IS NULL
       ORDER BY created_at DESC
       LIMIT 100`
    )

    const mfaExceptions = await query(
      `SELECT
        u.id AS user_id,
        u.first_name,
        u.last_name,
        u.email,
        r.role_code,
        r.role_level
       FROM adm_users u
       JOIN adm_roles r ON r.id = u.primary_role_id
       WHERE u.account_status = 'active'
         AND r.role_level >= 5
         AND COALESCE(u.mfa_enabled, FALSE) = FALSE
       ORDER BY r.role_level DESC, u.last_name ASC
       LIMIT 100`
    )

    const permissionAnomalies = await query(
      `WITH effective_permissions AS (
        SELECT u.id AS user_id, u.department_id, rp.permission_id
        FROM adm_users u
        JOIN adm_role_permissions rp ON rp.role_id = u.primary_role_id AND rp.granted = TRUE
        WHERE u.account_status = 'active'
        UNION
        SELECT u.id AS user_id, u.department_id, rp.permission_id
        FROM adm_users u
        JOIN adm_user_secondary_roles usr ON usr.user_id = u.id
        JOIN adm_role_permissions rp ON rp.role_id = usr.role_id AND rp.granted = TRUE
        WHERE u.account_status = 'active'
      ),
      department_users AS (
        SELECT department_id, COUNT(DISTINCT user_id)::int AS dept_user_count
        FROM effective_permissions
        GROUP BY department_id
      ),
      department_permission_density AS (
        SELECT
          department_id,
          permission_id,
          COUNT(DISTINCT user_id)::int AS holders
        FROM effective_permissions
        GROUP BY department_id, permission_id
      )
      SELECT
        u.id AS user_id,
        u.first_name,
        u.last_name,
        u.email,
        d.name AS department_name,
        p.permission_code,
        dpd.holders,
        du.dept_user_count
      FROM effective_permissions ep
      JOIN department_permission_density dpd
        ON dpd.department_id = ep.department_id
       AND dpd.permission_id = ep.permission_id
      JOIN department_users du ON du.department_id = ep.department_id
      JOIN adm_users u ON u.id = ep.user_id
      LEFT JOIN adm_departments d ON d.id = u.department_id
      JOIN adm_permissions p ON p.id = ep.permission_id
      WHERE du.dept_user_count >= 3
        AND dpd.holders <= 1
      ORDER BY du.dept_user_count DESC, p.permission_code ASC
      LIMIT 100`
    )

    const overrideRefactorInsights = await query(
      `SELECT
        p.permission_code,
        COUNT(*)::int AS override_count,
        COUNT(DISTINCT upo.user_id)::int AS users_impacted
       FROM adm_user_permission_overrides upo
       JOIN adm_permissions p ON p.id = upo.permission_id
       WHERE upo.approval_status = 'approved'
       GROUP BY p.permission_code
       HAVING COUNT(*) >= 3
       ORDER BY override_count DESC, users_impacted DESC
       LIMIT 25`
    )

    const overrideAgingTrend = await query(
      `SELECT
        TO_CHAR(DATE_TRUNC('week', created_at), 'YYYY-MM-DD') AS week_start,
        COUNT(*)::int AS override_count
       FROM adm_user_permission_overrides
       WHERE approval_status = 'approved'
         AND created_at >= NOW() - INTERVAL '12 weeks'
       GROUP BY DATE_TRUNC('week', created_at)
       ORDER BY DATE_TRUNC('week', created_at)`
    )

    const reviewTrend = await query(
      `SELECT
        TO_CHAR(DATE_TRUNC('week', reviewed_at), 'YYYY-MM-DD') AS week_start,
        status,
        COUNT(*)::int AS review_count
       FROM adm_access_reviews
       WHERE reviewed_at >= NOW() - INTERVAL '12 weeks'
       GROUP BY DATE_TRUNC('week', reviewed_at), status
       ORDER BY DATE_TRUNC('week', reviewed_at), status`
    )

    const sodSeverityTrend = await query(
      `WITH effective_permissions AS (
        SELECT u.id AS user_id, rp.permission_id
        FROM adm_users u
        JOIN adm_role_permissions rp ON rp.role_id = u.primary_role_id AND rp.granted = TRUE
        WHERE u.account_status = 'active'
        UNION
        SELECT u.id AS user_id, rp.permission_id
        FROM adm_users u
        JOIN adm_user_secondary_roles usr ON usr.user_id = u.id
        JOIN adm_role_permissions rp ON rp.role_id = usr.role_id AND rp.granted = TRUE
        WHERE u.account_status = 'active'
      )
      SELECT LOWER(COALESCE(s.severity, 'high')) AS severity, COUNT(*)::int AS conflict_count
      FROM effective_permissions ep
      JOIN adm_sod_rules s ON s.active = TRUE AND s.left_permission_id = ep.permission_id
      JOIN effective_permissions ep2 ON ep2.user_id = ep.user_id AND ep2.permission_id = s.right_permission_id
      GROUP BY LOWER(COALESCE(s.severity, 'high'))
      ORDER BY severity`
    )

    const responsePayload = {
      staleDays,
      snapshotRefresh,
      policy: {
        staleOverrideDays: staleDays,
        weightSodConflict: weightSod,
        weightStaleOverride: weightStale,
        weightMissingReason,
        weightOverrideCount,
        inactivityDaysHighPrivilege: Number(policy.inactivity_days_high_privilege || 60),
      },
      kpis: {
        totalUsers: userTotals?.total_users || 0,
        activeUsers: userTotals?.active_users || 0,
        inactiveOrSuspendedUsers: userTotals?.inactive_or_suspended_users || 0,
        totalOverrides: overrideTotals?.total_overrides || 0,
        usersWithOverrides: overrideTotals?.users_with_overrides || 0,
        overridesWithoutReason: overrideTotals?.overrides_without_reason || 0,
        staleOverrides: staleOverrideTotals?.stale_overrides || 0,
        usersWithStaleOverrides: staleOverrideTotals?.users_with_stale_overrides || 0,
        usersWithSodConflicts: sodTotals?.users_with_sod_conflicts || 0,
        totalSodConflicts: sodTotals?.total_sod_conflicts || 0,
        criticalSodConflicts: sodTotals?.critical_sod_conflicts || 0,
        highSodConflicts: sodTotals?.high_sod_conflicts || 0,
      },
      overrideAging,
      overrideAgingTrend,
      reviewTrend,
      sodSeverityTrend,
      riskBandCounts,
      departmentRisk,
      urgentItems,
      topRiskUsers,
      expiringAccounts,
      dormantHighPrivilege,
      orphanRoles,
      usersWithoutPrimaryRole,
      mfaExceptions,
      permissionAnomalies,
      overrideRefactorInsights,
      accessExceptions,
      staleOverrides,
      sodConflicts,
    }
    if (perfEnabled) {
      responsePayload.perf = perfBucket
    }
    writeDashboardCache(cacheKey, responsePayload)
    res.json({ ...responsePayload, cache: { hit: false, ttlMs: DASHBOARD_CACHE_TTL_MS } })
  } catch (e) {
    next(e)
  }
})

router.get('/users/dashboard-search', async (req, res, next) => {
  try {
    const q = (req.query.q || '').toString().trim().toLowerCase()
    const limit = Math.max(1, Math.min(Number(req.query.limit || 100), 300))
    if (!q) {
      res.json({ urgentItems: [], accessExceptions: [], sodConflicts: [], staleOverrides: [] })
      return
    }

    const [urgentItems, accessExceptions, sodConflicts, staleOverrides] = await Promise.all([
      query(
        `SELECT u.id AS user_id, u.first_name, u.last_name, u.email
         FROM adm_users u
         WHERE LOWER(u.first_name || ' ' || u.last_name) LIKE '%' || $1 || '%'
            OR LOWER(u.email) LIKE '%' || $1 || '%'
         ORDER BY u.id DESC
         LIMIT $2`,
        [q, limit]
      ),
      query(
        `SELECT upo.id, u.id AS user_id, u.first_name, u.last_name, u.email, p.permission_code, upo.reason, upo.effect
         FROM adm_user_permission_overrides upo
         JOIN adm_users u ON u.id = upo.user_id
         JOIN adm_permissions p ON p.id = upo.permission_id
         WHERE upo.approval_status = 'approved'
           AND (
             LOWER(u.first_name || ' ' || u.last_name) LIKE '%' || $1 || '%'
             OR LOWER(u.email) LIKE '%' || $1 || '%'
             OR LOWER(p.permission_code) LIKE '%' || $1 || '%'
             OR LOWER(COALESCE(upo.reason, '')) LIKE '%' || $1 || '%'
           )
         ORDER BY upo.created_at DESC
         LIMIT $2`,
        [q, limit]
      ),
      query(
        `WITH effective_permissions AS (
          SELECT u.id AS user_id, rp.permission_id
          FROM adm_users u
          JOIN adm_role_permissions rp ON rp.role_id = u.primary_role_id AND rp.granted = TRUE
          WHERE u.account_status = 'active'
          UNION
          SELECT u.id AS user_id, rp.permission_id
          FROM adm_users u
          JOIN adm_user_secondary_roles usr ON usr.user_id = u.id
          JOIN adm_role_permissions rp ON rp.role_id = usr.role_id AND rp.granted = TRUE
          WHERE u.account_status = 'active'
        )
        SELECT u.id AS user_id, u.first_name, u.last_name, u.email, s.code AS sod_code, s.severity
        FROM effective_permissions ep
        JOIN adm_sod_rules s ON s.active = TRUE AND s.left_permission_id = ep.permission_id
        JOIN effective_permissions ep2 ON ep2.user_id = ep.user_id AND ep2.permission_id = s.right_permission_id
        JOIN adm_users u ON u.id = ep.user_id
        WHERE LOWER(u.first_name || ' ' || u.last_name) LIKE '%' || $1 || '%'
           OR LOWER(u.email) LIKE '%' || $1 || '%'
           OR LOWER(s.code) LIKE '%' || $1 || '%'
        ORDER BY u.id DESC
        LIMIT $2`,
        [q, limit]
      ),
      query(
        `SELECT upo.id, u.id AS user_id, u.first_name, u.last_name, u.email, p.permission_code, upo.created_at
         FROM adm_user_permission_overrides upo
         JOIN adm_users u ON u.id = upo.user_id
         JOIN adm_permissions p ON p.id = upo.permission_id
         WHERE upo.approval_status = 'approved'
           AND (
             LOWER(u.first_name || ' ' || u.last_name) LIKE '%' || $1 || '%'
             OR LOWER(u.email) LIKE '%' || $1 || '%'
             OR LOWER(p.permission_code) LIKE '%' || $1 || '%'
           )
         ORDER BY upo.created_at ASC
         LIMIT $2`,
        [q, limit]
      ),
    ])

    res.json({ urgentItems, accessExceptions, sodConflicts, staleOverrides })
  } catch (e) {
    next(e)
  }
})

router.get('/users/dashboard-performance', async (req, res, next) => {
  try {
    const { actorEmail } = readActor(req)
    const hours = Math.max(1, Math.min(Number(req.query.hours || 24), 24 * 30))
    const routeCode = 'users.dashboard-summary'
    const doAutoTune = String(req.query.autoTune ?? 'true').toLowerCase() !== 'false'
    const doIncidentEval = String(req.query.incidentEval ?? 'true').toLowerCase() !== 'false'
    const doIncidentEscalation = String(req.query.incidentEscalation ?? 'true').toLowerCase() !== 'false'
    let autoTuneResult = []
    let incidentEval = { incidents: [], created: 0, updated: 0, resolved: 0, attempted: false }
    let incidentEscalation = {
      escalated: 0,
      activeIncidents: 0,
      overdueIncidents: 0,
      criticalOverdue: 0,
      escalationCooldownMinutes: PERF_INCIDENT_ESCALATION_COOLDOWN_MINUTES,
      maxLevel: PERF_INCIDENT_ESCALATION_MAX_LEVEL,
      attempted: false,
    }
    if (doAutoTune && Date.now() - lastPerfAutoTuneAt >= PERF_AUTO_TUNE_INTERVAL_MS) {
      autoTuneResult = await autoTunePerfThresholds({ routeCode, hours, actorEmail })
      lastPerfAutoTuneAt = Date.now()
    } else {
      await refreshPerfThresholdCache(false)
    }
    if (doIncidentEval && Date.now() - lastPerfIncidentEvalAt >= PERF_INCIDENT_EVAL_INTERVAL_MS) {
      const computed = await generatePerfIncidents({ routeCode, hours, actorEmail, emitNotifications: true })
      incidentEval = { ...computed, attempted: true }
      lastPerfIncidentEvalAt = Date.now()
    } else if (doIncidentEval) {
      const openIncidents = await fetchActivePerfIncidents(routeCode, 20)
      incidentEval = { incidents: openIncidents, created: 0, updated: 0, resolved: 0, attempted: false }
    }
    if (doIncidentEscalation && Date.now() - lastPerfIncidentEscalationAt >= PERF_INCIDENT_ESCALATION_INTERVAL_MS) {
      incidentEscalation = { ...incidentEscalation, ...(await processPerfIncidentEscalations({ routeCode, actorEmail, emitNotifications: true })), attempted: true }
      lastPerfIncidentEscalationAt = Date.now()
    } else if (doIncidentEscalation) {
      incidentEscalation = { ...incidentEscalation, ...(await processPerfIncidentEscalations({ routeCode, actorEmail, emitNotifications: false, applyEscalation: false })), attempted: false }
    }
    const [overview] = await query(
      `WITH scoped AS (
         SELECT elapsed_ms
         FROM adm_query_perf_log
         WHERE route_code = $1
           AND created_at >= NOW() - make_interval(hours => $2::int)
       )
       SELECT
         COUNT(*)::int AS samples,
         COALESCE(AVG(elapsed_ms), 0)::numeric(10,2) AS avg_ms,
         COALESCE(MIN(elapsed_ms), 0)::numeric(10,2) AS min_ms,
         COALESCE(MAX(elapsed_ms), 0)::numeric(10,2) AS max_ms,
         COALESCE(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY elapsed_ms), 0)::numeric(10,2) AS p50_ms,
         COALESCE(PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY elapsed_ms), 0)::numeric(10,2) AS p90_ms,
         COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY elapsed_ms), 0)::numeric(10,2) AS p95_ms,
         COALESCE(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY elapsed_ms), 0)::numeric(10,2) AS p99_ms
       FROM scoped`,
      [routeCode, hours]
    )

    const queryBreakdown = await query(
      `WITH scoped AS (
         SELECT query_code, elapsed_ms
         FROM adm_query_perf_log
         WHERE route_code = $1
           AND created_at >= NOW() - make_interval(hours => $2::int)
       )
       SELECT
         query_code,
         COUNT(*)::int AS samples,
         COALESCE(AVG(elapsed_ms), 0)::numeric(10,2) AS avg_ms,
         COALESCE(PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY elapsed_ms), 0)::numeric(10,2) AS p90_ms,
         COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY elapsed_ms), 0)::numeric(10,2) AS p95_ms,
         COALESCE(MAX(elapsed_ms), 0)::numeric(10,2) AS max_ms
       FROM scoped
       GROUP BY query_code
       ORDER BY p95_ms DESC, samples DESC
       LIMIT 30`,
      [routeCode, hours]
    )

    const regressions = await query(
      `WITH current_window AS (
         SELECT query_code, elapsed_ms
         FROM adm_query_perf_log
         WHERE route_code = $1
           AND created_at >= NOW() - make_interval(hours => $2::int)
       ),
       previous_window AS (
         SELECT query_code, elapsed_ms
         FROM adm_query_perf_log
         WHERE route_code = $1
           AND created_at >= NOW() - make_interval(hours => ($2::int * 2))
           AND created_at < NOW() - make_interval(hours => $2::int)
       ),
       cur AS (
         SELECT
           query_code,
           COUNT(*)::int AS current_samples,
           COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY elapsed_ms), 0)::numeric(10,2) AS current_p95_ms
         FROM current_window
         GROUP BY query_code
       ),
       prev AS (
         SELECT
           query_code,
           COUNT(*)::int AS previous_samples,
           COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY elapsed_ms), 0)::numeric(10,2) AS previous_p95_ms
         FROM previous_window
         GROUP BY query_code
       )
       SELECT
         COALESCE(cur.query_code, prev.query_code) AS query_code,
         COALESCE(cur.current_samples, 0) AS current_samples,
         COALESCE(prev.previous_samples, 0) AS previous_samples,
         COALESCE(cur.current_p95_ms, 0)::numeric(10,2) AS current_p95_ms,
         COALESCE(prev.previous_p95_ms, 0)::numeric(10,2) AS previous_p95_ms,
         CASE
           WHEN COALESCE(prev.previous_p95_ms, 0) <= 0 THEN NULL
           ELSE ROUND((COALESCE(cur.current_p95_ms, 0) / prev.previous_p95_ms)::numeric, 4)
         END AS drift_ratio
       FROM cur
       FULL OUTER JOIN prev ON prev.query_code = cur.query_code
       ORDER BY drift_ratio DESC NULLS LAST, current_p95_ms DESC
       LIMIT 20`,
      [routeCode, hours]
    )

    const trend = await query(
      `SELECT
        TO_CHAR(DATE_TRUNC('hour', created_at), 'YYYY-MM-DD HH24:00') AS hour_bucket,
        COUNT(*)::int AS samples,
        COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY elapsed_ms), 0)::numeric(10,2) AS p95_ms
       FROM adm_query_perf_log
       WHERE route_code = $1
         AND created_at >= NOW() - make_interval(hours => $2::int)
       GROUP BY DATE_TRUNC('hour', created_at)
       ORDER BY DATE_TRUNC('hour', created_at)`,
      [routeCode, hours]
    )

    const tunedThresholds = await query(
      `SELECT
        query_code,
        dynamic_threshold_ms,
        last_window_p95_ms,
        previous_window_p95_ms,
        drift_ratio,
        sample_count,
        updated_at
       FROM adm_query_perf_tuning
       WHERE route_code = $1
       ORDER BY drift_ratio DESC NULLS LAST, dynamic_threshold_ms DESC
       LIMIT 30`,
      [routeCode]
    )

    const slowEvents = await query(
      `SELECT
        id,
        query_code,
        elapsed_ms,
        row_count,
        created_at
       FROM adm_query_perf_log
       WHERE route_code = $1
         AND created_at >= NOW() - make_interval(hours => $2::int)
       ORDER BY elapsed_ms DESC, created_at DESC
       LIMIT 25`,
      [routeCode, hours]
    )
    const activeIncidents = await fetchActivePerfIncidents(routeCode, 20)
    const incidentAnalytics = await buildPerfIncidentAnalytics(routeCode, Math.max(hours, 24))

    res.json({
      routeCode,
      windowHours: hours,
      overview: {
        samples: overview?.samples || 0,
        avgMs: Number(overview?.avg_ms || 0),
        minMs: Number(overview?.min_ms || 0),
        maxMs: Number(overview?.max_ms || 0),
        p50Ms: Number(overview?.p50_ms || 0),
        p90Ms: Number(overview?.p90_ms || 0),
        p95Ms: Number(overview?.p95_ms || 0),
        p99Ms: Number(overview?.p99_ms || 0),
      },
      queryBreakdown,
      regressions,
      trend,
      slowEvents,
      tunedThresholds,
      incidents: activeIncidents,
      incidentAnalytics,
      autoTune: {
        attempted: doAutoTune,
        applied: autoTuneResult.length,
        intervalMs: PERF_AUTO_TUNE_INTERVAL_MS,
        driftAlertRatio: PERF_DRIFT_ALERT_RATIO,
      },
      incidentEval: {
        attempted: doIncidentEval,
        generatedThisRun: incidentEval.attempted,
        created: incidentEval.created,
        updated: incidentEval.updated,
        resolved: incidentEval.resolved,
        intervalMs: PERF_INCIDENT_EVAL_INTERVAL_MS,
        policy: {
          minSamples: PERF_INCIDENT_MIN_SAMPLES,
          driftRatio: PERF_INCIDENT_DRIFT_RATIO,
          spikeRatio: PERF_INCIDENT_SPIKE_RATIO,
          newlySlowP95Ms: PERF_INCIDENT_NEW_SLOW_P95_MS,
          slowHitCount: PERF_INCIDENT_SLOW_HIT_COUNT,
        },
      },
      incidentEscalation: {
        attempted: doIncidentEscalation,
        processedThisRun: incidentEscalation.attempted,
        escalated: incidentEscalation.escalated,
        activeIncidents: incidentEscalation.activeIncidents,
        overdueIncidents: incidentEscalation.overdueIncidents,
        criticalOverdue: incidentEscalation.criticalOverdue,
        intervalMs: PERF_INCIDENT_ESCALATION_INTERVAL_MS,
        policy: {
          criticalSlaMinutes: PERF_INCIDENT_CRITICAL_SLA_MINUTES,
          warningSlaMinutes: PERF_INCIDENT_WARNING_SLA_MINUTES,
          escalationCooldownMinutes: PERF_INCIDENT_ESCALATION_COOLDOWN_MINUTES,
          maxLevel: PERF_INCIDENT_ESCALATION_MAX_LEVEL,
        },
      },
    })
  } catch (e) {
    next(e)
  }
})

router.get('/users/perf-incidents', async (req, res, next) => {
  try {
    const routeCode = (req.query.routeCode || 'users.dashboard-summary').toString().trim()
    const status = (req.query.status || 'active').toString().trim().toLowerCase()
    const severity = (req.query.severity || '').toString().trim().toLowerCase()
    const q = (req.query.q || '').toString().trim().toLowerCase()
    const limit = Math.max(1, Math.min(Number(req.query.limit || 50), 200))

    const rows = await query(
      `SELECT
        id,
        route_code,
        query_code,
        incident_type,
        severity,
        status,
        title,
        summary,
        owner_email,
        acknowledged_by,
        acknowledged_at,
        resolved_by,
        resolved_at,
        resolution_note,
        sla_due_at,
        escalation_level,
        last_escalated_at,
        escalation_note,
        first_detected_at,
        last_detected_at,
        detected_count,
        current_p95_ms,
        previous_p95_ms,
        current_p99_ms,
        threshold_ms,
        drift_ratio,
        slow_event_count,
        details,
        updated_at
       FROM adm_query_perf_incidents
       WHERE route_code = $1
         AND (
           $2 = 'all'
           OR ($2 = 'active' AND status IN ('open', 'acknowledged'))
           OR status = $2
         )
         AND ($3 = '' OR severity = $3)
         AND (
           $4 = ''
           OR LOWER(query_code) LIKE '%' || $4 || '%'
           OR LOWER(title) LIKE '%' || $4 || '%'
           OR LOWER(summary) LIKE '%' || $4 || '%'
         )
       ORDER BY
         CASE severity WHEN 'critical' THEN 1 WHEN 'warning' THEN 2 ELSE 3 END,
         updated_at DESC
       LIMIT $5`,
      [routeCode, status, severity, q, limit]
    )
    res.json({ items: rows, routeCode, status, severity: severity || null, q, limit })
  } catch (e) {
    next(e)
  }
})

router.get('/users/perf-incidents/analytics', async (req, res, next) => {
  try {
    const routeCode = (req.query.routeCode || 'users.dashboard-summary').toString().trim()
    const hours = Math.max(1, Math.min(Number(req.query.hours || 24 * 7), 24 * 90))
    const analytics = await buildPerfIncidentAnalytics(routeCode, hours)
    res.json({ routeCode, windowHours: hours, ...analytics })
  } catch (e) {
    next(e)
  }
})

router.get('/users/perf-incidents/:id/events', async (req, res, next) => {
  try {
    const incidentId = Number(req.params.id)
    if (!Number.isFinite(incidentId) || incidentId <= 0) {
      res.status(400).json({ error: 'Invalid incident id' })
      return
    }
    const limit = Math.max(1, Math.min(Number(req.query.limit || 100), 500))
    const rows = await query(
      `SELECT
        id,
        incident_id,
        event_type,
        actor_email,
        note,
        payload,
        created_at
       FROM adm_query_perf_incident_events
       WHERE incident_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [incidentId, limit]
    )
    res.json({ items: rows, incidentId, limit })
  } catch (e) {
    next(e)
  }
})

router.patch('/users/perf-incidents/:id', async (req, res, next) => {
  try {
    const { actorEmail } = readActor(req)
    const incidentId = Number(req.params.id)
    if (!Number.isFinite(incidentId) || incidentId <= 0) {
      res.status(400).json({ error: 'Invalid incident id' })
      return
    }
    const payload = perfIncidentUpdateSchema.parse(req.body || {})
    const [current] = await query(
      `SELECT *
       FROM adm_query_perf_incidents
       WHERE id = $1`,
      [incidentId]
    )
    if (!current) {
      res.status(404).json({ error: 'Performance incident not found' })
      return
    }
    if (payload.action === 'assign_owner' && !payload.ownerEmail) {
      res.status(400).json({ error: 'ownerEmail is required for assign_owner action' })
      return
    }

    let sql = ''
    let params = []
    if (payload.action === 'acknowledge') {
      sql = `UPDATE adm_query_perf_incidents
             SET status = 'acknowledged',
                 owner_email = COALESCE($1, owner_email),
                 acknowledged_by = $2,
                 acknowledged_at = NOW(),
                 sla_due_at = COALESCE(sla_due_at, NOW() + make_interval(mins => $5::int)),
                 resolution_note = COALESCE($3, resolution_note),
                 last_action_by = $2,
                 last_action_at = NOW(),
                 updated_at = NOW()
             WHERE id = $4
             RETURNING *`
      params = [payload.ownerEmail || null, actorEmail, payload.note || null, incidentId, perfIncidentSlaMinutes(current.severity)]
    } else if (payload.action === 'resolve') {
      sql = `UPDATE adm_query_perf_incidents
             SET status = 'resolved',
                 owner_email = COALESCE($1, owner_email),
                 resolved_by = $2,
                 resolved_at = NOW(),
                 resolution_note = COALESCE($3, resolution_note),
                 last_action_by = $2,
                 last_action_at = NOW(),
                 updated_at = NOW()
             WHERE id = $4
             RETURNING *`
      params = [payload.ownerEmail || null, actorEmail, payload.note || null, incidentId]
    } else if (payload.action === 'reopen') {
      sql = `UPDATE adm_query_perf_incidents
             SET status = 'open',
                 owner_email = COALESCE($1, owner_email),
                 resolved_by = NULL,
                 resolved_at = NULL,
                 sla_due_at = NOW() + make_interval(mins => $5::int),
                 escalation_level = 0,
                 last_escalated_at = NULL,
                 escalation_note = NULL,
                 resolution_note = COALESCE($3, resolution_note),
                 last_action_by = $2,
                 last_action_at = NOW(),
                 updated_at = NOW()
             WHERE id = $4
             RETURNING *`
      params = [payload.ownerEmail || null, actorEmail, payload.note || null, incidentId, perfIncidentSlaMinutes(current.severity)]
    } else {
      sql = `UPDATE adm_query_perf_incidents
             SET owner_email = $1,
                 resolution_note = COALESCE($2, resolution_note),
                 last_action_by = $3,
                 last_action_at = NOW(),
                 updated_at = NOW()
             WHERE id = $4
             RETURNING *`
      params = [payload.ownerEmail || null, payload.note || null, actorEmail, incidentId]
    }

    const [updatedRow] = await query(sql, params)
    await appendPerfIncidentEvent({
      incidentId,
      eventType: `incident_${payload.action}`,
      actorEmail,
      note: payload.note || null,
      payload: {
        action: payload.action,
        ownerEmail: payload.ownerEmail || null,
        previousStatus: current.status,
        currentStatus: updatedRow?.status || current.status,
      },
    })
    await appendAudit(
      'ACCESS_PERF_INCIDENT_UPDATED',
      'performance_incident',
      String(incidentId),
      `Updated perf incident via action: ${payload.action}`,
      { action: payload.action, ownerEmail: payload.ownerEmail || null, note: payload.note || null },
      actorEmail
    )
    res.json(updatedRow)
  } catch (e) {
    next(e)
  }
})

router.post('/users/dashboard-summary/refresh-cache', async (req, res, next) => {
  try {
    const { actorEmail } = readActor(req)
    clearDashboardCache()
    await appendAudit(
      'USER_DASHBOARD_CACHE_REFRESH',
      'dashboard_cache',
      null,
      'Cleared enterprise dashboard cache',
      {},
      actorEmail
    )
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

router.get('/users/review-history', async (req, res, next) => {
  try {
    const reviewType = (req.query.reviewType || '').toString().trim()
    const reviewer = (req.query.reviewer || '').toString().trim().toLowerCase()
    const q = (req.query.q || '').toString().trim().toLowerCase()
    const from = (req.query.from || '').toString().trim()
    const to = (req.query.to || '').toString().trim()
    const userIdRaw = Number(req.query.userId || 0)
    const userId = Number.isFinite(userIdRaw) && userIdRaw > 0 ? userIdRaw : null
    const pageRaw = Number(req.query.page || 1)
    const page = Number.isFinite(pageRaw) ? Math.max(1, pageRaw) : 1
    const pageSizeRaw = Number(req.query.pageSize || req.query.limit || 20)
    const pageSize = Number.isFinite(pageSizeRaw) ? Math.max(1, Math.min(pageSizeRaw, 200)) : 20
    const offset = (page - 1) * pageSize

    const sortByAllowed = new Set(['reviewed_at', 'created_at', 'priority', 'status'])
    const sortBy = sortByAllowed.has((req.query.sortBy || '').toString()) ? req.query.sortBy.toString() : 'reviewed_at'
    const sortDir = String(req.query.sortDir || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC'

    const rows = await query(
      `SELECT
        r.id,
        r.user_id,
        r.review_type,
        r.status,
        r.reviewer_email AS actor_email,
        r.assigned_to,
        r.priority,
        r.due_at,
        r.reviewed_at,
        r.created_at,
        r.review_note,
        r.metadata,
        TRIM(COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '')) AS reviewed_user_name,
        u.email AS reviewed_user_email,
        d.name AS department_name
      FROM adm_access_reviews r
      LEFT JOIN adm_users u ON u.id = r.user_id
      LEFT JOIN adm_departments d ON d.id = u.department_id
      WHERE ($1 = '' OR r.review_type = $1)
        AND ($2::int IS NULL OR r.user_id = $2::int)
        AND ($3 = '' OR LOWER(COALESCE(r.reviewer_email, '')) LIKE '%' || $3 || '%')
        AND ($4 = '' OR r.reviewed_at >= $4::timestamptz)
        AND ($5 = '' OR r.reviewed_at <= $5::timestamptz + INTERVAL '1 day')
        AND (
          $6 = ''
          OR LOWER(COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '')) LIKE '%' || $6 || '%'
          OR LOWER(COALESCE(u.email, '')) LIKE '%' || $6 || '%'
          OR LOWER(COALESCE(r.review_note, '')) LIKE '%' || $6 || '%'
        )
      ORDER BY ${sortBy} ${sortDir}, r.id DESC
      LIMIT $7 OFFSET $8`,
      [reviewType, userId, reviewer, from, to, q, pageSize, offset]
    )

    const [countRow] = await query(
      `SELECT COUNT(*)::int AS total
       FROM adm_access_reviews r
       LEFT JOIN adm_users u ON u.id = r.user_id
       WHERE ($1 = '' OR r.review_type = $1)
         AND ($2::int IS NULL OR r.user_id = $2::int)
         AND ($3 = '' OR LOWER(COALESCE(r.reviewer_email, '')) LIKE '%' || $3 || '%')
         AND ($4 = '' OR r.reviewed_at >= $4::timestamptz)
         AND ($5 = '' OR r.reviewed_at <= $5::timestamptz + INTERVAL '1 day')
         AND (
           $6 = ''
           OR LOWER(COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '')) LIKE '%' || $6 || '%'
           OR LOWER(COALESCE(u.email, '')) LIKE '%' || $6 || '%'
           OR LOWER(COALESCE(r.review_note, '')) LIKE '%' || $6 || '%'
         )`,
      [reviewType, userId, reviewer, from, to, q]
    )

    res.json({
      items: rows,
      page,
      pageSize,
      total: countRow?.total || 0,
      totalPages: Math.max(1, Math.ceil((countRow?.total || 0) / pageSize)),
    })
  } catch (e) {
    next(e)
  }
})

router.get('/users/reviews/queue', async (req, res, next) => {
  try {
    const status = (req.query.status || '').toString().trim()
    const assignedTo = (req.query.assignedTo || '').toString().trim().toLowerCase()
    const priority = (req.query.priority || '').toString().trim().toLowerCase()
    const overdueOnly = String(req.query.overdueOnly || 'false').toLowerCase() === 'true'
    const page = Math.max(1, Number(req.query.page || 1))
    const pageSize = Math.max(1, Math.min(Number(req.query.pageSize || 20), 200))
    const offset = (page - 1) * pageSize

    const rows = await query(
      `SELECT
        r.*,
        u.first_name,
        u.last_name,
        u.email,
        d.name AS department_name,
        CASE
          WHEN r.status <> 'resolved' AND r.due_at IS NOT NULL AND r.due_at < NOW() THEN TRUE
          ELSE FALSE
        END AS is_overdue
      FROM adm_access_reviews r
      JOIN adm_users u ON u.id = r.user_id
      LEFT JOIN adm_departments d ON d.id = u.department_id
      WHERE ($1 = '' OR r.status = $1)
        AND ($2 = '' OR LOWER(COALESCE(r.assigned_to, '')) LIKE '%' || $2 || '%')
        AND ($3 = '' OR LOWER(COALESCE(r.priority, 'medium')) = $3)
        AND ($4::boolean = FALSE OR (r.status <> 'resolved' AND r.due_at IS NOT NULL AND r.due_at < NOW()))
      ORDER BY COALESCE(r.due_at, r.created_at) ASC, r.id DESC
      LIMIT $5 OFFSET $6`,
      [status, assignedTo, priority, overdueOnly, pageSize, offset]
    )

    const [countRow] = await query(
      `SELECT COUNT(*)::int AS total
       FROM adm_access_reviews r
       WHERE ($1 = '' OR r.status = $1)
         AND ($2 = '' OR LOWER(COALESCE(r.assigned_to, '')) LIKE '%' || $2 || '%')
         AND ($3 = '' OR LOWER(COALESCE(r.priority, 'medium')) = $3)
         AND ($4::boolean = FALSE OR (r.status <> 'resolved' AND r.due_at IS NOT NULL AND r.due_at < NOW()))`,
      [status, assignedTo, priority, overdueOnly]
    )

    res.json({
      items: rows,
      page,
      pageSize,
      total: countRow?.total || 0,
      totalPages: Math.max(1, Math.ceil((countRow?.total || 0) / pageSize)),
    })
  } catch (e) {
    next(e)
  }
})

router.get('/users/reviews/sla-summary', async (_req, res, next) => {
  try {
    const [summary] = await query(
      `SELECT
        COUNT(*)::int AS total_reviews,
        COUNT(*) FILTER (WHERE status <> 'resolved')::int AS open_reviews,
        COUNT(*) FILTER (WHERE status <> 'resolved' AND due_at IS NOT NULL AND due_at < NOW())::int AS overdue_reviews,
        COUNT(*) FILTER (WHERE escalated_at IS NOT NULL)::int AS escalated_reviews,
        AVG(EXTRACT(EPOCH FROM (COALESCE(resolved_at, NOW()) - created_at)) / 3600.0)::numeric(10,2) AS avg_turnaround_hours
       FROM adm_access_reviews`
    )
    res.json({
      totalReviews: summary?.total_reviews || 0,
      openReviews: summary?.open_reviews || 0,
      overdueReviews: summary?.overdue_reviews || 0,
      escalatedReviews: summary?.escalated_reviews || 0,
      avgTurnaroundHours: Number(summary?.avg_turnaround_hours || 0),
    })
  } catch (e) {
    next(e)
  }
})

router.get('/users/mfa-enforcement-report', async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT
        u.id AS user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.mfa_enabled,
        u.last_login_at,
        r.role_code,
        r.role_level,
        d.name AS department_name
       FROM adm_users u
       LEFT JOIN adm_roles r ON r.id = u.primary_role_id
       LEFT JOIN adm_departments d ON d.id = u.department_id
       WHERE u.account_status = 'active'
         AND COALESCE(r.role_level, 0) >= 4
       ORDER BY r.role_level DESC, u.last_name ASC`
    )
    const exceptions = rows.filter((row) => !row.mfa_enabled)
    res.json({
      totalPrivilegedUsers: rows.length,
      mfaEnabled: rows.length - exceptions.length,
      exceptions: exceptions.length,
      items: rows,
    })
  } catch (e) {
    next(e)
  }
})

router.post('/users/reviews/bulk-update', async (req, res, next) => {
  try {
    const { actorEmail } = readActor(req)
    const payload = z.object({
      reviewIds: z.array(z.number().int().positive()).min(1),
      status: z.enum(['open', 'in_review', 'resolved', 'reversed']).optional(),
      assignedTo: z.string().optional().nullable(),
      priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      reviewNote: z.string().optional().nullable(),
    }).parse(req.body || {})

    const result = await query(
      `UPDATE adm_access_reviews
       SET
        status = COALESCE($2, status),
        assigned_to = COALESCE($3, assigned_to),
        priority = COALESCE($4, priority),
        review_note = COALESCE($5, review_note),
        reviewer_email = COALESCE(reviewer_email, $6),
        updated_at = NOW()
       WHERE id = ANY($1::int[])
       RETURNING id, assigned_to, status, priority`,
      [payload.reviewIds, payload.status || null, payload.assignedTo || null, payload.priority || null, payload.reviewNote || null, actorEmail]
    )

    if (payload.assignedTo) {
      for (const row of result) {
        await appendNotificationEvent({
          eventCode: 'ACCESS_REVIEW_ASSIGNED_BULK',
          severity: 'info',
          channel: 'in_app',
          recipient: payload.assignedTo,
          title: 'Bulk access review assignment',
          body: `Review #${row.id} assigned in bulk action`,
          payload: { reviewId: row.id, assignedTo: payload.assignedTo, status: row.status, priority: row.priority },
        })
      }
    }

    await appendAudit(
      'USER_ACCESS_REVIEW_BULK_UPDATE',
      'access_review',
      null,
      `Bulk-updated ${result.length} reviews`,
      payload,
      actorEmail
    )
    res.json({ ok: true, updated: result.length, items: result })
  } catch (e) {
    next(e)
  }
})

router.post('/users/reviews/:id/assign', async (req, res, next) => {
  try {
    const reviewId = Number(req.params.id)
    const payload = reviewAssignSchema.parse(req.body || {})
    const { actorEmail } = readActor(req)
    const [row] = await query(
      `UPDATE adm_access_reviews
       SET
        assigned_to = $1,
        due_at = COALESCE($2::timestamptz, due_at),
        priority = $3,
        sla_hours = $4,
        status = CASE WHEN status = 'open' THEN 'in_review' ELSE status END,
        updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [payload.assignedTo, payload.dueAt || null, payload.priority, payload.slaHours, reviewId]
    )
    if (!row) {
      res.status(404).json({ error: 'Review not found' })
      return
    }

    await appendAudit(
      'USER_ACCESS_REVIEW_ASSIGNED',
      'access_review',
      String(reviewId),
      `Assigned review to ${payload.assignedTo}`,
      payload,
      actorEmail
    )
    await appendNotificationEvent({
      eventCode: 'ACCESS_REVIEW_ASSIGNED',
      severity: 'info',
      recipient: payload.assignedTo,
      title: 'Access review assigned',
      body: `Review #${reviewId} has been assigned to you`,
      payload: { reviewId, assignedTo: payload.assignedTo, dueAt: row.due_at, priority: row.priority },
    })
    await emitGovernanceWebhook(
      'ACCESS_REVIEW_ASSIGNED',
      { reviewId, assignedTo: payload.assignedTo, dueAt: row.due_at, priority: row.priority, assignedBy: actorEmail },
      'info'
    )
    await sendGovernanceEmail({
      recipient: payload.assignedTo,
      subject: `NAPTIN Access Review Assigned (#${reviewId})`,
      body: `You have been assigned access review #${reviewId} with priority ${row.priority}.`,
      payload: { reviewId, assignedTo: payload.assignedTo, dueAt: row.due_at, priority: row.priority, assignedBy: actorEmail },
      severity: 'info',
    })

    res.json({ ok: true, item: row })
  } catch (e) {
    next(e)
  }
})

router.get('/users/reviews/:id/comments', async (req, res, next) => {
  try {
    const reviewId = Number(req.params.id)
    const rows = await query(
      `SELECT id, review_id, actor_email, comment, created_at
       FROM adm_access_review_comments
       WHERE review_id = $1
       ORDER BY created_at DESC`,
      [reviewId]
    )
    res.json({ items: rows })
  } catch (e) {
    next(e)
  }
})

router.post('/users/reviews/:id/comments', async (req, res, next) => {
  try {
    const reviewId = Number(req.params.id)
    const payload = reviewCommentSchema.parse(req.body || {})
    const { actorEmail } = readActor(req)
    const [row] = await query(
      `INSERT INTO adm_access_review_comments (review_id, actor_email, comment)
       VALUES ($1,$2,$3)
       RETURNING *`,
      [reviewId, actorEmail, payload.comment]
    )
    await query('UPDATE adm_access_reviews SET updated_at = NOW() WHERE id = $1', [reviewId])
    await appendAudit(
      'USER_ACCESS_REVIEW_COMMENT_ADD',
      'access_review',
      String(reviewId),
      'Added review comment',
      { comment: payload.comment },
      actorEmail
    )
    res.status(201).json(row)
  } catch (e) {
    next(e)
  }
})

router.post('/users/reviews/escalate-overdue', async (req, res, next) => {
  try {
    const { actorEmail } = readActor(req)
    const rows = await query(
      `UPDATE adm_access_reviews
       SET
        escalated_at = NOW(),
        escalation_level = escalation_level + 1,
        priority = CASE
          WHEN priority = 'low' THEN 'medium'
          WHEN priority = 'medium' THEN 'high'
          ELSE 'critical'
        END,
        updated_at = NOW()
       WHERE status <> 'resolved'
         AND due_at IS NOT NULL
         AND due_at < NOW()
       RETURNING id, assigned_to, due_at, escalation_level, priority`
    )

    for (const row of rows) {
      await appendNotificationEvent({
        eventCode: 'ACCESS_REVIEW_ESCALATED',
        severity: 'warning',
        recipient: row.assigned_to || null,
        title: 'Access review escalated',
        body: `Review #${row.id} breached SLA and was escalated`,
        payload: row,
      })
      if (row.assigned_to) {
        await sendGovernanceEmail({
          recipient: row.assigned_to,
          subject: `NAPTIN Access Review Escalated (#${row.id})`,
          body: `Review #${row.id} breached SLA and was escalated to level ${row.escalation_level}.`,
          payload: row,
          severity: 'warning',
        })
      }
    }

    await appendAudit(
      'USER_ACCESS_REVIEW_BULK_ESCALATE',
      'access_review',
      null,
      `Escalated ${rows.length} overdue reviews`,
      { count: rows.length },
      actorEmail
    )
    await emitGovernanceWebhook(
      'USER_ACCESS_REVIEW_BULK_ESCALATE',
      { escalatedCount: rows.length, triggeredBy: actorEmail, items: rows },
      'warning'
    )

    res.json({ ok: true, escalated: rows.length })
  } catch (e) {
    next(e)
  }
})

router.post('/users/reviews/send-reminders', async (req, res, next) => {
  try {
    const hoursAhead = Math.max(1, Math.min(Number(req.body?.hoursAhead || 24), 168))
    const includeOverdue = String(req.body?.includeOverdue ?? 'true').toLowerCase() !== 'false'
    const { actorEmail } = readActor(req)
    const rows = await processReviewReminders({ hoursAhead, includeOverdue })

    await appendAudit(
      'USER_ACCESS_REVIEW_REMINDER_BULK',
      'access_review',
      null,
      `Sent ${rows.length} review reminders`,
      { count: rows.length, hoursAhead, includeOverdue },
      actorEmail
    )
    await emitGovernanceWebhook(
      'USER_ACCESS_REVIEW_REMINDER_BULK',
      { count: rows.length, hoursAhead, includeOverdue, sentBy: actorEmail },
      'info'
    )

    res.json({ ok: true, remindersSent: rows.length, hoursAhead, includeOverdue })
  } catch (e) {
    next(e)
  }
})

router.get('/reports/schedules', async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT *
       FROM adm_report_schedules
       ORDER BY status DESC, COALESCE(next_run_at, created_at) ASC, id DESC`
    )
    res.json({ items: rows })
  } catch (e) {
    next(e)
  }
})

router.post('/reports/schedules', async (req, res, next) => {
  try {
    const payload = reportScheduleSchema.parse(req.body || {})
    const { actorEmail } = readActor(req)
    const [row] = await query(
      `INSERT INTO adm_report_schedules (
         schedule_code, report_type, frequency, status, config, recipients, next_run_at, created_by, updated_at
       ) VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7,$8,NOW())
       RETURNING *`,
      [
        payload.scheduleCode.toUpperCase(),
        payload.reportType,
        payload.frequency,
        payload.status,
        JSON.stringify(payload.config || {}),
        JSON.stringify(payload.recipients || []),
        payload.nextRunAt || null,
        actorEmail,
      ]
    )
    await appendAudit('ACCESS_REPORT_SCHEDULE_CREATE', 'report_schedule', String(row.id), 'Created access report schedule', payload, actorEmail)
    res.status(201).json(row)
  } catch (e) {
    next(e)
  }
})

router.patch('/reports/schedules/:id', async (req, res, next) => {
  try {
    const scheduleId = Number(req.params.id)
    const payload = reportScheduleSchema.partial().parse(req.body || {})
    const { actorEmail } = readActor(req)
    const [row] = await query(
      `UPDATE adm_report_schedules
       SET
         schedule_code = COALESCE($1, schedule_code),
         report_type = COALESCE($2, report_type),
         frequency = COALESCE($3, frequency),
         status = COALESCE($4, status),
         config = COALESCE($5::jsonb, config),
         recipients = COALESCE($6::jsonb, recipients),
         next_run_at = COALESCE($7::timestamptz, next_run_at),
         updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [
        payload.scheduleCode?.toUpperCase(),
        payload.reportType,
        payload.frequency,
        payload.status,
        payload.config ? JSON.stringify(payload.config) : null,
        payload.recipients ? JSON.stringify(payload.recipients) : null,
        payload.nextRunAt || null,
        scheduleId,
      ]
    )
    if (!row) {
      res.status(404).json({ error: 'Schedule not found' })
      return
    }
    await appendAudit('ACCESS_REPORT_SCHEDULE_UPDATE', 'report_schedule', String(scheduleId), 'Updated access report schedule', payload, actorEmail)
    res.json(row)
  } catch (e) {
    next(e)
  }
})

router.post('/reports/schedules/:id/run-now', async (req, res, next) => {
  try {
    const scheduleId = Number(req.params.id)
    const { actorEmail } = readActor(req)
    const [schedule] = await query('SELECT * FROM adm_report_schedules WHERE id = $1', [scheduleId])
    if (!schedule) {
      res.status(404).json({ error: 'Schedule not found' })
      return
    }

    const runResult = await executeReportSchedule(schedule, actorEmail)
    await appendNotificationEvent({
      eventCode: 'ACCESS_REPORT_READY',
      severity: 'info',
      recipient: actorEmail,
      title: 'Compliance report generated',
      body: `${schedule.schedule_code} generated with ${runResult.rows} records`,
      payload: { scheduleId, scheduleCode: schedule.schedule_code, reportType: schedule.report_type, rows: runResult.rows },
    })
    await emitGovernanceWebhook(
      'ACCESS_REPORT_RUN_NOW',
      { scheduleId, scheduleCode: schedule.schedule_code, reportType: schedule.report_type, rows: runResult.rows, triggeredBy: actorEmail },
      'info'
    )
    const scheduleRecipients = Array.isArray(schedule.recipients)
      ? schedule.recipients
      : parseEmailList(typeof schedule.recipients === 'string' ? schedule.recipients : '')
    for (const recipient of scheduleRecipients) {
      await sendGovernanceEmail({
        recipient,
        subject: `NAPTIN Compliance Report Ready (${schedule.schedule_code})`,
        body: `${schedule.schedule_code} generated ${runResult.rows} records.`,
        payload: { scheduleId, scheduleCode: schedule.schedule_code, reportType: schedule.report_type, rows: runResult.rows },
        severity: 'info',
      })
    }

    res.json({
      scheduleId,
      scheduleCode: schedule.schedule_code,
      reportType: schedule.report_type,
      generatedAt: new Date().toISOString(),
      rows: runResult.rows,
      items: runResult.items,
      csv: runResult.csv,
    })
  } catch (e) {
    next(e)
  }
})

router.post('/reports/schedules/run-due', async (req, res, next) => {
  try {
    const { actorEmail } = readActor(req)
    const dueSchedules = await query(
      `SELECT *
       FROM adm_report_schedules
       WHERE status = 'active'
         AND next_run_at IS NOT NULL
         AND next_run_at <= NOW()
       ORDER BY next_run_at ASC
       LIMIT 50`
    )

    const results = []
    for (const schedule of dueSchedules) {
      const runResult = await executeReportSchedule(schedule, actorEmail)
      results.push({
        scheduleId: schedule.id,
        scheduleCode: schedule.schedule_code,
        reportType: schedule.report_type,
        rows: runResult.rows,
      })
    }

    await appendAudit(
      'ACCESS_REPORT_RUN_DUE_BATCH',
      'report_schedule',
      null,
      `Executed ${results.length} due schedules`,
      { count: results.length, results },
      actorEmail
    )

    res.json({ ok: true, executed: results.length, items: results })
  } catch (e) {
    next(e)
  }
})

router.get('/reports/attestation-packs', async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT id, pack_code, status, requested_by, filters, generated_at, expires_at
       FROM adm_attestation_packs
       ORDER BY generated_at DESC, id DESC
       LIMIT 200`
    )
    res.json({ items: rows })
  } catch (e) {
    next(e)
  }
})

router.get('/reports/attestation-packs/:id', async (req, res, next) => {
  try {
    const packId = Number(req.params.id)
    const [row] = await query(
      `SELECT *
       FROM adm_attestation_packs
       WHERE id = $1`,
      [packId]
    )
    if (!row) {
      res.status(404).json({ error: 'Attestation pack not found' })
      return
    }
    res.json(row)
  } catch (e) {
    next(e)
  }
})

router.get('/reports/attestation-packs/:id/download.csv', async (req, res, next) => {
  try {
    const packId = Number(req.params.id)
    const [row] = await query('SELECT pack_code, evidence FROM adm_attestation_packs WHERE id = $1', [packId])
    if (!row) {
      res.status(404).json({ error: 'Attestation pack not found' })
      return
    }
    const csv = row.evidence?.csv || ''
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${row.pack_code || 'attestation-pack'}.csv"`)
    res.send(csv)
  } catch (e) {
    next(e)
  }
})

router.post('/reports/attestation-packs', async (req, res, next) => {
  try {
    const { actorEmail } = readActor(req)
    const filters = attestationPackSchema.parse(req.body || {})
    const rows = await query(
      `SELECT
        r.id AS review_id,
        r.review_type,
        r.status,
        r.reviewer_email,
        r.assigned_to,
        r.priority,
        r.due_at,
        r.reviewed_at,
        r.review_note,
        u.email AS reviewed_user_email,
        u.first_name,
        u.last_name
       FROM adm_access_reviews r
       JOIN adm_users u ON u.id = r.user_id
       WHERE ($1 = '' OR r.review_type = $1)
         AND ($2 = '' OR LOWER(COALESCE(r.reviewer_email, '')) = LOWER($2))
         AND ($3 = '' OR r.status = $3)
         AND ($4 = '' OR r.reviewed_at >= $4::timestamptz)
         AND ($5 = '' OR r.reviewed_at <= $5::timestamptz)
       ORDER BY r.reviewed_at DESC
       LIMIT 2000`,
      [
        (filters.reviewType || '').toString().trim(),
        (filters.reviewer || '').toString().trim(),
        (filters.status || '').toString().trim(),
        (filters.from || '').toString().trim(),
        (filters.to || '').toString().trim(),
      ]
    )

    let comments = []
    if (filters.includeComments && rows.length) {
      const reviewIds = rows.map((r) => Number(r.review_id)).filter(Boolean)
      comments = await query(
        `SELECT review_id, actor_email, comment, created_at
         FROM adm_access_review_comments
         WHERE review_id = ANY($1::int[])
         ORDER BY created_at DESC`,
        [reviewIds]
      )
    }

    const byStatus = rows.reduce((acc, row) => {
      const key = row.status || 'unknown'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
    const byType = rows.reduce((acc, row) => {
      const key = row.review_type || 'unknown'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const csv = rows.length
      ? [
          Object.keys(rows[0]).join(','),
          ...rows.map((row) => Object.keys(rows[0]).map((k) => esc(row[k])).join(',')),
        ].join('\n')
      : ''

    const packCode = `ATTEST_${Date.now()}_${Math.random().toString(36).slice(2, 7).toUpperCase()}`
    const [pack] = await query(
      `INSERT INTO adm_attestation_packs (pack_code, status, requested_by, filters, evidence, expires_at)
       VALUES ($1,'ready',$2,$3::jsonb,$4::jsonb, NOW() + INTERVAL '30 days')
       RETURNING id, pack_code, status, requested_by, filters, evidence, generated_at, expires_at`,
      [
        packCode,
        actorEmail,
        JSON.stringify(filters),
        JSON.stringify({
          totalReviews: rows.length,
          totalComments: comments.length,
          byStatus,
          byType,
          reviews: rows,
          comments,
          csv,
        }),
      ]
    )

    await appendAudit(
      'ACCESS_ATTESTATION_PACK_CREATE',
      'attestation_pack',
      String(pack.id),
      'Generated access attestation evidence pack',
      { packCode: pack.pack_code, filters, totalReviews: rows.length },
      actorEmail
    )
    await appendNotificationEvent({
      eventCode: 'ACCESS_ATTESTATION_PACK_READY',
      severity: 'info',
      channel: 'in_app',
      recipient: actorEmail,
      title: 'Attestation evidence pack ready',
      body: `${pack.pack_code} generated with ${rows.length} review records`,
      payload: { packId: pack.id, packCode: pack.pack_code, totalReviews: rows.length },
    })

    res.status(201).json(pack)
  } catch (e) {
    next(e)
  }
})

router.get('/notifications/events', async (req, res, next) => {
  try {
    const recipient = (req.query.recipient || '').toString().trim().toLowerCase()
    const channel = (req.query.channel || '').toString().trim().toLowerCase()
    const since = (req.query.since || '').toString().trim()
    const scope = (req.query.scope || '').toString().trim().toLowerCase()
    const { actorEmail } = readActor(req)
    const limit = Math.max(1, Math.min(Number(req.query.limit || 100), 500))
    const effectiveRecipient = scope === 'mine' ? actorEmail.toLowerCase() : recipient
    const rows = await query(
      `SELECT *
       FROM adm_notification_events
       WHERE (
          ($5::boolean = TRUE AND (LOWER(COALESCE(recipient, '')) = $1 OR recipient IS NULL))
          OR ($5::boolean = FALSE AND ($1 = '' OR LOWER(COALESCE(recipient, '')) = $1))
       )
         AND ($2 = '' OR LOWER(channel) = $2)
         AND ($3 = '' OR created_at >= $3::timestamptz)
       ORDER BY created_at DESC
       LIMIT $4`,
      [effectiveRecipient, channel, since, limit, scope === 'mine']
    )
    res.json({ items: rows })
  } catch (e) {
    next(e)
  }
})

router.post('/notifications/retry-failed', async (req, res, next) => {
  try {
    const { actorEmail } = readActor(req)
    const limit = Math.max(1, Math.min(Number(req.body?.limit || 50), 500))
    const rows = await query(
      `SELECT *
       FROM adm_notification_events
       WHERE channel IN ('webhook', 'email')
         AND delivery_status IN ('failed', 'queued')
         AND delivery_attempts < $1
         AND (next_retry_at IS NULL OR next_retry_at <= NOW())
       ORDER BY created_at ASC
       LIMIT $2`,
      [MAX_DELIVERY_ATTEMPTS, limit]
    )

    let succeeded = 0
    let failed = 0
    for (const row of rows) {
      const result = await retryNotificationDelivery(row)
      if (result.sent) succeeded += 1
      else failed += 1
    }

    await appendAudit(
      'ACCESS_NOTIFICATION_RETRY_BATCH',
      'notification_event',
      null,
      `Retried ${rows.length} notification deliveries`,
      { total: rows.length, succeeded, failed, limit },
      actorEmail
    )
    res.json({ ok: true, total: rows.length, succeeded, failed })
  } catch (e) {
    next(e)
  }
})

router.post('/maintenance/perf/retune', async (req, res, next) => {
  try {
    const { actorEmail } = readActor(req)
    const hours = Math.max(1, Math.min(Number(req.body?.hours || 24), 24 * 30))
    const rows = await autoTunePerfThresholds({ routeCode: 'users.dashboard-summary', hours, actorEmail })
    await appendAudit(
      'ACCESS_PERF_THRESHOLDS_RETUNED',
      'performance',
      null,
      `Auto-tuned dashboard query thresholds using ${hours}h window`,
      { windowHours: hours, tunedQueries: rows.length },
      actorEmail
    )
    res.json({ ok: true, windowHours: hours, tunedQueries: rows.length, items: rows })
  } catch (e) {
    next(e)
  }
})

router.post('/maintenance/perf/incidents/generate', async (req, res, next) => {
  try {
    const { actorEmail } = readActor(req)
    const hours = Math.max(1, Math.min(Number(req.body?.hours || 24), 24 * 30))
    const generated = await generatePerfIncidents({ routeCode: 'users.dashboard-summary', hours, actorEmail, emitNotifications: true })
    await appendAudit(
      'ACCESS_PERF_INCIDENTS_GENERATED',
      'performance',
      null,
      `Generated performance incidents using ${hours}h window`,
      { windowHours: hours, created: generated.created, updated: generated.updated, resolved: generated.resolved },
      actorEmail
    )
    res.json({
      ok: true,
      windowHours: hours,
      created: generated.created,
      updated: generated.updated,
      resolved: generated.resolved,
      incidents: generated.incidents,
    })
  } catch (e) {
    next(e)
  }
})

router.post('/maintenance/perf/incidents/escalate', async (req, res, next) => {
  try {
    const { actorEmail } = readActor(req)
    const result = await processPerfIncidentEscalations({
      routeCode: 'users.dashboard-summary',
      actorEmail,
      emitNotifications: true,
      applyEscalation: true,
    })
    await appendAudit(
      'ACCESS_PERF_INCIDENTS_ESCALATED',
      'performance',
      null,
      `Processed performance incident escalations`,
      result,
      actorEmail
    )
    res.json({ ok: true, ...result })
  } catch (e) {
    next(e)
  }
})

router.post('/maintenance/perf/retention', async (req, res, next) => {
  try {
    const { actorEmail } = readActor(req)
    const result = await applyPerfRetention({ actorEmail })
    res.json({ ok: true, ...result })
  } catch (e) {
    next(e)
  }
})

router.post('/maintenance/run-automation', async (req, res, next) => {
  try {
    const { actorEmail } = readActor(req)
    const hoursAhead = Math.max(1, Math.min(Number(req.body?.hoursAhead || 24), 168))
    const includeOverdue = String(req.body?.includeOverdue ?? 'true').toLowerCase() !== 'false'
    const daysAhead = Math.max(1, Math.min(Number(req.body?.daysAhead || 7), 60))
    const retryLimit = Math.max(1, Math.min(Number(req.body?.retryLimit || 100), 500))
    const perfWindowHours = Math.max(1, Math.min(Number(req.body?.perfWindowHours || 24), 24 * 30))

    const dueSchedules = await query(
      `SELECT *
       FROM adm_report_schedules
       WHERE status = 'active'
         AND next_run_at IS NOT NULL
         AND next_run_at <= NOW()
       ORDER BY next_run_at ASC
       LIMIT 50`
    )
    const scheduleResults = []
    for (const schedule of dueSchedules) {
      const runResult = await executeReportSchedule(schedule, actorEmail)
      scheduleResults.push({ scheduleId: schedule.id, scheduleCode: schedule.schedule_code, rows: runResult.rows })
    }

    const reminderRows = await processReviewReminders({ hoursAhead, includeOverdue })
    const expiryResult = await processOverrideExpiryMaintenance({ daysAhead })

    const retryRows = await query(
      `SELECT *
       FROM adm_notification_events
       WHERE channel IN ('webhook', 'email')
         AND delivery_status IN ('failed', 'queued')
         AND delivery_attempts < $1
         AND (next_retry_at IS NULL OR next_retry_at <= NOW())
       ORDER BY created_at ASC
       LIMIT $2`,
      [MAX_DELIVERY_ATTEMPTS, retryLimit]
    )
    let retriedSucceeded = 0
    let retriedFailed = 0
    for (const row of retryRows) {
      const result = await retryNotificationDelivery(row)
      if (result.sent) retriedSucceeded += 1
      else retriedFailed += 1
    }
    const riskRefresh = await refreshRiskSnapshots({ forceFull: false })
    const tunedPerf = await autoTunePerfThresholds({ routeCode: 'users.dashboard-summary', hours: perfWindowHours, actorEmail })
    const perfIncidents = await generatePerfIncidents({
      routeCode: 'users.dashboard-summary',
      hours: perfWindowHours,
      actorEmail,
      emitNotifications: true,
    })
    const perfIncidentEscalation = await processPerfIncidentEscalations({
      routeCode: 'users.dashboard-summary',
      actorEmail,
      emitNotifications: true,
      applyEscalation: true,
    })
    const perfRetention = await applyPerfRetention({ actorEmail })
    clearDashboardCache()

    await appendAudit(
      'ACCESS_MAINTENANCE_AUTOMATION_RUN',
      'automation',
      null,
      'Executed governance automation batch',
      {
        schedulesExecuted: scheduleResults.length,
        remindersSent: reminderRows.length,
        expiryReminders: expiryResult.soonToExpire.length,
        overridesExpired: expiryResult.expired.length,
        retryTotal: retryRows.length,
        retriedSucceeded,
        retriedFailed,
        riskViewsRefreshed: true,
        riskRefreshMode: riskRefresh.mode,
        usersRefreshed: riskRefresh.usersRefreshed,
        departmentsRefreshed: riskRefresh.departmentsRefreshed,
        perfThresholdsRetuned: tunedPerf.length,
        perfWindowHours,
        perfIncidentsCreated: perfIncidents.created,
        perfIncidentsUpdated: perfIncidents.updated,
        perfIncidentsResolved: perfIncidents.resolved,
        perfIncidentsEscalated: perfIncidentEscalation.escalated,
        perfIncidentsOverdue: perfIncidentEscalation.overdueIncidents,
        perfIncidentsCriticalOverdue: perfIncidentEscalation.criticalOverdue,
        perfRetention,
      },
      actorEmail
    )

    res.json({
      ok: true,
      schedulesExecuted: scheduleResults.length,
      remindersSent: reminderRows.length,
      expiryReminders: expiryResult.soonToExpire.length,
      overridesExpired: expiryResult.expired.length,
      retriesProcessed: retryRows.length,
      retriedSucceeded,
      retriedFailed,
      perfThresholdsRetuned: tunedPerf.length,
      perfIncidentsCreated: perfIncidents.created,
      perfIncidentsUpdated: perfIncidents.updated,
      perfIncidentsResolved: perfIncidents.resolved,
      perfIncidentsEscalated: perfIncidentEscalation.escalated,
      perfIncidentsOverdue: perfIncidentEscalation.overdueIncidents,
      perfIncidentsCriticalOverdue: perfIncidentEscalation.criticalOverdue,
      perfRetention,
      scheduleResults,
    })
  } catch (e) {
    next(e)
  }
})

router.post('/maintenance/refresh-risk-views', async (req, res, next) => {
  try {
    const { actorEmail } = readActor(req)
    const refreshStats = await refreshRiskSnapshots({ forceFull: true })
    clearDashboardCache()
    await appendAudit(
      'ACCESS_RISK_VIEWS_REFRESH',
      'materialized_view',
      null,
      'Refreshed risk snapshots and cleared dashboard cache',
      refreshStats,
      actorEmail
    )
    res.json({ ok: true, ...refreshStats })
  } catch (e) {
    next(e)
  }
})

router.patch('/users/reviews/:id', async (req, res, next) => {
  try {
    const reviewId = Number(req.params.id)
    const { actorEmail } = readActor(req)
    const payload = z.object({
      status: z.enum(['open', 'in_review', 'resolved', 'reversed']),
      reviewNote: z.string().optional().nullable(),
    }).parse(req.body || {})

    const [row] = await query(
      `UPDATE adm_access_reviews
       SET
        status = $1,
        review_note = COALESCE($2, review_note),
        reviewer_email = COALESCE(reviewer_email, $3),
        updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [payload.status, payload.reviewNote || null, actorEmail, reviewId]
    )

    if (!row) {
      res.status(404).json({ error: 'Review not found' })
      return
    }

    await appendAudit(
      'USER_ACCESS_REVIEW_STATUS_UPDATE',
      'access_review',
      String(reviewId),
      `Set review status to ${payload.status}`,
      payload,
      actorEmail
    )

    res.json({ ok: true, item: row })
  } catch (e) {
    next(e)
  }
})

router.put('/users/:id/permission-overrides', async (req, res, next) => {
  try {
    const userId = Number(req.params.id)
    const { actorEmail } = readActor(req)
    const payload = userOverrideUpdateSchema.parse(req.body || {})

    await withTx(async (client) => {
      await client.query(
        `DELETE FROM adm_user_permission_overrides
         WHERE user_id = $1
           AND approval_status IN ('pending', 'rejected')`,
        [userId]
      )
      if (!payload.overrides.length) return
      for (const item of payload.overrides) {
        const permissionResult = await client.query(
          'SELECT id FROM adm_permissions WHERE permission_code = $1 LIMIT 1',
          [item.permissionCode]
        )
        const permissionId = permissionResult.rows[0]?.id
        if (!permissionId) continue
        await client.query(
          `INSERT INTO adm_user_permission_overrides (
             user_id, permission_id, effect, reason, created_by, approval_status, requested_by, requested_at, requested_approver_email, expires_at
           )
           VALUES ($1, $2, $3, $4, $5, 'pending', $5, NOW(), $6, $7::timestamptz)
           ON CONFLICT (user_id, permission_id)
           DO UPDATE SET
            effect = EXCLUDED.effect,
            reason = EXCLUDED.reason,
            created_by = EXCLUDED.created_by,
            approval_status = 'pending',
            requested_by = EXCLUDED.requested_by,
            requested_at = NOW(),
            requested_approver_email = EXCLUDED.requested_approver_email,
            expires_at = EXCLUDED.expires_at,
            approved_by = NULL,
            approved_at = NULL,
            approver_note = NULL,
            reviewed_at = NULL,
            reviewer_email = NULL`,
          [userId, permissionId, item.effect, item.reason || null, actorEmail, item.approverEmail || null, item.expiresAt || null]
        )
      }
    })

    await appendAudit(
      'USER_PERMISSION_OVERRIDE_SUBMIT',
      'user',
      String(userId),
      'Submitted user permission overrides for approval',
      payload,
      actorEmail
    )
    await appendNotificationEvent({
      eventCode: 'USER_PERMISSION_OVERRIDE_SUBMITTED',
      severity: 'warning',
      recipient: null,
      title: 'Override approval request pending',
      body: `User #${userId} has pending override changes awaiting approval`,
      payload: { userId, submittedBy: actorEmail, overrides: payload.overrides.length },
    })
    await emitGovernanceWebhook(
      'USER_PERMISSION_OVERRIDE_SUBMITTED',
      { userId, submittedBy: actorEmail, overrides: payload.overrides },
      'warning'
    )
    const governanceEmails = parseEmailList(process.env.ACCESS_GOVERNANCE_ALERT_EMAILS)
    for (const recipient of governanceEmails) {
      await sendGovernanceEmail({
        recipient,
        subject: `NAPTIN Override Request Pending (User #${userId})`,
        body: `Override request for user #${userId} submitted by ${actorEmail} awaits checker approval.`,
        payload: { userId, submittedBy: actorEmail, overrides: payload.overrides.length },
        severity: 'warning',
      })
    }

    res.json({ ok: true, status: 'pending_approval' })
  } catch (e) {
    next(e)
  }
})

router.get('/users/:id/permission-overrides/pending', async (req, res, next) => {
  try {
    const userId = Number(req.params.id)
    const rows = await query(
      `SELECT
        upo.id,
        p.permission_code,
        upo.effect,
        upo.reason,
        upo.approval_status,
        upo.requested_by,
        upo.requested_at
       FROM adm_user_permission_overrides upo
       JOIN adm_permissions p ON p.id = upo.permission_id
       WHERE upo.user_id = $1
         AND upo.approval_status = 'pending'
       ORDER BY upo.requested_at DESC, p.permission_code`,
      [userId]
    )
    res.json({ items: rows })
  } catch (e) {
    next(e)
  }
})

router.post('/users/:id/permission-overrides/approve', async (req, res, next) => {
  try {
    const userId = Number(req.params.id)
    const { actorEmail } = readActor(req)
    const payload = overrideApprovalDecisionSchema.parse(req.body || {})

    const [pendingBy] = await query(
      `SELECT requested_by
       FROM adm_user_permission_overrides
       WHERE user_id = $1 AND approval_status = 'pending'
       ORDER BY requested_at DESC
       LIMIT 1`,
      [userId]
    )
    if (!pendingBy) {
      res.status(404).json({ error: 'No pending override request for this user' })
      return
    }
    if ((pendingBy.requested_by || '').toLowerCase() === actorEmail.toLowerCase()) {
      res.status(403).json({ error: 'Maker-checker policy: requester cannot approve own override request' })
      return
    }

    const approvedCount = await withTx(async (client) => {
      await client.query(
        `DELETE FROM adm_user_permission_overrides
         WHERE user_id = $1
           AND approval_status = 'approved'`,
        [userId]
      )
      const result = await client.query(
        `UPDATE adm_user_permission_overrides
         SET
          approval_status = 'approved',
          approved_by = $2,
          approved_at = NOW(),
          approver_note = COALESCE($3, approver_note),
          reviewed_at = NOW(),
          reviewer_email = $2
         WHERE user_id = $1
           AND approval_status = 'pending'`,
        [userId, actorEmail, payload.approverNote || null]
      )
      return Number(result.rowCount || 0)
    })

    await appendAudit(
      'USER_PERMISSION_OVERRIDE_APPROVE',
      'user',
      String(userId),
      `Approved pending permission overrides (${approvedCount})`,
      { userId, approvedCount, approverNote: payload.approverNote || null },
      actorEmail
    )
    await appendNotificationEvent({
      eventCode: 'USER_PERMISSION_OVERRIDE_APPROVED',
      severity: 'info',
      recipient: pendingBy.requested_by || null,
      title: 'Override request approved',
      body: `Override request for user #${userId} was approved`,
      payload: { userId, approvedBy: actorEmail, approvedCount },
    })
    await emitGovernanceWebhook(
      'USER_PERMISSION_OVERRIDE_APPROVED',
      { userId, approvedBy: actorEmail, approvedCount, approverNote: payload.approverNote || null },
      'info'
    )
    await sendGovernanceEmail({
      recipient: pendingBy.requested_by || '',
      subject: `NAPTIN Override Request Approved (User #${userId})`,
      body: `Your override request for user #${userId} was approved by ${actorEmail}.`,
      payload: { userId, approvedBy: actorEmail, approvedCount, approverNote: payload.approverNote || null },
      severity: 'info',
    })

    res.json({ ok: true, approvedCount })
  } catch (e) {
    next(e)
  }
})

router.post('/users/:id/permission-overrides/reject', async (req, res, next) => {
  try {
    const userId = Number(req.params.id)
    const { actorEmail } = readActor(req)
    const payload = overrideApprovalDecisionSchema.parse(req.body || {})

    const [pendingBy] = await query(
      `SELECT requested_by
       FROM adm_user_permission_overrides
       WHERE user_id = $1 AND approval_status = 'pending'
       ORDER BY requested_at DESC
       LIMIT 1`,
      [userId]
    )
    if (!pendingBy) {
      res.status(404).json({ error: 'No pending override request for this user' })
      return
    }
    if ((pendingBy.requested_by || '').toLowerCase() === actorEmail.toLowerCase()) {
      res.status(403).json({ error: 'Maker-checker policy: requester cannot reject own override request' })
      return
    }

    const result = await query(
      `UPDATE adm_user_permission_overrides
       SET
        approval_status = 'rejected',
        approved_by = $2,
        approved_at = NOW(),
        approver_note = COALESCE($3, approver_note),
        reviewed_at = NOW(),
        reviewer_email = $2
       WHERE user_id = $1
         AND approval_status = 'pending'`,
      [userId, actorEmail, payload.approverNote || null]
    )
    const rejectedCount = Number(result.rowCount || 0)

    await appendAudit(
      'USER_PERMISSION_OVERRIDE_REJECT',
      'user',
      String(userId),
      `Rejected pending permission overrides (${rejectedCount})`,
      { userId, rejectedCount, approverNote: payload.approverNote || null },
      actorEmail
    )
    await appendNotificationEvent({
      eventCode: 'USER_PERMISSION_OVERRIDE_REJECTED',
      severity: 'warning',
      recipient: pendingBy.requested_by || null,
      title: 'Override request rejected',
      body: `Override request for user #${userId} was rejected`,
      payload: { userId, rejectedBy: actorEmail, rejectedCount },
    })
    await emitGovernanceWebhook(
      'USER_PERMISSION_OVERRIDE_REJECTED',
      { userId, rejectedBy: actorEmail, rejectedCount, approverNote: payload.approverNote || null },
      'warning'
    )
    await sendGovernanceEmail({
      recipient: pendingBy.requested_by || '',
      subject: `NAPTIN Override Request Rejected (User #${userId})`,
      body: `Your override request for user #${userId} was rejected by ${actorEmail}.`,
      payload: { userId, rejectedBy: actorEmail, rejectedCount, approverNote: payload.approverNote || null },
      severity: 'warning',
    })

    res.json({ ok: true, rejectedCount })
  } catch (e) {
    next(e)
  }
})

router.post('/users/permission-overrides/run-expiry-maintenance', async (req, res, next) => {
  try {
    const daysAhead = Math.max(1, Math.min(Number(req.body?.daysAhead || 7), 60))
    const { actorEmail } = readActor(req)
    const { soonToExpire, expired } = await processOverrideExpiryMaintenance({ daysAhead })

    await appendAudit(
      'USER_PERMISSION_OVERRIDE_EXPIRY_MAINTENANCE',
      'user_permission_override',
      null,
      `Processed override expiry maintenance`,
      { reminders: soonToExpire.length, expired: expired.length, daysAhead },
      actorEmail
    )

    res.json({ ok: true, remindersSent: soonToExpire.length, expiredCount: expired.length, daysAhead })
  } catch (e) {
    next(e)
  }
})

router.get('/departments', async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT d.id, d.code, d.name, d.status,
              (SELECT COUNT(*)::int FROM adm_department_units u WHERE u.department_id = d.id) AS unit_count
       FROM adm_departments d
       ORDER BY d.name`
    )
    res.json({ items: rows })
  } catch (e) {
    next(e)
  }
})

router.get('/departments/:departmentCode/units', async (req, res, next) => {
  try {
    const departmentCode = (req.params.departmentCode || '').toString().trim().toUpperCase()
    const rows = await query(
      `SELECT u.id, u.code, u.name, u.status
       FROM adm_department_units u
       JOIN adm_departments d ON d.id = u.department_id
       WHERE d.code = $1
       ORDER BY u.name`,
      [departmentCode]
    )
    res.json({ items: rows })
  } catch (e) {
    next(e)
  }
})

router.get('/job-descriptions', async (req, res, next) => {
  try {
    const departmentCode = (req.query.departmentCode || '').toString().trim().toUpperCase()
    const rows = await query(
      `SELECT jd.*,
              d.code AS department_code,
              d.name AS department_name,
              u.code AS unit_code,
              u.name AS unit_name
       FROM adm_job_descriptions jd
       LEFT JOIN adm_departments d ON d.id = jd.department_id
       LEFT JOIN adm_department_units u ON u.id = jd.unit_id
       WHERE ($1 = '' OR d.code = $1)
       ORDER BY jd.updated_at DESC, jd.title`,
      [departmentCode]
    )
    res.json({ items: rows })
  } catch (e) {
    next(e)
  }
})

router.post('/job-descriptions', async (req, res, next) => {
  try {
    const { actorEmail } = readActor(req)
    const payload = jobDescriptionSchema.parse(req.body || {})
    const created = await withTx(async (client) => {
      const depRes = payload.departmentCode
        ? await client.query('SELECT id FROM adm_departments WHERE code = $1', [payload.departmentCode])
        : { rows: [{ id: null }] }
      const unitRes = payload.unitCode
        ? await client.query('SELECT id FROM adm_department_units WHERE code = $1', [payload.unitCode])
        : { rows: [{ id: null }] }
      const row = await client.query(
        `INSERT INTO adm_job_descriptions
         (job_code, title, department_id, unit_id, summary, responsibilities, requirements, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING *`,
        [
          payload.jobCode.toUpperCase(),
          payload.title,
          depRes.rows[0]?.id || null,
          unitRes.rows[0]?.id || null,
          payload.summary,
          payload.responsibilities,
          payload.requirements,
          payload.status,
        ]
      )
      return row.rows[0]
    })

    await appendAudit('JOB_DESCRIPTION_CREATE', 'job_description', String(created.id), 'Created job description', payload, actorEmail)
    res.status(201).json(created)
  } catch (e) {
    next(e)
  }
})

router.patch('/job-descriptions/:id', async (req, res, next) => {
  try {
    const { actorEmail } = readActor(req)
    const jobDescriptionId = Number(req.params.id)
    const payload = jobDescriptionSchema.partial().parse(req.body || {})
    const updated = await withTx(async (client) => {
      let departmentId
      let unitId
      if (payload.departmentCode !== undefined) {
        const depRes = payload.departmentCode
          ? await client.query('SELECT id FROM adm_departments WHERE code = $1', [payload.departmentCode])
          : { rows: [{ id: null }] }
        departmentId = depRes.rows[0]?.id || null
      }
      if (payload.unitCode !== undefined) {
        const unitRes = payload.unitCode
          ? await client.query('SELECT id FROM adm_department_units WHERE code = $1', [payload.unitCode])
          : { rows: [{ id: null }] }
        unitId = unitRes.rows[0]?.id || null
      }
      const row = await client.query(
        `UPDATE adm_job_descriptions
         SET
          job_code = COALESCE($1, job_code),
          title = COALESCE($2, title),
          department_id = COALESCE($3, department_id),
          unit_id = COALESCE($4, unit_id),
          summary = COALESCE($5, summary),
          responsibilities = COALESCE($6, responsibilities),
          requirements = COALESCE($7, requirements),
          status = COALESCE($8, status),
          updated_at = NOW()
         WHERE id = $9
         RETURNING *`,
        [
          payload.jobCode?.toUpperCase(),
          payload.title,
          departmentId,
          unitId,
          payload.summary,
          payload.responsibilities,
          payload.requirements,
          payload.status,
          jobDescriptionId,
        ]
      )
      return row.rows[0]
    })

    if (!updated) {
      res.status(404).json({ error: 'Job description not found' })
      return
    }

    await appendAudit(
      'JOB_DESCRIPTION_UPDATE',
      'job_description',
      String(jobDescriptionId),
      'Updated job description',
      payload,
      actorEmail
    )
    res.json(updated)
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
