"use client"

import { useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle } from "lucide-react"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    setLoading(false)

    if (error) {
      toast.error(error.message || "Failed to send reset email")
      return
    }

    setSubmitted(true)
    toast.success("Password reset link sent to your email")
  }

  if (submitted) {
    return (
      <Card className="border-border/60 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-green-500/10 p-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">Check your email</h2>
              <p className="text-sm text-muted-foreground">
                We&apos;ve sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                The link will expire in 24 hours. If you don&apos;t see the email, check your spam folder.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSubmitted(false)
                setEmail("")
              }}
              className="mt-4"
            >
              Send another email
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Send reset link
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
