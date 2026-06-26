"use client"

import Link from "next/link"
import { Target, TrophyIcon, ListChecks, Flame, ArrowRight, BookOpenCheck } from "lucide-react"
import { useMyAttempts, useProfile } from "@/lib/queries"
import { StatCard } from "@/components/dashboard/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScoreTrendChart } from "@/components/analytics/score-trend-chart"

export function DashboardView() {
  const { data: profile } = useProfile()
  const { data: attempts, isLoading } = useMyAttempts()

  const total = attempts?.length ?? 0
  const avg = total ? Math.round(attempts!.reduce((s, a) => s + Number(a.percentage), 0) / total) : 0
  const best = total ? Math.round(Math.max(...attempts!.map((a) => Number(a.percentage)))) : 0
  const firstName = (profile?.full_name ?? "there").split(" ")[0]

  // Calculate real date-based streak
  const calculateStreak = () => {
    if (!attempts || attempts.length === 0) return 0
    const sorted = [...attempts].sort((a, b) => 
      new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime()
    )
    
    let streak = 0
    let lastDate: Date | null = null
    
    for (const attempt of sorted) {
      if (!attempt.completed_at) continue
      const attemptDate = new Date(attempt.completed_at)
      attemptDate.setHours(0, 0, 0, 0)
      
      if (!lastDate) {
        lastDate = attemptDate
        streak = 1
      } else {
        const diff = (lastDate.getTime() - attemptDate.getTime()) / (1000 * 60 * 60 * 24)
        if (diff === 1) {
          streak++
          lastDate = attemptDate
        } else if (diff > 1) {
          break
        }
      }
    }
    return streak
  }
  
  const streak = calculateStreak()

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-balance text-foreground">Welcome back, {firstName}</h1>
          <p className="text-sm text-muted-foreground">Here is a snapshot of your preparation.</p>
        </div>
        <Button asChild>
          <Link href="/tests">
            <BookOpenCheck className="size-4" /> Browse mock tests
          </Link>
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[92px] rounded-xl" />)
        ) : (
          <>
            <StatCard label="Tests completed" value={total} icon={ListChecks} accent="primary" />
            <StatCard label="Average score" value={`${avg}%`} icon={Target} accent="success" />
            <StatCard label="Best score" value={`${best}%`} icon={TrophyIcon} accent="warning" />
            <StatCard
              label="Current streak"
              value={`${streak} day${streak !== 1 ? 's' : ''}`}
              icon={Flame}
              accent="primary"
            />
          </>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Score trend</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : total === 0 ? (
              <EmptyTrend />
            ) : (
              <ScoreTrendChart attempts={attempts!} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent attempts</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
            ) : total === 0 ? (
              <p className="text-sm text-muted-foreground">No attempts yet. Take your first mock test!</p>
            ) : (
              attempts!.slice(0, 5).map((a) => (
                <Link
                  key={a.id}
                  href={`/results/${a.id}`}
                  className="group flex items-center justify-between gap-2 rounded-lg border border-border p-3 transition-colors hover:bg-accent/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{a.mock_tests?.title ?? "Test"}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.completed_at ? new Date(a.completed_at).toLocaleDateString() : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={Number(a.percentage) >= 60 ? "default" : "secondary"}>
                      {Math.round(Number(a.percentage))}%
                    </Badge>
                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function EmptyTrend() {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
      <p className="text-sm font-medium text-foreground">No data yet</p>
      <p className="max-w-xs text-sm text-muted-foreground">
        Complete a few mock tests and your score trend will appear here.
      </p>
      <Button asChild variant="outline" size="sm" className="mt-2">
        <Link href="/tests">Start a test</Link>
      </Button>
    </div>
  )
}
