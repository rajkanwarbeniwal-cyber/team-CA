import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Reset your password</h1>
          <p className="text-muted-foreground">Enter your email address and we&apos;ll send you a link to reset your password.</p>
        </div>

        <ForgotPasswordForm />
      </div>
    </div>
  )
}
