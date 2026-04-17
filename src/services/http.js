import axios from 'axios'
import { resolveWorkbenchApiBase } from '../config/workbenchApiBase'

const http = axios.create({
  baseURL: resolveWorkbenchApiBase(),
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((config) => {
  const raw = localStorage.getItem('naptin_portal_session')
  if (raw) {
    try {
      const session = JSON.parse(raw)
      if (session?.token) {
        config.headers.Authorization = `Bearer ${session.token}`
      }
    } catch {
      // silent
    }
  }
  return config
})

http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('naptin_portal_session')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default http
