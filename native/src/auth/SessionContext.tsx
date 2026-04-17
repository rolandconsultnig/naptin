import AsyncStorage from '@react-native-async-storage/async-storage'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { tryDemoLogin, type SessionPayload } from './demoAuth'

const STORAGE_KEY = 'naptin_portal_session'

type SessionContextValue = {
  session: SessionPayload | null
  bootstrapped: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean }>
  logout: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionPayload | null>(null)
  const [bootstrapped, setBootstrapped] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY)
        if (raw && !cancelled) {
          const data = JSON.parse(raw) as SessionPayload
          if (data?.user?.email && data?.roleKey) setSession(data)
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setBootstrapped(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      const res = await tryDemoLogin(email, password)
      if (!res.ok) return { ok: false as const }
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(res.session))
      setSession(res.session)
      return { ok: true as const }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY)
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({
      session,
      bootstrapped,
      loading,
      login,
      logout,
    }),
    [session, bootstrapped, loading, login, logout]
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within SessionProvider')
  return ctx
}
