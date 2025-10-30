"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
import { Calendar, MoreVertical, Trash2, User, GripVertical } from "lucide-react"
import { formatDate, getInitials } from "@/lib/utils"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface TaskCardProps {
  task: any
  onUpdate: () => void
  isDragging?: boolean
  onTaskClick?: (taskId: string) => void
}

const priorityColors = {
  low: "bg-slate-100 text-slate-700 border-slate-200",
  medium: "bg-blue-100 text-blue-700 border-blue-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  urgent: "bg-red-100 text-red-700 border-red-200",
}

export function TaskCard({ task, onUpdate, isDragging = false, onTaskClick }: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this task?")) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete task")
      }

      toast.success("Task deleted successfully")
      onUpdate()
    } catch (error) {
      toast.error("Failed to delete task")
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleStatusChange(newStatus: string) {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update task")
      }

      toast.success("Task updated successfully")
      onUpdate()
    } catch (error) {
      toast.error("Failed to update task")
    }
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done"

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={cn(
        "group hover:shadow-lg transition-all duration-200 cursor-grab active:cursor-grabbing border-l-4 hover:scale-[1.02] bg-white dark:bg-slate-900",
        (isDragging || isSortableDragging) && "opacity-50 scale-95",
        task.priority === "urgent" && "border-l-red-500",
        task.priority === "high" && "border-l-orange-500",
        task.priority === "medium" && "border-l-blue-500",
        task.priority === "low" && "border-l-slate-400"
      )}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // Only open detail if not clicking on dropdown or buttons
        const target = e.target as HTMLElement
        if (!target.closest('button') && onTaskClick) {
          onTaskClick(task.id)
        }
      }}
    >
      <CardHeader className="pb-3 relative">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <GripVertical className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex-1 space-y-1.5 min-w-0">
              <h3 className="font-semibold leading-tight text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {task.description}
                </p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 shrink-0 hover:bg-primary/10"
                disabled={isDeleting}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleStatusChange("todo")} className="cursor-pointer">
                <span className="mr-2">📝</span> Move to To Do
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("in_progress")} className="cursor-pointer">
                <span className="mr-2">⚡</span> Move to In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("done")} className="cursor-pointer">
                <span className="mr-2">✅</span> Mark as Done
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className={cn("text-xs font-semibold shadow-sm", priorityColors[task.priority as keyof typeof priorityColors])}
          >
            {task.priority === "urgent" && "🔥 "}
            {task.priority === "high" && "⚠️ "}
            {task.priority === "medium" && "➡️ "}
            {task.priority === "low" && "📌 "}
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </Badge>
          {task.dueDate && (
            <Badge 
              variant={isOverdue ? "destructive" : "outline"} 
              className={cn(
                "text-xs font-medium shadow-sm",
                !isOverdue && "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300"
              )}
            >
              <Calendar className="mr-1 h-3 w-3" />
              {formatDate(task.dueDate)}
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
          {task.assignee ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7 ring-2 ring-white dark:ring-slate-800 shadow-sm">
                <AvatarImage src={task.assignee.image} />
                <AvatarFallback className="text-xs font-semibold bg-linear-to-br from-primary to-primary/80 text-white">
                  {getInitials(task.assignee.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground font-medium">{task.assignee.name}</span>
            </div>
          ) : (
            <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800">
              <User className="mr-1 h-3 w-3" />
              Unassigned
            </Badge>
          )}
          {isOverdue && (
            <span className="text-xs text-red-600 dark:text-red-400 font-semibold animate-pulse">
              Overdue
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
