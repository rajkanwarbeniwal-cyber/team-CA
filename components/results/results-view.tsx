"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { Home, RotateCcw, PartyPopper } from "lucide-react"
import { Button } from "@/components/ui/button"
import { celebrate } from "@/lib/confetti"
import { ScoreSummary } from "@/components/results/score-summary"
import { LeaderboardPanel } from "@/components/results/leaderboard-panel"
import { ReviewList } from "@/components/results/review-list"
import type { AttemptReviewRow, LeaderboardRow, MockTest, TestAttempt } from "@/lib/types"

export function ResultsView({
  attempt,
  test,
  review,
  leaderboard,
  average,
}: {
  attempt: TestAttempt
  test: MockTest | null
  review: AttemptReviewRow[]
  leaderboard: LeaderboardRow[]
  average: number
}) {
  const firedRef = useRef(false)
  const passed = attempt.percentage > 60

  useEffect(() => {
    if (passed && !firedRef.current) {
      firedRef.current = true
      const t = setTimeout(() => celebrate(), 400)
      return () => clearTimeout(t)
    }
  }, [passed])

  const myRank = leaderboard.find((r) => r.is_current_user)?.rank ?? null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {passed && <PartyPopper className="h-5 w-5 text-warning" />}
          <h1 className="text-2xl font-bold tracking-tight">
            {passed ? "Great job!" : "Test Completed"}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {test?.title ?? "Mock Test"} — {passed ? "You passed the 60% benchmark." : "Review your answers below to improve."}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <ScoreSummary attempt={attempt} rank={myRank} />
        <LeaderboardPanel rows={leaderboard} average={average} myPercentage={attempt.percentage} />
      </div>

      <ReviewList rows={review} />

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/dashboard">
            <Home className="h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
        {test && (
          <Button asChild>
            <Link href={`/exam/${test.id}`}>
              <RotateCcw className="h-4 w-4" /> Retake Test
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
