"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { Resend } from "resend"

function createSupabaseServer() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        async getAll() {
          return (await cookieStore).getAll()
        },
        async setAll(cookiesToSet) {
          const store = await cookieStore
          cookiesToSet.forEach(({ name, value, options }) =>
            store.set(name, value, options)
          )
        },
      },
    }
  )
}

// ─── Email OTP via Resend ────────────────────────────────────────────────────

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOTPEmailAction(email: string, otp: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[v0] RESEND_API_KEY not set — OTP console fallback:", otp)
    return { success: false, error: "RESEND_API_KEY not configured" }
  }

  try {
    const result = await resend.emails.send({
      from: "Taksha <noreply@taksha.app>",
      to: email,
      subject: `${otp} — Your Taksha Verification Code`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#fff;border-radius:12px;">
          <h1 style="color:#3b82f6;margin:0 0 8px 0;font-size:24px;">Taksha</h1>
          <p style="color:#444;margin:0 0 24px 0;">Use the code below to verify your email address.</p>
          <div style="background:#f3f4f6;border-radius:8px;padding:24px;text-align:center;margin:0 0 24px 0;">
            <p style="margin:0 0 8px 0;color:#666;font-size:14px;">Verification code</p>
            <h2 style="letter-spacing:8px;font-size:40px;margin:0;font-family:'Courier New',monospace;color:#111;">${otp}</h2>
          </div>
          <p style="color:#888;font-size:13px;margin:0;">Expires in 10 minutes. If you did not request this, ignore this email.</p>
        </div>
      `,
    })

    if (result.error) {
      console.error("[v0] Resend error:", result.error)
      return { success: false, error: result.error.message }
    }

    return { success: true, messageId: result.data?.id }
  } catch (error) {
    console.error("[v0] sendOTPEmailAction error:", error)
    return { success: false, error: "Failed to send email" }
  }
}

// ─── OTP store in Supabase otp_codes table ───────────────────────────────────

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function createAndSendEmailOTP(email: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseServer()
  const otp = generateOTP()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  // Delete any existing OTPs for this identifier
  await supabase.from("otp_codes").delete().eq("identifier", `email:${email}`)

  // Store new OTP
  const { error: dbError } = await supabase.from("otp_codes").insert({
    identifier: `email:${email}`,
    code: otp,
    expires_at: expiresAt,
    used: false,
  })

  if (dbError) {
    console.error("[v0] DB error storing OTP:", dbError)
    return { success: false, error: "Failed to store OTP" }
  }

  // Send via Resend
  const result = await sendOTPEmailAction(email, otp)
  if (!result.success) {
    // Log OTP to console as fallback for development
    console.log(`[v0] EMAIL OTP for ${email}: ${otp}`)
  }

  return { success: true }
}

export async function createAndSendPhoneOTP(phone: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseServer()
  const otp = generateOTP()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  // Delete any existing OTPs for this identifier
  await supabase.from("otp_codes").delete().eq("identifier", `phone:${phone}`)

  // Store new OTP
  const { error: dbError } = await supabase.from("otp_codes").insert({
    identifier: `phone:${phone}`,
    code: otp,
    expires_at: expiresAt,
    used: false,
  })

  if (dbError) {
    console.error("[v0] DB error storing phone OTP:", dbError)
    return { success: false, error: "Failed to store OTP" }
  }

  // For now: log to console (integrate Twilio/MSG91 here for production)
  console.log(`[v0] PHONE OTP for ${phone}: ${otp}`)
  // TODO: await sendSMSOTP(phone, otp)

  return { success: true }
}

export async function verifyOTPAction(
  identifier: string,
  otp: string
): Promise<{ valid: boolean; error?: string }> {
  const supabase = createSupabaseServer()

  const { data, error } = await supabase
    .from("otp_codes")
    .select("*")
    .eq("identifier", identifier)
    .eq("used", false)
    .single()

  if (error || !data) {
    return { valid: false, error: "OTP not found or already used" }
  }

  if (new Date(data.expires_at) < new Date()) {
    await supabase.from("otp_codes").delete().eq("id", data.id)
    return { valid: false, error: "OTP has expired" }
  }

  if (data.code !== otp) {
    return { valid: false, error: "Invalid OTP" }
  }

  // Mark as used
  await supabase.from("otp_codes").update({ used: true }).eq("id", data.id)
  return { valid: true }
}

export async function sendConfirmationEmailAction(email: string, userName: string) {
  if (!process.env.RESEND_API_KEY) return { success: false }

  try {
    const result = await resend.emails.send({
      from: "Taksha <noreply@taksha.app>",
      to: email,
      subject: "Welcome to Taksha!",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <h1 style="color:#3b82f6;">Welcome, ${userName}!</h1>
          <p>Your account is ready. Start your exam preparation now.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://taksha.app"}/dashboard"
             style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;margin-top:16px;">
            Go to Dashboard
          </a>
        </div>
      `,
    })
    return { success: !result.error }
  } catch {
    return { success: false }
  }
}
