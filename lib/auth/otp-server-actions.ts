"use server"

import { sendVerificationEmail, sendConfirmationEmail } from "@/lib/auth/send-email"

export async function sendOTPEmailAction(email: string, otp: string) {
  try {
    const result = await sendVerificationEmail(email, otp)
    return result
  } catch (error) {
    console.error("[v0] Server action error sending OTP:", error)
    return { success: false, error: "Failed to send OTP email" }
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
