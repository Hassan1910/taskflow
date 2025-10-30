"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, Activity as ActivityIcon } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { getActivityMessage } from "@/lib/activity-logger"

interface Activity {
  id: string
  type: string
  entity: string
  entityId: string
  details: string | null
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

interface ActivityFeedProps {
  projectId: string
}

const activityIcons: Record<string, string> = {
  created: "➕",
  updated: "✏️",
  deleted: "🗑️",
  moved: "↔️",
  assigned: "👤",
  unassigned: "👤",
  completed: "✅",
  commented: "💬",
  attached: "📎",
  member_added: "👥",
  member_removed: "👥",
  role_changed: "🔑",
}

const activityColors: Record<string, string> = {
  created: "bg-green-500/10 text-green-700 dark:text-green-400",
  updated: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  deleted: "bg-red-500/10 text-red-700 dark:text-red-400",
  moved: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  assigned: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  commented: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  attached: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
  member_added: "bg-teal-500/10 text-teal-700 dark:text-teal-400",
  member_removed: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  role_changed: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
}

export function ActivityFeed({ projectId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [projectId])

  const fetchActivities = async () => {
    try {
      const response = await fetch(`/api/activities?projectId=${projectId}&limit=30`)
      if (response.ok) {
        const data = await response.json()
        setActivities(data)
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ActivityIcon className="h-5 w-5" />
            Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="border-b bg-linear-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-850">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ActivityIcon className="h-5 w-5 text-primary" />
          Activity Feed
          <Badge variant="secondary" className="ml-auto">
            {activities.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <ActivityIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium mb-1">No activity yet</p>
              <p className="text-sm text-muted-foreground">
                Activity will appear here when team members take actions
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {activities.map((activity) => {
                const message = getActivityMessage(activity)
                const icon = activityIcons[activity.type] || "•"
                const colorClass =
                  activityColors[activity.type] ||
                  "bg-slate-500/10 text-slate-700 dark:text-slate-400"

                return (
                  <div
                    key={activity.id}
                    className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8 shrink-0 border-2 border-white dark:border-slate-900 shadow-sm">
                        <AvatarImage src={activity.user.image || undefined} />
                        <AvatarFallback className="text-xs bg-linear-to-br from-blue-500 to-purple-500 text-white">
                          {activity.user.name?.charAt(0) || activity.user.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <Badge
                            variant="secondary"
                            className={`shrink-0 px-2 py-0.5 text-xs font-medium ${colorClass} border-0`}
                          >
                            <span className="mr-1">{icon}</span>
                            {activity.type}
                          </Badge>
                          <p className="text-sm text-muted-foreground flex-1 min-w-0">
                            {formatDistanceToNow(new Date(activity.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        <p className="text-sm leading-relaxed">{message}</p>
                        {activity.details && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            {activity.details}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

