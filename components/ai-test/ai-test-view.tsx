"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BrainCircuit, Clock, FileQuestion, Sparkles, ChevronRight, AlertCircle, UserCog } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { generateAiTest } from "@/app/actions/generate-ai-test"
import { useMyAiTests, useProfile } from "@/lib/queries"
import { toast } from "sonner"
import type { AiMockTest } from "@/app/actions/generate-ai-test"

function TestHistoryCard({ test }: { test: AiMockTest }) {
  const date = new Date(test.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
  return (
    <Link href={`/ai-test/${test.id}`}>
      <Card className="group cursor-pointer transition-colors hover:border-primary/40 hover:bg-accent/30">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <BrainCircuit className="size-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{test.title}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileQuestion className="size-3" />
                {test.total_questions} questions
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {test.duration_minutes} min
              </span>
              <span>{date}</span>
            </div>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </CardContent>
      </Card>
    </Link>
  )
}

function TestHistorySkeleton() {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <Skeleton className="size-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </CardContent>
    </Card>
  )
}

export function AiTestView() {
  const router = useRouter()
  const { data: profile, isLoading: profileLoading } = useProfile()
  const { data: aiTests, isLoading: testsLoading, refetch } = useMyAiTests()
  const [generating, setGenerating] = useState(false)

  const hasExamGoal = !!profile?.exam_goal

  async function handleGenerate() {
    setGenerating(true)
    try {
      const result = await generateAiTest()
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(`${result.totalQuestions} questions generated for ${profile?.exam_goal}!`)
      await refetch()
      router.push(`/ai-test/${result.testId}`)
    } catch (err) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <BrainCircuit className="size-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Test for Me</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate a personalized mock test built around your target exam, attempt stage, and syllabus — instantly.
        </p>
      </div>

      {/* Generate Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          {profileLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-10 w-40 mt-4" />
            </div>
          ) : hasExamGoal ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Ready to generate</span>
                <Badge variant="secondary" className="text-xs">{profile.exam_goal}</Badge>
                {profile.attempt_number && (
                  <Badge variant="outline" className="text-xs">{profile.attempt_number}</Badge>
                )}
                {profile.target_year && (
                  <Badge variant="outline" className="text-xs">Target {profile.target_year}</Badge>
                )}
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                Questions will be distributed across all major subjects for{" "}
                <span className="font-medium text-foreground">{profile.exam_goal}</span> with difficulty
                adjusted to your attempt stage.
              </p>

              <Button
                className="mt-5"
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <span className="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Generating your test...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 size-4" />
                    Generate my test
                  </>
                )}
              </Button>

              {generating && (
                <p className="mt-3 text-xs text-muted-foreground">
                  AI is writing questions subject-by-subject. This takes about 20–40 seconds.
                </p>
              )}
            </>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Complete your profile first</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Set your target exam in your profile so the AI can tailor questions to the right syllabus and difficulty.
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/profile">
                  <UserCog className="mr-2 size-4" />
                  Go to Profile
                </Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Past Tests */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Your AI Tests
        </h2>
        <div className="space-y-2">
          {testsLoading ? (
            Array.from({ length: 3 }).map((_, i) => <TestHistorySkeleton key={i} />)
          ) : !aiTests || aiTests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
                <FileQuestion className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No AI tests generated yet.</p>
                <p className="text-xs text-muted-foreground">
                  Hit &quot;Generate my test&quot; above and get your first personalized test in seconds.
                </p>
              </CardContent>
            </Card>
          ) : (
            aiTests.map((test) => <TestHistoryCard key={test.id} test={test} />)
          )}
        </div>
      </div>
    </div>
  )
}
