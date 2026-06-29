"use client"

import { Bookmark, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ExamQuestion, OptionKey } from "@/lib/types"

const OPTION_KEYS: OptionKey[] = ["A", "B", "C", "D"]

export function QuestionCard({
  question,
  index,
  total,
  selected,
  bookmarked,
  onSelect,
  onClear,
  onToggleBookmark,
}: {
  question: ExamQuestion
  index: number
  total: number
  selected: OptionKey | null
  bookmarked: boolean
  onSelect: (opt: OptionKey) => void
  onClear: () => void
  onToggleBookmark: () => void
}) {
  const options: { key: OptionKey; text: string }[] = [
    { key: "A", text: question.option_a },
    { key: "B", text: question.option_b },
    { key: "C", text: question.option_c },
    { key: "D", text: question.option_d },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono">
            Q{index + 1}
            <span className="text-muted-foreground">/{total}</span>
          </Badge>
          {question.marks ? (
            <span className="text-xs text-muted-foreground">
              +{question.marks}
              {question.negative_marks ? ` / -${question.negative_marks}` : ""}
            </span>
          ) : null}
        </div>
        <Button
          type="button"
          variant={bookmarked ? "default" : "outline"}
          size="sm"
          onClick={onToggleBookmark}
          aria-pressed={bookmarked}
        >
          <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
          {bookmarked ? "Bookmarked" : "Bookmark"}
        </Button>
      </div>

      <h2 className="text-pretty text-lg font-medium leading-relaxed text-foreground">
        {question.question_text}
      </h2>

      <div className="flex flex-col gap-3" role="radiogroup" aria-label={`Options for question ${index + 1}`}>
        {options.map((opt) => {
          const isSelected = selected === opt.key
          return (
            <button
              key={opt.key}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(opt.key)}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border bg-card hover:border-primary/40 hover:bg-accent/40",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-sm font-semibold",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-muted text-muted-foreground",
                )}
              >
                {opt.key}
              </span>
              <span className="pt-0.5 text-sm leading-relaxed text-foreground">{opt.text}</span>
            </button>
          )
        })}
      </div>

      {selected && (
        <Button type="button" variant="ghost" size="sm" className="self-start" onClick={onClear}>
          <RotateCcw className="h-4 w-4" /> Clear response
        </Button>
      )}
    </div>
  )
}
