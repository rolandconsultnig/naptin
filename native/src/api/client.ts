import { API_BASE_URL } from '../config'

export type HealthResponse = { ok: boolean; db?: string }

export async function fetchApiHealth(token: string | null): Promise<HealthResponse> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${API_BASE_URL}/health`, { headers })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<HealthResponse>
}
