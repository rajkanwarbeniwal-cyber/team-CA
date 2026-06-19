import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthErrorPage() {
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
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <CardTitle className="text-balance">Authentication error</CardTitle>
            <CardDescription>
              Something went wrong while signing you in. The link may have expired or already been used.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/auth/login">Try again</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
