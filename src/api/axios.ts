import axios from 'axios'
import { TOKEN_KEY } from '@/lib/constants'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Normalize error shape
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const data = err.response?.data
    const message =
      data?.error ??
      data?.message ??
      (typeof data === 'string' && data ? data : null) ??
      err.message ??
      'Something went wrong'
    return Promise.reject(new Error(message))
  }
)
