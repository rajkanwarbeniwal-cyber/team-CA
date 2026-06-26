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
 * Send OTP via email using Resend API
 */
export async function sendEmailOTP(email: string): Promise<string> {
  try {
    const otp = generateOTP()
    storeOTP(`email:${email}`, otp)

    // If Resend API key exists, use it; otherwise simulate
    const resendApiKey = process.env.NEXT_PUBLIC_RESEND_API_KEY || process.env.RESEND_API_KEY

    if (resendApiKey && typeof window === "undefined") {
      // Server-side: use Resend API
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "noreply@taksha.app",
          to: email,
          subject: "Your Taksha Verification Code",
          html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Verify Your Email</h2>
            <p>Your verification code is:</p>
            <h1 style="color: #3b82f6; letter-spacing: 3px; font-size: 32px;">${otp}</h1>
            <p style="color: #666;">This code will expire in 10 minutes.</p>
            <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
          </div>`,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send email OTP")
      }
    } else {
      // Development: log OTP
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
