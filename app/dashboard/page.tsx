import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { DashboardClient } from "./dashboard-client"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard - TaskFlow",
  description: "Manage your projects and tasks efficiently with TaskFlow dashboard",
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  return <DashboardClient user={session.user} />
}
