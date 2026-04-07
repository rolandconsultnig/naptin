import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { getRoleOverride } from '../admin/userRolesStore'
import { setCurrentTenantId } from '../admin/tenantStore'

const STORAGE_KEY = 'naptin_portal_session'
const DEMO_PASSWORD = 'naptin2026'

const AuthContext = createContext(null)

const base = (overrides) => ({
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
  /** Numeric id for integrated Owl Talk / dev chat when backend expects integer user ids */
  chatUserId: 900001,
  ...overrides,
})

/** Demo directory: email (lowercase) → role + profile */
const DEMO_USERS = {
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

function readSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data?.user?.email || !data?.roleKey) return null
    return data
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(false)
  const [bootstrapped, setBootstrapped] = useState(false)

  useEffect(() => {
    setSession(readSession())
    setBootstrapped(true)
  }, [])

  const login = useCallback(async (email, password) => {
    const key = email.trim().toLowerCase()
    const entry = DEMO_USERS[key]
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    if (!entry || password !== DEMO_PASSWORD) {
      setLoading(false)
      return { ok: false }
    }
    const roleKey = getRoleOverride(key) || entry.roleKey
    const payload = {
      token: 'naptin-demo-' + Date.now(),
      roleKey,
      user: { ...entry.user, roleKey, tenantId: entry.tenantId || 'naptin-hq' },
    }
    setCurrentTenantId(payload.user.tenantId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    setSession(payload)
    setLoading(false)
    return { ok: true, user: payload.user }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      roleKey: session?.roleKey ?? null,
      token: session?.token ?? null,
      loading,
      bootstrapped,
      login,
      logout,
    }),
    [session, loading, bootstrapped, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
