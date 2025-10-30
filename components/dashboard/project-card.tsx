"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LayoutGrid, Users, MoreVertical, Trash2, Settings, ArrowRight, Circle } from "lucide-react"
import { formatRelativeTime, getInitials, cn } from "@/lib/utils"
import { toast } from "sonner"
import { useMemo } from "react"

interface ProjectCardProps {
  project: any
  onDelete: () => void
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const taskCount = project.boards?.reduce((acc: number, board: any) => 
    acc + (board.tasks?.length || 0), 0
  ) || 0

  const completedTasks = useMemo(() => {
    return project.boards?.reduce((acc: number, board: any) => 
      acc + (board.tasks?.filter((t: any) => t.status === 'done').length || 0), 0
    ) || 0
  }, [project])

  const progress = taskCount > 0 ? (completedTasks / taskCount) * 100 : 0

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete project")
      }

      toast.success("Project deleted successfully")
      onDelete()
    } catch (error) {
      toast.error("Failed to delete project")
    }
  }

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 hover:border-primary/50 hover:-translate-y-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-2 overflow-hidden relative">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500" />
      
      <CardHeader className="relative pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className="h-14 w-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg relative shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
              style={{ backgroundColor: project.color || "#6366f1" }}
            >
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300" style={{ backgroundColor: project.color || "#6366f1" }} />
              <span className="relative z-10">{project.title.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/projects/${project.id}`} className="group/link">
                <CardTitle className="hover:text-primary transition-all cursor-pointer flex items-center gap-2 group-hover/link:gap-3 text-lg">
                  <span className="truncate">{project.title}</span>
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover/link:opacity-100 transition-all duration-300 shrink-0 group-hover/link:translate-x-1" />
                </CardTitle>
              </Link>
              <CardDescription className="line-clamp-2 mt-2 text-sm leading-relaxed">
                {project.description || "No description provided"}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 h-8 w-8 rounded-lg"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href={`/projects/${project.id}`} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Open Project
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 relative pt-0">
        {/* Progress Bar */}
        {taskCount > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                <Circle className="h-2.5 w-2.5 fill-current" />
                Progress
              </span>
              <span className={cn(
                "font-bold text-sm",
                progress === 100 ? "text-emerald-600 dark:text-emerald-400" : "text-primary"
              )}>
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700 ease-out relative",
                  progress === 100 
                    ? "bg-linear-to-r from-emerald-500 to-emerald-600" 
                    : "bg-linear-to-r from-blue-500 via-purple-500 to-blue-600"
                )}
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{completedTasks} completed</span>
              <span>{taskCount - completedTasks} remaining</span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 text-muted-foreground group/stat hover:text-primary transition-colors">
              <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center group-hover/stat:bg-blue-200 dark:group-hover/stat:bg-blue-900/50 transition-colors">
                <LayoutGrid className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-foreground">{taskCount}</span>
                <span className="text-xs">tasks</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground group/stat hover:text-primary transition-colors">
              <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center group-hover/stat:bg-purple-200 dark:group-hover/stat:bg-purple-900/50 transition-colors">
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-foreground">{project._count?.members || 0}</span>
                <span className="text-xs">members</span>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs px-2.5 py-1 font-medium shadow-sm">
            {formatRelativeTime(project.updatedAt)}
          </Badge>
        </div>

        {/* Members Avatars */}
        {project.members && project.members.length > 0 && (
          <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs font-semibold text-muted-foreground">Team</span>
            <div className="flex items-center gap-2 flex-1">
              <div className="flex -space-x-3">
                {project.members?.slice(0, 4).map((member: any, index: number) => (
                  <Avatar 
                    key={member.id} 
                    className={cn(
                      "h-9 w-9 border-3 border-background ring-2 ring-slate-100 dark:ring-slate-800 transition-all hover:scale-125 hover:z-10 hover:ring-primary/50 cursor-pointer",
                    )}
                    style={{ zIndex: 4 - index }}
                    title={member.user.name}
                  >
                    <AvatarImage src={member.user.image} />
                    <AvatarFallback className="text-xs font-semibold bg-linear-to-br from-blue-500 to-purple-600 text-white">
                      {getInitials(member.user.name)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {(project._count?.members || 0) > 4 && (
                <Badge variant="secondary" className="text-xs font-bold px-2 py-0.5 shadow-sm">
                  +{project._count.members - 4}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
