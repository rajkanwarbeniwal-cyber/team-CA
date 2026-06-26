"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import {
  createAndSendEmailOTP,
  verifyOTPAction,
  sendConfirmationEmailAction,
} from "@/lib/auth/otp-server-actions"
import { OTPVerification } from "@/components/auth/otp-verification"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleButton } from "@/components/auth/google-button"
import { Loader2, Eye, EyeOff } from "lucide-react"

type SignUpMethod = "otp" | "password"
type Stage = "form" | "otp"

export function SignUpForm() {
  const router = useRouter()

  const [method, setMethod] = useState<SignUpMethod>("otp")
  const [stage, setStage] = useState<Stage>("form")
  const [loading, setLoading] = useState(false)

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const isNameValid = fullName.trim().length >= 2
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isPasswordValid = password.length >= 8
  const isConfirmValid = password === confirmPassword

  const canSubmitOTP = isNameValid && isEmailValid
  const canSubmitPassword = isNameValid && isEmailValid && isPasswordValid && isConfirmValid

  // ── OTP flow ───────────────────────────────────────────────────────────────
  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmitOTP) return
    setLoading(true)
    try {
      const result = await createAndSendEmailOTP(email)
      if (!result.success) {
        toast.error(result.error || "Failed to send OTP")
        return
      }
      toast.success("OTP sent to your email!")
      setStage("otp")
    } catch {
      toast.error("Failed to send OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOTP(otp: string): Promise<boolean> {
    const { valid, error } = await verifyOTPAction(`email:${email}`, otp)
    if (!valid) {
      toast.error(error || "Invalid OTP")
      return false
    }

    const supabase = createClient()
    const { error: signUpErr } = await supabase.auth.signUp({
      email,
      password: `otp_user_${email}_v1`,
      options: { data: { full_name: fullName.trim(), role: "student" } },
    })

    if (signUpErr) {
      toast.error(signUpErr.message || "Could not create account")
      return false
    }

    try {
      await sendConfirmationEmailAction(email, fullName.trim())
    } catch {
      // Non-critical
    }

    toast.success("Account created successfully!")
    router.push("/auth/sign-up-success")
    return true
  }

  // ── Password flow ──────────────────────────────────────────────────────────
  async function handlePasswordSignUp(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmitPassword) return
    if (!isConfirmValid) {
      toast.error("Passwords do not match")
      return
    }
    setLoading(true)
    const supabase = createClient()
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName.trim(), role: "student" } },
      })
      if (error) {
        toast.error(error.message || "Could not create account")
        return
      }
      try {
        await sendConfirmationEmailAction(email, fullName.trim())
      } catch {
        // Non-critical
      }
      toast.success("Account created! Check your email to confirm.")
      router.push("/auth/sign-up-success")
    } catch {
      toast.error("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border/60 shadow-lg bg-background/95">
      <CardContent className="pt-6">
        {stage === "form" ? (
          <div className="flex flex-col gap-4">
            {/* Method toggle */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setMethod("otp"); setPassword(""); setConfirmPassword("") }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  method === "otp"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Sign up with OTP
              </button>
              <button
                type="button"
                onClick={() => { setMethod("password") }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  method === "password"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Sign up with Password
              </button>
            </div>

            <form
              onSubmit={method === "otp" ? handleSendOTP : handlePasswordSignUp}
              className="flex flex-col gap-4"
            >
              {/* Full Name */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="fullName" className="text-sm font-semibold">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  placeholder="Asha Verma"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value.slice(0, 60))}
                  className="text-base"
                  autoFocus
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="signup-email" className="text-sm font-semibold">
                  Email Address
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value.slice(0, 60))}
                  className="text-base"
                />
              </div>

              {/* Password fields — only shown in password mode */}
              {method === "password" && (
                <>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="signup-password" className="text-sm font-semibold">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimum 8 characters"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value.slice(0, 64))}
                        className="pr-10"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {password.length > 0 && !isPasswordValid && (
                      <p className="text-xs text-destructive">Minimum 8 characters required</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="confirm-password" className="text-sm font-semibold">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Re-enter your password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value.slice(0, 64))}
                        className="pr-10"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPassword.length > 0 && !isConfirmValid && (
                      <p className="text-xs text-destructive">Passwords do not match</p>
                    )}
                  </div>
                </>
              )}

              <Button
                type="submit"
                disabled={
                  loading ||
                  (method === "otp" ? !canSubmitOTP : !canSubmitPassword)
                }
                className="w-full h-10 text-base font-semibold mt-1"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {method === "otp" ? "Sending OTP..." : "Creating Account..."}
                  </>
                ) : (
                  method === "otp" ? "Continue with OTP" : "Create Account"
                )}
              </Button>
            </form>
          </div>
        ) : (
          <OTPVerification
            contact={email}
            method="email"
            onVerify={handleVerifyOTP}
            onBack={() => { setStage("form") }}
            isLoading={loading}
            onResend={() => createAndSendEmailOTP(email)}
          />
        )}

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">OR</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <GoogleButton />
      </CardContent>
    </Card>
  )
}
