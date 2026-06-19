"use client"

import Link from "next/link"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useMyAttempts } from "@/lib/queries"
import { ScoreTrendChart } from "@/components/analytics/score-trend-chart"
import { StatCard } from "@/components/dashboard/stat-card"
import { Target, TrendingUp, CheckCircle2, ListChecks } from "lucide-react"

export function AnalyticsView() {
  const { data: attempts, isLoading } = useMyAttempts()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    )
  }

  const list = attempts ?? []

  if (list.length === 0) {
    return (
      <div className="space-y-6">
        <Header />
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <ListChecks className="h-10 w-10 text-muted-foreground" />
            <p className="font-medium">No attempts yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Take your first mock test to start tracking your performance trends over time.
            </p>
            <Button asChild className="mt-2">
              <Link href="/tests">Browse Tests</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalTests = list.length
  const avgScore = Math.round(list.reduce((a, b) => a + b.percentage, 0) / totalTests)
  const bestScore = Math.max(...list.map((a) => a.percentage))
  const totalCorrect = list.reduce((a, b) => a + b.correct_count, 0)
  const totalQuestions = list.reduce((a, b) => a + b.total_questions, 0)
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0

  // Per-test comparison (latest 8)
  const compareData = list.slice(0, 8).map((a) => ({
    label: (a.mock_tests?.title ?? "Test").slice(0, 14),
    correct: a.correct_count,
    wrong: a.wrong_count,
    skipped: a.skipped_count,
  }))

  return (
    <div className="space-y-6">
      <Header />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tests Taken" value={totalTests} icon={ListChecks} />
        <StatCard label="Average Score" value={`${avgScore}%`} icon={TrendingUp} />
        <StatCard label="Best Score" value={`${bestScore}%`} icon={Target} accent="success" />
        <StatCard label="Overall Accuracy" value={`${accuracy}%`} icon={CheckCircle2} accent="success" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Score Trend</CardTitle>
          <CardDescription>Your percentage score across attempts over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ScoreTrendChart attempts={list} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Answer Breakdown by Test</CardTitle>
          <CardDescription>Correct, wrong, and skipped distribution across recent attempts</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              correct: { label: "Correct", color: "var(--chart-2)" },
              wrong: { label: "Wrong", color: "var(--chart-5)" },
              skipped: { label: "Skipped", color: "var(--chart-3)" },
            }}
            className="h-[300px] w-full"
          >
            <BarChart data={compareData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} width={36} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="correct" stackId="a" fill="var(--color-correct)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="wrong" stackId="a" fill="var(--color-wrong)" />
              <Bar dataKey="skipped" stackId="a" fill="var(--color-skipped)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function Header() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Performance Analytics</h1>
      <p className="text-sm text-muted-foreground">Track your progress and identify areas to improve.</p>
    </div>
  )
}
