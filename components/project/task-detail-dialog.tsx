"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { TaskComments } from "@/components/project/task-comments"
import { TaskAttachments } from "@/components/project/task-attachments"
import { toast } from "sonner"
import {
  Calendar,
  Clock,
  User,
  Tag,
  FileText,
  Save,
  Trash2,
  X,
} from "lucide-react"
import { formatDate, getInitials } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface TaskDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskId: string | null
  projectMembers: any[]
  onTaskUpdated: () => void
  onTaskDeleted: () => void
  currentUser: any
  projectId?: string
}

const priorityColors = {
  low: "bg-slate-100 text-slate-700 border-slate-200",
  medium: "bg-blue-100 text-blue-700 border-blue-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  urgent: "bg-red-100 text-red-700 border-red-200",
}

export function TaskDetailDialog({
  open,
  onOpenChange,
  taskId,
  projectMembers,
  onTaskUpdated,
  onTaskDeleted,
  currentUser,
  projectId,
}: TaskDetailDialogProps) {
  const [task, setTask] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [boards, setBoards] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    dueDate: "",
    assigneeId: "unassigned",
  })

  useEffect(() => {
    if (open && taskId) {
      fetchTask()
      if (projectId) {
        fetchBoards()
      }
    }
  }, [open, taskId, projectId])

  async function fetchBoards() {
    if (!projectId) return

    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setBoards(data.boards || [])
      }
    } catch (error) {
      console.error("Failed to fetch boards:", error)
    }
  }

  async function fetchTask() {
    if (!taskId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/tasks/${taskId}`)
      if (response.ok) {
        const data = await response.json()
        setTask(data)
        setFormData({
          title: data.title,
          description: data.description || "",
          priority: data.priority,
          status: data.status,
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split("T")[0] : "",
          assigneeId: data.assigneeId || "unassigned",
        })
      }
    } catch (error) {
      console.error("Failed to fetch task:", error)
      toast.error("Failed to load task details")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSave() {
    if (!taskId || !formData.title.trim()) {
      toast.error("Task title is required")
      return
    }

    setIsSaving(true)
    try {
      // Determine the target board based on status
      let targetBoardId = task.boardId // Keep current board by default
      
      if (formData.status !== task.status && boards.length > 0) {
        // Find the board that matches the new status
        const targetBoard = boards.find((board: any) => {
          const boardTitle = board.title.toLowerCase()
          if (formData.status === "todo") {
            return boardTitle.includes("to do") || boardTitle.includes("todo")
          } else if (formData.status === "in_progress") {
            return boardTitle.includes("progress")
          } else if (formData.status === "done") {
            return boardTitle.includes("done")
          }
          return false
        })
        
        if (targetBoard) {
          targetBoardId = targetBoard.id
        }
      }

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          status: formData.status,
          dueDate: formData.dueDate || null,
          assigneeId: formData.assigneeId === "unassigned" ? null : formData.assigneeId,
          boardId: targetBoardId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update task")
      }

      toast.success("Task updated successfully")
      onTaskUpdated()
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to update task")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!taskId) return
    if (!confirm("Are you sure you want to delete this task?")) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete task")
      }

      toast.success("Task deleted successfully")
      onTaskDeleted()
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to delete task")
    } finally {
      setIsDeleting(false)
    }
  }

  const isOverdue =
    task?.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "done"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-linear-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="bg-linear-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Task Details
            </span>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
              <p className="text-sm text-muted-foreground font-medium">Loading task details...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 overflow-y-auto flex-1 pr-2 custom-scrollbar">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2 text-base font-semibold">
                <FileText className="h-4 w-4 text-primary" />
                Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter task title"
                className="text-lg font-semibold border-2 focus:border-primary transition-colors"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-semibold">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Add a more detailed description..."
                rows={5}
                className="resize-none border-2 focus:border-primary transition-colors"
              />
            </div>

            <Separator className="my-6" />

            {/* Task Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status" className="flex items-center gap-2 text-base font-semibold">
                  <Tag className="h-4 w-4 text-primary" />
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger id="status" className="border-2 hover:border-primary/50 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span>📝</span> To Do
                      </div>
                    </SelectItem>
                    <SelectItem value="in_progress" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span>⚡</span> In Progress
                      </div>
                    </SelectItem>
                    <SelectItem value="done" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span>✅</span> Done
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority" className="flex items-center gap-2 text-base font-semibold">
                  <Tag className="h-4 w-4 text-primary" />
                  Priority
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger id="priority" className="border-2 hover:border-primary/50 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn("text-xs", priorityColors.low)}
                        >
                          📌 Low
                        </Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn("text-xs", priorityColors.medium)}
                        >
                          ➡️ Medium
                        </Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="high" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn("text-xs", priorityColors.high)}
                        >
                          ⚠️ High
                        </Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="urgent" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn("text-xs", priorityColors.urgent)}
                        >
                          🔥 Urgent
                        </Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="flex items-center gap-2 text-base font-semibold">
                  <Calendar className="h-4 w-4 text-primary" />
                  Due Date
                  {isOverdue && (
                    <Badge variant="destructive" className="text-xs animate-pulse">
                      ⚠️ Overdue
                    </Badge>
                  )}
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className="border-2 hover:border-primary/50 transition-colors"
                />
              </div>

              {/* Assignee */}
              <div className="space-y-2">
                <Label htmlFor="assignee" className="flex items-center gap-2 text-base font-semibold">
                  <User className="h-4 w-4 text-primary" />
                  Assign To
                </Label>
                <Select
                  value={formData.assigneeId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, assigneeId: value })
                  }
                >
                  <SelectTrigger id="assignee" className="border-2 hover:border-primary/50 transition-colors">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <User className="h-3 w-3" />
                        </div>
                        <span>Unassigned</span>
                      </div>
                    </SelectItem>
                    {projectMembers.map((member) => (
                      <SelectItem key={member.user.id} value={member.user.id} className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6 ring-2 ring-white dark:ring-slate-800">
                            <AvatarImage src={member.user.image} />
                            <AvatarFallback className="text-xs font-semibold bg-linear-to-br from-primary to-primary/80 text-white">
                              {getInitials(member.user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{member.user.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Metadata */}
            {task && (
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border-2 border-slate-100 dark:border-slate-800">
                <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">Timeline</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>
                      Created <span className="font-semibold text-slate-900 dark:text-slate-100">{formatDate(task.createdAt)}</span> by{" "}
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{task.createdBy?.name || "Unknown"}</span>
                    </span>
                  </div>
                  {task.updatedAt !== task.createdAt && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>
                        Last updated <span className="font-semibold text-slate-900 dark:text-slate-100">{formatDate(task.updatedAt)}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Separator className="my-6" />

            {/* Attachments Section */}
            {taskId && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border-2 border-slate-100 dark:border-slate-800 p-4">
                <TaskAttachments taskId={taskId} />
              </div>
            )}

            <Separator className="my-6" />

            {/* Comments Section */}
            {taskId && (
              <div className="bg-white dark:bg-slate-900 rounded-lg border-2 border-slate-100 dark:border-slate-800 p-4">
                <TaskComments taskId={taskId} currentUser={currentUser} />
              </div>
            )}

            <Separator className="my-6" />
            
            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 pb-2 sticky bottom-0 bg-linear-to-t from-white via-white to-transparent dark:from-slate-950 dark:via-slate-950 dark:to-transparent">
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting || isSaving}
                className="shadow-lg hover:shadow-xl transition-shadow"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete Task"}
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSaving || isDeleting}
                  className="shadow-md hover:shadow-lg transition-shadow"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving || isDeleting}
                  className="shadow-lg hover:shadow-xl transition-shadow bg-linear-to-r from-primary to-primary/90"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
