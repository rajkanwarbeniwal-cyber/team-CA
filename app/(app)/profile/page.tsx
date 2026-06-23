import { redirect } from "next/navigation"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Flame, Trophy, Zap, BookOpen, Star } from "lucide-react"
import { GamificationStats } from "@/components/profile/gamification-stats"
import { AchievementBadge } from "@/components/profile/achievement-badge"

export const metadata = {
  title: "My Profile — Taksha",
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Fetch user data
  const [{ data: profile }, { data: stats }, { data: achievements }, { data: attempts }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("user_stats").select("*").eq("user_id", user.id).single(),
    supabase.from("user_achievements").select("*").eq("user_id", user.id),
    supabase.from("test_attempts").select("*").eq("user_id", user.id).order("completed_at", { ascending: false }).limit(5),
  ])

  const initials = (profile?.full_name ?? "Student")
    .split(" ")
    .map((s: string) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  // Calculate level based on points
  const level = Math.floor((stats?.points ?? 0) / 500) + 1

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Profile Header */}
      <div className="glass relative overflow-hidden rounded-3xl border-0 p-8 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{profile?.full_name ?? "Student"}</h1>
                <p className="text-muted-foreground capitalize">Level {level}</p>
              </div>
            </div>
            <Badge className="gradient-purple-pink text-white text-lg px-4 py-2">
              {stats?.points ?? 0} Points
            </Badge>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <Flame className="h-5 w-5 text-orange-500 mb-2" />
              <div className="text-2xl font-bold">{stats?.current_streak ?? 0}</div>
              <div className="text-xs text-muted-foreground">Current Streak</div>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <Trophy className="h-5 w-5 text-yellow-500 mb-2" />
              <div className="text-2xl font-bold">{stats?.longest_streak ?? 0}</div>
              <div className="text-xs text-muted-foreground">Best Streak</div>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <BookOpen className="h-5 w-5 text-cyan-500 mb-2" />
              <div className="text-2xl font-bold">{stats?.total_quizzes_attempted ?? 0}</div>
              <div className="text-xs text-muted-foreground">Quizzes Done</div>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <Star className="h-5 w-5 text-pink-500 mb-2" />
              <div className="text-2xl font-bold">{achievements?.length ?? 0}</div>
              <div className="text-xs text-muted-foreground">Achievements</div>
            </div>
          </div>
        </div>
      </div>

      {/* Gamification Stats */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-accent" />
          <h2 className="text-2xl font-bold text-foreground">Your Progress</h2>
        </div>
        <GamificationStats stats={stats} />
      </div>

      {/* Achievements Section */}
      {(achievements && achievements.length > 0) ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Achievements ({achievements.length})</h2>
          </div>
          <div className="flex flex-wrap gap-6">
            {achievements.map((achievement: any, idx: number) => (
              <AchievementBadge key={achievement.id} achievement={achievement} index={idx} />
            ))}
          </div>
        </div>
      ) : (
        <Card className="glass border-0 p-8 text-center">
          <p className="text-muted-foreground">Complete quizzes and challenges to unlock achievements!</p>
        </Card>
      )}

      {/* Recent Attempts */}
      {attempts && attempts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Attempts</h2>
          <div className="space-y-3">
            {(attempts as any[]).map((attempt) => (
              <Card key={attempt.id} className="glass border-0 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">Mock Test Attempt</p>
                    <p className="text-sm text-muted-foreground">
                      {attempt.correct_count}/{attempt.total_questions} correct
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{Math.round(attempt.percentage || 0)}%</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(attempt.completed_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
