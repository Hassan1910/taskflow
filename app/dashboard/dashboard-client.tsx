"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { CreateProjectDialog } from "@/components/dashboard/create-project-dialog"
import { ProjectCard } from "@/components/dashboard/project-card"
import { Plus, Loader2, Search, FolderKanban, CheckCircle2, Clock, TrendingUp } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { cn } from "@/lib/utils"

interface DashboardClientProps {
  user: any
}

// Debounce hook for search optimization
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function DashboardClient({ user }: DashboardClientProps) {
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Debounce search query to avoid excessive filtering
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch("/api/projects")
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // Filter projects based on search with debouncing
  const filteredProjects = useMemo(() => {
    if (!debouncedSearchQuery) return projects
    const query = debouncedSearchQuery.toLowerCase()
    return projects.filter((project) =>
      project.title.toLowerCase().includes(query) ||
      project.description?.toLowerCase().includes(query)
    )
  }, [projects, debouncedSearchQuery])

  // Calculate statistics
  const stats = useMemo(() => {
    const totalProjects = projects.length
    const totalTasks = projects.reduce((acc, project) => 
      acc + (project.boards?.reduce((sum: number, board: any) => 
        sum + (board.tasks?.length || 0), 0) || 0), 0
    )
    const completedTasks = projects.reduce((acc, project) => 
      acc + (project.boards?.reduce((sum: number, board: any) => 
        sum + (board.tasks?.filter((t: any) => t.status === 'DONE').length || 0), 0) || 0), 0
    )
    const totalMembers = projects.reduce((acc, project) => 
      acc + (project._count?.members || 0), 0
    )
    
    return { totalProjects, totalTasks, completedTasks, totalMembers }
  }, [projects])

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl animate-blob" />
        <div className="absolute top-1/3 -right-48 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-48 left-1/3 w-96 h-96 bg-pink-400/20 dark:bg-pink-600/10 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000" />
      </div>
      
      <DashboardHeader user={user} />
      
      <main className="container relative z-10 py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-7xl mx-auto">
        {/* Welcome Section with Stats */}
        <div className="space-y-6 animate-in fade-in slide-in-from-top-1 duration-300">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-linear-to-r from-slate-900 via-blue-700 to-purple-700 dark:from-slate-100 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-500">
                Welcome back, {user.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-muted-foreground text-lg">
                Here's what's happening with your projects today.
              </p>
            </div>
            <Button 
              onClick={() => setShowCreateDialog(true)} 
              size="lg"
              className="shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 group"
            >
              <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
              New Project
            </Button>
          </div>

          {/* Stats Cards */}
          {!isLoading && projects.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 bg-linear-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative group cursor-default hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="absolute inset-0 bg-linear-to-tr from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-100 mb-1">Total Projects</p>
                      <p className="text-4xl font-bold">{stats.totalProjects}</p>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <FolderKanban className="h-7 w-7" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center text-xs text-blue-100">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span>Active workspace</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 bg-linear-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative group cursor-default hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="absolute inset-0 bg-linear-to-tr from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-100 mb-1">Completed Tasks</p>
                      <p className="text-4xl font-bold">{stats.completedTasks}</p>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <CheckCircle2 className="h-7 w-7" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center text-xs text-emerald-100">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    <span>Great progress!</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 bg-linear-to-br from-amber-500 to-orange-600 text-white overflow-hidden relative group cursor-default hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="absolute inset-0 bg-linear-to-tr from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-100 mb-1">Active Tasks</p>
                      <p className="text-4xl font-bold">{stats.totalTasks - stats.completedTasks}</p>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <Clock className="h-7 w-7" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center text-xs text-amber-100">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>In progress</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 bg-linear-to-br from-purple-500 to-purple-600 text-white overflow-hidden relative group cursor-default hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="absolute inset-0 bg-linear-to-tr from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-100 mb-1">Completion Rate</p>
                      <p className="text-4xl font-bold">
                        {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
                      </p>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <TrendingUp className="h-7 w-7" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center text-xs text-purple-100">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span>
                      {stats.totalTasks > 0 && Math.round((stats.completedTasks / stats.totalTasks) * 100) >= 75 
                        ? "Excellent!" 
                        : stats.totalTasks > 0 && Math.round((stats.completedTasks / stats.totalTasks) * 100) >= 50 
                        ? "Good pace" 
                        : "Keep going!"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Projects Section */}
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                Your Projects
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {projects.length === 0 
                  ? "Get started by creating your first project" 
                  : `Managing ${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`}
              </p>
            </div>
            {projects.length > 0 && (
              <div className="relative max-w-sm w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors" />
                <Input
                  type="search"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-2 focus:border-primary/50 transition-all duration-200 hover:bg-white dark:hover:bg-slate-900"
                />
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-lg bg-slate-200 dark:bg-slate-800" />
                        <div className="flex-1 space-y-2">
                          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-linear-to-br from-white/50 to-blue-50/30 dark:from-slate-900/50 dark:to-blue-950/30 backdrop-blur-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full -ml-32 -mb-32" />
              <CardContent className="flex flex-col items-center justify-center py-20 text-center relative">
                <div className="rounded-full bg-linear-to-br from-blue-500/20 to-purple-500/20 p-8 mb-6 relative group">
                  <div className="absolute inset-0 rounded-full bg-linear-to-br from-blue-500/20 to-purple-500/20 animate-pulse" />
                  <div className="absolute inset-0 rounded-full bg-linear-to-br from-blue-500/10 to-purple-500/10 blur-xl" />
                  <FolderKanban className="h-20 w-20 text-primary relative animate-in zoom-in duration-500" />
                </div>
                <h2 className="text-4xl font-bold mb-3 bg-linear-to-r from-slate-900 via-blue-700 to-purple-700 dark:from-slate-100 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Start Your First Project
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md text-lg leading-relaxed">
                  Create a new project to organize your tasks, collaborate with your team, and track progress efficiently.
                </p>
                <Button 
                  onClick={() => setShowCreateDialog(true)} 
                  size="lg" 
                  className="shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 group h-12 px-8"
                >
                  <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                  Create Your First Project
                </Button>
              </CardContent>
            </Card>
          ) : filteredProjects.length === 0 ? (
            <Card className="border-2 border-dashed bg-linear-to-br from-white/50 to-slate-50/30 dark:from-slate-900/50 dark:to-slate-800/30 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-6 mb-4">
                  <Search className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-2 bg-linear-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                  No projects found
                </h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  We couldn't find any projects matching <span className="font-semibold">"{searchQuery}"</span>. Try adjusting your search.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setSearchQuery("")}
                  className="shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project, index) => (
                <div
                  key={project.id}
                  className={cn(
                    "animate-in fade-in slide-in-from-bottom-4 duration-300",
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProjectCard
                    project={project}
                    onDelete={fetchProjects}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onProjectCreated={fetchProjects}
      />
    </div>
  )
}
