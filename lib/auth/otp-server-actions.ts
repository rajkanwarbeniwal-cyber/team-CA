"use server"

import { sendEmailOTP, sendPhoneOTP, verifyEmailOTP, verifyPhoneOTP } from "@/lib/auth/otp-handler"
import { sendConfirmationEmail } from "@/lib/auth/send-email"
import { createClient } from "@/lib/supabase/server"

export async function sendEmailOTPAction(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    await sendEmailOTP(email)
    return { success: true }
  } catch (error: any) {
    console.error("[auth] sendEmailOTPAction:", error?.message ?? error)
    return { success: false, error: error?.message ?? "OTP bhejne mein error aaya" }
  }
}

export async function sendPhoneOTPAction(phone: string): Promise<{ success: boolean; error?: string }> {
  try {
    await sendPhoneOTP(phone)
    return { success: true }
  } catch (error: any) {
    console.error("[auth] sendPhoneOTPAction:", error?.message ?? error)
    return { success: false, error: error?.message ?? "OTP bhejne mein error aaya" }
  }
}

export async function verifyEmailOTPAction(
  email: string,
  otp: string
): Promise<{ success: boolean; isNewUser?: boolean; error?: string }> {
  try {
    const valid = await verifyEmailOTP(email, otp)
    if (!valid) return { success: false, error: "Galat ya expire hua OTP" }

    const supabase = await createClient()

    // Try sign-in first
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: `otp_${otp}_taksha`,
    })

    if (!signInError) return { success: true, isNewUser: false }

    // New user — sign up
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password: `otp_${otp}_taksha`,
    })

    if (signUpError) {
      console.error("[auth] signUp error:", signUpError.message)
      return { success: false, error: "Account create nahi ho saka" }
    }

    // Send welcome email (best-effort)
    const name = email.split("@")[0]
    sendConfirmationEmail(email, name).catch(() => {})

    return { success: true, isNewUser: true }
  } catch (error: any) {
    console.error("[auth] verifyEmailOTPAction:", error?.message ?? error)
    return { success: false, error: "Verification mein error aaya" }
  }
}

export async function verifyPhoneOTPAction(
  phone: string,
  otp: string
): Promise<{ success: boolean; isNewUser?: boolean; error?: string }> {
  try {
    const valid = await verifyPhoneOTP(phone, otp)
    if (!valid) return { success: false, error: "Galat ya expire hua OTP" }

    const supabase = await createClient()
    const email = `${phone}@phone.taksha.local`

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: `otp_${otp}_taksha`,
    })

    if (!signInError) return { success: true, isNewUser: false }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password: `otp_${otp}_taksha`,
    })

    if (signUpError) {
      console.error("[auth] phone signUp error:", signUpError.message)
      return { success: false, error: "Account create nahi ho saka" }
    }

    return { success: true, isNewUser: true }
  } catch (error: any) {
    console.error("[auth] verifyPhoneOTPAction:", error?.message ?? error)
    return { success: false, error: "Verification mein error aaya" }
  }
}

// Legacy compatibility exports
export async function sendOTPEmailAction(email: string, _otp: string) {
  return sendEmailOTPAction(email)
}
export async function sendConfirmationEmailAction(email: string, userName: string) {
  return sendConfirmationEmail(email, userName)
}
