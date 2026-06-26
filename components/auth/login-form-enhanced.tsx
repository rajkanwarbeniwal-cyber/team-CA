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
import { sendPhoneOTP, sendEmailOTP, verifyPhoneOTP, verifyEmailOTP } from "@/lib/auth/otp-handler"
import { sendConfirmationEmailAction } from "@/lib/auth/otp-server-actions"
import { Loader2, Eye, EyeOff, CheckCircle } from "lucide-react"

export function LoginFormEnhanced() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get("redirect") || "/dashboard"

  // Phone tab state
  const [phone, setPhone] = useState("")
  const [phoneStage, setPhoneStage] = useState<"input" | "otp">("input")
  const [phoneLoading, setPhoneLoading] = useState(false)

  // Email tab state
  const [email, setEmail] = useState("")
  const [emailStage, setEmailStage] = useState<"input" | "otp">("input")
  const [emailLoading, setEmailLoading] = useState(false)

  // Validation helpers
  const validatePhone = (value: string) => {
    const digits = value.replace(/\D/g, "")
    return digits.length <= 10 ? digits : digits.slice(0, 10)
  }

  const validateEmail = (value: string) => {
    return value.slice(0, 40)
  }

  const isPhoneValid = phone.length === 10
  const isEmailValid = email.length > 0 && email.length <= 40 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(validatePhone(e.target.value))
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(validateEmail(e.target.value))
  }

  // Phone OTP flow
  async function handlePhoneSendOTP(e: React.FormEvent) {
    e.preventDefault()
    if (!isPhoneValid) return

    setPhoneLoading(true)

    try {
      const otp = await sendPhoneOTP(phone)
      console.log("[v0] OTP sent to phone - check console for code")
      toast.success("OTP sent to your phone!")
      setPhoneStage("otp")
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.")
      console.error("[v0] Error sending phone OTP:", error)
    } finally {
      setPhoneLoading(false)
    }
  }

  async function handlePhoneVerifyOTP(otp: string): Promise<boolean> {
    try {
      const isValid = verifyPhoneOTP(phone, otp)
      if (!isValid) {
        return false
      }

      // Login user after OTP verification
      const supabase = createClient()
      const isNewUser = true
      
      const { error } = await supabase.auth.signInWithPassword({
        email: `${phone}@phone.taksha.local`,
        password: otp,
      })

      if (error && error.message.includes("invalid")) {
        // User doesn't exist, sign them up
        const { error: signUpError, data } = await supabase.auth.signUp({
          email: `${phone}@phone.taksha.local`,
          password: otp,
        })

        if (signUpError) {
          console.error("[v0] Sign up error:", signUpError)
          return false
        }

        // Send confirmation email to user's phone (simulate with console)
        console.log(`[v0] New user registered with phone: ${phone}`)
      } else if (error) {
        console.error("[v0] Sign in error:", error)
        return false
      }

      toast.success("Signed in successfully!")
      router.push(redirect)
      router.refresh()
      return true
    } catch (error) {
      console.error("[v0] Phone verification error:", error)
      return false
    }
  }

  // Email OTP flow
  async function handleEmailSendOTP(e: React.FormEvent) {
    e.preventDefault()
    if (!isEmailValid) return

    setEmailLoading(true)

    try {
      const otp = await sendEmailOTP(email)
      console.log("[v0] OTP sent to email - check console for code")
      toast.success("OTP sent to your email!")
      setEmailStage("otp")
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.")
      console.error("[v0] Error sending email OTP:", error)
    } finally {
      setEmailLoading(false)
    }
  }

  async function handleEmailVerifyOTP(otp: string): Promise<boolean> {
    try {
      const isValid = verifyEmailOTP(email, otp)
      if (!isValid) {
        return false
      }

      // Login user after OTP verification
      const supabase = createClient()
      let isNewUser = false
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: otp,
      })

      if (error && error.message.includes("invalid")) {
        // User doesn't exist, sign them up
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password: otp,
        })

        if (signUpError) {
          console.error("[v0] Sign up error:", signUpError)
          return false
        }
        isNewUser = true

        // Send confirmation email to new user
        try {
          const emailName = email.split("@")[0]
          await sendConfirmationEmailAction(email, emailName)
          console.log("[v0] Confirmation email sent to:", email)
        } catch (emailError) {
          console.warn("[v0] Could not send confirmation email:", emailError)
        }
      } else if (error) {
        console.error("[v0] Sign in error:", error)
        return false
      }

      toast.success("Signed in successfully!")
      router.push(redirect)
      router.refresh()
      return true
    } catch (error) {
      console.error("[v0] Email verification error:", error)
      return false
    }
  }

  return (
    <Card className="border-border/60 shadow-lg backdrop-blur-sm bg-background/95">
      <CardContent className="pt-6">
        <Tabs defaultValue="phone" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50">
            <TabsTrigger value="phone" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Phone
            </TabsTrigger>
            <TabsTrigger value="email" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Email
            </TabsTrigger>
          </TabsList>

          {/* Phone Login Tab */}
          <TabsContent value="phone" className="mt-6 space-y-4">
            {phoneStage === "input" ? (
              <form onSubmit={handlePhoneSendOTP} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone" className="text-base font-semibold">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center pointer-events-none pl-3">
                      <span className="text-lg font-medium text-foreground/30 opacity-30 transition-opacity duration-300">
                        {phone ? "" : "7737775985"}
                      </span>
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      placeholder=""
                      maxLength="10"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="text-lg pr-12 bg-transparent relative z-10"
                      autoFocus
                    />
                    {phone.length > 0 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                        {phone.length}/10
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Enter exactly 10 digits</p>
                </div>

                <Button
                  type="submit"
                  disabled={!isPhoneValid || phoneLoading}
                  className="w-full h-10 text-base font-semibold mt-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all"
                >
                  {phoneLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              </form>
            ) : (
              <OTPVerification
                contact={phone}
                method="phone"
                onVerify={handlePhoneVerifyOTP}
                onBack={() => {
                  setPhoneStage("input")
                  setPhone("")
                }}
                isLoading={phoneLoading}
              />
            )}
          </TabsContent>

          {/* Email Login Tab */}
          <TabsContent value="email" className="mt-6 space-y-4">
            {emailStage === "input" ? (
              <form onSubmit={handleEmailSendOTP} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email" className="text-base font-semibold">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    maxLength="40"
                    value={email}
                    onChange={handleEmailChange}
                    className="text-base"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    {email.length}/40 characters
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={!isEmailValid || emailLoading}
                  className="w-full h-10 text-base font-semibold mt-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all"
                >
                  {emailLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              </form>
            ) : (
              <OTPVerification
                contact={email}
                method="email"
                onVerify={handleEmailVerifyOTP}
                onBack={() => {
                  setEmailStage("input")
                  setEmail("")
                }}
                isLoading={emailLoading}
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
