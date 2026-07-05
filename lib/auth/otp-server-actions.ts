"use server"

import { sendVerificationEmail, sendConfirmationEmail } from "@/lib/auth/send-email"

export async function sendOTPEmailAction(email: string, otp: string) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("[v0] RESEND_API_KEY not configured")
      return { success: false, error: "Email service not configured. Please contact support." }
    }
    
    const result = await sendVerificationEmail(email, otp)
    return result
  } catch (error) {
    console.error("[v0] Server action error sending OTP:", error)
    const errorMsg = error instanceof Error ? error.message : "Failed to send OTP email"
    return { success: false, error: errorMsg }
  }
}

export async function sendConfirmationEmailAction(email: string, userName: string) {
  try {
    const result = await sendConfirmationEmail(email, userName)
    return result
  } catch (error) {
    console.error("[v0] Server action error sending confirmation:", error)
    return { success: false, error: "Failed to send confirmation email" }
  }
}
