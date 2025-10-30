import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateMemberSchema = z.object({
  role: z.enum(["OWNER", "ADMIN", "MEMBER", "VIEWER"]),
})

// Update member role
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const body = await req.json()
    const validatedData = updateMemberSchema.parse(body)

    // Get the membership to update
    const targetMembership = await prisma.projectMember.findUnique({
      where: { id },
    })

    if (!targetMembership) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Verify user is owner or admin of the project
    const userMembership = await prisma.projectMember.findFirst({
      where: {
        projectId: targetMembership.projectId,
        userId: session.user.id,
        role: {
          in: ["OWNER", "ADMIN"],
        },
      },
    })

    if (!userMembership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Update member role
    const updatedMember = await prisma.projectMember.update({
      where: { id },
      data: {
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

    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error("Error updating member:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 })
  }
}

// Remove member from project
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    // Get the membership to delete
    const targetMembership = await prisma.projectMember.findUnique({
      where: { id },
    })

    if (!targetMembership) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Verify user is owner or admin of the project, or removing themselves
    const userMembership = await prisma.projectMember.findFirst({
      where: {
        projectId: targetMembership.projectId,
        userId: session.user.id,
      },
    })

    if (!userMembership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const canRemove =
      userMembership.role === "OWNER" ||
      userMembership.role === "ADMIN" ||
      targetMembership.userId === session.user.id

    if (!canRemove) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Prevent removing the last owner
    if (targetMembership.role === "OWNER") {
      const ownerCount = await prisma.projectMember.count({
        where: {
          projectId: targetMembership.projectId,
          role: "OWNER",
        },
      })

      if (ownerCount <= 1) {
        return NextResponse.json(
          { error: "Cannot remove the last owner" },
          { status: 400 }
        )
      }
    }

    // Delete membership
    await prisma.projectMember.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Member removed successfully" })
  } catch (error) {
    console.error("Error removing member:", error)
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 })
  }
}
