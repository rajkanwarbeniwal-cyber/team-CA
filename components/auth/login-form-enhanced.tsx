"use client"

import type React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GoogleButton } from "@/components/auth/google-button"
import { OTPVerification } from "@/components/auth/otp-verification"
import {
  sendEmailOTPAction,
  sendPhoneOTPAction,
  verifyEmailOTPAction,
  verifyPhoneOTPAction,
} from "@/lib/auth/otp-server-actions"
import { Loader2, Eye, EyeOff } from "lucide-react"

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
  const [emailMethod, setEmailMethod] = useState<"otp" | "password">("otp")
  const [emailPassword, setEmailPassword] = useState("")
  const [showEmailPassword, setShowEmailPassword] = useState(false)
  const [emailPasswordLoading, setEmailPasswordLoading] = useState(false)

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
  const isEmailPasswordValid =
    email.length > 0 &&
    email.length <= 40 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    emailPassword.length >= 6 &&
    emailPassword.length <= 16

  const validateEmailPassword = (value: string) => {
    return value.slice(0, 16)
  }

  const handleEmailPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailPassword(validateEmailPassword(e.target.value))
  }

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
    const result = await sendPhoneOTPAction(phone)
    setPhoneLoading(false)
    if (!result.success) {
      toast.error(result.error ?? "OTP bhejne mein dikkat aayi")
      return
    }
    toast.success("OTP bhej diya gaya!")
    setPhoneStage("otp")
  }

  async function handlePhoneVerifyOTP(otp: string): Promise<boolean> {
    const result = await verifyPhoneOTPAction(phone, otp)
    if (!result.success) {
      toast.error(result.error ?? "OTP galat hai")
      return false
    }
    toast.success("Login ho gaya!")
    router.push(redirect)
    router.refresh()
    return true
  }

  // Email password login
  async function handleEmailPasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!isEmailPasswordValid) return

    setEmailPasswordLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: emailPassword,
      })

      setEmailPasswordLoading(false)

      if (error) {
        toast.error(error.message || "Invalid email or password")
        return
      }

      toast.success("Signed in successfully!")
      router.push(redirect)
      router.refresh()
    } catch (error) {
      setEmailPasswordLoading(false)
      toast.error("An error occurred. Please try again.")
    }
  }

  // Email OTP flow
  async function handleEmailSendOTP(e: React.FormEvent) {
    e.preventDefault()
    if (!isEmailValid) return
    setEmailLoading(true)
    const result = await sendEmailOTPAction(email)
    setEmailLoading(false)
    if (!result.success) {
      toast.error(result.error ?? "OTP bhejne mein dikkat aayi")
      return
    }
    toast.success("OTP aapki email par bhej diya gaya!")
    setEmailStage("otp")
  }

  async function handleEmailVerifyOTP(otp: string): Promise<boolean> {
    const result = await verifyEmailOTPAction(email, otp)
    if (!result.success) {
      toast.error(result.error ?? "OTP galat hai")
      return false
    }
    toast.success(result.isNewUser ? "Account ban gaya! Welcome to Taksha!" : "Login ho gaya!")
    router.push(redirect)
    router.refresh()
    return true
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
              <>
                {/* Email method toggle */}
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailMethod("otp")
                      setEmailPassword("")
                    }}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                      emailMethod === "otp"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailMethod("password")
                      setEmailPassword("")
                    }}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                      emailMethod === "password"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    Password
                  </button>
                </div>

                {emailMethod === "otp" ? (
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
                  <form onSubmit={handleEmailPasswordLogin} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="email-pwd" className="text-base font-semibold">
                        Email Address
                      </Label>
                      <Input
                        id="email-pwd"
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

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="email-password" className="text-base font-semibold">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="email-password"
                          type={showEmailPassword ? "text" : "password"}
                          placeholder="Enter 6-16 characters"
                          maxLength="16"
                          value={emailPassword}
                          onChange={handleEmailPasswordChange}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowEmailPassword(!showEmailPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showEmailPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {emailPassword.length}/16 characters • Min 6 required
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={!isEmailPasswordValid || emailPasswordLoading}
                      className="w-full h-10 text-base font-semibold mt-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all"
                    >
                      {emailPasswordLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Signing in...
                        </>
                      ) : (
                        "Sign in with Password"
                      )}
                    </Button>
                  </form>
                )}
              </>
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
