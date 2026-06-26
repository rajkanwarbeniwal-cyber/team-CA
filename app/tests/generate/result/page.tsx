import Link from "next/link"
import { CheckCircle, XCircle, MinusCircle, Clock, RotateCcw, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default async function AITestResultPage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; total?: string; correct?: string; wrong?: string; skipped?: string; time?: string }>
}) {
  const params = await searchParams
  const title = params.title ?? "AI Test"
  const total = Number(params.total ?? 0)
  const correct = Number(params.correct ?? 0)
  const wrong = Number(params.wrong ?? 0)
  const skipped = Number(params.skipped ?? 0)
  const timeTaken = Number(params.time ?? 0)
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0
  const minutes = Math.floor(timeTaken / 60)
  const seconds = timeTaken % 60

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-foreground text-balance">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your AI-generated test is complete</p>
      </div>

      {/* Score ring */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-primary/20 bg-primary/5">
          <span className="text-4xl font-bold text-primary">{percentage}%</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {correct} of {total} correct
        </p>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4">
            <CheckCircle className="h-5 w-5 text-success" />
            <span className="text-xl font-bold text-foreground">{correct}</span>
            <span className="text-xs text-muted-foreground">Correct</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4">
            <XCircle className="h-5 w-5 text-destructive" />
            <span className="text-xl font-bold text-foreground">{wrong}</span>
            <span className="text-xs text-muted-foreground">Wrong</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4">
            <MinusCircle className="h-5 w-5 text-muted-foreground" />
            <span className="text-xl font-bold text-foreground">{skipped}</span>
            <span className="text-xs text-muted-foreground">Skipped</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4">
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-xl font-bold text-foreground">
              {minutes}:{String(seconds).padStart(2, "0")}
            </span>
            <span className="text-xs text-muted-foreground">Time taken</span>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="outline" className="flex-1 gap-2">
          <Link href="/tests/generate">
            <RotateCcw className="h-4 w-4" /> Generate Another
          </Link>
        </Button>
        <Button asChild className="flex-1 gap-2">
          <Link href="/dashboard">
            <LayoutDashboard className="h-4 w-4" /> Go to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  )
}
