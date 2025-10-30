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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { Users, UserPlus, MoreVertical, Trash2, Shield, Crown, Eye, Loader2 } from "lucide-react"
import { getInitials } from "@/lib/utils"

interface TeamManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  currentUserRole: string
}

const roleIcons = {
  OWNER: <Crown className="h-4 w-4 text-yellow-500" />,
  ADMIN: <Shield className="h-4 w-4 text-blue-500" />,
  MEMBER: <Users className="h-4 w-4 text-green-500" />,
  VIEWER: <Eye className="h-4 w-4 text-gray-500" />,
}

const roleLabels = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
  VIEWER: "Viewer",
}

export function TeamManagementDialog({
  open,
  onOpenChange,
  projectId,
  currentUserRole,
}: TeamManagementDialogProps) {
  const [members, setMembers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<string>("MEMBER")
  const [isInviting, setIsInviting] = useState(false)

  useEffect(() => {
    if (open) {
      fetchMembers()
    }
  }, [open, projectId])

  async function fetchMembers() {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/members?projectId=${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setMembers(data)
      }
    } catch (error) {
      console.error("Failed to fetch members:", error)
      toast.error("Failed to load team members")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleInvite() {
    if (!email.trim()) {
      toast.error("Email is required")
      return
    }

    setIsInviting(true)
    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          role,
          projectId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to invite member")
      }

      toast.success("Member added successfully")
      setEmail("")
      setRole("MEMBER")
      fetchMembers()
    } catch (error: any) {
      toast.error(error.message || "Failed to invite member")
    } finally {
      setIsInviting(false)
    }
  }

  async function handleUpdateRole(memberId: string, newRole: string) {
    try {
      const response = await fetch(`/api/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        throw new Error("Failed to update role")
      }

      toast.success("Role updated successfully")
      fetchMembers()
    } catch (error) {
      toast.error("Failed to update role")
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!confirm("Are you sure you want to remove this member?")) return

    try {
      const response = await fetch(`/api/members/${memberId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to remove member")
      }

      toast.success("Member removed successfully")
      fetchMembers()
    } catch (error: any) {
      toast.error(error.message || "Failed to remove member")
    }
  }

  const canManage = currentUserRole === "OWNER" || currentUserRole === "ADMIN"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Management
          </DialogTitle>
        </DialogHeader>

        {canManage && (
          <>
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Invite Member
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="member@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIEWER">Viewer</SelectItem>
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      {currentUserRole === "OWNER" && (
                        <SelectItem value="OWNER">Owner</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleInvite} disabled={isInviting} className="w-full">
                {isInviting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                Invite Member
              </Button>
            </div>

            <Separator />
          </>
        )}

        <div className="space-y-4">
          <h3 className="text-sm font-semibold">
            Team Members ({members.length})
          </h3>
          
          <ScrollArea className="max-h-[400px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.user.image} />
                        <AvatarFallback>
                          {getInitials(member.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="gap-1">
                        {roleIcons[member.role as keyof typeof roleIcons]}
                        {roleLabels[member.role as keyof typeof roleLabels]}
                      </Badge>
                      {canManage && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleUpdateRole(member.id, "VIEWER")}
                            >
                              Make Viewer
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateRole(member.id, "MEMBER")}
                            >
                              Make Member
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateRole(member.id, "ADMIN")}
                            >
                              Make Admin
                            </DropdownMenuItem>
                            {currentUserRole === "OWNER" && (
                              <DropdownMenuItem
                                onClick={() => handleUpdateRole(member.id, "OWNER")}
                              >
                                Make Owner
                              </DropdownMenuItem>
                            )}
                            <Separator className="my-1" />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleRemoveMember(member.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="pt-4 text-sm text-muted-foreground space-y-2">
          <p className="font-medium">Role Permissions:</p>
          <ul className="space-y-1 text-xs">
            <li>• <strong>Owner:</strong> Full access, can delete project</li>
            <li>• <strong>Admin:</strong> Manage members, create/edit tasks</li>
            <li>• <strong>Member:</strong> Create and edit own tasks</li>
            <li>• <strong>Viewer:</strong> Read-only access</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
