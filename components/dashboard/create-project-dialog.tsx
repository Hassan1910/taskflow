"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Sparkles, FolderKanban, Check } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectCreated: () => void
}

const PROJECT_COLORS = [
  { value: "#6366f1", name: "Indigo" },
  { value: "#8b5cf6", name: "Purple" },
  { value: "#ec4899", name: "Pink" },
  { value: "#f43f5e", name: "Rose" },
  { value: "#f97316", name: "Orange" },
  { value: "#10b981", name: "Emerald" },
  { value: "#06b6d4", name: "Cyan" },
  { value: "#3b82f6", name: "Blue" },
]

export function CreateProjectDialog({
  open,
  onOpenChange,
  onProjectCreated,
}: CreateProjectDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0])
  const [title, setTitle] = useState("")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const titleValue = formData.get("title") as string
    const description = formData.get("description") as string

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: titleValue,
          description,
          color: selectedColor.value,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create project")
      }

      toast.success("Project created successfully!")
      onOpenChange(false)
      onProjectCreated()
      
      // Reset form
      e.currentTarget.reset()
      setTitle("")
      setSelectedColor(PROJECT_COLORS[0])
    } catch (error: any) {
      toast.error(error.message || "Failed to create project")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] gap-0 p-0 overflow-hidden bg-white dark:bg-slate-950">
        {/* Header with gradient background */}
        <div className="relative bg-linear-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 px-6 pt-6 pb-8 bg-white dark:bg-slate-900">
          <div className="absolute top-4 right-4 h-20 w-20 bg-blue-500/20 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 h-20 w-20 bg-purple-500/20 rounded-full blur-2xl" />
          
          <DialogHeader className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <DialogTitle className="text-2xl">Create New Project</DialogTitle>
            </div>
            <DialogDescription className="text-base">
              Start organizing your tasks and collaborate with your team.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Form Content */}
        <form onSubmit={onSubmit} className="px-6 py-6 bg-white dark:bg-slate-950">
          <div className="space-y-6">
            {/* Project Preview */}
            {title && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-1 duration-300">
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md"
                  style={{ backgroundColor: selectedColor.value }}
                >
                  {title.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{title}</p>
                  <p className="text-xs text-muted-foreground">Project preview</p>
                </div>
              </div>
            )}

            {/* Project Name Input */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-primary" />
                Project Name
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Website Redesign, Mobile App, Q4 Planning"
                required
                disabled={isLoading}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11"
              />
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold">
                Description <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the project goals, scope, or any important details..."
                disabled={isLoading}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Color Picker */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">
                Project Color
              </Label>
              <div className="grid grid-cols-8 gap-3">
                {PROJECT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "relative h-10 w-10 rounded-lg transition-all duration-200",
                      "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                      selectedColor.value === color.value 
                        ? "scale-110 ring-2 ring-offset-2 ring-primary shadow-lg" 
                        : "hover:shadow-md"
                    )}
                    style={{ backgroundColor: color.value }}
                    disabled={isLoading}
                    title={color.name}
                  >
                    {selectedColor.value === color.value && (
                      <Check className="h-5 w-5 text-white absolute inset-0 m-auto drop-shadow-md" />
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Selected: <span className="font-medium">{selectedColor.name}</span>
              </p>
            </div>
          </div>

          {/* Footer with Actions */}
          <DialogFooter className="mt-8 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                setTitle("")
              }}
              disabled={isLoading}
              className="flex-1 sm:flex-initial"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !title}
              className="flex-1 sm:flex-initial shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Project
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
