import Link from "next/link"
import { MailCheck } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignUpSuccessPage() {
  return (
    <main className="flex min-h-svh flex-col bg-muted/30">
      <header className="px-6 py-4">
        <Link href="/">
          <BrandLogo />
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
              <MailCheck className="h-6 w-6" />
            </div>
            <CardTitle className="text-balance">Check your inbox</CardTitle>
            <CardDescription>
              {"We've sent you a confirmation link. Please verify your email before signing in."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/auth/login">Back to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
