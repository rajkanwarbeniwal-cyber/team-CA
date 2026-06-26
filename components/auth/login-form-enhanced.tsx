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
import { PhoneOtpForm } from "@/components/auth/phone-otp-form"
import { Loader2, Eye, EyeOff } from "lucide-react"

export function LoginFormEnhanced() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get("redirect") || "/dashboard"

  // Phone tab state
  const [phone, setPhone] = useState("")
  const [phonePassword, setPhonePassword] = useState("")
  const [showPhonePassword, setShowPhonePassword] = useState(false)
  const [phoneLoading, setPhoneLoading] = useState(false)

  // Email tab state
  const [email, setEmail] = useState("")
  const [emailPassword, setEmailPassword] = useState("")
  const [showEmailPassword, setShowEmailPassword] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)

  // Validation helpers
  const validatePhone = (value: string) => {
    const digits = value.replace(/\D/g, "")
    return digits.length <= 10 ? digits : digits.slice(0, 10)
  }

  const validatePassword = (value: string) => {
    return value.slice(0, 16)
  }

  const validateEmail = (value: string) => {
    return value.slice(0, 40)
  }

  const isPhoneValid = phone.length === 10 && phonePassword.length >= 6 && phonePassword.length <= 16
  const isEmailValid =
    email.length > 0 && email.length <= 40 && emailPassword.length >= 6 && emailPassword.length <= 16

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(validatePhone(e.target.value))
  }

  const handlePhonePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhonePassword(validatePassword(e.target.value))
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(validateEmail(e.target.value))
  }

  const handleEmailPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailPassword(validatePassword(e.target.value))
  }

  async function handlePhoneLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!isPhoneValid) return

    setPhoneLoading(true)
    const supabase = createClient()

    try {
      // For phone login with password - you may need to adjust based on your auth setup
      const { error } = await supabase.auth.signInWithPassword({
        email: `${phone}@phone.local`,
        password: phonePassword,
      })

      setPhoneLoading(false)

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success("Signed in successfully!")
      router.push(redirect)
      router.refresh()
    } catch (error) {
      setPhoneLoading(false)
      toast.error("An error occurred. Please try again.")
    }
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!isEmailValid) return

    setEmailLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: emailPassword,
      })

      setEmailLoading(false)

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success("Signed in successfully!")
      router.push(redirect)
      router.refresh()
    } catch (error) {
      setEmailLoading(false)
      toast.error("An error occurred. Please try again.")
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
            <form onSubmit={handlePhoneLogin} className="flex flex-col gap-4">
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
                  />
                  {phone.length > 0 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                      {phone.length}/10
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Enter exactly 10 digits</p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="phonePassword" className="text-base font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="phonePassword"
                    type={showPhonePassword ? "text" : "password"}
                    placeholder="Enter 6-16 characters"
                    maxLength="16"
                    value={phonePassword}
                    onChange={handlePhonePasswordChange}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPhonePassword(!showPhonePassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPhonePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {phonePassword.length}/16 characters • Min 6 required
                </p>
              </div>

              <Button
                type="submit"
                disabled={!isPhoneValid || phoneLoading}
                className="w-full h-10 text-base font-semibold mt-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all"
              >
                {phoneLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  "Sign in with Phone"
                )}
              </Button>
            </form>
          </TabsContent>

          {/* Email Login Tab */}
          <TabsContent value="email" className="mt-6 space-y-4">
            <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
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
                />
                <p className="text-xs text-muted-foreground">
                  {email.length}/40 characters
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="emailPassword" className="text-base font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="emailPassword"
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
                    {showEmailPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {emailPassword.length}/16 characters • Min 6 required
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
                    Signing in...
                  </>
                ) : (
                  "Sign in with Email"
                )}
              </Button>
            </form>
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
