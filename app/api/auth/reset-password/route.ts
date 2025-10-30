import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail, generatePasswordResetEmail } from "@/lib/email"
import { hash } from "bcryptjs"
import { randomBytes } from "crypto"
import { z } from "zod"

// POST - Request password reset
export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ 
        message: "If the email exists, a password reset link has been sent" 
      })
    }

    // Generate reset token
    const token = randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store token
    await prisma.verificationToken.create({
      data: {
        identifier: `reset:${email}`,
        token,
        expires,
      },
    })

    // Send email
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`
    const emailContent = generatePasswordResetEmail(user.name || "User", resetUrl)

    try {
      await sendEmail({
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      })
    } catch (emailError) {
      console.error("Failed to send reset email:", emailError)
    }

    return NextResponse.json({ 
      message: "If the email exists, a password reset link has been sent" 
    })
  } catch (error) {
    console.error("Failed to process password reset:", error)
    return NextResponse.json(
      { error: "Failed to process password reset" },
      { status: 500 }
    )
  }
}

// PATCH - Reset password with token
export async function PATCH(request: Request) {
  try {
    const json = await request.json()
    const { token, email, password } = z
      .object({
        token: z.string(),
        email: z.string().email(),
        password: z.string().min(6),
      })
      .parse(json)

    // Find valid token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: `reset:${email}`,
          token,
        },
      },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      )
    }

    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: `reset:${email}`,
            token,
          },
        },
      })
      return NextResponse.json(
        { error: "Reset token has expired. Please request a new one." },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await hash(password, 12)

    // Update user password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    })

    // Delete used token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: `reset:${email}`,
          token,
        },
      },
    })

    return NextResponse.json({ 
      message: "Password reset successfully!" 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    console.error("Failed to reset password:", error)
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    )
  }
}
