/**
 * Node API base (includes `/api/v1`). Override per machine:
 * - Android emulator → host PC is `http://10.0.2.2:4002/api/v1`
 * - Physical device → your LAN IP or public URL, e.g. `http://192.168.0.10:4002/api/v1`
 */
const raw = process.env.EXPO_PUBLIC_API_URL?.trim()
export const API_BASE_URL = (raw || 'http://10.0.2.2:4002/api/v1').replace(/\/$/, '')
