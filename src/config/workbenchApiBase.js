/** Node API (server/index.js). Not the Vite/preview UI port unless you add a proxy. */
const DEFAULT_API_PORT = 4002

function trimTrailingSlashes(s) {
  return String(s).replace(/\/+$/, '')
}

/**
 * Returns the JSON API base including `/api/v1` (no trailing slash).
 */
export function resolveWorkbenchApiBase() {
  let fromEnv = (import.meta.env.VITE_WORKBENCH_API_URL || import.meta.env.VITE_API_URL || '').trim()
  if (!fromEnv) {
    if (typeof window !== 'undefined' && window.location?.hostname) {
      return trimTrailingSlashes(
        `${window.location.protocol}//${window.location.hostname}:${DEFAULT_API_PORT}/api/v1`
      )
    }
    return `http://localhost:${DEFAULT_API_PORT}/api/v1`
  }

  fromEnv = trimTrailingSlashes(fromEnv)

  if (import.meta.env.DEV && typeof window !== 'undefined' && window.location?.hostname) {
    try {
      if (new URL(fromEnv).origin === window.location.origin) {
        return trimTrailingSlashes(
          `${window.location.protocol}//${window.location.hostname}:${DEFAULT_API_PORT}/api/v1`
        )
      }
    } catch {
      // leave fromEnv as-is if unparsable
    }
  }

  return fromEnv
}
