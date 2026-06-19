"use client"

import { CheckCircle2, XCircle, MinusCircle, Trophy, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { TestAttempt } from "@/lib/types"

function ScoreRing({ percentage }: { percentage: number }) {
  const radius = 56
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference
  const tone = percentage >= 60 ? "text-success" : percentage >= 40 ? "text-warning" : "text-destructive"

  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128" aria-hidden="true">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="var(--muted)" strokeWidth="10" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-all duration-1000 ease-out", tone)}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn("text-3xl font-bold tabular-nums", tone)}>{percentage}%</span>
        <span className="text-xs text-muted-foreground">Score</span>
      </div>
    </div>
  )
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s.toString().padStart(2, "0")}s`
}

export function ScoreSummary({ attempt, rank }: { attempt: TestAttempt; rank: number | null }) {
  const stats = [
    { label: "Correct", value: attempt.correct_count, icon: CheckCircle2, tone: "text-success" },
    { label: "Wrong", value: attempt.wrong_count, icon: XCircle, tone: "text-destructive" },
    { label: "Skipped", value: attempt.skipped_count, icon: MinusCircle, tone: "text-muted-foreground" },
  ]

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-center sm:gap-8">
        <ScoreRing percentage={attempt.percentage} />
        <div className="flex-1 space-y-4 text-center sm:text-left">
          <div>
            <p className="text-sm text-muted-foreground">Final Score</p>
            <p className="text-2xl font-bold">
              {attempt.score} <span className="text-base font-normal text-muted-foreground">marks</span>
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                <s.icon className={cn("mx-auto mb-1 h-5 w-5", s.tone)} />
                <p className="text-lg font-semibold tabular-nums">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
            <span className="flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-warning" />
              {rank ? `Rank #${rank}` : "Unranked"}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {formatDuration(attempt.time_taken_seconds)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
