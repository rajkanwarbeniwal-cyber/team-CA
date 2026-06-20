import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { BarChart3, BookmarkCheck, Clock, ListChecks, Trophy, Unlock } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { BrandLogo } from "@/components/brand-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const FEATURES = [
  { icon: Clock, title: "Flexible timer modes", desc: "Switch between a total-paper countdown or a per-question timer to match real exam pressure." },
  { icon: Unlock, title: "Progressive answer keys", desc: "Skipped answers unlock only after you finish half the paper, keeping practice honest." },
  { icon: ListChecks, title: "Detailed review", desc: "Every question comes with the correct answer and a crisp 1–2 line explanation." },
  { icon: Trophy, title: "Leaderboards", desc: "See your rank against the peer average and celebrate scores above 60%." },
  { icon: BarChart3, title: "Performance trends", desc: "Track your historical accuracy and scores with clean charts over time." },
  { icon: BookmarkCheck, title: "Bookmark questions", desc: "Flag tricky questions during a test and revisit them whenever you want." },
]

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect("/dashboard")

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <BrandLogo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <Image
              src="/taksha-badge-hi-en.png"
              alt="Taksha — तक्षा"
              width={150}
              height={150}
              className="mx-auto mb-6 h-32 w-32 rounded-full object-cover shadow-lg ring-1 ring-border md:h-36 md:w-36"
              priority
            />
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              UPSC · SSC · Banking · State Exams
            </span>
            <h1 className="mt-5 text-pretty text-4xl font-bold tracking-tight md:text-5xl">
              Practice smarter. Score higher on every mock test.
            </h1>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Taksha gives you timed mock tests, instant scoring, peer leaderboards, and detailed explanations — all in
              one distraction-free workspace.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/auth/sign-up">Start practicing free</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/auth/login">I already have an account</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.title} className="border-border/60">
                <CardContent className="pt-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row">
          <BrandLogo />
          <p className="text-sm text-muted-foreground">Built for serious exam aspirants.</p>
        </div>
      </footer>
    </div>
  )
}
