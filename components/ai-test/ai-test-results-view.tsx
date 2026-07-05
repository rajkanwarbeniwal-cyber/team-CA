"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  CheckCircle2, XCircle, MinusCircle, Trophy, Clock,
  ChevronDown, ChevronUp, ArrowLeft, BrainCircuit, RotateCcw,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { AiTestResult, ReviewRow } from "@/components/ai-test/ai-exam-runner"
import type { OptionKey } from "@/lib/types"

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

function optionLabel(q: ReviewRow, key: OptionKey) {
  return key === "A" ? q.option_a : key === "B" ? q.option_b : key === "C" ? q.option_c : q.option_d
}

function ReviewQuestionCard({ row, index }: { row: ReviewRow; index: number }) {
  const [open, setOpen] = useState(false)
  const options: OptionKey[] = ["A", "B", "C", "D"]

  return (
    <Card className={cn("border", row.is_correct ? "border-green-500/20" : row.selected_option ? "border-destructive/20" : "border-border")}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {row.is_correct ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-500" />
          ) : row.selected_option ? (
            <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          ) : (
            <MinusCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-foreground leading-relaxed">
                <span className="text-muted-foreground mr-1.5">Q{index + 1}.</span>
                {row.question_text}
              </p>
              <Badge variant="outline" className="shrink-0 text-xs">{row.subject}</Badge>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {options.map((opt) => {
                const isCorrect = opt === row.correct_option
                const isSelected = opt === row.selected_option
                return (
                  <div
                    key={opt}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-3 py-2 text-xs",
                      isCorrect
                        ? "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400"
                        : isSelected && !isCorrect
                          ? "border-destructive/40 bg-destructive/10 text-destructive"
                          : "border-border bg-muted/30 text-muted-foreground",
                    )}
                  >
                    <span className="font-semibold">{opt}.</span>
                    <span>{optionLabel(row, opt)}</span>
                  </div>
                )
              })}
            </div>

            {row.explanation && (
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="mt-3 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                {open ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                {open ? "Hide" : "Show"} explanation
              </button>
            )}
            {open && row.explanation && (
              <p className="mt-2 rounded-md bg-muted/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                {row.explanation}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function AiTestResultsView() {
  const params = useParams<{ testId: string }>()
  const router = useRouter()
  const [result, setResult] = useState<AiTestResult | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem(`ai-result-${params.testId}`)
    if (!raw) {
      router.replace(`/ai-test`)
      return
    }
    try {
      setResult(JSON.parse(raw) as AiTestResult)
    } catch {
      router.replace("/ai-test")
    }
  }, [params.testId, router])

  if (!result) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const scoreColor =
    result.percentage >= 70 ? "text-green-600 dark:text-green-400"
    : result.percentage >= 40 ? "text-amber-600 dark:text-amber-400"
    : "text-destructive"

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">

      {/* Back link */}
      <Link href="/ai-test" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All AI Tests
      </Link>

      {/* Score card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex items-center gap-2">
              <BrainCircuit className="size-5 text-primary" />
              <span className="text-sm font-semibold text-muted-foreground">{result.examGoal} · AI Test</span>
            </div>
            <h1 className="mt-1 text-xl font-bold text-foreground text-pretty">{result.title}</h1>

            <div className={cn("mt-4 text-6xl font-black tabular-nums", scoreColor)}>
              {result.percentage}%
            </div>
            <p className="text-sm text-muted-foreground">
              {result.correct} correct · {result.wrong} wrong · {result.skipped} skipped
            </p>

            <Progress value={result.percentage} className="mt-4 h-2 w-full max-w-xs" />
          </div>

          {/* Stat row */}
          <div className="mt-6 grid grid-cols-3 divide-x divide-border border-t border-border pt-4 text-center">
            <div className="px-4">
              <p className="text-lg font-bold text-foreground">{result.score}</p>
              <p className="text-xs text-muted-foreground">Score</p>
            </div>
            <div className="px-4">
              <p className="text-lg font-bold text-foreground">{result.total}</p>
              <p className="text-xs text-muted-foreground">Questions</p>
            </div>
            <div className="px-4 flex flex-col items-center">
              <p className="flex items-center gap-1 text-lg font-bold text-foreground">
                <Clock className="size-4" />
                {formatTime(result.timeTaken)}
              </p>
              <p className="text-xs text-muted-foreground">Time taken</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance message */}
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <Trophy className={cn("size-5 shrink-0", scoreColor)} />
          <p className="text-sm text-foreground">
            {result.percentage >= 70
              ? "Excellent work! You are well-prepared for this exam section."
              : result.percentage >= 40
                ? "Good effort. Review the wrong answers below to strengthen your weak areas."
                : "Keep practicing. Go through the explanations carefully to build a stronger foundation."}
          </p>
        </CardContent>
      </Card>

      {/* Generate another */}
      <div className="flex justify-end">
        <Button asChild variant="outline" size="sm">
          <Link href="/ai-test">
            <RotateCcw className="mr-1.5 size-3.5" />
            Generate another test
          </Link>
        </Button>
      </div>

      {/* Question review */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Full Review
        </h2>
        <div className="space-y-3">
          {result.review.map((row, idx) => (
            <ReviewQuestionCard key={idx} row={row} index={idx} />
          ))}
        </div>
      </div>
    </div>
  )
}
