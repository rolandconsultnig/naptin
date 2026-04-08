/**
 * Owl Talk / dev chat backend (Python `dev/main.py` + Socket.IO).
 *
 * **Vite dev (default):** API + Socket.IO use **`/proxy-chat-api`** and **`/proxy-chat-socket`**
 * so the browser does not hit self-signed `https://localhost:4003` directly.
 *
 * - **VITE_CHAT_API_URL** / **VITE_CHAT_SOCKET_URL** — bypass proxy; talk to backend directly
 *   (required if chat is same-origin via Nginx; otherwise non-localhost defaults to **:4003** on this host)
 * - **VITE_CHAT_USE_VITE_PROXY=0** — disable proxy in dev (direct :4003)
 * - **VITE_CHAT_BACKEND_PROTOCOL** — `http` | `https` for the proxy **target** in `vite.config.js`
 * - **VITE_CHAT_OFFLINE=1** — no network: roster from STAFF mock, session-local messages only
 */

function chatBackendProtocol() {
  const env = import.meta.env.VITE_CHAT_BACKEND_PROTOCOL
  if (env === 'http' || env === 'https') return `${env}:`
  return 'https:'
}

function isLocalDevHost() {
  const h = window.location.hostname
  return h === 'localhost' || h === '127.0.0.1' || h === '[::1]'
}

/** Dev server proxies to 127.0.0.1:4003 (`vite.config.js`). */
export function usesChatViteProxy() {
  if (!import.meta.env.DEV) return false
  if (import.meta.env.VITE_CHAT_API_URL || import.meta.env.VITE_CHAT_SOCKET_URL) return false
  if (import.meta.env.VITE_CHAT_USE_VITE_PROXY === '0' || import.meta.env.VITE_CHAT_USE_VITE_PROXY === 'false')
    return false
  return true
}

/** Extra `socket.io-client` options when using the Vite proxy. */
export function getSocketIoClientOptions() {
  if (usesChatViteProxy()) {
    return { path: '/proxy-chat-socket/socket.io' }
  }
  return {}
}

/** When UI is on :4001 (vite preview) or another port, chat still runs on :4003 unless Nginx same-origin — then set VITE_CHAT_* */
function publicChatOrigin() {
  const hostname = window.location.hostname
  const protocol = window.location.protocol || 'http:'
  return `${protocol}//${hostname}:4003`
}

export function getApiBase() {
  const fromEnv = import.meta.env.VITE_CHAT_API_URL
  if (fromEnv) return String(fromEnv).replace(/\/$/, '')

  if (usesChatViteProxy()) {
    return `${window.location.origin}/proxy-chat-api`
  }

  if (!isLocalDevHost()) {
    return `${publicChatOrigin()}/api`
  }

  const hostname = window.location.hostname
  const protocol = chatBackendProtocol()
  return `${protocol}//${hostname}:4003/api`
}

export function getSocketUrl() {
  const fromEnv = import.meta.env.VITE_CHAT_SOCKET_URL
  if (fromEnv) return String(fromEnv).replace(/\/$/, '')

  if (usesChatViteProxy()) {
    return window.location.origin
  }

  if (!isLocalDevHost()) {
    return publicChatOrigin()
  }

  const hostname = window.location.hostname
  const protocol = chatBackendProtocol()
  return `${protocol}//${hostname}:4003`
}

const CHAT_RUNTIME_OFFLINE_KEY = 'naptin.chat.runtimeOffline'

function getRuntimeOfflineFlag() {
  try {
    return window.sessionStorage.getItem(CHAT_RUNTIME_OFFLINE_KEY) === '1'
  } catch {
    return false
  }
}

export function enableChatRuntimeOffline() {
  try {
    window.sessionStorage.setItem(CHAT_RUNTIME_OFFLINE_KEY, '1')
  } catch {
    // ignore storage errors
  }
}

export function clearChatRuntimeOffline() {
  try {
    window.sessionStorage.removeItem(CHAT_RUNTIME_OFFLINE_KEY)
  } catch {
    // ignore storage errors
  }
}

/** Session-local prototype only (no Socket.IO / REST attempts). */
export function isChatEnvForcedOffline() {
  return import.meta.env.VITE_CHAT_OFFLINE === '1' || import.meta.env.VITE_CHAT_OFFLINE === 'true'
}

/** Session-local prototype only when explicitly forced by env. */
export function isChatForcedOffline() {
  return isChatEnvForcedOffline() || getRuntimeOfflineFlag()
}

/** Try live chat server (default unless VITE_CHAT_OFFLINE). */
export function hasChatBackend() {
  return !isChatForcedOffline()
}
