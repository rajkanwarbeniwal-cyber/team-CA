import { createClient } from "@/lib/supabase/client"

/**
 * Send OTP via email using Supabase native email OTP
 * Supabase handles the email sending automatically through its email provider
 */
export async function sendEmailOTP(email: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
    },
  })

  if (error) {
    console.error("[v0] Supabase OTP error:", error)
    throw new Error(error.message || "Failed to send OTP email")
  }

  console.log("[v0] OTP email sent successfully to:", email)
}

/**
 * Verify email OTP - Supabase handles this automatically via the callback URL
 * User clicks the link in the email, which completes the auth flow
 */
export async function verifyEmailOTP(email: string, otp: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: "email",
  })

  if (error) {
    console.error("[v0] OTP verification error:", error)
    return false
  }

  return true
}
