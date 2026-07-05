"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Loader2, Send, BrainCircuit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { BrandLogo } from "@/components/brand-logo"
import { QuestionCard } from "@/components/exam/question-card"
import { QuestionPalette } from "@/components/exam/question-palette"
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
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { AiMockTest, AiTestQuestion } from "@/app/actions/generate-ai-test"
import type { ExamQuestion, OptionKey } from "@/lib/types"

// ---------- helpers ----------

function toExamQuestion(q: AiTestQuestion): ExamQuestion {
  return {
    id: q.id,
    mock_test_id: q.test_id,
    question_text: q.question_text,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    marks: 1,
    negative_marks: 0,
    sort_order: q.sort_order,
  }
}

type AnswerMap = Record<string, { selected: OptionKey | null; bookmarked: boolean; visited: boolean }>

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

// ---------- component ----------

interface Props {
  test: AiMockTest
  questions: AiTestQuestion[]
}

export function AiExamRunner({ test, questions }: Props) {
  const router = useRouter()
  const examQuestions = questions.map(toExamQuestion)
  const total = examQuestions.length

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswerMap>(() =>
    Object.fromEntries(examQuestions.map((q) => [q.id, { selected: null, bookmarked: false, visited: false }])),
  )
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(test.duration_minutes * 60) // seconds
  const startedAt = useRef(Date.now())
  const submitted = useRef(false)

  const current = examQuestions[currentIndex]
  const answerState = answers[current.id]
  const answered = Object.values(answers).filter((a) => a.selected !== null).length
  const progress = total > 0 ? Math.round((answered / total) * 100) : 0

  // Mark current question as visited
  useEffect(() => {
    setAnswers((prev) => ({
      ...prev,
      [current.id]: { ...prev[current.id], visited: true },
    }))
  }, [current.id])

  // Countdown timer — client-side only (no server attempt record for AI tests)
  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id)
          if (!submitted.current) {
            toast.info("Time is up! Submitting your test.")
            handleSubmit()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSelect = useCallback((opt: OptionKey) => {
    setAnswers((prev) => ({ ...prev, [current.id]: { ...prev[current.id], selected: opt } }))
  }, [current.id])

  const handleClear = useCallback(() => {
    setAnswers((prev) => ({ ...prev, [current.id]: { ...prev[current.id], selected: null } }))
  }, [current.id])

  const handleToggleBookmark = useCallback(() => {
    setAnswers((prev) => ({
      ...prev,
      [current.id]: { ...prev[current.id], bookmarked: !prev[current.id].bookmarked },
    }))
  }, [current.id])

  const handleSubmit = useCallback(async () => {
    if (submitted.current || submitting) return
    submitted.current = true
    setSubmitting(true)

    const timeTaken = Math.round((Date.now() - startedAt.current) / 1000)

    // Score the test client-side using the correct_option from DB (questions already fetched server-side)
    const correctMap = Object.fromEntries(questions.map((q) => [q.id, q.correct_option]))
    let correct = 0
    let wrong = 0
    let skipped = 0
    const reviewRows: ReviewRow[] = []

    for (const q of questions) {
      const selected = answers[q.id]?.selected ?? null
      const isCorrect = selected !== null && selected === correctMap[q.id]
      if (selected === null) skipped++
      else if (isCorrect) correct++
      else wrong++

      reviewRows.push({
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_option: q.correct_option as OptionKey,
        explanation: q.explanation,
        selected_option: selected,
        is_correct: isCorrect,
        is_bookmarked: answers[q.id]?.bookmarked ?? false,
        subject: q.subject,
        sort_order: q.sort_order,
      })
    }

    const score = correct
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0

    // Store results in sessionStorage and navigate to results view
    const resultPayload: AiTestResult = {
      testId: test.id,
      title: test.title,
      examGoal: test.exam_goal,
      timeTaken,
      score,
      correct,
      wrong,
      skipped,
      total,
      percentage,
      review: reviewRows,
    }

    sessionStorage.setItem(`ai-result-${test.id}`, JSON.stringify(resultPayload))
    router.push(`/ai-test/${test.id}/results`)
  }, [answers, questions, submitting, test, total, router])

  const timerWarning = timeLeft < 120
  const timerCritical = timeLeft < 30

  // Build palette state
  // No derived paletteStates needed — pass raw data to QuestionPalette

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <BrandLogo />
          <div className="hidden h-5 w-px bg-border sm:block" />
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <BrainCircuit className="size-3.5 text-primary" />
            <span className="font-medium text-foreground">{test.exam_goal}</span>
            <span>·</span>
            <span>AI Test</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer */}
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-mono font-semibold tabular-nums",
              timerCritical
                ? "border-destructive/40 bg-destructive/10 text-destructive"
                : timerWarning
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "border-border bg-card text-foreground",
            )}
            aria-label={`Time remaining: ${formatTime(timeLeft)}`}
          >
            {formatTime(timeLeft)}
          </div>

          <ThemeToggle />

          {/* Submit dialog */}
          <AlertDialog>
            <AlertDialogTrigger>
              <Button size="sm" disabled={submitting} type="button">
                {submitting ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <Send className="mr-1.5 size-3.5" />}
                Submit
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Submit your AI test?</AlertDialogTitle>
                <AlertDialogDescription>
                  You have answered {answered} of {total} questions. Skipped questions will be marked as wrong.
                  You can review the full solution after submission.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => { e.preventDefault(); handleSubmit() }}
                >
                  Submit now
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      {/* Progress bar */}
      <div className="shrink-0">
        <Progress value={progress} className="h-1 rounded-none" />
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Question area */}
        <main className="flex flex-1 flex-col overflow-y-auto px-4 py-6 lg:px-8">
          <QuestionCard
            question={current}
            index={currentIndex}
            total={total}
            selected={answerState?.selected ?? null}
            bookmarked={answerState?.bookmarked ?? false}
            onSelect={handleSelect}
            onClear={handleClear}
            onToggleBookmark={handleToggleBookmark}
          />

          {/* Subject badge */}
          <div className="mt-4">
            <Badge variant="outline" className="text-xs text-muted-foreground">
              {questions[currentIndex]?.subject}
            </Badge>
          </div>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => i - 1)}
            >
              <ChevronLeft className="mr-1 size-4" /> Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              {currentIndex + 1} / {total}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentIndex === total - 1}
              onClick={() => setCurrentIndex((i) => i + 1)}
            >
              Next <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </main>

        {/* Palette sidebar */}
        <aside className="hidden w-64 shrink-0 overflow-y-auto border-l border-border bg-card p-4 lg:block">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Question Palette</h3>
            <Badge variant="secondary" className="text-[10px]">{progress}% done</Badge>
          </div>
          <QuestionPalette
            questions={examQuestions}
            answers={answers}
            current={currentIndex}
            onJump={(idx) => setCurrentIndex(idx)}
          />
          <div className="mt-4 border-t border-border pt-4 space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-sm bg-primary" /> Answered ({answered})
            </div>
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-sm bg-amber-400" /> Visited ({Object.values(answers).filter(a => a.visited && a.selected === null).length})
            </div>
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-sm border border-border bg-muted" /> Not visited ({total - answered - Object.values(answers).filter(a => a.visited && a.selected === null).length})
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

// Types for result payload stored in sessionStorage
export interface ReviewRow {
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: OptionKey
  explanation: string
  selected_option: OptionKey | null
  is_correct: boolean
  is_bookmarked: boolean
  subject: string
  sort_order: number
}

export interface AiTestResult {
  testId: string
  title: string
  examGoal: string
  timeTaken: number
  score: number
  correct: number
  wrong: number
  skipped: number
  total: number
  percentage: number
  review: ReviewRow[]
}
