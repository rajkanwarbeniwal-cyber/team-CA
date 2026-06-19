"use client"

import { useEffect } from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
  }
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
}

export function ExamTimer({
  seconds,
  label,
  onExpire,
  warnThreshold = 30,
}: {
  seconds: number
  label: string
  onExpire: () => void
  warnThreshold?: number
}) {
  useEffect(() => {
    if (seconds <= 0) {
      onExpire()
    }
  }, [seconds, onExpire])

  const isWarning = seconds <= warnThreshold

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-sm font-semibold tabular-nums transition-colors",
        isWarning
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : "border-border bg-card text-foreground",
      )}
      role="timer"
      aria-live={isWarning ? "assertive" : "off"}
    >
      <Clock className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline text-muted-foreground font-sans text-xs">{label}</span>
      <span>{formatTime(seconds)}</span>
    </div>
  )
}
