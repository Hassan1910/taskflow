import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { unlink } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

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

    // Verify attachment exists and user has access
    const attachment = await prisma.attachment.findUnique({
      where: { id },
      include: {
        task: {
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
        },
      },
    })

    if (!attachment || attachment.task.board.project.members.length === 0) {
      return NextResponse.json({ error: "Attachment not found or access denied" }, { status: 404 })
    }

    // Delete file from filesystem
    const filepath = join(process.cwd(), "public", attachment.fileUrl)
    if (existsSync(filepath)) {
      await unlink(filepath)
    }

    // Delete database record
    await prisma.attachment.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Attachment deleted successfully" })
  } catch (error) {
    console.error("Error deleting attachment:", error)
    return NextResponse.json({ error: "Failed to delete attachment" }, { status: 500 })
  }
}
