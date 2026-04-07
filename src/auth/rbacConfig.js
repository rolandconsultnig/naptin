/** Canonical role keys — keep in sync with AuthContext demo users. */
export const ROLE_KEYS = ['staff', 'hod', 'director', 'ict_admin', 'auditor']

export const ALL_ROLES = [...ROLE_KEYS]

/**
 * Default route rules when no admin policy override exists.
 * segment = first path segment under /app (e.g. finance -> /app/finance).
 */
export const APP_ROUTE_RULES = [
  { segment: 'security', roles: ['director', 'ict_admin', 'auditor'] },
  { segment: 'integrations', roles: ['director', 'ict_admin'] },
  { segment: 'documents', roles: ['hod', 'director', 'ict_admin', 'auditor'] },
  { segment: 'process-maker', roles: ['ict_admin'] },
]

export function defaultAllowedRolesForSegment(segment) {
  const rule = APP_ROUTE_RULES.find((r) => r.segment === segment)
  return rule ? [...rule.roles] : [...ALL_ROLES]
}
