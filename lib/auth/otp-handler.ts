"use server"

import { createClient as createServiceClient } from "@supabase/supabase-js"
import { sendVerificationEmail } from "@/lib/auth/send-email"

// Service-role client — bypasses RLS, safe only in server code
function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/** Generate a random 6-digit OTP */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/** Persist OTP to Supabase (survives serverless cold starts) */
async function storeOTP(identifier: string, code: string): Promise<void> {
  const supabase = getServiceClient()
  // Invalidate any previous unused codes for this identifier
  await supabase
    .from("otp_codes")
    .update({ used: true })
    .eq("identifier", identifier)
    .eq("used", false)

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
  const { error } = await supabase
    .from("otp_codes")
    .insert({ identifier, code, expires_at: expiresAt })

  if (error) throw new Error(`OTP store failed: ${error.message}`)
}

/** Verify OTP from Supabase and mark it used */
export async function verifyOTP(identifier: string, code: string): Promise<boolean> {
  const supabase = getServiceClient()

  const { data, error } = await supabase
    .from("otp_codes")
    .select("id, code, expires_at, used")
    .eq("identifier", identifier)
    .eq("used", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (error || !data) return false

  const expired = new Date(data.expires_at) < new Date()
  if (expired || data.used || data.code !== code) return false

  // Mark as used
  await supabase.from("otp_codes").update({ used: true }).eq("id", data.id)
  return true
}

/** Send OTP to a phone number (logs to console — integrate Twilio for production) */
export async function sendPhoneOTP(phone: string): Promise<void> {
  const otp = generateOTP()
  await storeOTP(`phone:${phone}`, otp)
  // TODO: replace with Twilio API call
  console.log(`[dev] OTP for ${phone}: ${otp}`)
}

/** Send OTP email via Resend and persist to Supabase */
export async function sendEmailOTP(email: string): Promise<void> {
  const otp = generateOTP()
  await storeOTP(`email:${email}`, otp)

  const result = await sendVerificationEmail(email, otp)
  if (!result.success) {
    throw new Error(result.error ?? "Failed to send OTP email")
  }
}

/** Verify a phone OTP */
export async function verifyPhoneOTP(phone: string, otp: string): Promise<boolean> {
  return verifyOTP(`phone:${phone}`, otp)
}

/** Verify an email OTP */
export async function verifyEmailOTP(email: string, otp: string): Promise<boolean> {
  return verifyOTP(`email:${email}`, otp)
}
