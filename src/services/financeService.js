import http from './http'

export const financeApi = {
  // ── Chart of Accounts ────────────────────
  getChartOfAccounts(params = {}) {
    return http.get('/finance/accounts', { params }).then(r => r.data)
  },
  createAccount(payload) {
    return http.post('/finance/accounts', payload).then(r => r.data)
  },
  updateAccount(id, payload) {
    return http.patch(`/finance/accounts/${id}`, payload).then(r => r.data)
  },

  // ── Journal Entries ──────────────────────
  getJournalEntries(params = {}) {
    return http.get('/finance/journals', { params }).then(r => r.data)
  },
  createJournalEntry(payload) {
    return http.post('/finance/journals', payload).then(r => r.data)
  },
  postJournalEntry(id) {
    return http.post(`/finance/journals/${id}/post`).then(r => r.data)
  },
  reverseJournalEntry(id) {
    return http.post(`/finance/journals/${id}/reverse`).then(r => r.data)
  },

  // ── AP (Accounts Payable) ────────────────
  getAPInvoices(params = {}) {
    return http.get('/finance/ap/invoices', { params }).then(r => r.data)
  },
  createAPInvoice(payload) {
    return http.post('/finance/ap/invoices', payload).then(r => r.data)
  },
  approveAPInvoice(id) {
    return http.post(`/finance/ap/invoices/${id}/approve`).then(r => r.data)
  },
  recordAPPayment(invoiceId, payload) {
    return http.post(`/finance/ap/invoices/${invoiceId}/pay`, payload).then(r => r.data)
  },

  // ── AR (Accounts Receivable) ─────────────
  getARInvoices(params = {}) {
    return http.get('/finance/ar/invoices', { params }).then(r => r.data)
  },
  createARInvoice(payload) {
    return http.post('/finance/ar/invoices', payload).then(r => r.data)
  },
  recordARReceipt(invoiceId, payload) {
    return http.post(`/finance/ar/invoices/${invoiceId}/receipt`, payload).then(r => r.data)
  },

  // ── Budget ───────────────────────────────
  getBudgetHeads(fiscalYearId) {
    return http.get('/finance/budget', { params: { fiscalYearId } }).then(r => r.data)
  },
  createBudgetHead(payload) {
    return http.post('/finance/budget', payload).then(r => r.data)
  },
  updateBudgetHead(id, payload) {
    return http.patch(`/finance/budget/${id}`, payload).then(r => r.data)
  },
  getFiscalYears() {
    return http.get('/finance/fiscal-years').then(r => r.data)
  },

  // ── Budget Workbench (Consolidation & Virement) ───────────────
  getBudgetWorkbenchSubmissions(params = {}) {
    return http.get('/finance/budget-workbench/submissions', { params }).then(r => r.data)
  },
  approveBudgetSubmission(id, payload = {}) {
    return http.post(`/finance/budget-workbench/submissions/${id}/approve`, payload).then(r => r.data)
  },
  returnBudgetSubmission(id, payload) {
    return http.post(`/finance/budget-workbench/submissions/${id}/return`, payload).then(r => r.data)
  },
  approveAllBudgetSubmissions(payload = {}) {
    return http.post('/finance/budget-workbench/submissions/approve-all', payload).then(r => r.data)
  },
  lockBudgetSubmissions(payload = {}) {
    return http.post('/finance/budget-workbench/submissions/lock', payload).then(r => r.data)
  },
  getBudgetVirements(params = {}) {
    return http.get('/finance/budget-workbench/virements', { params }).then(r => r.data)
  },
  createBudgetVirement(payload) {
    return http.post('/finance/budget-workbench/virements', payload).then(r => r.data)
  },
  approveBudgetVirement(id, payload = {}) {
    return http.post(`/finance/budget-workbench/virements/${id}/approve`, payload).then(r => r.data)
  },
  rejectBudgetVirement(id, payload) {
    return http.post(`/finance/budget-workbench/virements/${id}/reject`, payload).then(r => r.data)
  },

  // ── Treasury ─────────────────────────────
  getBankAccounts() {
    return http.get('/finance/treasury/bank-accounts').then(r => r.data)
  },
  getBankTransactions(accountId, params = {}) {
    return http.get(`/finance/treasury/bank-accounts/${accountId}/transactions`, { params }).then(r => r.data)
  },
  createBankTransaction(accountId, payload) {
    return http.post(`/finance/treasury/bank-accounts/${accountId}/transactions`, payload).then(r => r.data)
  },
  reconcileTransaction(transactionId, journalId) {
    return http.post(`/finance/treasury/transactions/${transactionId}/reconcile`, { journalId }).then(r => r.data)
  },

  // ── Fixed Assets ─────────────────────────
  getFixedAssets(params = {}) {
    return http.get('/finance/assets', { params }).then(r => r.data)
  },
  createFixedAsset(payload) {
    return http.post('/finance/assets', payload).then(r => r.data)
  },
  depreciateAssets(period) {
    return http.post('/finance/assets/depreciate', { period }).then(r => r.data)
  },

  getOverviewSummary() {
    return http.get('/finance/overview-summary').then((r) => r.data)
  },

  // ── Reports ──────────────────────────────
  getTrialBalance(params = {}) {
    return http.get('/finance/reports/trial-balance', { params }).then(r => r.data)
  },
  getIncomeStatement(params = {}) {
    return http.get('/finance/reports/income-statement', { params }).then(r => r.data)
  },
  getBalanceSheet(params = {}) {
    return http.get('/finance/reports/balance-sheet', { params }).then(r => r.data)
  },
  getCashFlow(params = {}) {
    return http.get('/finance/reports/cash-flow', { params }).then(r => r.data)
  },

  // ── Vendors (shared with Procurement) ────
  getVendors(params = {}) {
    return http.get('/finance/vendors', { params }).then(r => r.data)
  },
  getCustomers(params = {}) {
    return http.get('/finance/customers', { params }).then(r => r.data)
  },

  // ── Cash Advances ─────────────────────────
  getCashAdvances(params = {}) {
    return http.get('/finance/cash-advances', { params }).then(r => r.data)
  },
  getCashAdvanceDashboard() {
    return http.get('/finance/cash-advances/dashboard').then(r => r.data)
  },
  getCashAdvance(id) {
    return http.get(`/finance/cash-advances/${id}`).then(r => r.data)
  },
  createCashAdvance(payload) {
    return http.post('/finance/cash-advances', payload).then(r => r.data)
  },
  approveManagerCashAdvance(id, payload = {}) {
    return http.post(`/finance/cash-advances/${id}/approve-manager`, payload).then(r => r.data)
  },
  approveFinanceCashAdvance(id, payload = {}) {
    return http.post(`/finance/cash-advances/${id}/approve-finance`, payload).then(r => r.data)
  },
  rejectCashAdvance(id, payload) {
    return http.post(`/finance/cash-advances/${id}/reject`, payload).then(r => r.data)
  },
  disburseCashAdvance(id, payload) {
    return http.post(`/finance/cash-advances/${id}/disburse`, payload).then(r => r.data)
  },
  retireCashAdvance(id, payload) {
    return http.post(`/finance/cash-advances/${id}/retire`, payload).then(r => r.data)
  },
  settleCashAdvance(id, payload) {
    return http.post(`/finance/cash-advances/${id}/settle`, payload).then(r => r.data)
  },
  getCashAdvanceLog(id) {
    return http.get(`/finance/cash-advances/${id}/log`).then(r => r.data)
  },
}
