"use client"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Paperclip,
  Upload,
  Trash2,
  Download,
  File,
  FileText,
  FileImage,
  FileVideo,
  FileArchive,
  Loader2,
} from "lucide-react"
import { formatDate, getInitials } from "@/lib/utils"

interface TaskAttachmentsProps {
  taskId: string
}

function getFileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase()
  
  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext || "")) {
    return <FileImage className="h-8 w-8 text-blue-500" />
  }
  if (["mp4", "avi", "mov", "wmv"].includes(ext || "")) {
    return <FileVideo className="h-8 w-8 text-purple-500" />
  }
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext || "")) {
    return <FileArchive className="h-8 w-8 text-orange-500" />
  }
  if (["pdf", "doc", "docx", "txt", "md"].includes(ext || "")) {
    return <FileText className="h-8 w-8 text-red-500" />
  }
  return <File className="h-8 w-8 text-gray-500" />
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function TaskAttachments({ taskId }: TaskAttachmentsProps) {
  const [attachments, setAttachments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchAttachments()
  }, [taskId])

  async function fetchAttachments() {
    if (!taskId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/attachments?taskId=${taskId}`)
      if (response.ok) {
        const data = await response.json()
        setAttachments(data)
      }
    } catch (error) {
      console.error("Failed to fetch attachments:", error)
      toast.error("Failed to load attachments")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB")
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("taskId", taskId)

      const response = await fetch("/api/attachments", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload file")
      }

      toast.success("File uploaded successfully")
      fetchAttachments()
    } catch (error) {
      toast.error("Failed to upload file")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  async function handleDelete(attachmentId: string) {
    if (!confirm("Are you sure you want to delete this attachment?")) return

    try {
      const response = await fetch(`/api/attachments/${attachmentId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete attachment")
      }

      toast.success("Attachment deleted")
      fetchAttachments()
    } catch (error) {
      toast.error("Failed to delete attachment")
    }
  }

  function handleDownload(attachment: any) {
    const link = document.createElement("a")
    link.href = attachment.fileUrl
    link.download = attachment.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="h-5 w-5" />
          <h3 className="text-lg font-semibold">
            Attachments ({attachments.length})
          </h3>
        </div>
        <Button
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Upload File
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="*/*"
        />
      </div>

      <Separator />

      {/* Attachments List */}
      <ScrollArea className="max-h-[300px] pr-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : attachments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Paperclip className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No attachments yet</p>
            <p className="text-sm">Upload files to share with your team</p>
          </div>
        ) : (
          <div className="space-y-3">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-md transition-shadow group"
              >
                <div className="shrink-0">
                  {getFileIcon(attachment.fileName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {attachment.fileName}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(attachment.fileSize)}</span>
                    <span>•</span>
                    <span>{formatDate(attachment.createdAt)}</span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDownload(attachment)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(attachment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {attachments.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Maximum file size: 10MB
        </p>
      )}
    </div>
  )
}
