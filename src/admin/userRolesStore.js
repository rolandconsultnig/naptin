import { ROLE_KEYS } from '../auth/rbacConfig'

const KEY = 'naptin_portal_user_roles'
const EVENT = 'naptin-policy-changed'

export function getRoleOverride(emailLower) {
  try {
    const m = JSON.parse(localStorage.getItem(KEY) || '{}')
    const r = m[emailLower]
    if (r && ROLE_KEYS.includes(r)) return r
  } catch {
    /* ignore */
  }
  return null
}

export function setRoleOverride(emailLower, roleKey) {
  const m = JSON.parse(localStorage.getItem(KEY) || '{}')
  if (!ROLE_KEYS.includes(roleKey)) return
  m[emailLower] = roleKey
  localStorage.setItem(KEY, JSON.stringify(m))
  window.dispatchEvent(new Event(EVENT))
}

export function clearRoleOverride(emailLower) {
  const m = JSON.parse(localStorage.getItem(KEY) || '{}')
  delete m[emailLower]
  localStorage.setItem(KEY, JSON.stringify(m))
  window.dispatchEvent(new Event(EVENT))
}
