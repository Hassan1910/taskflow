import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateCommentSchema = z.object({
  content: z.string().min(1, "Comment content is required"),
})

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
    const validatedData = updateCommentSchema.parse(body)

    // Verify comment exists and user is the owner
    const existingComment = await prisma.comment.findUnique({
      where: { id },
    })

    if (!existingComment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    if (existingComment.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: {
        content: validatedData.content,
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

    return NextResponse.json(comment)
  } catch (error) {
    console.error("Error updating comment:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 })
  }
}

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

    // Verify comment exists and user is the owner
    const existingComment = await prisma.comment.findUnique({
      where: { id },
    })

    if (!existingComment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    if (existingComment.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.comment.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Comment deleted successfully" })
  } catch (error) {
    console.error("Error deleting comment:", error)
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 })
  }
}
