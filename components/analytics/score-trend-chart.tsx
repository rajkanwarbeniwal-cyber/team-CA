"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { MockTest, TestAttempt } from "@/lib/types"

const config = {
  percentage: { label: "Score %", color: "var(--chart-1)" },
} satisfies ChartConfig

export function ScoreTrendChart({
  attempts,
}: {
  attempts: (TestAttempt & { mock_tests: MockTest | null })[]
}) {
  // chronological order for trend
  const data = [...attempts]
    .reverse()
    .map((a, i) => ({
      label: `#${i + 1}`,
      percentage: Math.round(Number(a.percentage)),
      title: a.mock_tests?.title ?? "Test",
    }))

  return (
    <ChartContainer config={config} className="h-64 w-full">
      <LineChart data={data} margin={{ left: 4, right: 12, top: 8, bottom: 4 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis domain={[0, 100]} tickLine={false} axisLine={false} width={32} tickMargin={4} />
        <ChartTooltip
          content={<ChartTooltipContent labelKey="title" nameKey="percentage" />}
          cursor={{ strokeDasharray: "3 3" }}
        />
        <Line
          type="monotone"
          dataKey="percentage"
          stroke="var(--color-percentage)"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "var(--color-percentage)" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ChartContainer>
  )
}
