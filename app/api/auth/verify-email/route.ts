import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail, generateVerificationEmail } from "@/lib/email"
import { randomBytes } from "crypto"

// POST - Send verification email
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

    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json({ message: "If the email exists, a verification link has been sent" })
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: "Email is already verified" }, { status: 400 })
    }

    // Generate verification token
    const token = randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Store token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    })

    // Send email
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`
    const emailContent = generateVerificationEmail(user.name || "User", verificationUrl)

    try {
      await sendEmail({
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      })
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError)
      // Continue even if email fails - user can request resend
    }

    return NextResponse.json({ 
      message: "Verification email sent. Please check your inbox." 
    })
  } catch (error) {
    console.error("Failed to send verification email:", error)
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    )
  }
}

// GET - Verify email with token
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")
    const email = searchParams.get("email")

    if (!token || !email) {
      return NextResponse.json(
        { error: "Token and email are required" },
        { status: 400 }
      )
    }

    // Find valid token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: email,
          token,
        },
      },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      )
    }

    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: email,
            token,
          },
        },
      })
      return NextResponse.json(
        { error: "Verification token has expired. Please request a new one." },
        { status: 400 }
      )
    }

    // Update user
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    })

    // Delete used token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token,
        },
      },
    })

    return NextResponse.json({ 
      message: "Email verified successfully!" 
    })
  } catch (error) {
    console.error("Failed to verify email:", error)
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    )
  }
}
