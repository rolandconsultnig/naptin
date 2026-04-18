import axios from 'axios'
import { getApiBase } from './chatConfig'

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase()
}

function samePortalIdentity(owlUser, portalUser) {
  const portalEmail = normalizeEmail(portalUser?.email)
  if (!portalEmail) return true

  const owlEmail = normalizeEmail(owlUser?.email)
  if (owlEmail) return owlEmail === portalEmail

  const portalLocal = portalEmail.split('@')[0]
  return String(owlUser?.username || '').trim().toLowerCase() === portalLocal
}

/**
 * Ensure the browser has a valid Owl Talk Flask session (cookie) before opening Socket.IO.
 * Returns the chat backend user row (includes real numeric `id` from PostgreSQL).
 */
export async function ensureOwlTalkSession(portalUser, options = {}) {
  const { signal } = options
  const cfg = { withCredentials: true, ...(signal ? { signal } : {}) }
  const base = getApiBase()

  try {
    const me = await axios.get(`${base}/me`, cfg)
    if (me.data?.user) {
      if (samePortalIdentity(me.data.user, portalUser)) {
        return { ok: true, user: me.data.user }
      }
      try {
        await axios.post(`${base}/logout`, {}, cfg)
      } catch {
        /* ignore logout failure; continue with explicit login/register flow */
      }
    }
  } catch (e) {
    if (e?.code === 'ERR_CANCELED') throw e
  }

  const username = portalUser?.name || portalUser?.email?.split('@')[0] || 'naptin-user'
  const email = portalUser?.email || `${username}@naptin.gov.ng`
  let hash = 0
  for (let i = 0; i < email.length; i++) hash = (Math.imul(31, hash) + email.charCodeAt(i)) | 0
  const password = `naptin-${Math.abs(hash).toString(36)}`

  try {
    const login = await axios.post(`${base}/login`, { username, email, password }, cfg)
    if (login.data?.user) return { ok: true, user: login.data.user }
  } catch (e) {
    if (e?.code === 'ERR_CANCELED') throw e
  }

  try {
    const reg = await axios.post(`${base}/register`, { username, email, password }, cfg)
    if (reg.data?.user) return { ok: true, user: reg.data.user }
  } catch (e) {
    if (e?.code === 'ERR_CANCELED') throw e
    // User may exist from seed / old password — align to portal deterministic secret when server allows it
    try {
      const sync = await axios.post(`${base}/portal-sync`, { email, password }, cfg)
      if (sync.data?.user) return { ok: true, user: sync.data.user }
    } catch {
      /* ignore — try /me below */
    }
  }

  try {
    const me2 = await axios.get(`${base}/me`, cfg)
    if (me2.data?.user) return { ok: true, user: me2.data.user }
  } catch (e) {
    if (e?.code === 'ERR_CANCELED') throw e
  }

  return { ok: false, user: null }
}
