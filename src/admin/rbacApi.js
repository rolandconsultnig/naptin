async function requestJson(url, options = {}) {
  let session = null
  try {
    session = JSON.parse(localStorage.getItem('naptin_portal_session') || 'null')
  } catch {
    session = null
  }
  const roleKey = session?.roleKey || ''
  const roleLevel = Number(session?.user?.roleLevel || 0)
  const userEmail = session?.user?.email || ''

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-role-key': roleKey,
      'x-role-level': String(roleLevel),
      'x-user-email': userEmail,
      ...(options.headers || {}),
    },
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : {}

  if (!response.ok) {
    throw new Error(data?.error || `Request failed: ${response.status}`)
  }

  return data
}

const BASE = '/api/v1/admin/rbac'

export function fetchRbacUsers(filters = {}) {
  const q = new URLSearchParams()
  if (filters.q) q.set('q', filters.q)
  if (filters.department) q.set('department', filters.department)
  if (filters.role) q.set('role', filters.role)
  if (filters.status) q.set('status', filters.status)
  return requestJson(`${BASE}/users${q.toString() ? `?${q.toString()}` : ''}`)
}

export function fetchRbacDepartments() {
  return requestJson(`${BASE}/departments`)
}

export function fetchRbacDepartmentUnits(departmentCode) {
  return requestJson(`${BASE}/departments/${encodeURIComponent(departmentCode)}/units`)
}

export function fetchRbacJobDescriptions(filters = {}) {
  const q = new URLSearchParams()
  if (filters.departmentCode) q.set('departmentCode', filters.departmentCode)
  return requestJson(`${BASE}/job-descriptions${q.toString() ? `?${q.toString()}` : ''}`)
}

export function createRbacJobDescription(payload) {
  return requestJson(`${BASE}/job-descriptions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateRbacJobDescription(id, payload) {
  return requestJson(`${BASE}/job-descriptions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function createRbacUser(payload) {
  return requestJson(`${BASE}/users`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateRbacUser(id, payload) {
  return requestJson(`${BASE}/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function disableRbacUser(id) {
  return requestJson(`${BASE}/users/${id}/disable`, {
    method: 'POST',
  })
}

export function assignRbacUserSecondaryRole(userId, payload) {
  return requestJson(`${BASE}/users/${userId}/secondary-roles`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function removeRbacUserSecondaryRole(userId, roleCode) {
  return requestJson(`${BASE}/users/${userId}/secondary-roles/${encodeURIComponent(roleCode)}`, {
    method: 'DELETE',
  })
}

export function fetchRbacUserAccessProfile(userId) {
  return requestJson(`${BASE}/users/${userId}/access-profile`)
}

export function fetchRbacEnterpriseDashboard(staleDays = 90) {
  const days = Number(staleDays) || 90
  return requestJson(`${BASE}/users/dashboard-summary?staleDays=${days}`)
}

export function refreshRbacEnterpriseDashboardCache() {
  return requestJson(`${BASE}/users/dashboard-summary/refresh-cache`, {
    method: 'POST',
  })
}

export function searchRbacEnterpriseDashboard(q, limit = 100) {
  const qs = new URLSearchParams()
  if (q) qs.set('q', q)
  if (limit) qs.set('limit', String(limit))
  return requestJson(`${BASE}/users/dashboard-search${qs.toString() ? `?${qs.toString()}` : ''}`)
}

export function fetchRbacDashboardPerformance(hours = 24, autoTune = true) {
  const h = Number(hours) || 24
  const tune = autoTune ? 'true' : 'false'
  return requestJson(`${BASE}/users/dashboard-performance?hours=${encodeURIComponent(h)}&autoTune=${tune}`)
}

export function fetchRbacPerformanceIncidents(filters = {}) {
  const q = new URLSearchParams()
  if (filters.routeCode) q.set('routeCode', filters.routeCode)
  if (filters.status) q.set('status', filters.status)
  if (filters.severity) q.set('severity', filters.severity)
  if (filters.q) q.set('q', filters.q)
  if (filters.limit) q.set('limit', String(filters.limit))
  return requestJson(`${BASE}/users/perf-incidents${q.toString() ? `?${q.toString()}` : ''}`)
}

export function fetchRbacPerformanceIncidentAnalytics(hours = 24 * 7, routeCode = 'users.dashboard-summary') {
  const q = new URLSearchParams()
  q.set('hours', String(Number(hours) || 24 * 7))
  if (routeCode) q.set('routeCode', routeCode)
  return requestJson(`${BASE}/users/perf-incidents/analytics?${q.toString()}`)
}

export function fetchRbacPerformanceIncidentEvents(id, limit = 50) {
  return requestJson(`${BASE}/users/perf-incidents/${id}/events?limit=${encodeURIComponent(Number(limit) || 50)}`)
}

export function updateRbacPerformanceIncident(id, payload = {}) {
  return requestJson(`${BASE}/users/perf-incidents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function fetchRbacAccessReviewHistory(filters = {}) {
  const q = new URLSearchParams()
  if (filters.reviewType) q.set('reviewType', filters.reviewType)
  if (filters.userId) q.set('userId', String(filters.userId))
  if (filters.reviewer) q.set('reviewer', filters.reviewer)
  if (filters.from) q.set('from', filters.from)
  if (filters.to) q.set('to', filters.to)
  if (filters.q) q.set('q', filters.q)
  if (filters.page) q.set('page', String(filters.page))
  if (filters.pageSize) q.set('pageSize', String(filters.pageSize))
  if (filters.sortBy) q.set('sortBy', filters.sortBy)
  if (filters.sortDir) q.set('sortDir', filters.sortDir)
  if (filters.limit) q.set('limit', String(filters.limit))
  return requestJson(`${BASE}/users/review-history${q.toString() ? `?${q.toString()}` : ''}`)
}

export function completeRbacUserAccessReview(userId, payload) {
  return requestJson(`${BASE}/users/${userId}/review-completed`, {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  })
}

export function updateRbacAccessReviewStatus(reviewId, payload) {
  return requestJson(`${BASE}/users/reviews/${reviewId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload || {}),
  })
}

export function fetchRbacAccessReviewQueue(filters = {}) {
  const q = new URLSearchParams()
  if (filters.status) q.set('status', filters.status)
  if (filters.assignedTo) q.set('assignedTo', filters.assignedTo)
  if (filters.priority) q.set('priority', filters.priority)
  if (filters.overdueOnly !== undefined) q.set('overdueOnly', String(filters.overdueOnly))
  if (filters.page) q.set('page', String(filters.page))
  if (filters.pageSize) q.set('pageSize', String(filters.pageSize))
  return requestJson(`${BASE}/users/reviews/queue${q.toString() ? `?${q.toString()}` : ''}`)
}

export function fetchRbacReviewSlaSummary() {
  return requestJson(`${BASE}/users/reviews/sla-summary`)
}

export function assignRbacAccessReview(reviewId, payload) {
  return requestJson(`${BASE}/users/reviews/${reviewId}/assign`, {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  })
}

export function addRbacAccessReviewComment(reviewId, comment) {
  return requestJson(`${BASE}/users/reviews/${reviewId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ comment }),
  })
}

export function fetchRbacAccessReviewComments(reviewId) {
  return requestJson(`${BASE}/users/reviews/${reviewId}/comments`)
}

export function escalateRbacOverdueReviews() {
  return requestJson(`${BASE}/users/reviews/escalate-overdue`, {
    method: 'POST',
  })
}

export function sendRbacReviewReminders(payload = {}) {
  return requestJson(`${BASE}/users/reviews/send-reminders`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function bulkUpdateRbacAccessReviews(payload = {}) {
  return requestJson(`${BASE}/users/reviews/bulk-update`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchRbacMfaEnforcementReport() {
  return requestJson(`${BASE}/users/mfa-enforcement-report`)
}

export function fetchRbacRiskPolicy() {
  return requestJson(`${BASE}/policies/risk`)
}

export function updateRbacRiskPolicy(payload) {
  return requestJson(`${BASE}/policies/risk`, {
    method: 'PUT',
    body: JSON.stringify(payload || {}),
  })
}

export function fetchRbacReportSchedules() {
  return requestJson(`${BASE}/reports/schedules`)
}

export function createRbacReportSchedule(payload) {
  return requestJson(`${BASE}/reports/schedules`, {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  })
}

export function updateRbacReportSchedule(id, payload) {
  return requestJson(`${BASE}/reports/schedules/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload || {}),
  })
}

export function runRbacReportScheduleNow(id) {
  return requestJson(`${BASE}/reports/schedules/${id}/run-now`, {
    method: 'POST',
  })
}

export function fetchRbacNotificationEvents(filters = {}) {
  const q = new URLSearchParams()
  if (filters.recipient) q.set('recipient', filters.recipient)
  if (filters.channel) q.set('channel', filters.channel)
  if (filters.since) q.set('since', filters.since)
  if (filters.scope) q.set('scope', filters.scope)
  if (filters.limit) q.set('limit', String(filters.limit))
  return requestJson(`${BASE}/notifications/events${q.toString() ? `?${q.toString()}` : ''}`)
}

export function retryRbacNotificationDeliveries(limit = 50) {
  return requestJson(`${BASE}/notifications/retry-failed`, {
    method: 'POST',
    body: JSON.stringify({ limit }),
  })
}

export function fetchRbacAttestationPacks() {
  return requestJson(`${BASE}/reports/attestation-packs`)
}

export function fetchRbacAttestationPack(id) {
  return requestJson(`${BASE}/reports/attestation-packs/${id}`)
}

export function downloadRbacAttestationPackCsvUrl(id) {
  return `${BASE}/reports/attestation-packs/${id}/download.csv`
}

export function createRbacAttestationPack(payload = {}) {
  return requestJson(`${BASE}/reports/attestation-packs`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function runRbacDueSchedules() {
  return requestJson(`${BASE}/reports/schedules/run-due`, {
    method: 'POST',
  })
}

export function runRbacOverrideExpiryMaintenance(payload = {}) {
  return requestJson(`${BASE}/users/permission-overrides/run-expiry-maintenance`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function runRbacMaintenanceAutomation(payload = {}) {
  return requestJson(`${BASE}/maintenance/run-automation`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function retuneRbacPerformanceThresholds(payload = {}) {
  return requestJson(`${BASE}/maintenance/perf/retune`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function generateRbacPerformanceIncidents(payload = {}) {
  return requestJson(`${BASE}/maintenance/perf/incidents/generate`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function escalateRbacPerformanceIncidents(payload = {}) {
  return requestJson(`${BASE}/maintenance/perf/incidents/escalate`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function runRbacPerformanceRetention(payload = {}) {
  return requestJson(`${BASE}/maintenance/perf/retention`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function refreshRbacRiskViews() {
  return requestJson(`${BASE}/maintenance/refresh-risk-views`, {
    method: 'POST',
  })
}

export function updateRbacUserPermissionOverrides(userId, overrides) {
  return requestJson(`${BASE}/users/${userId}/permission-overrides`, {
    method: 'PUT',
    body: JSON.stringify({ overrides }),
  })
}

export function fetchRbacPendingUserPermissionOverrides(userId) {
  return requestJson(`${BASE}/users/${userId}/permission-overrides/pending`)
}

export function approveRbacUserPermissionOverrides(userId, approverNote = '') {
  return requestJson(`${BASE}/users/${userId}/permission-overrides/approve`, {
    method: 'POST',
    body: JSON.stringify({ approverNote }),
  })
}

export function rejectRbacUserPermissionOverrides(userId, approverNote = '') {
  return requestJson(`${BASE}/users/${userId}/permission-overrides/reject`, {
    method: 'POST',
    body: JSON.stringify({ approverNote }),
  })
}

export function fetchRbacRoles() {
  return requestJson(`${BASE}/roles`)
}

export function createRbacRole(payload) {
  return requestJson(`${BASE}/roles`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateRbacRole(id, payload) {
  return requestJson(`${BASE}/roles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function fetchRbacPermissions(moduleCode) {
  const q = moduleCode ? `?module=${encodeURIComponent(moduleCode)}` : ''
  return requestJson(`${BASE}/permissions${q}`)
}

export function fetchRbacRolePermissions(roleId) {
  return requestJson(`${BASE}/roles/${roleId}/permissions`)
}

export function updateRbacRolePermissions(roleId, permissionCodes) {
  return requestJson(`${BASE}/roles/${roleId}/permissions`, {
    method: 'PUT',
    body: JSON.stringify({ permissionCodes }),
  })
}

export function fetchRbacMatrix(moduleCode) {
  const q = moduleCode ? `?module=${encodeURIComponent(moduleCode)}` : ''
  return requestJson(`${BASE}/matrix${q}`)
}

export function fetchRbacModules() {
  return requestJson(`${BASE}/modules`)
}

export function createRbacModule(payload) {
  return requestJson(`${BASE}/modules`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateRbacModule(id, payload) {
  return requestJson(`${BASE}/modules/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function fetchRbacModuleFeatures(moduleId) {
  return requestJson(`${BASE}/modules/${moduleId}/features`)
}

export function createRbacModuleFeature(moduleId, payload) {
  return requestJson(`${BASE}/modules/${moduleId}/features`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateRbacModuleFeature(moduleId, featureId, payload) {
  return requestJson(`${BASE}/modules/${moduleId}/features/${featureId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function fetchRbacAudit(limit = 100) {
  return requestJson(`${BASE}/audit?limit=${Number(limit) || 100}`)
}

export function checkRbacSodForUser(userId) {
  return requestJson(`${BASE}/sod/check/user/${userId}`)
}
