import http from './http'

export const procurementApi = {
  // ── Vendors ──────────────────────────────
  getVendors(params = {}) {
    return http.get('/procurement/vendors', { params }).then(r => r.data)
  },
  createVendor(payload) {
    return http.post('/procurement/vendors', payload).then(r => r.data)
  },
  updateVendor(id, payload) {
    return http.patch(`/procurement/vendors/${id}`, payload).then(r => r.data)
  },

  // ── Purchase Requisitions ────────────────
  getRequisitions(params = {}) {
    return http.get('/procurement/requisitions', { params }).then(r => r.data)
  },
  createRequisition(payload) {
    return http.post('/procurement/requisitions', payload).then(r => r.data)
  },
  approveRequisition(id) {
    return http.post(`/procurement/requisitions/${id}/approve`).then(r => r.data)
  },

  // ── Tenders ──────────────────────────────
  getTenders(params = {}) {
    return http.get('/procurement/tenders', { params }).then(r => r.data)
  },
  createTender(payload) {
    return http.post('/procurement/tenders', payload).then(r => r.data)
  },
  submitBid(tenderId, payload) {
    return http.post(`/procurement/tenders/${tenderId}/bids`, payload).then(r => r.data)
  },
  evaluateBids(tenderId) {
    return http.post(`/procurement/tenders/${tenderId}/evaluate`).then(r => r.data)
  },

  // ── Purchase Orders ──────────────────────
  getPurchaseOrders(params = {}) {
    return http.get('/procurement/purchase-orders', { params }).then(r => r.data)
  },
  createPurchaseOrder(payload) {
    return http.post('/procurement/purchase-orders', payload).then(r => r.data)
  },
  approvePurchaseOrder(id, payload = {}) {
    return http.post(`/procurement/purchase-orders/${id}/approve`, payload).then(r => r.data)
  },

  // ── Goods Received ───────────────────────
  postGoodsReceived(payload) {
    return http.post('/procurement/goods-received', payload).then(r => r.data)
  },
  getGoodsReceived(params = {}) {
    return http.get('/procurement/goods-received', { params }).then(r => r.data)
  },

  // ── Dashboard / Summary ──────────────────
  getSummary() {
    return http.get('/procurement/summary').then(r => r.data)
  },
}
