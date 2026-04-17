import axios from 'axios'
import { resolveWorkbenchApiBase } from '../config/workbenchApiBase'

const baseURL = resolveWorkbenchApiBase()

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

