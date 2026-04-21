/**
 * Hardened admin console: served at /admin (not under /app).
 * Host allowlist + role allowlist; override via env for staging/production.
 */

/** Roles that may open the admin console */
export const ADMIN_CONSOLE_ROLES = ['ict_admin', 'director', 'hod', 'super_admin']

const DEFAULT_HOSTS = ['127.0.0.1', 'localhost', '::1']

export function isAdminHostAllowed() {
  if (import.meta.env.VITE_ADMIN_DISABLE_HOST_CHECK === 'true') return true
  const extra = (import.meta.env.VITE_ADMIN_ALLOWED_HOSTS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const allowed = [...DEFAULT_HOSTS, ...extra]
  return allowed.includes(window.location.hostname)
}

export function canAccessAdminConsole(roleKey) {
  return ADMIN_CONSOLE_ROLES.includes(roleKey)
}
