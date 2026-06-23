"use client"

import { motion } from "framer-motion"
import { Trophy, Zap, Heart, Brain, Award, Flame } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { UserAchievement } from "@/lib/types"

interface AchievementBadgeProps {
  achievement: UserAchievement
  index?: number
}

const achievementIcons: Record<string, React.ReactNode> = {
  first_test: <Trophy className="h-6 w-6" />,
  perfect_score: <Heart className="h-6 w-6" />,
  streak_7: <Flame className="h-6 w-6" />,
  scholar: <Brain className="h-6 w-6" />,
  champion: <Award className="h-6 w-6" />,
  speedster: <Zap className="h-6 w-6" />,
}

const badgeColors: Record<string, string> = {
  first_test: "from-blue-500 to-cyan-500",
  perfect_score: "from-red-500 to-pink-500",
  streak_7: "from-orange-500 to-red-500",
  scholar: "from-purple-500 to-pink-500",
  champion: "from-yellow-500 to-orange-500",
  speedster: "from-green-500 to-cyan-500",
}

export function AchievementBadge({ achievement, index = 0 }: AchievementBadgeProps) {
  const icon = achievementIcons[achievement.achievement_type] || <Trophy className="h-6 w-6" />
  const color = badgeColors[achievement.achievement_type] || "from-primary to-secondary"

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.1 }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`glass relative h-20 w-20 rounded-full bg-gradient-to-br ${color} p-0.5 shadow-lg`}>
            <div className="flex h-full w-full items-center justify-center rounded-full bg-background text-foreground">
              {icon}
            </div>
            <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
              ✓
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">{achievement.title}</p>
            <p className="text-xs text-muted-foreground">{achievement.description}</p>
            <p className="text-xs text-muted-foreground">Unlocked on {new Date(achievement.unlocked_at).toLocaleDateString()}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </motion.div>
  )
}
