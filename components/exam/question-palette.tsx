"use client"

import { Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ExamQuestion } from "@/lib/types"

type AnswerState = Record<string, { selected: string | null; bookmarked: boolean; visited: boolean }>

export function QuestionPalette({
  questions,
  answers,
  current,
  onJump,
}: {
  questions: ExamQuestion[]
  answers: AnswerState
  current: number
  onJump: (index: number) => void
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-5">
        {questions.map((q, i) => {
          const state = answers[q.id]
          const answered = !!state?.selected
          const bookmarked = !!state?.bookmarked
          const visited = !!state?.visited
          const isCurrent = i === current
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onJump(i)}
              aria-label={`Question ${i + 1}${answered ? ", answered" : ""}${bookmarked ? ", bookmarked" : ""}`}
              aria-current={isCurrent ? "true" : undefined}
              className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors",
                isCurrent && "ring-2 ring-ring ring-offset-1 ring-offset-background",
                answered
                  ? "border-success bg-success text-success-foreground"
                  : visited
                    ? "border-warning/50 bg-warning/15 text-warning-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-accent",
              )}
            >
              {i + 1}
              {bookmarked && (
                <Bookmark
                  className="absolute -right-1 -top-1 h-3.5 w-3.5 fill-primary text-primary"
                  aria-hidden="true"
                />
              )}
            </button>
          )
        })}
      </div>
      <div className="space-y-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm border border-success bg-success" /> Answered
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm border border-warning/50 bg-warning/15" /> Visited / Skipped
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm border border-border bg-card" /> Not visited
        </div>
        <div className="flex items-center gap-2">
          <Bookmark className="h-3 w-3 fill-primary text-primary" /> Bookmarked
        </div>
      </div>
    </div>
  )
}
