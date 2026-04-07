import { ROLE_KEYS, defaultAllowedRolesForSegment } from '../auth/rbacConfig'
import { PORTAL_MODULES, GRANTS_ALLOW_ROUTE } from './portalModules'

const POLICY_KEY = 'naptin_portal_policy'
const POLICY_EVENT = 'naptin-policy-changed'

function buildDefaultGrants() {
  const grants = {}
  for (const m of PORTAL_MODULES) {
    const allowed = defaultAllowedRolesForSegment(m.segment)
    grants[m.segment] = {}
    for (const r of ROLE_KEYS) {
      grants[m.segment][r] = allowed.includes(r) ? 'view' : 'none'
    }
  }
  return grants
}

function buildDefaultDisabled() {
  const disabled = {}
  for (const m of PORTAL_MODULES) disabled[m.segment] = false
  return disabled
}

export function getDefaultPolicy() {
  return {
    version: 1,
    updatedAt: null,
    grants: buildDefaultGrants(),
    disabled: buildDefaultDisabled(),
  }
}

function mergeGrants(baseGrants, savedGrants) {
  const out = { ...baseGrants }
  for (const seg of Object.keys(savedGrants || {})) {
    out[seg] = { ...(baseGrants[seg] || {}), ...savedGrants[seg] }
  }
  return out
}

export function loadPolicy() {
  try {
    const raw = localStorage.getItem(POLICY_KEY)
    if (!raw) return getDefaultPolicy()
    const parsed = JSON.parse(raw)
    const base = getDefaultPolicy()
    return {
      version: parsed.version ?? base.version,
      updatedAt: parsed.updatedAt ?? null,
      grants: mergeGrants(base.grants, parsed.grants),
      disabled: { ...base.disabled, ...parsed.disabled },
    }
  } catch {
    return getDefaultPolicy()
  }
}

export function savePolicy(policy) {
  const next = { ...policy, updatedAt: new Date().toISOString() }
  localStorage.setItem(POLICY_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event(POLICY_EVENT))
  return next
}

export function resetPolicyToDefaults() {
  localStorage.removeItem(POLICY_KEY)
  window.dispatchEvent(new Event(POLICY_EVENT))
  return getDefaultPolicy()
}

export function subscribePolicy(cb) {
  window.addEventListener(POLICY_EVENT, cb)
  return () => window.removeEventListener(POLICY_EVENT, cb)
}

/**
 * Roles that may access /app/{segment} according to stored policy.
 */
export function getAllowedRolesForSegment(segment) {
  const p = loadPolicy()
  if (p.disabled?.[segment]) return []
  const row = p.grants?.[segment]
  if (!row) return defaultAllowedRolesForSegment(segment)
  return ROLE_KEYS.filter((r) => {
    const g = row[r] ?? 'none'
    return GRANTS_ALLOW_ROUTE.includes(g)
  })
}

export function setModuleDisabled(segment, disabled) {
  const p = loadPolicy()
  const next = {
    ...p,
    disabled: { ...p.disabled, [segment]: disabled },
  }
  return savePolicy(next)
}

export function setGrant(segment, roleKey, grantId) {
  const p = loadPolicy()
  const row = { ...(p.grants[segment] || {}) }
  row[roleKey] = grantId
  const next = {
    ...p,
    grants: { ...p.grants, [segment]: row },
  }
  return savePolicy(next)
}
