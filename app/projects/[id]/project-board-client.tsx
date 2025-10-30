"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Plus, ArrowLeft, Users } from "lucide-react"
import { CreateTaskDialog } from "@/components/project/create-task-dialog"
import { TaskCard } from "@/components/project/task-card"
import { TaskDetailDialog } from "@/components/project/task-detail-dialog"
import { TeamManagementDialog } from "@/components/project/team-management-dialog"
import { ActivityFeed } from "@/components/project/activity-feed"
import { TaskFilter, TaskFilters } from "@/components/project/task-filter"
import { toast } from "sonner"
import Link from "next/link"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"

// Droppable Board Component
function DroppableBoard({ board, children }: { board: any; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: board.id,
  })

  return (
    <div
      ref={setNodeRef}
      className={`shrink-0 w-80 transition-all ${
        isOver ? "ring-2 ring-primary ring-offset-2" : ""
      }`}
    >
      {children}
    </div>
  )
}

interface ProjectBoardClientProps {
  projectId: string
  user: any
}

export function ProjectBoardClient({ projectId, user }: ProjectBoardClientProps) {
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [selectedBoardId, setSelectedBoardId] = useState<string>("")
  const [activeTask, setActiveTask] = useState<any>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [showTaskDetail, setShowTaskDetail] = useState(false)
  const [showTeamManagement, setShowTeamManagement] = useState(false)
  const [filters, setFilters] = useState<TaskFilters>({
    search: "",
    priority: "all",
    assignee: "all",
    status: "all",
    sortBy: "recent",
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)
      } else if (response.status === 404) {
        toast.error("Project not found")
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Failed to fetch project:", error)
      toast.error("Failed to load project")
    } finally {
      setIsLoading(false)
    }
  }, [projectId, router])

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  const handleCreateTask = useCallback((boardId: string) => {
    setSelectedBoardId(boardId)
    setShowCreateTask(true)
  }, [])

  const handleTaskClick = useCallback((taskId: string) => {
    setSelectedTaskId(taskId)
    setShowTaskDetail(true)
  }, [])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    const taskId = active.id as string
    
    // Find the task being dragged
    const task = project?.boards
      ?.flatMap((board: any) => board.tasks || [])
      .find((t: any) => t.id === taskId)
    
    setActiveTask(task)
  }, [project])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    const targetId = over.id as string

    // Check if dropped over a board
    const targetBoard = project.boards?.find((board: any) => board.id === targetId)
    
    if (targetBoard) {
      // Find the task and its current board
      let sourceBoard: any = null
      let task: any = null

      for (const board of project.boards || []) {
        const foundTask = board.tasks?.find((t: any) => t.id === taskId)
        if (foundTask) {
          task = foundTask
          sourceBoard = board
          break
        }
      }

      if (!task || !sourceBoard) return

      // If same board, do nothing
      if (sourceBoard.id === targetBoard.id) return

      // Determine status based on board title
      let newStatus = task.status
      const boardTitle = targetBoard.title.toLowerCase()
      if (boardTitle.includes("to do") || boardTitle.includes("todo")) {
        newStatus = "todo"
      } else if (boardTitle.includes("progress")) {
        newStatus = "in_progress"
      } else if (boardTitle.includes("done")) {
        newStatus = "done"
      }

      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            status: newStatus,
            boardId: targetBoard.id 
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to update task")
        }

        toast.success("Task moved successfully")
        fetchProject()
      } catch (error) {
        toast.error("Failed to move task")
      }
    }
  }, [project, fetchProject])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <DashboardHeader user={user} />
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <DashboardHeader user={user} />
        <div className="container py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Project not found</h1>
            <Button asChild className="mt-4">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Memoize task count calculation
  const taskCount = useMemo(() => 
    project?.boards?.reduce((acc: number, board: any) => 
      acc + (board.tasks?.length || 0), 0
    ) || 0,
    [project]
  )

  // Filter and sort tasks
  const filteredProject = useMemo(() => {
    if (!project) return null

    const filteredBoards = project.boards?.map((board: any) => {
      let tasks = board.tasks || []

      // Apply search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        tasks = tasks.filter((task: any) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower)
        )
      }

      // Apply priority filter
      if (filters.priority !== "all") {
        tasks = tasks.filter((task: any) => task.priority === filters.priority)
      }

      // Apply assignee filter
      if (filters.assignee !== "all") {
        if (filters.assignee === "unassigned") {
          tasks = tasks.filter((task: any) => !task.assigneeId)
        } else {
          tasks = tasks.filter((task: any) => task.assigneeId === filters.assignee)
        }
      }

      // Apply status filter
      if (filters.status !== "all") {
        tasks = tasks.filter((task: any) => task.status === filters.status)
      }

      // Apply sorting
      tasks = [...tasks].sort((a: any, b: any) => {
        switch (filters.sortBy) {
          case "recent":
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          case "oldest":
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          case "priority_high": {
            const priorityOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 }
            return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
          }
          case "priority_low": {
            const priorityOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 }
            return (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0)
          }
          case "due_date":
            if (!a.dueDate) return 1
            if (!b.dueDate) return -1
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          case "title":
            return a.title.localeCompare(b.title)
          default:
            return 0
        }
      })

      return { ...board, tasks }
    })

    return { ...project, boards: filteredBoards }
  }, [project, filters])

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <DashboardHeader user={user} />
      
      <div className="border-b bg-background/95 backdrop-blur-lg shadow-sm">
        <div className="container py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" asChild className="hover:bg-primary/10">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20 ring-2 ring-white dark:ring-slate-800"
              style={{ backgroundColor: project.color || "#6366f1" }}
            >
              {project.title.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-linear-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                {project.title}
              </h1>
              {project.description && (
                <p className="text-muted-foreground mt-1 text-sm">{project.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium shadow-sm">
              <span className="mr-1.5">📋</span>
              {taskCount} tasks
            </Badge>
            <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium shadow-sm">
              <span className="mr-1.5">👥</span>
              {project.members?.length || 0} members
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTeamManagement(true)}
              className="shadow-sm hover:shadow-md transition-shadow hover:border-primary/50"
            >
              <Users className="mr-2 h-4 w-4" />
              Manage Team
            </Button>
          </div>
          <div className="mt-4">
            <TaskFilter
              filters={filters}
              onFiltersChange={setFilters}
              members={project.members || []}
            />
          </div>
        </div>
      </div>

      <div className="container py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-6">
          <div className="xl:col-span-3">
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              collisionDetection={closestCenter}
              >
                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {filteredProject?.boards?.map((board: any) => (
              <DroppableBoard key={board.id} board={board}>
                <Card className="h-full shadow-md hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <CardHeader className="pb-3 bg-linear-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-850 border-b-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        {board.title}
                      </CardTitle>
                      <Badge 
                        variant="outline" 
                        className="px-2.5 py-0.5 font-semibold bg-primary/5 border-primary/20"
                      >
                        {board.tasks?.length || 0}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ScrollArea className="h-[calc(100vh-320px)] pr-3">
                      <SortableContext
                        id={board.id}
                        items={board.tasks?.map((task: any) => task.id) || []}
                        strategy={verticalListSortingStrategy}
                      >
                        <div 
                          className="space-y-3 min-h-[120px]" 
                          data-board-id={board.id}
                        >
                          {board.tasks?.map((task: any) => (
                            <TaskCard 
                              key={task.id} 
                              task={task} 
                              onUpdate={fetchProject}
                              isDragging={activeTask?.id === task.id}
                              onTaskClick={handleTaskClick}
                            />
                          ))}
                          {(!board.tasks || board.tasks.length === 0) && (
                            <div className="text-center py-12 text-muted-foreground text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-800/50">
                              <div className="flex flex-col items-center gap-2">
                                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                  <Plus className="h-6 w-6 text-slate-400" />
                                </div>
                                <p className="font-medium">No tasks yet</p>
                                <p className="text-xs">Drop tasks here or add new ones</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </SortableContext>
                    </ScrollArea>
                    <Button
                      variant="ghost"
                      className="w-full mt-4 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all duration-200"
                      onClick={() => handleCreateTask(board.id)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Task
                    </Button>
                  </CardContent>
                </Card>
              </DroppableBoard>
            ))}
          </div>
          <DragOverlay>
            {activeTask ? (
              <div className="rotate-2 cursor-grabbing opacity-90 scale-105 transition-transform">
                <TaskCard task={activeTask} onUpdate={() => {}} isDragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
          </div>
          <div className="xl:col-span-1">
            <ActivityFeed projectId={projectId} />
          </div>
        </div>
      </div>

      <CreateTaskDialog
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
        boardId={selectedBoardId}
        projectMembers={project.members || []}
        onTaskCreated={fetchProject}
      />

      <TaskDetailDialog
        open={showTaskDetail}
        onOpenChange={setShowTaskDetail}
        taskId={selectedTaskId}
        projectMembers={project.members || []}
        onTaskUpdated={fetchProject}
        onTaskDeleted={fetchProject}
        currentUser={user}
        projectId={projectId}
      />

      <TeamManagementDialog
        open={showTeamManagement}
        onOpenChange={setShowTeamManagement}
        projectId={projectId}
        currentUserRole={project.members?.find((m: any) => m.userId === user.id)?.role || "VIEWER"}
      />
    </div>
  )
}
