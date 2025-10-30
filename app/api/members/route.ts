import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["OWNER", "ADMIN", "MEMBER", "VIEWER"]),
  projectId: z.string(),
})

const updateMemberSchema = z.object({
  role: z.enum(["OWNER", "ADMIN", "MEMBER", "VIEWER"]),
})

// Add member to project
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = inviteMemberSchema.parse(body)

    // Verify user is owner or admin of the project
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId: validatedData.projectId,
        userId: session.user.id,
        role: {
          in: ["OWNER", "ADMIN"],
        },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Find user by email
    const invitedUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (!invitedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: validatedData.projectId,
          userId: invitedUser.id,
        },
      },
    })

    if (existingMember) {
      return NextResponse.json({ error: "User is already a member" }, { status: 400 })
    }

    // Add member
    const newMember = await prisma.projectMember.create({
      data: {
        projectId: validatedData.projectId,
        userId: invitedUser.id,
        role: validatedData.role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    // Create notification for the invited user
    await prisma.notification.create({
      data: {
        type: "TEAM_INVITE",
        title: "Added to Project",
        message: `You've been added to a project by ${session.user.name}`,
        userId: invitedUser.id,
        link: `/projects/${validatedData.projectId}`,
      },
    })

    return NextResponse.json(newMember, { status: 201 })
  } catch (error) {
    console.error("Error adding member:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to add member" }, { status: 500 })
  }
}

// Get project members
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 })
    }

    // Verify user is a member
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: session.user.id,
      },
    })

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: [
        { role: "asc" },
        { joinedAt: "asc" },
      ],
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error("Error fetching members:", error)
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 })
  }
}
