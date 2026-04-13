import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { projectSchema, type ProjectFormData } from '@/schemas/project'
import {
  CheckSquare, FolderOpen, LayoutGrid, Plus, LogOut, X, ChevronRight,
} from 'lucide-react'
import { getProjects, createProject } from '@/api/projects'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  const [newProjectOpen, setNewProjectOpen] = useState(false)

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  })

  const { mutate: addProject, isPending } = useMutation({
    mutationFn: createProject,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setNewProjectOpen(false)
      reset()
      navigate(`/projects/${created.id}`)
      onClose()
    },
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  })

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <>
      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out',
          'lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-gray-100">
          <Link
            to="/projects"
            className="flex items-center gap-2.5"
            onClick={onClose}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <CheckSquare className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-base font-bold text-gray-900 tracking-tight">TaskFlow</span>
          </Link>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">

          {/* Overview */}
          <Link
            to="/projects"
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive('/projects')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            )}
          >
            <LayoutGrid className="h-4 w-4 shrink-0" />
            All Projects
          </Link>

          {/* Projects section */}
          <div className="pt-4">
            <div className="flex items-center justify-between px-3 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Projects
              </span>
              <button
                onClick={() => setNewProjectOpen(true)}
                title="New project"
                className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-0.5">
              {projects.length === 0 && (
                <p className="px-3 py-2 text-xs text-gray-400">No projects yet</p>
              )}
              {projects.map((project) => {
                const active = location.pathname.startsWith(`/projects/${project.id}`)
                return (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors group',
                      active
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    )}
                  >
                    <FolderOpen className={cn('h-4 w-4 shrink-0', active ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500')} />
                    <span className="flex-1 truncate">{project.name}</span>
                    {active && <ChevronRight className="h-3 w-3 shrink-0 text-blue-400" />}
                  </Link>
                )
              })}
            </div>
          </div>
        </nav>

        {/* User section */}
        <div className="border-t border-gray-100 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2 mb-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {/* New Project dialog */}
      <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create project</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit((data) => addProject(data))}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="proj-name">Name</Label>
              <Input id="proj-name" placeholder="e.g. Website Redesign" {...register('name')} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proj-desc">Description (optional)</Label>
              <Input id="proj-desc" placeholder="What is this project about?" {...register('description')} />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setNewProjectOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating…' : 'Create project'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
