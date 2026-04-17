/** Matches `src/context/AuthContext.jsx` demo gate until real auth exists on the API. */
export const DEMO_PASSWORD = 'naptin2026'

export type PortalUser = {
  id: string
  name: string
  initials: string
  email: string
  role: string
  department: string
  grade: string
  staffId: string
  phone: string
  location: string
  chatUserId: number
  roleKey: string
  tenantId: string
}

type UserCore = Omit<PortalUser, 'roleKey' | 'tenantId'>

const base = (overrides: Partial<UserCore>): UserCore => ({
  id: 'USR-001',
  name: 'Adebayo Okonkwo',
  initials: 'AO',
  email: 'a.okonkwo@naptin.gov.ng',
  role: 'Senior Manager',
  department: 'Human Resource Management',
  grade: 'GL-14',
  staffId: 'NPN/HQ/2019/0421',
  phone: '+234 803 456 7890',
  location: 'Corporate HQ, Abuja',
  chatUserId: 900001,
  ...overrides,
})

const DEMO_USERS: Record<string, { roleKey: string; tenantId: string; user: UserCore }> = {
  'staff@naptin.gov.ng': {
    roleKey: 'staff',
    tenantId: 'naptin-hq',
    user: base({
      email: 'staff@naptin.gov.ng',
      name: 'Adebayo Okonkwo',
      initials: 'AO',
      role: 'Senior Manager',
      department: 'Human Resource Management',
      staffId: 'NPN/HQ/2019/0421',
      chatUserId: 900001,
    }),
  },
  'hod@naptin.gov.ng': {
    roleKey: 'hod',
    tenantId: 'naptin-hq',
    user: base({
      email: 'hod@naptin.gov.ng',
      name: 'Grace Okafor',
      initials: 'GO',
      role: 'Head of Department',
      department: 'Finance & Accounts',
      staffId: 'NPN/HQ/2020/0112',
      chatUserId: 900002,
    }),
  },
  'director@naptin.gov.ng': {
    roleKey: 'director',
    tenantId: 'naptin-hq',
    user: base({
      email: 'director@naptin.gov.ng',
      name: 'Biodun Adeyemi',
      initials: 'BA',
      role: 'Director',
      department: 'Corporate & Consultancy Services',
      staffId: 'NPN/HQ/2015/0003',
      grade: 'GL-16',
      chatUserId: 900003,
    }),
  },
  'ict@naptin.gov.ng': {
    roleKey: 'ict_admin',
    tenantId: 'lagos-campus',
    user: base({
      email: 'ict@naptin.gov.ng',
      name: 'Emmanuel Bello',
      initials: 'EB',
      role: 'Systems Administrator',
      department: 'Planning, Research & Statistics',
      staffId: 'NPN/HQ/2019/0088',
      grade: 'GL-09',
      chatUserId: 900004,
    }),
  },
  'audit@naptin.gov.ng': {
    roleKey: 'auditor',
    tenantId: 'kaduna-campus',
    user: base({
      email: 'audit@naptin.gov.ng',
      name: 'Ngozi Eze',
      initials: 'NE',
      role: 'Internal Auditor',
      department: 'Internal Audit',
      staffId: 'NPN/HQ/2020/0156',
      grade: 'GL-12',
      chatUserId: 900005,
    }),
  },
  'a.okonkwo@naptin.gov.ng': {
    roleKey: 'staff',
    tenantId: 'naptin-hq',
    user: base({
      email: 'a.okonkwo@naptin.gov.ng',
      name: 'Adebayo Okonkwo',
      initials: 'AO',
      role: 'Senior Manager',
      department: 'Human Resource Management',
      staffId: 'NPN/HQ/2019/0421',
      chatUserId: 900001,
    }),
  },
}

export type SessionPayload = {
  token: string
  roleKey: string
  user: PortalUser
}

export async function tryDemoLogin(
  email: string,
  password: string
): Promise<{ ok: true; session: SessionPayload } | { ok: false }> {
  const key = email.trim().toLowerCase()
  const entry = DEMO_USERS[key]
  await new Promise((r) => setTimeout(r, 400))
  if (!entry || password !== DEMO_PASSWORD) return { ok: false }
  const roleKey = entry.roleKey
  const user: PortalUser = {
    ...entry.user,
    roleKey,
    tenantId: entry.tenantId,
  }
  return {
    ok: true,
    session: {
      token: `naptin-demo-${Date.now()}`,
      roleKey,
      user,
    },
  }
}
