import { z } from 'zod'

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['todo', 'in_progress', 'done']),
  assignee_id: z.string().optional(),
  due_date: z.string().optional(),
})

export type TaskFormData = z.infer<typeof taskSchema>
