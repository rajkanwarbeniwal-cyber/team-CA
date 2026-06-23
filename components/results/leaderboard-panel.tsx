"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import type { LeaderboardRow } from "@/lib/types"

export function LeaderboardPanel({
  rows,
  average,
  myPercentage,
}: {
  rows: LeaderboardRow[]
  average: number
  myPercentage: number
}) {
  const chartData = [
    { label: "You", value: myPercentage, key: "you" },
    { label: "Peer Avg", value: average, key: "avg" },
    { label: "Topper", value: rows[0]?.percentage ?? myPercentage, key: "top" },
  ]

  const diff = Math.round((myPercentage - average) * 10) / 10

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Performance vs Peers</CardTitle>
        <CardDescription>
          {diff >= 0
            ? `You scored ${diff} points above the peer average.`
            : `You scored ${Math.abs(diff)} points below the peer average.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ChartContainer
          config={{
            value: { label: "Score %" },
          }}
          className="h-[180px] w-full"
        >
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis domain={[0, 100]} tickLine={false} axisLine={false} width={36} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {chartData.map((d) => (
                <Cell
                  key={d.key}
                  fill={d.key === "you" ? "var(--chart-1)" : d.key === "avg" ? "var(--chart-3)" : "var(--chart-2)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>

        <div>
          <h4 className="mb-2 text-sm font-semibold">Top Performers</h4>
          <ul className="space-y-1.5">
            {rows.slice(0, 5).map((row) => (
              <li
                key={`${row.rank}-${row.display_name}`}
                className={cn(
                  "flex items-center justify-between rounded-md px-3 py-2 text-sm",
                  row.is_current_user ? "bg-primary/10 font-medium text-foreground" : "bg-muted/40",
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-card text-xs font-semibold tabular-nums">
                    {row.rank}
                  </span>
                  {row.display_name}
                </span>
                <span className="tabular-nums text-muted-foreground">{row.percentage}%</span>
              </li>
            ))}
            {rows.length === 0 && (
              <li className="rounded-md bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                Be the first to set a score on this test.
              </li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
