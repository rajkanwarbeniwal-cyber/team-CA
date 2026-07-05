import { sendOTPEmailAction } from "@/lib/auth/otp-server-actions"

/**
 * Store OTP temporarily (in-memory for dev, should use Redis in production)
 */
const otpStore = new Map<string, { code: string; expiresAt: number }>()

/**
 * Generate random 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Store OTP temporarily (10 minutes expiry)
 */
export function storeOTP(identifier: string, otp: string): void {
  const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes
  otpStore.set(identifier, { code: otp, expiresAt })
  console.log("[v0] OTP stored for:", identifier, "expires in 10 minutes")
}

/**
 * Verify OTP
 */
export function verifyOTP(identifier: string, otp: string): boolean {
  const stored = otpStore.get(identifier)
  if (!stored) {
    console.warn("[v0] OTP not found for:", identifier)
    return false
  }
  if (Date.now() > stored.expiresAt) {
    console.warn("[v0] OTP expired for:", identifier)
    otpStore.delete(identifier)
    return false
  }
  if (stored.code !== otp) {
    console.warn("[v0] OTP mismatch for:", identifier)
    return false
  }
  otpStore.delete(identifier)
  console.log("[v0] OTP verified successfully for:", identifier)
  return true
}

/**
 * Send OTP via email using Resend (via server action)
 * Client code calls this, which then calls the server action to send email
 */
export async function sendEmailOTP(email: string): Promise<string> {
  try {
    // Generate OTP
    const otp = generateOTP()
    
    // Store OTP
    storeOTP(`email:${email}`, otp)
    
    // Send via server action (which calls Resend)
    const result = await sendOTPEmailAction(email, otp)
    
    if (!result.success) {
      console.error("[v0] Failed to send OTP email:", result.error)
      throw new Error(result.error || "Failed to send OTP email")
    }
    
    console.log("[v0] OTP email sent successfully to:", email)
    return otp
  } catch (error) {
    console.error("[v0] Error in sendEmailOTP:", error)
    throw error
  }
}

/**
 * Verify email OTP
 */
export function verifyEmailOTP(email: string, otp: string): boolean {
  return verifyOTP(`email:${email}`, otp)
}
