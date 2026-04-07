async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : {}

  if (!response.ok) {
    throw new Error(data?.error || `Request failed: ${response.status}`)
  }

  return data
}

export function fetchWorkflowProcessesApi(params = {}) {
  const query = new URLSearchParams(params)
  const suffix = query.toString()
  return requestJson(`/api/workflow/processes${suffix ? `?${suffix}` : ''}`)
}

export function fetchMyWorkflowTasksApi(params = {}) {
  const query = new URLSearchParams(params)
  const suffix = query.toString()
  return requestJson(`/api/workflow/tasks/my${suffix ? `?${suffix}` : ''}`)
}

export function fetchRoleWorkflowTasksApi(roleKey, params = {}) {
  const query = new URLSearchParams(params)
  const suffix = query.toString()
  return requestJson(`/api/workflow/tasks/role/${roleKey}${suffix ? `?${suffix}` : ''}`)
}

export function claimWorkflowTaskApi(taskId) {
  return requestJson(`/api/workflow/tasks/${taskId}/claim`, {
    method: 'POST',
  })
}

export function completeWorkflowTaskApi(taskId, payload) {
  return requestJson(`/api/workflow/tasks/${taskId}/complete`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function reassignWorkflowTaskApi(taskId, payload) {
  return requestJson(`/api/workflow/tasks/${taskId}/reassign`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
