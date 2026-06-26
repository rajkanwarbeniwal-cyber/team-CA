"use client"

import { useEffect, useState } from "react"

const quotes = [
  "Your future is being created by what you do today, not tomorrow. 🚀",
  "Success is the sum of small efforts repeated day in and day out. 💪",
  "The only way to do great work is to love what you do. ✨",
  "Believe you can and you're halfway there. 🎯",
  "Don't watch the clock; do what it does. Keep going. ⏰",
  "Excellence is not a skill, it's an attitude. 🏆",
  "Your exam is not your destiny, it's your stepping stone. 📚",
  "Every mistake is a lesson, every attempt is progress. 📈",
]

export function MotivationalQuotes() {
  const [currentQuote, setCurrentQuote] = useState(quotes[0])
  const [fadeIn, setFadeIn] = useState(true)

  useEffect(() => {
    let currentIndex = 0

    const interval = setInterval(() => {
      setFadeIn(false)
      setTimeout(() => {
        currentIndex = (currentIndex + 1) % quotes.length
        setCurrentQuote(quotes[currentIndex])
        setFadeIn(true)
      }, 300)
    }, 7000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center justify-center px-4 py-6">
      <p
        className={`text-center text-sm font-medium text-foreground/80 transition-opacity duration-300 ${
          fadeIn ? "opacity-100" : "opacity-0"
        }`}
      >
        {currentQuote}
      </p>
    </div>
  )
}
