"use client"

import { motion } from "framer-motion"
import { Flame, Zap, Trophy, Target } from "lucide-react"
import type { UserStats } from "@/lib/types"

interface GamificationStatsProps {
  stats: UserStats | null
}

export function GamificationStats({ stats }: GamificationStatsProps) {
  if (!stats) {
    return (
      <div className="glass rounded-2xl border-0 p-6 text-center">
        <p className="text-muted-foreground">Loading stats...</p>
      </div>
    )
  }

  const statItems = [
    {
      icon: Flame,
      label: "Current Streak",
      value: stats.current_streak,
      unit: "days",
      color: "text-orange-500",
    },
    {
      icon: Trophy,
      label: "Longest Streak",
      value: stats.longest_streak,
      unit: "days",
      color: "text-yellow-500",
    },
    {
      icon: Target,
      label: "Quizzes Completed",
      value: stats.total_quizzes_attempted,
      unit: "",
      color: "text-blue-500",
    },
    {
      icon: Zap,
      label: "Total Points",
      value: stats.points,
      unit: "pts",
      color: "text-purple-500",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass relative overflow-hidden rounded-2xl border-0 p-6"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-50" />
            <div className="relative z-10 space-y-3">
              <div className={`rounded-full bg-background p-2 w-fit ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground">
                  {stat.value.toLocaleString()}
                  <span className="ml-1 text-sm text-muted-foreground">{stat.unit}</span>
                </p>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
