import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Flame, Trophy, BookOpen, Star, Target, MapPin, Calendar, Hash } from "lucide-react"
import { GamificationStats } from "@/components/profile/gamification-stats"
import { AchievementBadge } from "@/components/profile/achievement-badge"
import { ProfileEditForm } from "@/components/profile/profile-edit-form"

export const metadata: Metadata = {
  title: "My Profile — Taksha",
  description: "View and update your Taksha profile, exam goals, and preparation details.",
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const [{ data: profile }, { data: stats }, { data: achievements }, { data: attempts }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("user_stats").select("*").eq("user_id", user.id).single(),
      supabase.from("user_achievements").select("*").eq("user_id", user.id),
      supabase
        .from("test_attempts")
        .select("*, mock_tests(title)")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(5),
    ])

  const initials = (profile?.full_name ?? "Student")
    .split(" ")
    .map((s: string) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const level = Math.floor((stats?.points ?? 0) / 500) + 1
  const progressToNextLevel = ((stats?.points ?? 0) % 500) / 5 // percentage within current level

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Profile Header Card */}
      <Card className="overflow-hidden border-border">
        {/* Top colour strip */}
        <div className="h-2 bg-primary" />

        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-4 border-background ring-2 ring-border">
              <AvatarImage
                src={profile?.avatar_url ?? undefined}
                alt={profile?.full_name ?? "Profile photo"}
              />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground leading-tight">
                {profile?.full_name ?? "Student"}
              </h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="secondary">Level {level}</Badge>
                {profile?.exam_goal && (
                  <Badge variant="outline" className="gap-1">
                    <Target className="h-3 w-3" />
                    {profile.exam_goal}
                  </Badge>
                )}
                {profile?.target_state && (
                  <Badge variant="outline" className="gap-1">
                    <MapPin className="h-3 w-3" />
                    {profile.target_state}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Points pill */}
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="text-3xl font-bold text-primary">
              {(stats?.points ?? 0).toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Points</span>
            {/* Level progress bar */}
            <div className="w-32">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progressToNextLevel}%` }}
                />
              </div>
              <p className="mt-0.5 text-right text-xs text-muted-foreground">
                {(stats?.points ?? 0) % 500}/{500} to Level {level + 1}
              </p>
            </div>
          </div>
        </div>

        {/* Quick stat pills */}
        <div className="grid grid-cols-2 divide-x divide-y divide-border border-t border-border sm:grid-cols-4 sm:divide-y-0">
          {[
            { icon: Flame, label: "Current Streak", value: stats?.current_streak ?? 0, color: "text-orange-500" },
            { icon: Trophy, label: "Best Streak", value: stats?.longest_streak ?? 0, color: "text-yellow-500" },
            { icon: BookOpen, label: "Quizzes Done", value: stats?.total_quizzes_attempted ?? 0, color: "text-accent" },
            { icon: Star, label: "Achievements", value: achievements?.length ?? 0, color: "text-secondary" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex flex-col items-center gap-1 px-4 py-4">
              <Icon className={`h-5 w-5 ${color}`} />
              <span className="text-2xl font-bold text-foreground">{value}</span>
              <span className="text-xs text-muted-foreground text-center">{label}</span>
            </div>
          ))}
        </div>

        {/* Exam prep summary row */}
        {(profile?.exam_goal || profile?.target_year || profile?.attempt_number) && (
          <div className="flex flex-wrap gap-6 border-t border-border px-6 py-3 bg-muted/30">
            {profile?.exam_goal && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Target className="h-4 w-4 shrink-0" />
                <span>Target: <strong className="text-foreground">{profile.exam_goal}</strong></span>
              </div>
            )}
            {profile?.target_year && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>Year: <strong className="text-foreground">{profile.target_year}</strong></span>
              </div>
            )}
            {profile?.attempt_number && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Hash className="h-4 w-4 shrink-0" />
                <span>Attempt: <strong className="text-foreground">{profile.attempt_number}</strong></span>
              </div>
            )}
            {profile?.target_state && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>State: <strong className="text-foreground">{profile.target_state}</strong></span>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Tabs: Overview | Edit Profile */}
      <Tabs defaultValue="overview">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview" className="flex-1 sm:flex-none">Overview</TabsTrigger>
          <TabsTrigger value="edit" className="flex-1 sm:flex-none">Edit Profile</TabsTrigger>
        </TabsList>

        {/* --- OVERVIEW TAB --- */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Gamification */}
          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">Your Progress</h2>
            <GamificationStats stats={stats} />
          </div>

          {/* Achievements */}
          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Achievements{achievements && achievements.length > 0 ? ` (${achievements.length})` : ""}
            </h2>
            {achievements && achievements.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {achievements.map((achievement: any, idx: number) => (
                  <AchievementBadge key={achievement.id} achievement={achievement} index={idx} />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center border-border">
                <Star className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
                <p className="text-muted-foreground text-sm">
                  Complete quizzes and challenges to unlock achievements!
                </p>
              </Card>
            )}
          </div>

          {/* Recent Attempts */}
          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">Recent Attempts</h2>
            {attempts && attempts.length > 0 ? (
              <div className="space-y-3">
                {(attempts as any[]).map((attempt) => (
                  <Card key={attempt.id} className="flex items-center justify-between p-4 border-border">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground text-sm">
                        {attempt.mock_tests?.title ?? "Mock Test"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {attempt.correct_count}/{attempt.total_questions} correct &middot;{" "}
                        {new Date(attempt.completed_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="ml-4 shrink-0 text-right">
                      <p
                        className={`text-2xl font-bold ${
                          attempt.percentage >= 60 ? "text-primary" : "text-secondary"
                        }`}
                      >
                        {Math.round(attempt.percentage ?? 0)}%
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center border-border">
                <BookOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
                <p className="text-muted-foreground text-sm">No attempts yet. Take your first mock test!</p>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* --- EDIT PROFILE TAB --- */}
        <TabsContent value="edit" className="mt-6">
          <Card className="border-border p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground">Edit Profile</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Update your personal details, target exam, and preparation information.
              </p>
            </div>
            <ProfileEditForm
              profile={profile ?? { id: user.id, full_name: null, avatar_url: null, role: "student", exam_goal: null, target_year: null, attempt_number: null, target_state: null, created_at: "" }}
              email={user.email ?? ""}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
