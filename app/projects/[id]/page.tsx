import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { ProjectBoardClient } from "./project-board-client"
import type { Metadata } from "next"

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { id } = await params
  
  return {
    title: "Project Board - TaskFlow",
    description: "Manage your project tasks with an intuitive kanban board",
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const session = await auth()
  const { id } = await params

  if (!session?.user) {
    redirect("/auth/signin")
  }

  return <ProjectBoardClient projectId={id} user={session.user} />
}
