import axios from 'axios'

function resolveApiBase() {
  if (import.meta.env.VITE_WORKBENCH_API_URL) return import.meta.env.VITE_WORKBENCH_API_URL
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:4002/api/v1`
  }
  return 'http://localhost:4002/api/v1'
}

const baseURL = resolveApiBase()

const http = axios.create({
  baseURL,
  timeout: 15000,
})

export const workbenchApi = {
  summary: () => http.get('/workbench/summary').then((r) => r.data),
  clients: () => http.get('/workbench/clients').then((r) => r.data),

  onboarding: () => http.get('/workbench/onboarding').then((r) => r.data),
  createOnboarding: (payload) => http.post('/workbench/onboarding', payload).then((r) => r.data),
  onboardingTasks: (id) => http.get(`/workbench/onboarding/${id}/tasks`).then((r) => r.data),
  setOnboardingTask: (taskId, status) => http.patch(`/workbench/onboarding/tasks/${taskId}`, { status }).then((r) => r.data),

  healthConfig: () => http.get('/workbench/health/config').then((r) => r.data),
  updateHealthConfig: (payload) => http.patch('/workbench/health/config', payload).then((r) => r.data),
  healthScores: () => http.get('/workbench/health').then((r) => r.data),
  recalcHealth: (clientId, payload) => http.post(`/workbench/health/${clientId}/recalculate`, payload).then((r) => r.data),

  opportunities: () => http.get('/workbench/opportunities').then((r) => r.data),
  createOpportunity: (payload) => http.post('/workbench/opportunities', payload).then((r) => r.data),
  setOpportunity: (id, payload) => http.patch(`/workbench/opportunities/${id}`, payload).then((r) => r.data),

  marketCriteria: () => http.get('/workbench/markets/criteria').then((r) => r.data),
  updateMarketCriteria: (payload) => http.patch('/workbench/markets/criteria', payload).then((r) => r.data),
  marketCandidates: () => http.get('/workbench/markets/candidates').then((r) => r.data),
  createMarketCandidate: (payload) => http.post('/workbench/markets/candidates', payload).then((r) => r.data),
  startDeepDive: (id) => http.post(`/workbench/markets/candidates/${id}/deep-dive`, {}).then((r) => r.data),
  deepDiveTasks: () => http.get('/workbench/markets/deep-dive-tasks').then((r) => r.data),

  pilots: () => http.get('/workbench/pilots').then((r) => r.data),
  createPilot: (payload) => http.post('/workbench/pilots', payload).then((r) => r.data),
  addPilotMetrics: (id, payload) => http.post(`/workbench/pilots/${id}/metrics`, payload).then((r) => r.data),
  setPilotDecision: (id, decision) => http.patch(`/workbench/pilots/${id}/decision`, { decision }).then((r) => r.data),

  feedback: () => http.get('/workbench/feedback').then((r) => r.data),
  createFeedback: (payload) => http.post('/workbench/feedback', payload).then((r) => r.data),
  setFeedback: (id, payload) => http.patch(`/workbench/feedback/${id}`, payload).then((r) => r.data),

  renewals: () => http.get('/workbench/renewals').then((r) => r.data),
  createRenewal: (payload) => http.post('/workbench/renewals', payload).then((r) => r.data),
  setRenewalStatus: (id, payload) => http.patch(`/workbench/renewals/${id}/status`, payload).then((r) => r.data),
}

