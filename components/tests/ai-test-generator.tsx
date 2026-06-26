"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { BrainCircuit, Clock, FileQuestion, Loader2, Sparkles, TrendingUp } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type StrengthLevel = "weak" | "average" | "strong"

interface SubjectStrength {
  subject_name: string
  strength_level: StrengthLevel
}

interface Profile {
  exam_goal: string | null
  full_name: string | null
}

const QUESTION_OPTIONS = [20, 50, 100] as const
const DURATION_OPTIONS = [30, 60, 90] as const

const strengthStyle: Record<StrengthLevel, { badge: string; label: string }> = {
  weak: { badge: "bg-destructive/10 text-destructive border-destructive/20", label: "Weak" },
  average: { badge: "bg-warning/15 text-warning border-warning/30", label: "Average" },
  strong: { badge: "bg-success/10 text-success border-success/20", label: "Strong" },
}

const weightLabel: Record<StrengthLevel, string> = {
  weak: "60% of questions",
  average: "30% of questions",
  strong: "10% of questions",
}

export function AITestGenerator() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [strengths, setStrengths] = useState<SubjectStrength[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [questionCount, setQuestionCount] = useState<(typeof QUESTION_OPTIONS)[number]>(50)
  const [durationMinutes, setDurationMinutes] = useState<(typeof DURATION_OPTIONS)[number]>(60)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: profileData }, { data: strengthData }] = await Promise.all([
        supabase.from("profiles").select("exam_goal, full_name").eq("id", user.id).single(),
        supabase
          .from("user_subject_strengths")
          .select("subject_name, strength_level")
          .eq("user_id", user.id),
      ])

      setProfile(profileData ?? null)

      // Filter to only the strengths matching the user's current exam goal
      if (profileData?.exam_goal && strengthData) {
        const { data: goalStrengths } = await supabase
          .from("user_subject_strengths")
          .select("subject_name, strength_level")
          .eq("user_id", user.id)
          .eq("exam_goal", profileData.exam_goal)
        setStrengths((goalStrengths as SubjectStrength[]) ?? [])
      }

      setLoading(false)
    }
    fetchData()
  }, [])

  async function handleGenerate() {
    if (!profile?.exam_goal) {
      toast.error("Please set your exam goal in your profile first.")
      return
    }
    if (strengths.length === 0) {
      toast.error("Please map your subject strengths in your profile first.")
      return
    }

    setGenerating(true)

    try {
      const res = await fetch("/api/generate-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionCount, durationMinutes }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? "Failed to generate test. Please try again.")
        return
      }

      toast.success("Test generated! Starting now…")
      router.push(`/exam/ai/${data.testId}`)
    } catch {
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading your profile…</span>
        </div>
      </div>
    )
  }

  const hasProfile = !!profile?.exam_goal
  const hasStrengths = strengths.length > 0

  // Group strengths by level for the summary
  const weakSubjects = strengths.filter((s) => s.strength_level === "weak")
  const averageSubjects = strengths.filter((s) => s.strength_level === "average")
  const strongSubjects = strengths.filter((s) => s.strength_level === "strong")

  return (
    <div className="flex flex-col gap-6">
      {/* Subject Strengths Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Your Subject Strengths</CardTitle>
          </div>
          <CardDescription>
            {hasProfile
              ? `Based on your ${profile.exam_goal} profile`
              : "Set your exam goal and subject strengths in your profile to get started."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasProfile ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center">
              <p className="text-sm text-muted-foreground">No exam goal set.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => router.push("/profile")}
              >
                Go to Profile
              </Button>
            </div>
          ) : !hasStrengths ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No subject strengths mapped for {profile.exam_goal} yet.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => router.push("/profile")}
              >
                Map Strengths
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {weakSubjects.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-destructive">
                      Weak — 60% of test
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {weakSubjects.map((s) => (
                      <Badge key={s.subject_name} variant="outline" className={strengthStyle.weak.badge}>
                        {s.subject_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {averageSubjects.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-warning">
                    Average — 30% of test
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {averageSubjects.map((s) => (
                      <Badge key={s.subject_name} variant="outline" className={strengthStyle.average.badge}>
                        {s.subject_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {strongSubjects.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-success">
                    Strong — 10% of test
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {strongSubjects.map((s) => (
                      <Badge key={s.subject_name} variant="outline" className={strengthStyle.strong.badge}>
                        {s.subject_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileQuestion className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Number of Questions</CardTitle>
          </div>
          <CardDescription>More questions = more comprehensive practice.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {QUESTION_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setQuestionCount(n)}
                className={`flex h-16 w-24 flex-col items-center justify-center rounded-lg border text-sm font-medium transition-all ${
                  questionCount === n
                    ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                    : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <span className="text-xl font-bold">{n}</span>
                <span className="text-xs text-muted-foreground">questions</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Time Limit</CardTitle>
          </div>
          <CardDescription>Choose how long you want to spend on this test.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {DURATION_OPTIONS.map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setDurationMinutes(mins)}
                className={`flex h-16 w-24 flex-col items-center justify-center rounded-lg border text-sm font-medium transition-all ${
                  durationMinutes === mins
                    ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                    : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <span className="text-xl font-bold">{mins}</span>
                <span className="text-xs text-muted-foreground">minutes</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Generate button */}
      <div className="flex flex-col gap-3">
        <Button
          size="lg"
          className="w-full gap-2 text-base font-semibold"
          disabled={generating || !hasProfile || !hasStrengths}
          onClick={handleGenerate}
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              AI is preparing your test based on your weak areas…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate My Personalized Test
            </>
          )}
        </Button>
        {generating && (
          <p className="text-center text-xs text-muted-foreground">
            This may take up to 30 seconds. Please do not close this page.
          </p>
        )}
        {(!hasProfile || !hasStrengths) && (
          <p className="text-center text-xs text-destructive">
            Complete your profile and subject strength mapping before generating a test.
          </p>
        )}
      </div>
    </div>
  )
}
