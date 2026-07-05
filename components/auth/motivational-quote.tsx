"use client"

import { useEffect, useState } from "react"
import { Quote } from "lucide-react"
import { cn } from "@/lib/utils"

const QUOTES = [
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Your only limit is your mind.", author: "Unknown" },
  { text: "Dream big. Start small. Act now.", author: "Robin Sharma" },
]

const ROTATE_INTERVAL_MS = 6000

export function MotivationalQuote() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false)
      // Wait for fade-out, then swap quote and fade back in
      const t = setTimeout(() => {
        setIndex((i) => (i + 1) % QUOTES.length)
        setVisible(true)
      }, 300)
      return () => clearTimeout(t)
    }, ROTATE_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  const quote = QUOTES[index]

  return (
    <figure
      aria-live="polite"
      className={cn(
        "mx-auto flex max-w-sm items-start gap-2 rounded-lg border border-border/60 bg-card/50 px-4 py-3 transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
      <div>
        <blockquote className="text-pretty text-xs leading-relaxed text-muted-foreground">{quote.text}</blockquote>
        <figcaption className="mt-1 text-[10px] font-medium text-muted-foreground/70">
          {"— "}
          {quote.author}
        </figcaption>
      </div>
    </figure>
  )
}
