/**
 * Maps authenticated users (by `user.department` from login) to departmental app segments.
 * Elevated roles (`director`, `ict_admin`) bypass and may open any segment allowed by RBAC policy.
 */

export const DEPARTMENT_TO_SEGMENTS = {
  // Current organogram departments
  'Human Resource Management': ['human-resource'],
  'Finance & Accounts': ['finance'],
  'Planning, Research & Statistics': ['planning'],
  'Training': ['training'],
  'Corporate & Consultancy Services': ['corporate'],
  'Marketing & Business Development': ['marketing', 'client-ops-markets'],
  // Units (board level)
  'Legal / Board Secretariat': ['legal'],
  'Internal Audit': ['documents'],
  'Procurement': ['procurement'],
  // Legacy aliases (backward compat)
  'HR & People': ['human-resource'],
  Finance: ['finance'],
  Legal: ['legal'],
  Admin: ['corporate'],
  'M&E': ['planning'],
  ICT: ['planning'],
  'Corporate Services': ['corporate'],
  'Audit & Assurance': ['documents'],
}

/** Shown to every logged-in user (not department-scoped). */
export const WORKSPACE_SEGMENTS = new Set([
  'dashboard',
  'intranet',
  'collaboration',
  'chat',
  'meetings',
  'profile',
  'forbidden',
])

/** Policy + role only; no department ownership check. */
export const PLATFORM_SEGMENTS = new Set(['integrations', 'security'])

export function bypassesDepartmentScope(roleKey) {
  return roleKey === 'director' || roleKey === 'ict_admin'
}

/** HR-only tabs inside Human Resources (directory, people, operations, enterprise). */
export function canAccessHRStaffTabs(user) {
  if (!user?.roleKey) return false
  if (bypassesDepartmentScope(user.roleKey)) return true
  return user.department === 'HR & People'
}

export function departmentOwnsSegment(department, segment) {
  if (!department) return false
  const segs = DEPARTMENT_TO_SEGMENTS[department]
  return segs?.includes(segment) ?? false
}

/**
 * Default landing path after login (department “home” module).
 */
export function getHomePathForUser(user) {
  if (!user?.roleKey) return '/app/dashboard'
  if (bypassesDepartmentScope(user.roleKey)) return '/app/dashboard'
  const dept = user.department
  const segs = DEPARTMENT_TO_SEGMENTS[dept]
  if (!segs?.length) return '/app/dashboard'
  const first = segs[0]
  const paths = {
    'human-resource': '/app/human-resource',
    finance: '/app/finance',
    legal: '/app/legal',
    corporate: '/app/corporate',
    procurement: '/app/procurement',
    planning: '/app/planning',
    marketing: '/app/marketing',
    training: '/app/training',
    ict: '/app/ict',
    mande: '/app/planning',
    documents: '/app/documents',
  }
  return paths[first] || '/app/dashboard'
}
