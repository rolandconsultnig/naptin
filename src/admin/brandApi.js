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

export function fetchBrandAssetsApi(params = {}) {
  const query = new URLSearchParams(params)
  const suffix = query.toString()
  return requestJson(`/api/brand/assets${suffix ? `?${suffix}` : ''}`)
}

export function createBrandAssetApi(payload) {
  return requestJson('/api/brand/assets', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function runComplianceScanApi(payload) {
  return requestJson('/api/brand/compliance/scans', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function runComplianceBatchApi(payload) {
  return requestJson('/api/brand/compliance/batches', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function createProductNamingRequestApi(payload) {
  return requestJson('/api/brand/naming/requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchBrandHealthDashboardApi(params = {}) {
  const query = new URLSearchParams(params)
  const suffix = query.toString()
  return requestJson(`/api/brand/health/dashboard${suffix ? `?${suffix}` : ''}`)
}

export function initiateBrandCrisisApi(payload) {
  return requestJson('/api/brand/crises', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function importCompetitorSignalApi(payload) {
  return requestJson('/api/brand/competitors/signals/import', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchBrandUsageReportApi(params = {}) {
  const query = new URLSearchParams(params)
  const suffix = query.toString()
  return requestJson(`/api/brand/usage/reports${suffix ? `?${suffix}` : ''}`)
}

export function fetchBrandApprovalsApi(params = {}) {
  const query = new URLSearchParams(params)
  const suffix = query.toString()
  return requestJson(`/api/brand/approvals${suffix ? `?${suffix}` : ''}`)
}

export function decideBrandApprovalApi(approvalId, payload) {
  return requestJson(`/api/brand/approvals/${approvalId}/decision`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
