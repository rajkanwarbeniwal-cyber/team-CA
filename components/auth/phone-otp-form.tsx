"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export function PhoneOtpForm({ redirect = "/dashboard" }: { redirect?: string }) {
  const router = useRouter()
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [stage, setStage] = useState<"phone" | "otp">("phone")
  const [loading, setLoading] = useState(false)

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({ phone })
    setLoading(false)
    if (error) {
      // Requires an SMS provider (e.g. Twilio) enabled in Supabase Auth.
      toast.error(error.message || "Phone OTP is not configured yet.")
      return
    }
    setStage("otp")
    toast.success("OTP sent to your phone")
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" })
    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Signed in successfully")
    router.push(redirect)
    router.refresh()
  }

  if (stage === "otp") {
    return (
      <form onSubmit={verifyOtp} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="otp">Enter the 6-digit code</Label>
          <Input
            id="otp"
            inputMode="numeric"
            placeholder="123456"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Verify & sign in
        </Button>
        <button type="button" className="text-sm text-muted-foreground hover:underline" onClick={() => setStage("phone")}>
          Use a different number
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={sendOtp} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Phone number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+91 98765 43210"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">Include your country code, e.g. +91.</p>
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Send OTP
      </Button>
    </form>
  )
}
