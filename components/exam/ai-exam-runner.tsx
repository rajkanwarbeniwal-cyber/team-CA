"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Loader2, Send } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { ExamTimer } from "@/components/exam/exam-timer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { OptionKey } from "@/lib/types"

interface AITest {
  id: string
  title: string
  duration_minutes: number
  total_questions: number
  exam_goal: string
}

interface AIQuestion {
  id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: string
  explanation: string | null
  subject: string
  difficulty: string
  sort_order: number
}

type AnswerState = Record<string, { selected: OptionKey | null; bookmarked: boolean }>

const OPTION_KEYS: OptionKey[] = ["A", "B", "C", "D"]

function optionText(q: AIQuestion, key: OptionKey) {
  return key === "A" ? q.option_a : key === "B" ? q.option_b : key === "C" ? q.option_c : q.option_d
}

export function AIExamRunner({ test, questions }: { test: AITest; questions: AIQuestion[] }) {
  const router = useRouter()
  const total = questions.length
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<AnswerState>({})
  const [submitted, setSubmitted] = useState(false)
  const [deadline] = useState(() => Date.now() + test.duration_minutes * 60 * 1000)
  const [now, setNow] = useState(Date.now())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => setNow(Date.now()), 250)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const question = questions[current]
  const answeredCount = Object.values(answers).filter((a) => a.selected !== null).length
  const progress = total > 0 ? Math.round((answeredCount / total) * 100) : 0
  const timeRemaining = Math.max(0, Math.round((deadline - now) / 1000))

  function selectOption(qId: string, opt: OptionKey) {
    setAnswers((prev) => ({
      ...prev,
      [qId]: { selected: opt, bookmarked: prev[qId]?.bookmarked ?? false },
    }))
  }

  function clearOption(qId: string) {
    setAnswers((prev) => ({
      ...prev,
      [qId]: { selected: null, bookmarked: prev[qId]?.bookmarked ?? false },
    }))
  }

  function toggleBookmark(qId: string) {
    setAnswers((prev) => ({
      ...prev,
      [qId]: { selected: prev[qId]?.selected ?? null, bookmarked: !prev[qId]?.bookmarked },
    }))
  }

  const handleSubmit = useCallback(() => {
    setSubmitted(true)
    // Score calculation
    let correct = 0
    let wrong = 0
    let skipped = 0
    questions.forEach((q) => {
      const sel = answers[q.id]?.selected
      if (!sel) { skipped++; return }
      if (sel === q.correct_option) correct++
      else wrong++
    })
    const timeTaken = test.duration_minutes * 60 - timeRemaining
    // Encode results into URL so we can show a summary without needing a DB write
    const params = new URLSearchParams({
      title: test.title,
      total: String(total),
      correct: String(correct),
      wrong: String(wrong),
      skipped: String(skipped),
      time: String(timeTaken),
    })
    router.push(`/tests/generate/result?${params.toString()}`)
  }, [answers, questions, router, test, total, timeRemaining])

  const handleExpire = useCallback(() => {
    if (!submitted) handleSubmit()
  }, [submitted, handleSubmit])

  if (!question) return null

  const answerState = answers[question.id]
  const selected = answerState?.selected ?? null
  const bookmarked = answerState?.bookmarked ?? false

  // After submission show review mode
  if (submitted) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Calculating your results…
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <BrandLogo />
            <div className="hidden sm:block">
              <p className="text-sm font-medium leading-none">{test.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {answeredCount}/{total} answered
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ExamTimer seconds={timeRemaining} label="Time left" onExpire={handleExpire} warnThreshold={60} />
            <ThemeToggle />
          </div>
        </div>
        <Progress value={progress} className="h-1 rounded-none" />
      </header>

      {/* Body */}
      <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[1fr_280px]">
        {/* Question card */}
        <div className="flex flex-col">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-muted-foreground">
                Question {current + 1} of {total}
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{question.subject}</Badge>
                <Badge
                  variant="outline"
                  className={
                    question.difficulty === "easy"
                      ? "bg-success/10 text-success border-success/20 text-xs"
                      : question.difficulty === "medium"
                      ? "bg-warning/15 text-warning border-warning/30 text-xs"
                      : "bg-destructive/10 text-destructive border-destructive/20 text-xs"
                  }
                >
                  {question.difficulty}
                </Badge>
              </div>
            </div>

            <p className="mb-6 text-base font-medium leading-relaxed text-foreground">
              {question.question_text}
            </p>

            <div className="flex flex-col gap-3">
              {OPTION_KEYS.map((key) => {
                const isSelected = selected === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => isSelected ? clearOption(question.id) : selectOption(question.id, key)}
                    className={`flex items-start gap-3 rounded-lg border p-4 text-left text-sm transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border bg-background hover:border-primary/40 hover:bg-muted/40"
                    }`}
                  >
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                      isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40 text-muted-foreground"
                    }`}>
                      {key}
                    </span>
                    <span className="leading-relaxed">{optionText(question, key)}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <Button variant="outline" onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}>
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            {current < total - 1 ? (
              <Button onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <SubmitButton answered={answeredCount} total={total} onConfirm={handleSubmit} />
            )}
          </div>
        </div>

        {/* Palette sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold">Question Palette</h3>
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((q, i) => {
                const isAnswered = !!answers[q.id]?.selected
                const isCurrent = i === current
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrent(i)}
                    className={`flex h-8 w-full items-center justify-center rounded text-xs font-medium transition-all ${
                      isCurrent
                        ? "bg-primary text-primary-foreground"
                        : isAnswered
                        ? "bg-success/20 text-success"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>
            <div className="mt-5">
              <SubmitButton answered={answeredCount} total={total} onConfirm={handleSubmit} fullWidth />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function SubmitButton({
  answered,
  total,
  onConfirm,
  fullWidth,
}: {
  answered: number
  total: number
  onConfirm: () => void
  fullWidth?: boolean
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button className={fullWidth ? "w-full" : undefined}>
            <Send className="h-4 w-4" /> Submit Test
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Submit your test?</AlertDialogTitle>
          <AlertDialogDescription>
            You have answered {answered} of {total} questions.
            {answered < total ? " Unanswered questions will be marked as skipped." : ""} You cannot
            change your answers after submitting.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep working</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Submit now</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
