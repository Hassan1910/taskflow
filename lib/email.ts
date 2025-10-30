import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    // If email is not configured, log to console instead
    if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
      console.log("📧 Email would be sent:")
      console.log(`To: ${to}`)
      console.log(`Subject: ${subject}`)
      console.log(`Content: ${text || html}`)
      return { success: true, simulated: true }
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER,
      to,
      subject,
      html,
      text,
    })

    console.log("Email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Failed to send email:", error)
    throw error
  }
}

export function generateVerificationEmail(name: string, verificationUrl: string) {
  return {
    subject: "Verify your email - TaskFlow",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to TaskFlow! 🎉</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Thanks for signing up! We're excited to have you on board.</p>
              <p>Please verify your email address by clicking the button below:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't create an account, you can safely ignore this email.</p>
              <p>Best regards,<br/>The TaskFlow Team</p>
            </div>
            <div class="footer">
              <p>© 2025 TaskFlow. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Hi ${name},\n\nThanks for signing up for TaskFlow!\n\nPlease verify your email address by clicking this link:\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, you can safely ignore this email.\n\nBest regards,\nThe TaskFlow Team`,
  }
}

export function generatePasswordResetEmail(name: string, resetUrl: string) {
  return {
    subject: "Reset your password - TaskFlow",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request 🔐</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>We received a request to reset your password for your TaskFlow account.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
              <div class="warning">
                <strong>⚠️ Security Note:</strong> This link will expire in 1 hour for security reasons.
              </div>
              <p>If you didn't request a password reset, please ignore this email or contact support if you're concerned about your account security.</p>
              <p>Best regards,<br/>The TaskFlow Team</p>
            </div>
            <div class="footer">
              <p>© 2025 TaskFlow. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Hi ${name},\n\nWe received a request to reset your password for your TaskFlow account.\n\nClick this link to reset your password:\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request a password reset, please ignore this email.\n\nBest regards,\nThe TaskFlow Team`,
  }
}

export function generateTeamInviteEmail(
  inviterName: string,
  projectName: string,
  role: string,
  inviteUrl: string
) {
  return {
    subject: `${inviterName} invited you to join "${projectName}" on TaskFlow`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .project-box { background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>You've been invited! 🎉</h1>
            </div>
            <div class="content">
              <p>Great news!</p>
              <p><strong>${inviterName}</strong> has invited you to collaborate on a project in TaskFlow.</p>
              <div class="project-box">
                <h3 style="margin: 0 0 10px 0;">📋 ${projectName}</h3>
                <p style="margin: 0; color: #666;">Role: <strong>${role}</strong></p>
              </div>
              <p>Click the button below to accept the invitation and start collaborating:</p>
              <div style="text-align: center;">
                <a href="${inviteUrl}" class="button">Accept Invitation</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${inviteUrl}</p>
              <p>Looking forward to working with you!</p>
              <p>Best regards,<br/>The TaskFlow Team</p>
            </div>
            <div class="footer">
              <p>© 2025 TaskFlow. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `${inviterName} has invited you to join "${projectName}" on TaskFlow!\n\nRole: ${role}\n\nAccept the invitation here:\n${inviteUrl}\n\nBest regards,\nThe TaskFlow Team`,
  }
}
