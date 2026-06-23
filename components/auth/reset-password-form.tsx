"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle } from "lucide-react"

export function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (error) {
      toast.error(error.message || "Failed to reset password")
      return
    }

    setSuccess(true)
    toast.success("Password updated successfully")
    setTimeout(() => {
      router.push("/auth/login")
    }, 2000)
  }

  if (success) {
    return (
      <Card className="border-border/60 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-green-500/10 p-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">Password reset successful</h2>
              <p className="text-sm text-muted-foreground">Your password has been updated. Redirecting to login...</p>
            </div>
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
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Reset password
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
