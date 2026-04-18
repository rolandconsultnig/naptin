import http from './http'

export const hrmsApi = {
  // ── Employees ────────────────────────────
  getEmployees(params = {}) {
    return http.get('/hrms/employees', { params }).then(r => r.data)
  },
  getEmployee(id) {
    return http.get(`/hrms/employees/${id}`).then(r => r.data)
  },
  createEmployee(payload) {
    return http.post('/hrms/employees', payload).then(r => r.data)
  },
  updateEmployee(id, payload) {
    return http.patch(`/hrms/employees/${id}`, payload).then(r => r.data)
  },
  /** Persists portal fields on hr_employees (matched by email). Username is not updated server-side. */
  patchMyPortalProfile(payload) {
    return http.patch('/hrms/profile/me', payload).then((r) => r.data)
  },
  getEmployeeDocuments(employeeId) {
    return http.get(`/hrms/employees/${employeeId}/documents`).then(r => r.data)
  },
  createEmployeeDocument(employeeId, payload) {
    return http.post(`/hrms/employees/${employeeId}/documents`, payload).then(r => r.data)
  },

  // ── Org Chart ────────────────────────────
  getOrgChart() {
    return http.get('/hrms/org-chart').then(r => r.data)
  },
  getDepartments() {
    return http.get('/hrms/departments').then(r => r.data)
  },

  // ── Leave ────────────────────────────────
  getLeaveTypes() {
    return http.get('/hrms/leave/types').then(r => r.data)
  },
  getLeaveRequests(params = {}) {
    return http.get('/hrms/leave/requests', { params }).then(r => r.data)
  },
  createLeaveRequest(payload) {
    return http.post('/hrms/leave/requests', payload).then(r => r.data)
  },
  reviewLeaveRequest(id, payload) {
    return http.patch(`/hrms/leave/requests/${id}/review`, payload).then(r => r.data)
  },
  getLeaveBalances(employeeId, year) {
    return http.get(`/hrms/leave/balances/${employeeId}`, { params: { year } }).then(r => r.data)
  },

  // ── Attendance ───────────────────────────
  getAttendance(params = {}) {
    return http.get('/hrms/attendance', { params }).then(r => r.data)
  },
  getAttendanceSummary() {
    return http.get('/hrms/attendance/summary').then(r => r.data)
  },
  clockIn(payload) {
    return http.post('/hrms/attendance/clock-in', payload).then(r => r.data)
  },
  clockOut(payload) {
    return http.post('/hrms/attendance/clock-out', payload).then(r => r.data)
  },

  // ── Payroll ──────────────────────────────
  getPayrollPeriods() {
    return http.get('/hrms/payroll/periods').then(r => r.data)
  },
  createPayrollPeriod(payload) {
    return http.post('/hrms/payroll/periods', payload).then(r => r.data)
  },
  runPayroll(periodId) {
    return http.post(`/hrms/payroll/periods/${periodId}/run`).then(r => r.data)
  },
  approvePayroll(periodId) {
    return http.post(`/hrms/payroll/periods/${periodId}/approve`).then(r => r.data)
  },
  getPayslips(periodId) {
    return http.get(`/hrms/payroll/periods/${periodId}/payslips`).then(r => r.data)
  },
  getMyPayslips(params = {}) {
    return http.get('/hrms/payroll/my-payslips', { params }).then(r => r.data)
  },

  // ── Recruitment ──────────────────────────
  getJobOpenings(params = {}) {
    return http.get('/hrms/recruitment/jobs', { params }).then(r => r.data)
  },
  createJobOpening(payload) {
    return http.post('/hrms/recruitment/jobs', payload).then(r => r.data)
  },
  updateJobOpening(id, payload) {
    return http.patch(`/hrms/recruitment/jobs/${id}`, payload).then(r => r.data)
  },
  getCandidates(jobId) {
    return http.get(`/hrms/recruitment/jobs/${jobId}/candidates`).then(r => r.data)
  },
  addCandidate(jobId, payload) {
    return http.post(`/hrms/recruitment/jobs/${jobId}/candidates`, payload).then(r => r.data)
  },
  updateCandidateStage(candidateId, payload) {
    return http.patch(`/hrms/recruitment/candidates/${candidateId}/stage`, payload).then(r => r.data)
  },
  scheduleInterview(candidateId, payload) {
    return http.post(`/hrms/recruitment/candidates/${candidateId}/interviews`, payload).then(r => r.data)
  },
  getInterviews(params = {}) {
    return http.get('/hrms/recruitment/interviews', { params }).then(r => r.data)
  },

  // ── Performance ──────────────────────────
  getReviewCycles() {
    return http.get('/hrms/performance/cycles').then(r => r.data)
  },
  createReviewCycle(payload) {
    return http.post('/hrms/performance/cycles', payload).then(r => r.data)
  },
  getGoals(params = {}) {
    return http.get('/hrms/performance/goals', { params }).then(r => r.data)
  },
  createGoal(payload) {
    return http.post('/hrms/performance/goals', payload).then(r => r.data)
  },
  updateGoal(id, payload) {
    return http.patch(`/hrms/performance/goals/${id}`, payload).then(r => r.data)
  },
  getReviews(params = {}) {
    return http.get('/hrms/performance/reviews', { params }).then(r => r.data)
  },
  submitReview(payload) {
    return http.post('/hrms/performance/reviews', payload).then(r => r.data)
  },

  // ── Training ─────────────────────────────
  getCourses(params = {}) {
    return http.get('/hrms/training/courses', { params }).then(r => r.data)
  },
  createCourse(payload) {
    return http.post('/hrms/training/courses', payload).then(r => r.data)
  },
  getSessions(courseId) {
    return http.get(`/hrms/training/courses/${courseId}/sessions`).then(r => r.data)
  },
  createSession(courseId, payload) {
    return http.post(`/hrms/training/courses/${courseId}/sessions`, payload).then(r => r.data)
  },
  enrollInSession(sessionId, payload) {
    return http.post(`/hrms/training/sessions/${sessionId}/enroll`, payload).then(r => r.data)
  },
  getEnrollments(params = {}) {
    return http.get('/hrms/training/enrollments', { params }).then(r => r.data)
  },
  getCertifications(employeeId) {
    return http.get(`/hrms/training/certifications/${employeeId}`).then(r => r.data)
  },

  // ── Benefits ─────────────────────────────
  getBenefitPlans() {
    return http.get('/hrms/benefits/plans').then(r => r.data)
  },
  getMyBenefits() {
    return http.get('/hrms/benefits/my-enrollments').then(r => r.data)
  },
  enrollInPlan(payload) {
    return http.post('/hrms/benefits/enroll', payload).then(r => r.data)
  },
}
