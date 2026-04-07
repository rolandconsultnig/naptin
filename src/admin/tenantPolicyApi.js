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

export async function fetchTenantsApi() {
  return requestJson('/api/admin/tenants')
}

export async function fetchTenantPolicyApi(tenantKey) {
  const q = new URLSearchParams({ tenant_key: tenantKey })
  return requestJson(`/api/admin/tenant-module-policy?${q.toString()}`)
}

export async function updateTenantModulePolicyApi({ tenantKey, segment, isEnabled }) {
  const q = new URLSearchParams({ tenant_key: tenantKey })
  return requestJson(`/api/admin/tenant-module-policy/${encodeURIComponent(segment)}?${q.toString()}`, {
    method: 'PUT',
    body: JSON.stringify({ is_enabled: !!isEnabled }),
  })
}

export async function fetchTenantAuditApi(tenantKey, limit = 100) {
  const q = new URLSearchParams({ tenant_key: tenantKey, limit: String(limit) })
  return requestJson(`/api/admin/tenant-audit?${q.toString()}`)
}

export async function fetchCurrentUserTenantPolicyApi() {
  return requestJson('/api/tenant-policy')
}
