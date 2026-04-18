import http from './http'

export const internalAuditApi = {
  getDashboard() {
    return http.get('/internal-audit/dashboard').then((r) => r.data)
  },

  getEngagements(params = {}) {
    return http.get('/internal-audit/engagements', { params }).then((r) => r.data)
  },

  createEngagement(payload) {
    return http.post('/internal-audit/engagements', payload).then((r) => r.data)
  },

  updateEngagement(id, payload) {
    return http.patch(`/internal-audit/engagements/${id}`, payload).then((r) => r.data)
  },

  getFindings(params = {}) {
    return http.get('/internal-audit/findings', { params }).then((r) => r.data)
  },

  createFinding(payload) {
    return http.post('/internal-audit/findings', payload).then((r) => r.data)
  },

  updateFinding(id, payload) {
    return http.patch(`/internal-audit/findings/${id}`, payload).then((r) => r.data)
  },

  getFindingActions(findingId) {
    return http.get(`/internal-audit/findings/${findingId}/actions`).then((r) => r.data)
  },

  addFindingAction(findingId, payload) {
    return http.post(`/internal-audit/findings/${findingId}/actions`, payload).then((r) => r.data)
  },

  getCrossModuleExceptions(module, params = {}) {
    return http.get('/internal-audit/cross-module/exceptions', { params: { module, ...params } }).then((r) => r.data)
  },

  getCollaborationMatrix() {
    return http.get('/internal-audit/collaboration-matrix').then((r) => r.data)
  },
}
