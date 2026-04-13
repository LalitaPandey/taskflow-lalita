import { api } from './axios'
import type { Task, TaskPriority, TaskStatus } from '@/types'

export async function getTasks(
  projectId: string,
  filters?: { status?: TaskStatus; assignee?: string }
): Promise<Task[]> {
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  if (filters?.assignee) params.set('assignee', filters.assignee)
  const res = await api.get<{ tasks: Task[] }>(
    `/projects/${projectId}/tasks?${params}`
  )
  return res.data.tasks
}

export async function createTask(
  projectId: string,
  data: {
    title: string
    description?: string
    status: TaskStatus
    priority: TaskPriority
    assignee_id?: string | null
    due_date?: string | null
  }
): Promise<Task> {
  const res = await api.post<Task>('/tasks', { ...data, project_id: projectId })
  return res.data
}

export async function updateTask(
  id: string,
  data: Partial<{
    title: string
    description: string
    status: TaskStatus
    priority: TaskPriority
    assignee_id: string | null
    due_date: string | null
  }>
): Promise<Task> {
  const res = await api.patch<Task>(`/tasks/${id}`, data)
  return res.data
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`)
}
