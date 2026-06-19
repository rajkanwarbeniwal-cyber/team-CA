"use client"

import { useState } from "react"
import { Bookmark, CheckCircle2, XCircle, MinusCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { AttemptReviewRow, OptionKey } from "@/lib/types"

type Filter = "all" | "incorrect" | "bookmarked"

export function ReviewList({ rows }: { rows: AttemptReviewRow[] }) {
  const [filter, setFilter] = useState<Filter>("all")

  const filtered = rows.filter((r) => {
    if (filter === "incorrect") return !r.is_correct
    if (filter === "bookmarked") return r.is_bookmarked
    return true
  })

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: rows.length },
    { key: "incorrect", label: "Incorrect", count: rows.filter((r) => !r.is_correct).length },
    { key: "bookmarked", label: "Bookmarked", count: rows.filter((r) => r.is_bookmarked).length },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle className="text-base">Answer Review</CardTitle>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              <span className="ml-1 text-xs opacity-70">{f.count}</span>
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {filtered.map((row, idx) => (
          <ReviewItem key={row.question_id} row={row} index={idx} />
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No questions match this filter.</p>
        )}
      </CardContent>
    </Card>
  )
}

function ReviewItem({ row, index }: { row: AttemptReviewRow; index: number }) {
  const options: { key: OptionKey; text: string }[] = [
    { key: "A", text: row.option_a },
    { key: "B", text: row.option_b },
    { key: "C", text: row.option_c },
    { key: "D", text: row.option_d },
  ]

  const statusBadge = row.is_skipped ? (
    <Badge variant="secondary" className="gap-1">
      <MinusCircle className="h-3 w-3" /> Skipped
    </Badge>
  ) : row.is_correct ? (
    <Badge className="gap-1 bg-success text-success-foreground">
      <CheckCircle2 className="h-3 w-3" /> Correct
    </Badge>
  ) : (
    <Badge variant="destructive" className="gap-1">
      <XCircle className="h-3 w-3" /> Incorrect
    </Badge>
  )

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <p className="text-sm font-medium leading-relaxed">
          <span className="text-muted-foreground">Q{index + 1}.</span> {row.question_text}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          {row.is_bookmarked && <Bookmark className="h-4 w-4 fill-primary text-primary" />}
          {statusBadge}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((opt) => {
          const isCorrect = row.correct_option === opt.key
          const isChosen = row.selected_option === opt.key
          return (
            <div
              key={opt.key}
              className={cn(
                "flex items-start gap-2 rounded-md border p-2.5 text-sm",
                isCorrect
                  ? "border-success bg-success/10"
                  : isChosen
                    ? "border-destructive bg-destructive/10"
                    : "border-border",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-semibold",
                  isCorrect
                    ? "bg-success text-success-foreground"
                    : isChosen
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {opt.key}
              </span>
              <span className="pt-0.5">{opt.text}</span>
            </div>
          )
        })}
      </div>

      {row.explanation && (
        <div className="mt-3 rounded-md bg-muted/50 p-3 text-sm">
          <span className="font-medium text-foreground">Explanation: </span>
          <span className="text-muted-foreground">{row.explanation}</span>
        </div>
      )}
    </div>
  )
}
