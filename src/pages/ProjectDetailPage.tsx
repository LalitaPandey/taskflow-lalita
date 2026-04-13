import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft, Plus, Loader2, Pencil, Trash2, Calendar, User, ClipboardList,
} from 'lucide-react'
import { getProject } from '@/api/projects'
import { updateTask, deleteTask } from '@/api/tasks'
import { getUsers } from '@/api/users'
import type { Task, TaskStatus } from '@/types'
import { TaskModal, type TaskFormData } from '@/components/TaskModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { formatDate, isOverdue, cn } from '@/lib/utils'

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
}

const STATUS_BADGE: Record<TaskStatus, 'secondary' | 'default' | 'success'> = {
  todo: 'secondary',
  in_progress: 'default',
  done: 'success',
}

const PRIORITY_BADGE = {
  low: 'secondary',
  medium: 'warning',
  high: 'destructive',
} as const

const STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'done']

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterAssignee, setFilterAssignee] = useState<string>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(id!),
    enabled: !!id,
  })

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  })

  const { mutate: editTask, isPending: isEditing } = useMutation({
    mutationFn: (data: TaskFormData) =>
      updateTask(editingTask!.id, {
        ...data,
        assignee_id: data.assignee_id || null,
        due_date: data.due_date || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] })
      setModalOpen(false)
      setEditingTask(null)
    },
  })

  const { mutate: changeStatus } = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      updateTask(taskId, { status }),
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['project', id] })
      const previous = queryClient.getQueryData(['project', id])
      queryClient.setQueryData(['project', id], (old: typeof project) => {
        if (!old) return old
        return { ...old, tasks: old.tasks.map((t) => t.id === taskId ? { ...t, status } : t) }
      })
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['project', id], context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] })
    },
  })

  const { mutate: removeTask } = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', id] }),
  })

  function openEdit(task: Task) {
    setEditingTask(task)
    setModalOpen(true)
  }

  const getUserName = (userId?: string | null) =>
    userId ? (users.find((u) => u.id === userId)?.name ?? null) : null

  const allTasks = project?.tasks ?? []
  const filteredTasks = allTasks.filter((t) => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false
    if (filterAssignee !== 'all' && t.assignee_id !== filterAssignee) return false
    return true
  })

  const tasksByStatus = STATUS_ORDER.reduce<Record<string, Task[]>>((acc, status) => {
    acc[status] = filteredTasks.filter((t) => t.status === status)
    return acc
  }, {})

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    )
  }

  if (isError || !project) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          Failed to load project. It may not exist or the API is offline.
        </div>
        <Link to="/projects" className="mt-4 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
          <ChevronLeft className="h-4 w-4" /> Back to projects
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <Link to="/projects" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
        <ChevronLeft className="h-4 w-4" /> Projects
      </Link>

      {/* Project header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="mt-1 text-sm text-gray-500">{project.description}</p>
          )}
        </div>
        <Button onClick={() => navigate(`/projects/${id}/tasks/new`)} className="shrink-0 self-start">
          <Plus className="h-4 w-4" />
          Add task
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-3">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="todo">To do</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterAssignee} onValueChange={setFilterAssignee}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All assignees" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All assignees</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(filterStatus !== 'all' || filterAssignee !== 'all') && (
          <Button variant="ghost" size="sm" onClick={() => { setFilterStatus('all'); setFilterAssignee('all') }}>
            Clear filters
          </Button>
        )}
      </div>

      {/* Empty state */}
      {allTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <ClipboardList className="h-7 w-7 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">No tasks yet</h3>
          <p className="mt-1 text-sm text-gray-500">Add the first task to this project.</p>
          <Button className="mt-5" onClick={() => navigate(`/projects/${id}/tasks/new`)}>
            <Plus className="h-4 w-4" /> Add task
          </Button>
        </div>
      )}

      {/* Filtered empty */}
      {allTasks.length > 0 && filteredTasks.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-200 bg-white py-10 text-center">
          <p className="text-sm text-gray-500">No tasks match the selected filters.</p>
        </div>
      )}

      {/* Kanban columns */}
      {filteredTasks.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {STATUS_ORDER.map((status) => (
            <div key={status} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Badge variant={STATUS_BADGE[status]}>{STATUS_LABELS[status]}</Badge>
                <span className="text-xs text-gray-400">{tasksByStatus[status].length}</span>
              </div>
              {tasksByStatus[status].map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  assigneeName={getUserName(task.assignee_id)}
                  onStatusChange={(newStatus) => changeStatus({ taskId: task.id, status: newStatus })}
                  onEdit={() => openEdit(task)}
                  onDelete={() => removeTask(task.id)}
                />
              ))}
              {tasksByStatus[status].length === 0 && (
                <div className="rounded-md border border-dashed border-gray-200 py-6 text-center">
                  <p className="text-xs text-gray-400">No tasks</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <TaskModal
        open={modalOpen}
        onOpenChange={(v) => { setModalOpen(v); if (!v) setEditingTask(null) }}
        onSubmit={(data) => editTask(data)}
        isPending={isEditing}
        task={editingTask}
      />
    </div>
  )
}

// ── Task Card ─────────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task
  assigneeName: string | null
  onStatusChange: (status: TaskStatus) => void
  onEdit: () => void
  onDelete: () => void
}

function TaskCard({ task, assigneeName, onStatusChange, onEdit, onDelete }: TaskCardProps) {
  const nextStatus: Record<TaskStatus, TaskStatus> = { todo: 'in_progress', in_progress: 'done', done: 'todo' }
  const nextLabel: Record<TaskStatus, string> = { todo: 'Start', in_progress: 'Complete', done: 'Reopen' }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-900 leading-snug">{task.title}</p>
        <div className="flex shrink-0 gap-1">
          <button onClick={onEdit} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600" title="Edit">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={onDelete} className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500" title="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="mb-2 text-xs text-gray-500 line-clamp-2">{task.description}</p>
      )}

      <div className="mb-3 flex flex-wrap gap-1.5">
        <Badge variant={PRIORITY_BADGE[task.priority]} className="capitalize">{task.priority}</Badge>
      </div>

      <div className="space-y-1.5">
        {assigneeName && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <User className="h-3.5 w-3.5 shrink-0" />
            <span>{assigneeName}</span>
          </div>
        )}
        {task.due_date && (
          <div className={cn(
            'flex items-center gap-1.5 text-xs',
            isOverdue(task.due_date) && task.status !== 'done' ? 'text-red-500' : 'text-gray-500'
          )}>
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{formatDate(task.due_date)}</span>
          </div>
        )}
      </div>

      <button
        onClick={() => onStatusChange(nextStatus[task.status])}
        className="mt-3 w-full rounded-md border border-gray-200 py-1 text-xs text-gray-500 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
      >
        {nextLabel[task.status]} →
      </button>
    </div>
  )
}
