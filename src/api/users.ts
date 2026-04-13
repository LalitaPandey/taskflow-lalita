import { api } from './axios'
import type { User } from '@/types'

export async function getUsers(): Promise<User[]> {
  const res = await api.get<User[]>('/users')
  return res.data
}
