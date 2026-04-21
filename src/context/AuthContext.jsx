import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { getRoleOverride } from '../admin/userRolesStore'
import { setCurrentTenantId } from '../admin/tenantStore'
import { hrmsApi } from '../services/hrmsService'

const STORAGE_KEY = 'naptin_portal_session'
const PROFILE_OVERRIDES_KEY = 'naptin_portal_profile_overrides'
const DEMO_PASSWORD = 'naptin2026'

const PROFILE_OVERRIDE_FIELDS = ['name', 'phone', 'location', 'bio', 'profilePicture', 'initials']

function initialsFromName(name) {
  const n = String(name || '').trim()
  if (!n) return 'NP'
  const parts = n.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return n.slice(0, 2).toUpperCase()
}

function readProfileOverrides() {
  try {
    const raw = localStorage.getItem(PROFILE_OVERRIDES_KEY)
    if (!raw) return {}
    const data = JSON.parse(raw)
    return data && typeof data === 'object' ? data : {}
  } catch {
    return {}
  }
}

function mergeProfileOverrides(email, user) {
  if (!email || !user) return user
  const all = readProfileOverrides()
  const o = all[String(email).trim().toLowerCase()]
  if (!o) return user
  const next = { ...user }
  for (const k of PROFILE_OVERRIDE_FIELDS) {
    if (o[k] !== undefined && o[k] !== null) next[k] = o[k]
  }
  return next
}

function ensureUsername(user) {
  if (!user) return user
  if (user.username) return user
  const e = user.email
  if (e && String(e).includes('@')) {
    return { ...user, username: String(e).split('@')[0] }
  }
  return { ...user, username: 'user' }
}

const AuthContext = createContext(null)

const base = (overrides) => ({
  id: 'USR-001',
  username: 'user',
  name: 'Adebayo Okonkwo',
  initials: 'AO',
  email: 'a.okonkwo@naptin.gov.ng',
  role: 'Senior Manager',
  department: 'Human Resource Management',
  grade: 'GL-14',
  staffId: 'NPN/HQ/2019/0421',
  phone: '+234 803 456 7890',
  location: 'Corporate HQ, Abuja',
  bio: '',
  profilePicture: null,
  /** Numeric id for integrated Owl Talk / dev chat when backend expects integer user ids */
  chatUserId: 900001,
  roleLevel: 1,
  ...overrides,
})

/** Demo directory: email (lowercase) → role + profile */
const DEMO_USERS = {
  'staff@naptin.gov.ng': {
    roleKey: 'staff',
    tenantId: 'naptin-hq',
    user: base({
      username: 'adebayo.okonkwo',
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
      username: 'grace.okafor',
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
      username: 'biodun.adeyemi',
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
      username: 'emmanuel.bello',
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
      username: 'ngozi.eze',
      email: 'audit@naptin.gov.ng',
      name: 'Ngozi Eze',
      initials: 'NE',
      role: 'Internal Auditor',
      department: 'Internal Audit',
      staffId: 'NPN/HQ/2020/0156',
      grade: 'GL-12',
      chatUserId: 900005,
      roleLevel: 3,
    }),
  },
  'superadmin@naptin.gov.ng': {
    roleKey: 'super_admin',
    tenantId: 'naptin-hq',
    user: base({
      username: 'chief.admin',
      email: 'superadmin@naptin.gov.ng',
      name: 'Platform Super Administrator',
      initials: 'SA',
      role: 'Super Administrator',
      department: 'ICT',
      staffId: 'NPN/HQ/2013/0001',
      grade: 'GL-17',
      chatUserId: 900006,
      roleLevel: 5,
    }),
  },
  'a.okonkwo@naptin.gov.ng': {
    roleKey: 'staff',
    tenantId: 'naptin-hq',
    user: base({
      username: 'a.okonkwo',
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
    const email = String(data.user.email).trim().toLowerCase()
    data.user = ensureUsername(mergeProfileOverrides(email, data.user))
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
    const baseUser = { ...entry.user, roleKey, tenantId: entry.tenantId || 'naptin-hq' }
    const user = ensureUsername(mergeProfileOverrides(key, baseUser))
    const payload = {
      token: 'naptin-demo-' + Date.now(),
      roleKey,
      user,
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

  const updateProfile = useCallback(async (updates) => {
    if (!updates || typeof updates !== 'object') return { ok: true }
    const { username: _ignoredUsername, ...rest } = updates
    const allowed = ['name', 'phone', 'location', 'bio', 'profilePicture']

    let syncOk = true
    let employeePayload = null
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const session = raw ? JSON.parse(raw) : null
      const em = String(session?.user?.email || '').trim().toLowerCase()
      if (em) {
        const body = { email: em }
        if ('name' in rest) body.displayName = typeof rest.name === 'string' ? rest.name.trim() : ''
        if ('phone' in rest) body.phone = rest.phone === '' || rest.phone == null ? null : String(rest.phone).trim()
        if ('location' in rest) body.location = rest.location === '' || rest.location == null ? null : String(rest.location).trim()
        if ('bio' in rest) body.bio = typeof rest.bio === 'string' ? rest.bio : ''
        if ('profilePicture' in rest) body.profilePhotoUrl = rest.profilePicture
        const keys = ['displayName', 'phone', 'location', 'bio', 'profilePhotoUrl']
        const hasPortalPayload = keys.some((k) => k in body)
        if (hasPortalPayload) {
          employeePayload = await hrmsApi.patchMyPortalProfile(body)
        }
      }
    } catch (e) {
      syncOk = false
      console.warn('[Auth] HRMS portal profile sync failed (is the API running and DB migrated?)', e)
    }

    setSession((prev) => {
      if (!prev?.user?.email) return prev
      const email = String(prev.user.email).trim().toLowerCase()
      const nextUser = { ...prev.user }
      for (const key of allowed) {
        if (key in rest) {
          const v = rest[key]
          const clearToNull = v === '' && (key === 'phone' || key === 'location' || key === 'profilePicture')
          nextUser[key] = clearToNull ? null : v
        }
      }
      if ('name' in rest && typeof rest.name === 'string') {
        nextUser.initials = initialsFromName(nextUser.name)
      }
      const storedPatch = {}
      for (const key of allowed) {
        if (key in rest) storedPatch[key] = nextUser[key]
      }
      if ('name' in rest) storedPatch.initials = nextUser.initials
      const all = readProfileOverrides()
      all[email] = { ...(all[email] || {}), ...storedPatch }
      try {
        localStorage.setItem(PROFILE_OVERRIDES_KEY, JSON.stringify(all))
      } catch (e) {
        console.warn('[Auth] Could not persist profile overrides (storage full?)', e)
      }
      const next = { ...prev, user: nextUser }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch (e) {
        console.warn('[Auth] Could not persist session', e)
      }
      return next
    })

    return { ok: syncOk, employee: employeePayload }
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
      updateProfile,
    }),
    [session, loading, bootstrapped, login, logout, updateProfile]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
