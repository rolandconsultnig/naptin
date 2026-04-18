/**
 * Owl Talk / dev chat backend (Python `dev/main.py` + Socket.IO).
 *
 * **Vite dev (default):** API + Socket.IO use **`/proxy-chat-api`** and **`/proxy-chat-socket`**
 * so the browser does not hit self-signed `https://localhost:4003` directly.
 * Uploaded files are served from Flask at **`/static/...`** (not under `/api`); **`/proxy-chat-static`** maps there — use `resolveChatAssetUrl()` for `<img src>`.
 *
 * - **VITE_CHAT_API_URL** / **VITE_CHAT_SOCKET_URL** — bypass proxy; talk to backend directly
 *   (required if chat is same-origin via Nginx; otherwise non-localhost defaults to **:4003** on this host)
 * - **VITE_CHAT_USE_VITE_PROXY=0** — disable proxy in dev (direct :4003)
 * - **VITE_CHAT_BACKEND_PROTOCOL** — `http` (default) | `https` for the proxy **target** in `vite.config.js` (use `https` only when Owl Talk runs with dev/ssl certs)
 * - **VITE_CHAT_OFFLINE=1** — no network: roster from STAFF mock, session-local messages only
 */

function chatBackendProtocol() {
  const env = import.meta.env.VITE_CHAT_BACKEND_PROTOCOL
  if (env === 'http' || env === 'https') return `${env}:`
  // Default matches local Owl Talk without dev/ssl certs (HTTP on :4003). Set VITE_CHAT_BACKEND_PROTOCOL=https if you use HTTPS.
  return 'http:'
}

function isLocalDevHost() {
  const h = window.location.hostname
  return h === 'localhost' || h === '127.0.0.1' || h === '[::1]'
}

/**
 * Host the browser uses to reach the SPA; if `location.hostname` is empty (rare),
 * derive from baked-in `VITE_*` so we never build `http://:4003/...`.
 */
function browserVisibleHost() {
  if (typeof window !== 'undefined') {
    const h = (window.location.hostname || '').trim()
    if (h) return h
  }
  const fromUrl = (raw) => {
    if (raw == null) return ''
    const s = String(raw).trim()
    if (!s) return ''
    try {
      return (new URL(s).hostname || '').trim()
    } catch {
      return ''
    }
  }
  const fromChat = fromUrl(import.meta.env.VITE_CHAT_API_URL)
  if (fromChat) return fromChat
  const fromBench = fromUrl(import.meta.env.VITE_WORKBENCH_API_URL)
  if (fromBench) return fromBench
  return '127.0.0.1'
}

/** Dev server proxies to 127.0.0.1:4003 (`vite.config.js`). */
export function usesChatViteProxy() {
  if (!import.meta.env.DEV) return false
  if (import.meta.env.VITE_CHAT_API_URL || import.meta.env.VITE_CHAT_SOCKET_URL) return false
  if (import.meta.env.VITE_CHAT_USE_VITE_PROXY === '0' || import.meta.env.VITE_CHAT_USE_VITE_PROXY === 'false')
    return false
  return true
}

/**
 * Extra `socket.io-client` options when using the Vite proxy.
 * Vite's WebSocket upgrade to an HTTPS (TLS) chat backend often fails with "Invalid frame header";
 * long-polling over the same HTTP proxy path is reliable and still carries the session cookie.
 */
export function getSocketIoClientOptions() {
  if (usesChatViteProxy()) {
    return {
      path: '/proxy-chat-socket/socket.io',
      transports: ['polling'],
      upgrade: false,
    }
  }
  // UI on :4001 + Owl on :4003 (different origins): WebSocket upgrade often fails on threading/Werkzeug or firewalls;
  // Engine.IO long-polling is reliable and still sends session cookies.
  if (!isLocalDevHost()) {
    return { transports: ['polling', 'websocket'], upgrade: true }
  }
  return { transports: ['websocket', 'polling'] }
}

/** When UI is on :4001 (vite preview) or another port, chat still runs on :4003 unless Nginx same-origin — then set VITE_CHAT_* */
function publicChatOrigin() {
  const hostname = browserVisibleHost()
  const protocol =
    typeof window !== 'undefined' && window.location?.protocol ? window.location.protocol : 'http:'
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

  const hostname = browserVisibleHost()
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

  const hostname = browserVisibleHost()
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

const IMAGE_EXT_IN_PATH = /\.(jpe?g|png|gif|webp)(\?|#|$)/i
const AUDIO_EXT_IN_PATH = /\.(webm|ogg|mp3|wav|m4a)(\?|#|$)/i

/**
 * Turn Owl Talk paths like `/static/uploads/foo.jpg` into a browser-loadable URL.
 * Uploads live on Flask's app root, not under `/api`, so we use `/proxy-chat-static` in dev (see vite.config.js).
 */
export function resolveChatAssetUrl(pathOrUrl) {
  if (pathOrUrl == null || pathOrUrl === '') return ''
  const s = String(pathOrUrl).trim()
  if (/^https?:\/\//i.test(s)) return s
  if (!s.startsWith('/')) return s
  if (usesChatViteProxy()) {
    return `${window.location.origin}/proxy-chat-static${s}`
  }
  const hostname = browserVisibleHost()
  const protocol = chatBackendProtocol()
  return `${protocol}//${hostname}:4003${s}`
}

/**
 * Single-token messages that are only a file path/URL (used when sending).
 */
export function inferChatMessageType(content) {
  const c = String(content ?? '').trim()
  if (!c) return 'text'
  if (/\s/.test(c)) return 'text'
  if (c.startsWith('/static/') || c.startsWith('http://') || c.startsWith('https://')) {
    if (IMAGE_EXT_IN_PATH.test(c)) return 'image'
    if (AUDIO_EXT_IN_PATH.test(c)) return 'audio'
  }
  return 'text'
}

/** Whether the bubble should render an <img> (image type or legacy single image path in text). */
export function messageShowsAsImage(msg) {
  if (!msg?.content) return false
  if (msg.message_type === 'image') return true
  return inferChatMessageType(String(msg.content).trim()) === 'image'
}

/** Voice / audio file path messages (Socket.IO uses message_type `audio`). */
export function messageShowsAsAudio(msg) {
  if (!msg?.content) return false
  if (msg.message_type === 'audio') return true
  return inferChatMessageType(String(msg.content).trim()) === 'audio'
}
