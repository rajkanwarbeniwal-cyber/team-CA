"use client"

import type React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GoogleButton } from "@/components/auth/google-button"
import { OTPVerification } from "@/components/auth/otp-verification"
import {
  createAndSendEmailOTP,
  createAndSendPhoneOTP,
  verifyOTPAction,
} from "@/lib/auth/otp-server-actions"
import { Loader2, Eye, EyeOff } from "lucide-react"

type LoginMethod = "otp" | "password"
type Stage = "input" | "otp"

export function LoginFormEnhanced() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get("redirect") || "/dashboard"

  // ── Phone tab ──────────────────────────────────────────────────────────────
  const [phone, setPhone] = useState("")
  const [phoneStage, setPhoneStage] = useState<Stage>("input")
  const [phoneLoading, setPhoneLoading] = useState(false)

  // ── Email tab ──────────────────────────────────────────────────────────────
  const [email, setEmail] = useState("")
  const [emailMethod, setEmailMethod] = useState<LoginMethod>("otp")
  const [emailStage, setEmailStage] = useState<Stage>("input")
  const [emailLoading, setEmailLoading] = useState(false)

  // Password state
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  // ── Validation ─────────────────────────────────────────────────────────────
  const cleanPhone = (v: string) => v.replace(/\D/g, "").slice(0, 10)
  const isPhoneValid = phone.length === 10
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isPasswordValid = isEmailValid && password.length >= 6

  // ── Phone handlers ─────────────────────────────────────────────────────────
  async function handlePhoneSendOTP(e: React.FormEvent) {
    e.preventDefault()
    if (!isPhoneValid) return
    setPhoneLoading(true)
    try {
      const result = await createAndSendPhoneOTP(phone)
      if (!result.success) {
        toast.error(result.error || "Failed to send OTP")
        return
      }
      toast.success("OTP sent! Check your phone (or console in dev)")
      setPhoneStage("otp")
    } catch {
      toast.error("Failed to send OTP. Please try again.")
    } finally {
      setPhoneLoading(false)
    }
  }

  async function handlePhoneVerifyOTP(otp: string): Promise<boolean> {
    const { valid, error } = await verifyOTPAction(`phone:${phone}`, otp)
    if (!valid) {
      toast.error(error || "Invalid OTP")
      return false
    }

    // Sign in or create the user via a pseudo email
    const supabase = createClient()
    const pseudoEmail = `${phone}@phone.taksha.local`
    const pseudoPassword = `phone_${phone}_secret_v1`

    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: pseudoEmail,
      password: pseudoPassword,
    })

    if (signInErr) {
      // First time — create account
      const { error: signUpErr } = await supabase.auth.signUp({
        email: pseudoEmail,
        password: pseudoPassword,
        options: { data: { role: "student" } },
      })
      if (signUpErr) {
        toast.error("Could not create account. Try again.")
        return false
      }
    }

    toast.success("Signed in successfully!")
    router.push(redirect)
    router.refresh()
    return true
  }

  // ── Email OTP handlers ─────────────────────────────────────────────────────
  async function handleEmailSendOTP(e: React.FormEvent) {
    e.preventDefault()
    if (!isEmailValid) return
    setEmailLoading(true)
    try {
      const result = await createAndSendEmailOTP(email)
      if (!result.success) {
        toast.error(result.error || "Failed to send OTP")
        return
      }
      toast.success("OTP sent to your email!")
      setEmailStage("otp")
    } catch {
      toast.error("Failed to send OTP. Please try again.")
    } finally {
      setEmailLoading(false)
    }
  }

  async function handleEmailVerifyOTP(otp: string): Promise<boolean> {
    const { valid, error } = await verifyOTPAction(`email:${email}`, otp)
    if (!valid) {
      toast.error(error || "Invalid OTP")
      return false
    }

    // Try sign in first; if fails, create account
    const supabase = createClient()
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email,
      password: `otp_user_${email}_v1`,
    })

    if (signInErr) {
      const { error: signUpErr } = await supabase.auth.signUp({
        email,
        password: `otp_user_${email}_v1`,
        options: { data: { role: "student" } },
      })
      if (signUpErr) {
        toast.error("Could not authenticate. Try signing up first.")
        return false
      }
    }

    toast.success("Signed in successfully!")
    router.push(redirect)
    router.refresh()
    return true
  }

  // ── Email password login ───────────────────────────────────────────────────
  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!isPasswordValid) return
    setPasswordLoading(true)
    const supabase = createClient()
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        toast.error(error.message || "Invalid email or password")
        return
      }
      toast.success("Signed in successfully!")
      router.push(redirect)
      router.refresh()
    } catch {
      toast.error("An error occurred. Please try again.")
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <Card className="border-border/60 shadow-lg bg-background/95">
      <CardContent className="pt-6">
        <Tabs defaultValue="phone" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50">
            <TabsTrigger
              value="phone"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Phone
            </TabsTrigger>
            <TabsTrigger
              value="email"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Email
            </TabsTrigger>
          </TabsList>

          {/* ── Phone Tab ── */}
          <TabsContent value="phone" className="mt-6">
            {phoneStage === "input" ? (
              <form onSubmit={handlePhoneSendOTP} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone" className="text-sm font-semibold">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder="Enter 10-digit number"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(cleanPhone(e.target.value))}
                    className="text-lg tracking-wider"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">{phone.length}/10 digits</p>
                </div>
                <Button
                  type="submit"
                  disabled={!isPhoneValid || phoneLoading}
                  className="w-full h-10 text-base font-semibold"
                >
                  {phoneLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />Sending OTP...</>
                  ) : (
                    "Send OTP via SMS"
                  )}
                </Button>
              </form>
            ) : (
              <OTPVerification
                contact={phone}
                method="phone"
                onVerify={handlePhoneVerifyOTP}
                onBack={() => { setPhoneStage("input"); setPhone("") }}
                isLoading={phoneLoading}
                onResend={() => createAndSendPhoneOTP(phone)}
              />
            )}
          </TabsContent>

          {/* ── Email Tab ── */}
          <TabsContent value="email" className="mt-6">
            {emailStage === "input" ? (
              <div className="flex flex-col gap-4">
                {/* Method toggle */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setEmailMethod("otp"); setPassword("") }}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      emailMethod === "otp"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    Login with OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEmailMethod("password"); setPassword("") }}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      emailMethod === "password"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    Login with Password
                  </button>
                </div>

                {emailMethod === "otp" ? (
                  <form onSubmit={handleEmailSendOTP} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="email-otp" className="text-sm font-semibold">
                        Email Address
                      </Label>
                      <Input
                        id="email-otp"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value.slice(0, 60))}
                        className="text-base"
                        autoFocus
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={!isEmailValid || emailLoading}
                      className="w-full h-10 text-base font-semibold"
                    >
                      {emailLoading ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" />Sending OTP...</>
                      ) : (
                        "Send OTP to Email"
                      )}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handlePasswordLogin} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="email-pwd" className="text-sm font-semibold">
                        Email Address
                      </Label>
                      <Input
                        id="email-pwd"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value.slice(0, 60))}
                        className="text-base"
                        autoFocus
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="password" className="text-sm font-semibold">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value.slice(0, 64))}
                          className="pr-10"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={!isPasswordValid || passwordLoading}
                      className="w-full h-10 text-base font-semibold"
                    >
                      {passwordLoading ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" />Signing in...</>
                      ) : (
                        "Sign in with Password"
                      )}
                    </Button>
                  </form>
                )}
              </div>
            ) : (
              <OTPVerification
                contact={email}
                method="email"
                onVerify={handleEmailVerifyOTP}
                onBack={() => { setEmailStage("input"); setEmail("") }}
                isLoading={emailLoading}
                onResend={() => createAndSendEmailOTP(email)}
              />
            )}
          </TabsContent>
        </Tabs>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">OR</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <GoogleButton redirect={redirect} />
      </CardContent>
    </Card>
  )
}
