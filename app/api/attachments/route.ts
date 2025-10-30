import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const taskId = formData.get("taskId") as string | null

    if (!file || !taskId) {
      return NextResponse.json({ error: "File and taskId are required" }, { status: 400 })
    }

    // Verify task exists and user has access
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        board: {
          include: {
            project: {
              include: {
                members: {
                  where: {
                    userId: session.user.id,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!task || task.board.project.members.length === 0) {
      return NextResponse.json({ error: "Task not found or access denied" }, { status: 404 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", "attachments")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
    const filepath = join(uploadsDir, filename)

    // Save file
    await writeFile(filepath, buffer)

    // Create database record
    const attachment = await prisma.attachment.create({
      data: {
        fileName: file.name,
        fileUrl: `/uploads/attachments/${filename}`,
        fileSize: file.size,
        fileType: file.type || "application/octet-stream",
        taskId,
      },
    })

    return NextResponse.json(attachment, { status: 201 })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const taskId = searchParams.get("taskId")

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 })
    }

    // Verify user has access to the task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        board: {
          include: {
            project: {
              include: {
                members: {
                  where: {
                    userId: session.user.id,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!task || task.board.project.members.length === 0) {
      return NextResponse.json({ error: "Task not found or access denied" }, { status: 404 })
    }

    const attachments = await prisma.attachment.findMany({
      where: { taskId },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(attachments)
  } catch (error) {
    console.error("Error fetching attachments:", error)
    return NextResponse.json({ error: "Failed to fetch attachments" }, { status: 500 })
  }
}
