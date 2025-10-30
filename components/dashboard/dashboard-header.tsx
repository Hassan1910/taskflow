"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CheckCircle2, LogOut, User, Settings } from "lucide-react"
import { getInitials } from "@/lib/utils"
import { signOut } from "next-auth/react"
import { NotificationDropdown } from "@/components/notifications/notification-dropdown"

interface DashboardHeaderProps {
  user: any
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleSignOut() {
    await signOut({ redirect: false })
    router.push("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl supports-backdrop-filter:bg-white/70 dark:supports-backdrop-filter:bg-slate-950/70 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative h-9 w-9 rounded-xl bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-linear-to-r from-slate-900 via-blue-700 to-purple-700 dark:from-slate-100 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              TaskFlow
            </span>
            <span className="text-xs text-muted-foreground -mt-1">Project Management</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <NotificationDropdown />
          {!mounted ? (
            <Button variant="ghost" className="relative h-11 w-11 rounded-xl ring-2 ring-transparent">
              <Avatar className="h-11 w-11">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-background shadow-sm" />
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-11 w-11 rounded-xl ring-2 ring-transparent hover:ring-primary/30 transition-all duration-300 hover:scale-105">
                  <Avatar className="h-11 w-11 ring-2 ring-white dark:ring-slate-800 shadow-md">
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-background shadow-sm animate-pulse" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-2">
                <DropdownMenuLabel className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 ring-2 ring-primary/20 shadow-md">
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1 flex-1 min-w-0">
                      <p className="text-sm font-bold leading-none truncate">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user.email}
                      </p>
                      <Badge variant="secondary" className="text-xs w-fit mt-1">
                        Active
                      </Badge>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer py-2.5 rounded-lg">
                  <Link href="/profile">
                    <User className="mr-3 h-4 w-4" />
                    <span>Profile Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer py-2.5 rounded-lg">
                  <Link href="/profile">
                    <Settings className="mr-3 h-4 w-4" />
                    <span>Account Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive py-2.5 rounded-lg">
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
