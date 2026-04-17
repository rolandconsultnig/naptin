import http from './http'

export const ictApi = {
  // ── Service Desk ─────────────────────────
  getTickets(params = {}) {
    return http.get('/ict/tickets', { params }).then(r => r.data)
  },
  createTicket(payload) {
    return http.post('/ict/tickets', payload).then(r => r.data)
  },
  updateTicket(id, payload) {
    return http.patch(`/ict/tickets/${id}`, payload).then(r => r.data)
  },
  resolveTicket(id, payload) {
    return http.post(`/ict/tickets/${id}/resolve`, payload).then(r => r.data)
  },

  // ── IT Assets ────────────────────────────
  getAssets(params = {}) {
    return http.get('/ict/assets', { params }).then(r => r.data)
  },
  createAsset(payload) {
    return http.post('/ict/assets', payload).then(r => r.data)
  },
  updateAsset(id, payload) {
    return http.patch(`/ict/assets/${id}`, payload).then(r => r.data)
  },

  // ── Change Management ────────────────────
  getChangeRequests(params = {}) {
    return http.get('/ict/change-requests', { params }).then(r => r.data)
  },
  createChangeRequest(payload) {
    return http.post('/ict/change-requests', payload).then(r => r.data)
  },
  approveChangeRequest(id) {
    return http.post(`/ict/change-requests/${id}/approve`).then(r => r.data)
  },

  // ── Systems / Infrastructure ─────────────
  getSystems() {
    return http.get('/ict/systems').then(r => r.data)
  },
  updateSystemStatus(id, payload) {
    return http.patch(`/ict/systems/${id}`, payload).then(r => r.data)
  },

  // ── Dashboard ────────────────────────────
  getSummary() {
    return http.get('/ict/summary').then(r => r.data)
  },
}
