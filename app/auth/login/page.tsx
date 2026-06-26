import Link from "next/link"
import { Suspense } from "react"
import { BrandLogo } from "@/components/brand-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoginFormEnhanced } from "@/components/auth/login-form-enhanced"
import { MotivationalQuotes } from "@/components/auth/motivational-quotes"

export default function LoginPage() {
  return (
    <main className="flex min-h-svh flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <header className="flex items-center justify-between px-6 py-4 md:px-8 md:py-6">
        <Link href="/" className="transition-transform hover:scale-105">
          <BrandLogo />
        </Link>
        <ThemeToggle />
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-md">
          {/* Header Section */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-balance bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Level Up
            </h1>
            <p className="mt-3 text-lg text-foreground/70 font-medium">
              Your exam journey starts here
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to access your personalized study plan
            </p>
          </div>

          {/* Login Form */}
          <Suspense fallback={null}>
            <LoginFormEnhanced />
          </Suspense>

          {/* Footer Links */}
          <div className="mt-8 space-y-3 text-center">
            <p className="text-sm text-foreground/70">
              {"Don't have an account yet? "}
              <Link
                href="/auth/sign-up"
                className="font-bold text-primary hover:text-primary/80 hover:underline transition-colors"
              >
                Create one now
              </Link>
            </p>
            <p className="text-xs text-muted-foreground">
              Need help?{" "}
              <Link href="/support" className="text-primary hover:underline">
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Motivational Quotes Section at Bottom */}
      <footer className="border-t border-border/40 bg-muted/30 backdrop-blur-sm">
        <MotivationalQuotes />
      </footer>
    </main>
  )
}
