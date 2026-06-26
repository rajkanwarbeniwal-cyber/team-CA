import { createClient } from "@/lib/supabase/client"

// Store OTP codes in memory (in production, use a secure backend)
const otpStore = new Map<string, { code: string; expiresAt: number }>()

/**
 * Generate a random 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Store OTP temporarily for verification
 */
export function storeOTP(identifier: string, otp: string): void {
  const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes
  otpStore.set(identifier, { code: otp, expiresAt })
}

/**
 * Verify OTP against stored value
 */
export function verifyOTP(identifier: string, otp: string): boolean {
  const stored = otpStore.get(identifier)
  if (!stored) return false
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(identifier)
    return false
  }
  if (stored.code !== otp) return false
  otpStore.delete(identifier)
  return true
}

/**
 * Send OTP via phone (simulated for development)
 * In production, integrate with Twilio or similar service
 */
export async function sendPhoneOTP(phone: string): Promise<string> {
  try {
    const otp = generateOTP()
    storeOTP(`phone:${phone}`, otp)

    // Log for development (in real app, send via Twilio)
    console.log(`[v0] OTP for ${phone}: ${otp}`)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return otp
  } catch (error) {
    console.error("[v0] Error sending phone OTP:", error)
    throw error
  }
}

/**
 * Send OTP via email using Resend API (server-side)
 */
export async function sendEmailOTP(email: string): Promise<string> {
  try {
    const otp = generateOTP()
    storeOTP(`email:${email}`, otp)

    // Try to send via server action (Resend)
    try {
      const { sendOTPEmailAction } = await import("@/lib/auth/otp-server-actions")
      const result = await sendOTPEmailAction(email, otp)
      
      if (result.success) {
        console.log(`[v0] OTP email sent successfully to ${email}`)
      } else {
        console.warn(`[v0] Failed to send email via Resend: ${result.error}`)
        console.log(`[v0] OTP for ${email}: ${otp} (fallback to console)`)
      }
    } catch (error) {
      // If Resend not available or error occurs, log to console for development
      console.warn("[v0] Could not send email via Resend, using console fallback")
      console.log(`[v0] OTP for ${email}: ${otp}`)
    }

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return otp
  } catch (error) {
    console.error("[v0] Error sending email OTP:", error)
    throw error
  }
}

/**
 * Verify phone OTP
 */
export function verifyPhoneOTP(phone: string, otp: string): boolean {
  return verifyOTP(`phone:${phone}`, otp)
}

/**
 * Verify email OTP
 */
export function verifyEmailOTP(email: string, otp: string): boolean {
  return verifyOTP(`email:${email}`, otp)
}

/**
 * Create or get user after OTP verification
 */
export async function createOrGetUserAfterOTP(
  contact: string,
  method: "phone" | "email"
): Promise<{ userId: string; isNewUser: boolean }> {
  const supabase = createClient()

  if (method === "phone") {
    // For phone: use phone as email (phone@taksha.local)
    const pseudoEmail = `${contact}@phone.taksha.local`

    // Try to sign up (will fail if already exists)
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: pseudoEmail,
      password: generateOTP(), // Generate random password
      phone: contact,
    })

    if (signUpError && !signUpError.message.includes("already")) {
      throw signUpError
    }

    // Sign in to get current user
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      return { userId: data.user.id, isNewUser: !signUpError || signUpError.message.includes("already") }
    }

    throw new Error("Failed to authenticate user")
  } else {
    // For email: use email directly
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: contact,
      password: generateOTP(), // Generate random password
    })

    if (signUpError && !signUpError.message.includes("already")) {
      throw signUpError
    }

    const { data } = await supabase.auth.getUser()
    if (data.user) {
      return { userId: data.user.id, isNewUser: !signUpError || signUpError.message.includes("already") }
    }

    throw new Error("Failed to authenticate user")
  }
}
