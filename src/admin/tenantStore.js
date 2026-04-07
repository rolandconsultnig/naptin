const TENANT_KEY = 'naptin_portal_active_tenant'
const TENANT_EVENT = 'naptin-tenant-changed'

export const TENANT_OPTIONS = [
  { id: 'naptin-hq', name: 'NAPTIN HQ' },
  { id: 'lagos-campus', name: 'Lagos Campus' },
  { id: 'kaduna-campus', name: 'Kaduna Campus' },
]

const DEFAULT_TENANT_ID = TENANT_OPTIONS[0].id

export function getCurrentTenantId() {
  const saved = localStorage.getItem(TENANT_KEY)
  if (saved && TENANT_OPTIONS.some((t) => t.id === saved)) return saved
  return DEFAULT_TENANT_ID
}

export function setCurrentTenantId(tenantId) {
  const next = TENANT_OPTIONS.some((t) => t.id === tenantId) ? tenantId : DEFAULT_TENANT_ID
  localStorage.setItem(TENANT_KEY, next)
  window.dispatchEvent(new Event(TENANT_EVENT))
  return next
}

export function subscribeTenant(cb) {
  window.addEventListener(TENANT_EVENT, cb)
  return () => window.removeEventListener(TENANT_EVENT, cb)
}
