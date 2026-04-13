import { api } from './axios'
import type { AuthResponse } from '@/types'

export async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/register', {
    name,
    email,
    password,
  })
  return res.data
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/login', { email, password })
  return res.data
}
