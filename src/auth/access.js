import { canAccessAdminConsole } from './adminConsole.js'
import { getAllowedRolesForSegment } from '../admin/policyStore.js'
import {
  WORKSPACE_SEGMENTS,
  PLATFORM_SEGMENTS,
  bypassesDepartmentScope,
  departmentOwnsSegment,
  canAccessHRStaffTabs,
} from './departmentAccess.js'

export { ROLE_KEYS, ALL_ROLES, APP_ROUTE_RULES, defaultAllowedRolesForSegment } from './rbacConfig.js'

export function allowedRolesForAppPath(appPath) {
  const normalized = appPath.replace(/^\//, '').replace(/^app\/?/, '')
  const segment = normalized.split('/')[0] || ''
  return getAllowedRolesForSegment(segment)
}

export function canAccessAppSegment(segment, roleKey) {
  return getAllowedRolesForSegment(segment).includes(roleKey)
}

/**
 * Full gate: RBAC policy + department ownership (and HR sub-tab rules).
 */
export function canUserAccessAppPath(user, pathname) {
  if (!user?.roleKey) return false
  const roleKey = user.roleKey
  const pathAfter = pathname.replace(/^\/app\/?/, '').split('/').filter(Boolean)
  const segment = pathAfter[0] || ''

  if (!segment || segment === 'forbidden') return true

  const allowedRoles = getAllowedRolesForSegment(segment)
  if (!allowedRoles.includes(roleKey)) return false

  if (WORKSPACE_SEGMENTS.has(segment)) return true
  if (PLATFORM_SEGMENTS.has(segment)) return true

  if (segment === 'human-resource') {
    const sub = pathAfter[1] || ''
    if (!sub || sub === 'self-service') return true
    return canAccessHRStaffTabs(user)
  }

  if (bypassesDepartmentScope(roleKey)) return true

  return departmentOwnsSegment(user.department, segment)
}

export function canAccessNavPath(to, user) {
  if (!user?.roleKey) return false
  const roleKey = user.roleKey
  if (to === '/admin') return canAccessAdminConsole(roleKey)
  if (!to || !to.startsWith('/app/')) return true
  return canUserAccessAppPath(user, to)
}
