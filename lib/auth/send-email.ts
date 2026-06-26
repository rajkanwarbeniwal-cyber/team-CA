"use server"

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, otp: string) {
  try {
    const result = await resend.emails.send({
      from: "noreply@taksha.app",
      to: email,
      subject: "Your Taksha Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; margin: 0;">Taksha</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; padding: 30px; text-align: center; color: white;">
            <h2 style="margin: 0 0 20px 0;">Verify Your Email</h2>
            <p style="margin: 0 0 20px 0; font-size: 16px;">Your verification code is:</p>
            <div style="background: rgba(255,255,255,0.2); border-radius: 8px; padding: 15px; margin: 20px 0;">
              <h1 style="letter-spacing: 5px; font-size: 36px; margin: 0; font-family: 'Courier New', monospace;">${otp}</h1>
            </div>
            <p style="margin: 20px 0 0 0; font-size: 14px;">This code will expire in 10 minutes.</p>
          </div>

          <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
            <p style="margin: 10px 0;">If you didn't request this code, please ignore this email.</p>
            <p style="margin: 10px 0; color: #999;">© 2025 Taksha. All rights reserved.</p>
          </div>
        </div>
      `,
    })

    if (result.error) {
      console.error("[v0] Resend error:", result.error)
      return { success: false, error: result.error.message }
    }

    console.log("[v0] Email sent successfully to:", email)
    return { success: true, messageId: result.data?.id }
  } catch (error) {
    console.error("[v0] Error sending email:", error)
    return { success: false, error: "Failed to send email" }
  }
}

export async function sendConfirmationEmail(email: string, userName: string) {
  try {
    const result = await resend.emails.send({
      from: "noreply@taksha.app",
      to: email,
      subject: "Welcome to Taksha - Your Account is Confirmed",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; margin: 0;">Taksha</h1>
          </div>
          
          <h2 style="color: #333; margin-top: 0;">Welcome, ${userName}! 🎉</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Your account has been successfully created. You're all set to start your exam preparation journey.
          </p>

          <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">What's Next?</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Complete your profile to get personalized recommendations</li>
              <li>Select your exam goal and target year</li>
              <li>Map your subject strengths to optimize your study plan</li>
              <li>Start practicing with thousands of exam questions</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://taksha.app"}/profile" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Complete Your Profile
            </a>
          </div>

          <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <p style="margin: 10px 0;">If you have any questions, feel free to reach out to our support team.</p>
            <p style="margin: 10px 0;">© 2025 Taksha. All rights reserved.</p>
          </div>
        </div>
      `,
    })

    if (result.error) {
      console.error("[v0] Resend error:", result.error)
      return { success: false, error: result.error.message }
    }

    console.log("[v0] Confirmation email sent to:", email)
    return { success: true, messageId: result.data?.id }
  } catch (error) {
    console.error("[v0] Error sending confirmation email:", error)
    return { success: false, error: "Failed to send confirmation email" }
  }
}
