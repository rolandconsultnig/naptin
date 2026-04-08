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

export const intranetApi = {
  posts: () => http.get('/intranet/posts').then((r) => r.data),
  createPost: (payload) => http.post('/intranet/posts', payload).then((r) => r.data),
  addComment: (postId, payload) => http.post(`/intranet/posts/${postId}/comments`, payload).then((r) => r.data),
  toggleLike: (postId, payload) => http.post(`/intranet/posts/${postId}/toggle-like`, payload).then((r) => r.data),
  upload: (file, kind) => {
    const form = new FormData()
    form.append('file', file)
    form.append('kind', kind)
    return http
      .post('/intranet/uploads', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },
}

