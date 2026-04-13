export interface User {
  id: string
  name: string
  email: string
  created_at: string
}

export interface Project {
  id: string
  name: string
  description?: string
  owner_id: string
  created_at: string
}

export interface ProjectWithTasks extends Project {
  tasks: Task[]
}

export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  project_id: string
  assignee_id?: string | null
  due_date?: string | null
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}

