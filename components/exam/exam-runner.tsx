"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Loader2, Send } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useExamStore } from "@/lib/exam-store"
import { useServerTimer } from "@/hooks/use-server-timer"
import type { ExamQuestion, MockTest, OptionKey } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { BrandLogo } from "@/components/brand-logo"
import { ExamTimer } from "@/components/exam/exam-timer"
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

export function ExamRunner({ test }: { test: MockTest }) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const store = useExamStore()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [now, setNow] = useState(Date.now())
  const initRef = useRef(false)

  // Server-authoritative timer validation
  const serverTimer = useServerTimer({
    attemptId: store.attemptId || "",
    timerMode: store.timerMode || "total",
    totalDurationMinutes: store.durationMinutes || 0,
    enabled: !!store.attemptId && !store.finished,
  })

  // ---- Initialize or resume the exam session ----
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    async function start() {
      // Resume if we have a persisted, unfinished attempt for this same test
      if (store.attemptId && store.testId === test.id && !store.finished && store.questions.length > 0) {
        setLoading(false)
        return
      }

      // Fresh start: clear any stale session and create a new attempt
      store.reset()

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data: attempt, error: attemptErr } = await supabase
        .from("test_attempts")
        .insert({ user_id: user.id, mock_test_id: test.id, status: "in_progress" })
        .select()
        .single()

      if (attemptErr || !attempt) {
        toast.error("Could not start the test. Please try again.")
        router.push("/tests")
        return
      }

      const { data: questions, error: qErr } = await supabase.rpc("get_exam_questions", {
        p_test_id: test.id,
      })

      if (qErr || !questions || questions.length === 0) {
        toast.error("This test has no questions yet.")
        router.push("/tests")
        return
      }

      store.initExam({
        attemptId: attempt.id,
        testId: test.id,
        title: test.title,
        timerMode: test.timer_mode,
        perQuestionSeconds: test.per_question_seconds,
        durationMinutes: test.duration_minutes,
        questions: questions as ExamQuestion[],
      })
      setLoading(false)
    }

    start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- Clock tick (display only; server is source of truth) ----
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [])

  // ---- Auto-submit if server says time is expired ----
  useEffect(() => {
    if (serverTimer.isExpired && !submitting && store.attemptId) {
      toast.info("Time is up! Auto-submitting your test.")
      handleSubmit()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverTimer.isExpired])

  const questions = store.questions
  const total = questions.length
  const current = store.currentIndex
  const question = questions[current]
  const answered = store.answeredCount()
  const progress = total > 0 ? Math.round((answered / total) * 100) : 0

  const handleSubmit = useCallback(async () => {
    if (!store.attemptId) return
    setSubmitting(true)

    // Sync with server before submission to ensure time hasn't expired
    try {
      await serverTimer.syncWithServer()
    } catch (error) {
      console.error("[v0] Server timer sync failed before submit:", error)
    }

    const answersPayload = questions.map((q) => ({
      question_id: q.id,
      selected_option: store.answers[q.id]?.selected ?? null,
      bookmarked: store.answers[q.id]?.bookmarked ?? false,
    }))

    const { error } = await supabase.rpc("submit_attempt", {
      p_attempt_id: store.attemptId,
      p_answers: answersPayload,
      p_time_taken: undefined, // Server will calculate from started_at
    })

    if (error) {
      toast.error("Submission failed. Please try again.")
      setSubmitting(false)
      return
    }

    const attemptId = store.attemptId
    store.finishExam()
    store.reset()
    router.push(`/results/${attemptId}`)
  }, [store, questions, supabase, router, serverTimer])

  // ---- Timer expiry handlers ----
  const handleTotalExpire = useCallback(() => {
    if (submitting) return
    toast.info("Time is up! Submitting your test.")
    handleSubmit()
  }, [submitting, handleSubmit])

  const handlePerQuestionExpire = useCallback(() => {
    if (current < total - 1) {
      store.next()
    } else {
      handleTotalExpire()
    }
  }, [current, total, store, handleTotalExpire])

  if (loading || !question) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Preparing your test…
        </div>
      </div>
    )
  }

  const totalRemaining = store.deadline ? Math.round((store.deadline - now) / 1000) : 0
  const perQRemaining = store.perQuestionDeadline ? Math.round((store.perQuestionDeadline - now) / 1000) : 0
  const answerState = store.answers[question.id]

  return (
    <div className="flex min-h-svh flex-col bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <BrandLogo />
            <div className="hidden sm:block">
              <p className="text-sm font-medium leading-none">{store.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {answered}/{total} answered
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {store.timerMode === "total" ? (
              <ExamTimer seconds={totalRemaining} label="Time left" onExpire={handleTotalExpire} warnThreshold={60} />
            ) : (
              <ExamTimer
                seconds={perQRemaining}
                label="This question"
                onExpire={handlePerQuestionExpire}
                warnThreshold={10}
              />
            )}
            <ThemeToggle />
          </div>
        </div>
        <Progress value={progress} className="h-1 rounded-none" />
      </header>

      {/* Body */}
      <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[1fr_280px]">
        {/* Question column */}
        <div className="flex flex-col">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <QuestionCard
              question={question}
              index={current}
              total={total}
              selected={answerState?.selected ?? null}
              bookmarked={answerState?.bookmarked ?? false}
              onSelect={(opt: OptionKey) => store.selectOption(question.id, opt)}
              onClear={() => store.clearOption(question.id)}
              onToggleBookmark={() => store.toggleBookmark(question.id)}
            />
          </div>

          {/* Nav controls */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <Button variant="outline" onClick={() => store.prev()} disabled={current === 0}>
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>

            {current < total - 1 ? (
              <Button onClick={() => store.next()}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <SubmitButton answered={answered} total={total} submitting={submitting} onConfirm={handleSubmit} />
            )}
          </div>
        </div>

        {/* Palette sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Question Palette</h3>
              <Badge variant="secondary" className="text-[10px]">
                {progress}% done
              </Badge>
            </div>
            <QuestionPalette
              questions={questions}
              answers={store.answers}
              current={current}
              onJump={(i) => store.goTo(i)}
            />
            <div className="mt-5">
              <SubmitButton
                answered={answered}
                total={total}
                submitting={submitting}
                onConfirm={handleSubmit}
                fullWidth
              />
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
  submitting,
  onConfirm,
  fullWidth,
}: {
  answered: number
  total: number
  submitting: boolean
  onConfirm: () => void
  fullWidth?: boolean
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button className={fullWidth ? "w-full" : undefined} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit Test
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Submit your test?</AlertDialogTitle>
          <AlertDialogDescription>
            You have answered {answered} of {total} questions.
            {answered < total ? " Unanswered questions will be marked as skipped." : ""} You cannot change your
            answers after submitting.
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
