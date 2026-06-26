// This file is kept for backward compatibility.
// All OTP logic has been moved to lib/auth/otp-server-actions.ts
// which uses Supabase otp_codes table for reliable server-side storage.

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
