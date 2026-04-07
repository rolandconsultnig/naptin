import { STAFF } from '../data/mock'

/** Demo accounts (can sign in) with canonical roles */
export const DEMO_ACCOUNT_ROWS = [
  { email: 'staff@naptin.gov.ng', name: 'Adebayo Okonkwo', defaultRole: 'staff', signIn: true },
  { email: 'hod@naptin.gov.ng', name: 'Grace Okafor', defaultRole: 'hod', signIn: true },
  { email: 'director@naptin.gov.ng', name: 'Biodun Adeyemi', defaultRole: 'director', signIn: true },
  { email: 'ict@naptin.gov.ng', name: 'Emmanuel Bello', defaultRole: 'ict_admin', signIn: true },
  { email: 'audit@naptin.gov.ng', name: 'Ngozi Eze', defaultRole: 'auditor', signIn: true },
  { email: 'a.okonkwo@naptin.gov.ng', name: 'Adebayo Okonkwo', defaultRole: 'staff', signIn: true },
]

export function getDirectoryUsersForAdmin() {
  const fromStaff = STAFF.map((s) => ({
    email: s.email.toLowerCase(),
    name: s.name,
    defaultRole: 'staff',
    signIn: false,
    staffId: s.id,
    department: s.dept,
  }))
  return [...DEMO_ACCOUNT_ROWS.map((r) => ({ ...r, email: r.email.toLowerCase(), department: '—' })), ...fromStaff]
}
