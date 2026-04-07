async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
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
