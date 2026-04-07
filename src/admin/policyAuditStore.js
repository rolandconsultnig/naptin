const AUDIT_KEY = 'naptin_portal_policy_audit'
const MAX_EVENTS = 200

function loadEvents() {
  try {
    const raw = localStorage.getItem(AUDIT_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveEvents(events) {
  localStorage.setItem(AUDIT_KEY, JSON.stringify(events.slice(0, MAX_EVENTS)))
}

export function appendPolicyAuditEvent({ actor = 'system', action, detail, tenantId }) {
  if (!action || !detail) return
  const next = [
    {
      when: new Date().toISOString(),
      actor,
      action,
      detail,
      tenantId: tenantId || 'unknown',
    },
    ...loadEvents(),
  ]
  saveEvents(next)
}

export function getPolicyAuditEvents() {
  return loadEvents()
}
