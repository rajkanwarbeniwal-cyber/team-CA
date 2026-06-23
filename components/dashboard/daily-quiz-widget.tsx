"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Flame, Zap, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { UserStats } from "@/lib/types"

interface DailyQuizWidgetProps {
  stats: UserStats | null
  completed: boolean
}

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
}

const streakVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity },
  },
}

export function DailyQuizWidget({ stats, completed }: DailyQuizWidgetProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Card className="glass relative overflow-hidden border-0 p-6 backdrop-blur-xl">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-pink-500/10 to-purple-500/10" />

        {/* Content */}
        <div className="relative z-10">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold text-foreground">Daily Challenge</h3>
              <p className="mt-1 text-sm text-muted-foreground">5 questions, 10 minutes</p>
            </div>
            {completed && (
              <div className="rounded-full bg-gradient-to-br from-green-400 to-emerald-600 px-3 py-1">
                <span className="text-xs font-bold text-white">Completed!</span>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="mb-6 grid grid-cols-3 gap-4">
            {/* Current Streak */}
            <motion.div
              variants={streakVariants}
              animate="pulse"
              className="rounded-xl bg-white/20 p-4 text-center backdrop-blur-sm"
            >
              <div className="flex justify-center mb-2">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats?.current_streak ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Current Streak</p>
            </motion.div>

            {/* Longest Streak */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl bg-white/20 p-4 text-center backdrop-blur-sm"
            >
              <div className="flex justify-center mb-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats?.longest_streak ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Best Streak</p>
            </motion.div>

            {/* Points */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl bg-white/20 p-4 text-center backdrop-blur-sm"
            >
              <div className="flex justify-center mb-2">
                <Zap className="h-6 w-6 text-cyan-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats?.points ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Total Points</p>
            </motion.div>
          </div>

          {/* CTA Button */}
          {!completed ? (
            <Link href="/daily-quiz" className="block">
              <Button size="lg" className="w-full gradient-purple-pink text-white font-semibold">
                Start Today&apos;s Quiz
              </Button>
            </Link>
          ) : (
            <div className="rounded-lg bg-green-500/20 p-4 text-center">
              <p className="text-sm font-semibold text-green-600">Great job! Come back tomorrow for a new challenge.</p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
