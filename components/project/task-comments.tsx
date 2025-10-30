"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { MessageSquare, MoreVertical, Pencil, Trash2, Send, Loader2 } from "lucide-react"
import { formatDate, getInitials } from "@/lib/utils"

interface TaskCommentsProps {
  taskId: string
  currentUser: any
}

export function TaskComments({ taskId, currentUser }: TaskCommentsProps) {
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")

  useEffect(() => {
    fetchComments()
  }, [taskId])

  async function fetchComments() {
    if (!taskId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/comments?taskId=${taskId}`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error)
      toast.error("Failed to load comments")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit() {
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          taskId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create comment")
      }

      toast.success("Comment added")
      setNewComment("")
      fetchComments()
    } catch (error) {
      toast.error("Failed to add comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleEdit(commentId: string, content: string) {
    if (!editContent.trim()) return

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      })

      if (!response.ok) {
        throw new Error("Failed to update comment")
      }

      toast.success("Comment updated")
      setEditingId(null)
      setEditContent("")
      fetchComments()
    } catch (error) {
      toast.error("Failed to update comment")
    }
  }

  async function handleDelete(commentId: string) {
    if (!confirm("Are you sure you want to delete this comment?")) return

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete comment")
      }

      toast.success("Comment deleted")
      fetchComments()
    } catch (error) {
      toast.error("Failed to delete comment")
    }
  }

  function startEdit(comment: any) {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditContent("")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h3 className="text-lg font-semibold">
          Comments ({comments.length})
        </h3>
      </div>

      <Separator />

      {/* Add Comment */}
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={currentUser?.image || ""} />
          <AvatarFallback>
            {getInitials(currentUser?.name || "")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleSubmit()
              }
            }}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Press Ctrl+Enter to submit
            </span>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting || !newComment.trim()}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Comment
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Comments List */}
      <ScrollArea className="max-h-[400px] pr-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No comments yet</p>
            <p className="text-sm">Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 group">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user.image} />
                  <AvatarFallback>
                    {getInitials(comment.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {comment.user.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.createdAt)}
                      </span>
                      {comment.updatedAt !== comment.createdAt && (
                        <span className="text-xs text-muted-foreground italic">
                          (edited)
                        </span>
                      )}
                    </div>
                    {currentUser?.id === comment.user.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => startEdit(comment)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(comment.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  {editingId === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleEdit(comment.id, comment.content)}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
