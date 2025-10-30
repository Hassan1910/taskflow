"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Check, Trash2, CheckCheck, Loader2 } from "lucide-react"
import { formatDate, cn } from "@/lib/utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function NotificationDropdown() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchNotifications() {
    try {
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      })

      if (response.ok) {
        fetchNotifications()
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  async function markAllAsRead() {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      })

      if (response.ok) {
        toast.success("All notifications marked as read")
        fetchNotifications()
      }
    } catch (error) {
      toast.error("Failed to mark all as read")
    }
  }

  async function deleteNotification(notificationId: string) {
    try {
      const response = await fetch(`/api/notifications?notificationId=${notificationId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Notification deleted")
        fetchNotifications()
      }
    } catch (error) {
      toast.error("Failed to delete notification")
    }
  }

  function handleNotificationClick(notification: any) {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    if (notification.link) {
      router.push(notification.link)
      setIsOpen(false)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl">
        <Bell className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-105">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <>
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-bold shadow-lg animate-in zoom-in"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive rounded-full animate-ping opacity-75" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h3 className="font-bold text-base">Notifications</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-8 text-xs hover:bg-white dark:hover:bg-slate-800 rounded-lg"
            >
              <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[420px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading notifications...</p>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-semibold text-sm mb-1">No notifications</p>
              <p className="text-xs text-muted-foreground">You're all caught up! 🎉</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-all duration-200 group relative",
                    !notification.read && "bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/50 dark:hover:bg-blue-950/30"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {!notification.read && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
                  )}
                  <div className="flex items-start gap-3 pl-3">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                      !notification.read 
                        ? "bg-blue-100 dark:bg-blue-950/50" 
                        : "bg-slate-100 dark:bg-slate-800"
                    )}>
                      <Bell className={cn(
                        "h-5 w-5",
                        !notification.read 
                          ? "text-blue-600 dark:text-blue-400" 
                          : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm leading-tight">{notification.title}</p>
                        {!notification.read && (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0 h-5 shrink-0 bg-blue-500">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950"
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead(notification.id)
                          }}
                          title="Mark as read"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg text-destructive hover:text-destructive hover:bg-red-100 dark:hover:bg-red-950"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
