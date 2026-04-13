import { api } from './axios'
import type { Project, ProjectWithTasks } from '@/types'

export async function getProjects(): Promise<Project[]> {
  const res = await api.get<{ projects: Project[] }>('/projects')
  return res.data.projects
}

export async function getProject(id: string): Promise<ProjectWithTasks> {
  const res = await api.get<ProjectWithTasks>(`/projects/${id}`)
  return res.data
}

export async function createProject(data: {
  name: string
  description?: string
}): Promise<Project> {
  const res = await api.post<Project>('/projects', data)
  return res.data
}

export async function updateProject(
  id: string,
  data: { name?: string; description?: string }
): Promise<Project> {
  const res = await api.patch<Project>(`/projects/${id}`, data)
  return res.data
}

export async function deleteProject(id: string): Promise<void> {
  await api.delete(`/projects/${id}`)
}
