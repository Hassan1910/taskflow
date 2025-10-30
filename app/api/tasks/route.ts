import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  boardId: z.string(),
  assigneeId: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  dueDate: z.string().optional(),
})

// POST - Create a new task
export async function POST(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const data = taskSchema.parse(body)

    // Verify user has access to the board's project
    const board = await prisma.board.findFirst({
      where: {
        id: data.boardId,
        project: {
          OR: [
            { ownerId: session.user.id },
            {
              members: {
                some: {
                  userId: session.user.id,
                },
              },
            },
          ],
        },
      },
      include: {
        tasks: {
          orderBy: { position: "desc" },
          take: 1,
        },
      },
    })

    if (!board) {
      return NextResponse.json(
        { error: "Board not found or access denied" },
        { status: 404 }
      )
    }

    const position = (board.tasks[0]?.position || 0) + 1

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        boardId: data.boardId,
        assigneeId: data.assigneeId,
        priority: data.priority || "medium",
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        position,
        createdById: session.user.id,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error("Error creating task:", error)
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    )
  }
}
