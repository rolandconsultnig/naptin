import http from './http'

export const collabApi = {
  getOfficeIntegrationHints() {
    return http.get('/collaboration/integrations/office').then((r) => r.data)
  },

  getCalendarEvents(params = {}) {
    return http.get('/collaboration/calendar-events', { params }).then((r) => r.data)
  },
  createCalendarEvent(payload) {
    return http.post('/collaboration/calendar-events', payload).then((r) => r.data)
  },

  getForumThreads() {
    return http.get('/collaboration/forum/threads').then((r) => r.data)
  },
  getForumThread(threadId) {
    return http.get(`/collaboration/forum/threads/${threadId}`).then((r) => r.data)
  },
  createForumThread(payload) {
    return http.post('/collaboration/forum/threads', payload).then((r) => r.data)
  },
  createForumPost(threadId, payload) {
    return http.post(`/collaboration/forum/threads/${threadId}/posts`, payload).then((r) => r.data)
  },

  getProjects() {
    return http.get('/collaboration/projects').then((r) => r.data)
  },
  createProject(payload) {
    return http.post('/collaboration/projects', payload).then((r) => r.data)
  },
  updateProject(projectId, payload) {
    return http.patch(`/collaboration/projects/${projectId}`, payload).then((r) => r.data)
  },
  getProjectTasks(projectId) {
    return http.get(`/collaboration/projects/${projectId}/tasks`).then((r) => r.data)
  },
  createProjectTask(projectId, payload) {
    const id = Number(projectId)
    const body = { ...payload }
    delete body.projectId
    if (body.dueDate === '' || body.dueDate === undefined) body.dueDate = null
    return http.post(`/collaboration/projects/${id}/tasks`, body).then((r) => r.data)
  },
  updateProjectTask(taskId, payload) {
    return http.patch(`/collaboration/project-tasks/${taskId}`, payload).then((r) => r.data)
  },

  getWorkspaces(params = {}) {
    return http.get('/collaboration/workspaces', { params }).then((r) => r.data)
  },
  createWorkspace(payload) {
    return http.post('/collaboration/workspaces', payload).then((r) => r.data)
  },
  getWorkspaceMembers(workspaceId) {
    return http.get(`/collaboration/workspaces/${workspaceId}/members`).then((r) => r.data)
  },
  addWorkspaceMember(workspaceId, payload) {
    return http.post(`/collaboration/workspaces/${workspaceId}/members`, payload).then((r) => r.data)
  },
  getWorkspaceDocuments(workspaceId) {
    return http.get(`/collaboration/workspaces/${workspaceId}/documents`).then((r) => r.data)
  },
  createWorkspaceDocument(workspaceId, payload) {
    return http.post(`/collaboration/workspaces/${workspaceId}/documents`, payload).then((r) => r.data)
  },
  updateDocument(documentId, payload) {
    return http.patch(`/collaboration/documents/${documentId}`, payload).then((r) => r.data)
  },

  getSharedFiles() {
    return http.get('/collaboration/files').then((r) => r.data)
  },
  createSharedFile(payload) {
    return http.post('/collaboration/files', payload).then((r) => r.data)
  },
}

export const whistleblowerApi = {
  submitReport(payload) {
    return http.post('/whistleblower/reports', payload).then((r) => r.data)
  },
  trackReport(caseRef) {
    return http.get(`/whistleblower/reports/${caseRef}`).then((r) => r.data)
  },
  getCases(params = {}) {
    return http.get('/whistleblower/cases', { params }).then((r) => r.data)
  },
  updateCase(id, payload) {
    return http.patch(`/whistleblower/cases/${id}`, payload).then((r) => r.data)
  },
  getCaseTimeline(id) {
    return http.get(`/whistleblower/cases/${id}/timeline`).then((r) => r.data)
  },
}
