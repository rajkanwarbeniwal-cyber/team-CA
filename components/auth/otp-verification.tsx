"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

interface OTPVerificationProps {
  contact: string // phone or email
  method: "phone" | "email"
  onVerify: (otp: string) => Promise<boolean>
  onBack: () => void
  isLoading?: boolean
}

export function OTPVerification({
  contact,
  method,
  onVerify,
  onBack,
  isLoading = false,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Countdown timer for resend
  useEffect(() => {
    if (timeLeft === 0) {
      setCanResend(true)
      return
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    const sliced = value.slice(0, 6)
    setOtp(sliced)
    setError("")
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP")
      return
    }

    setVerifying(true)
    setError("")

    try {
      const success = await onVerify(otp)
      if (success) {
        setVerified(true)
        setTimeout(() => {
          // Component will be removed by parent
        }, 1500)
      } else {
        setError("Invalid OTP. Please try again.")
      }
    } catch (err) {
      setError("Verification failed. Please try again.")
      console.error("[v0] OTP verification error:", err)
    } finally {
      setVerifying(false)
    }
  }

  const handleResend = () => {
    setOtp("")
    setError("")
    setTimeLeft(30)
    setCanResend(false)
  }

  if (verified) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <div className="mb-4 rounded-full bg-green-100 dark:bg-green-900/30 p-3">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-semibold text-center text-green-700 dark:text-green-400">
          Verification Successful!
        </h3>
        <p className="text-sm text-muted-foreground text-center mt-2">
          Creating your account...
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleVerify} className="flex flex-col gap-4">
      {/* Header */}
      <div className="text-center mb-2">
        <h3 className="text-lg font-bold">Verify {method === "phone" ? "Phone" : "Email"}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          We sent a code to{" "}
          <span className="font-semibold text-foreground">{contact}</span>
        </p>
      </div>

      {/* OTP Input */}
      <div className="flex flex-col gap-3">
        <Label htmlFor="otp" className="text-base font-semibold">
          Enter Verification Code
        </Label>
        <Input
          ref={inputRef}
          id="otp"
          type="text"
          inputMode="numeric"
          placeholder="000000"
          maxLength="6"
          value={otp}
          onChange={handleOtpChange}
          disabled={verifying}
          className="text-center text-2xl font-bold tracking-widest border-2 focus:border-primary"
          aria-label="OTP verification code"
        />
        <p className="text-xs text-muted-foreground text-center">
          {otp.length}/6 digits
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Verify Button */}
      <Button
        type="submit"
        disabled={otp.length !== 6 || verifying || isLoading}
        className="w-full h-10 text-base font-semibold mt-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all"
      >
        {verifying || isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Verifying...
          </>
        ) : (
          "Verify & Continue"
        )}
      </Button>

      {/* Resend Section */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">Didn&apos;t receive code? </span>
        {canResend ? (
          <button
            type="button"
            onClick={handleResend}
            className="font-semibold text-primary hover:underline transition-colors"
          >
            Resend OTP
          </button>
        ) : (
          <span className="text-primary font-semibold">Resend in {timeLeft}s</span>
        )}
      </div>

      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        disabled={verifying || isLoading}
        className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors disabled:opacity-50"
      >
        Use a different {method === "phone" ? "number" : "email"}
      </button>
    </form>
  )
}
