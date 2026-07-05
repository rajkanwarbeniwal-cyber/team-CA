"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { sendConfirmationEmail } from "@/lib/auth/send-email"
import { sendEmailOTP, verifyEmailOTP } from "@/lib/auth/otp-handler"
import { OTPVerification } from "@/components/auth/otp-verification"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleButton } from "@/components/auth/google-button"
import { Loader2 } from "lucide-react"

export function SignUpForm() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [stage, setStage] = useState<"form" | "otp">("form")
  const [loading, setLoading] = useState(false)

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) {
      toast.error("Please enter your full name")
      return
    }
    if (!email) {
      toast.error("Please enter your email")
      return
    }

    setLoading(true)
    try {
      await sendEmailOTP(email)
      setStage("otp")
      toast.success("OTP sent to your email!")
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.")
      console.error("[v0] Error:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOTP(otp: string): Promise<boolean> {
    try {
      // Verify OTP (synchronous)
      const isValid = verifyEmailOTP(email, otp)
      if (!isValid) {
        toast.error("Invalid or expired OTP. Please try again.")
        return false
      }

      // Sign up user in Supabase with temporary password
      const supabase = createClient()
      const tempPassword = Math.random().toString(36).slice(-12)
      
      const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
        email,
        password: tempPassword,
        options: {
          data: {
            full_name: fullName,
            role: "student",
          },
        },
      })

      if (signUpError && !signUpError.message.includes("already")) {
        console.error("[v0] Sign up error:", signUpError)
        throw new Error(signUpError.message || "Failed to create account")
      }

      // Get current user
      const { data: userData } = await supabase.auth.getUser()

      if (userData.user) {
        // Create profile record
        const { error: profileError } = await supabase.from("profiles").insert({
          id: userData.user.id,
          full_name: fullName,
          role: "student",
        }).select()

        if (profileError && !profileError.message.includes("duplicate")) {
          console.warn("[v0] Profile record error:", profileError)
        }
      }

      // Send confirmation email
      try {
        await sendConfirmationEmail(email, fullName)
      } catch (error) {
        console.error("[v0] Confirmation email error:", error)
      }

      toast.success("Account created successfully!")
      router.push("/auth/sign-up-success")
      return true
    } catch (error) {
      console.error("[v0] Verification error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create account")
      return false
    }
  }

  return (
    <Card className="border-border/60 shadow-lg backdrop-blur-sm bg-background/95">
      <CardContent className="pt-6">
        {stage === "form" ? (
          <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="fullName" className="text-base font-semibold">
                Full Name
              </Label>
              <Input
                id="fullName"
                placeholder="Asha Verma"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="text-base"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-base font-semibold">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-base"
              />
              <p className="text-xs text-muted-foreground">
                {email.length}/40 characters
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || !fullName.trim() || !email}
              className="w-full h-10 text-base font-semibold mt-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending OTP...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        ) : (
          <OTPVerification
            contact={email}
            method="email"
            onVerify={handleVerifyOTP}
            onBack={() => {
              setStage("form")
              setEmail("")
            }}
            isLoading={loading}
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
