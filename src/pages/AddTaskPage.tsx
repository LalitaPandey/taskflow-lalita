import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, FolderOpen, UserCheck } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { taskSchema, type TaskFormData } from '@/schemas/task'
import { createTask } from '@/api/tasks'
import { getProject } from '@/api/projects'
import { getUsers } from '@/api/users'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function AddTaskPage() {
  const { id: projectId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user: loggedInUser } = useAuth()
  const [serverError, setServerError] = useState('')

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId!),
    enabled: !!projectId,
  })

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: TaskFormData) =>
      createTask(projectId!, {
        ...data,
        assignee_id: data.assignee_id || null,
        due_date: data.due_date || null,
      }),
    onSuccess: async () => {
      await queryClient.fetchQuery({
        queryKey: ['project', projectId],
        queryFn: () => getProject(projectId!),
      })
      navigate(`/projects/${projectId}`)
    },
    onError: (err: Error) => {
      setServerError(err.message)
    },
  })

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      assignee_id: '',
      due_date: '',
    },
  })

  const currentAssigneeId = watch('assignee_id')
  const assigneeName = users.find((u) => u.id === currentAssigneeId)?.name

  function onSubmit(data: TaskFormData) {
    setServerError('')
    mutate(data)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">

        {/* Back link */}
        <button
          type="button"
          onClick={() => navigate(`/projects/${projectId}`)}
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to project
        </button>

        {/* Project context banner */}
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
            <FolderOpen className="h-5 w-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-blue-500">
              Adding task to
            </p>
            <p className="truncate text-base font-bold text-blue-900">
              {project?.name ?? '…'}
            </p>
            {project?.description && (
              <p className="mt-0.5 truncate text-xs text-blue-600">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Form card */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h1 className="text-lg font-bold text-gray-900">New Task</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Fill in the details below to create a task.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6 space-y-6">

            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title">
                Task title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g. Design landing page wireframes"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                rows={4}
                placeholder="Describe what needs to be done, acceptance criteria, notes…"
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                {...register('description')}
              />
            </div>

            {/* Status + Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pick a status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To do</SelectItem>
                        <SelectItem value="in_progress">In progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pick a priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Assignee */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Assignee</Label>
                {loggedInUser && (
                  <button
                    type="button"
                    onClick={() => setValue('assignee_id', loggedInUser.id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    Assign to me
                  </button>
                )}
              </div>
              <Controller
                name="assignee_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || 'none'}
                    onValueChange={(v) => field.onChange(v === 'none' ? '' : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a team member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unassigned</SelectItem>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}{u.id === loggedInUser?.id ? ' (you)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {assigneeName && (
                <p className="text-xs text-gray-500">
                  Assigned to{' '}
                  <span className="font-medium text-gray-700">{assigneeName}</span>
                </p>
              )}
            </div>

            {/* Due date */}
            <div className="space-y-1.5">
              <Label htmlFor="due_date">Due date</Label>
              <Input id="due_date" type="date" {...register('due_date')} />
              <p className="text-xs text-gray-400">Leave empty if there is no deadline.</p>
            </div>

            {serverError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {serverError}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/projects/${projectId}`)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="min-w-[8rem]">
                {isPending ? 'Creating…' : 'Create task'}
              </Button>
            </div>
          </form>
        </div>
    </div>
  )
}
