import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ResultsView } from "@/components/results/results-view"
import type { AttemptReviewRow, LeaderboardRow, MockTest, TestAttempt } from "@/lib/types"

export default async function ResultsPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: attempt } = await supabase
    .from("test_attempts")
    .select("*")
    .eq("id", attemptId)
    .eq("user_id", user.id)
    .single()

  if (!attempt) notFound()

  const [{ data: test }, { data: review }, { data: leaderboard }, { data: average }] = await Promise.all([
    supabase.from("mock_tests").select("*").eq("id", attempt.mock_test_id).single(),
    supabase.rpc("get_attempt_review", { p_attempt_id: attemptId }),
    supabase.rpc("get_leaderboard", { p_mock_test_id: attempt.mock_test_id }),
    supabase.rpc("get_test_average", { p_mock_test_id: attempt.mock_test_id }),
  ])

  return (
    <ResultsView
      attempt={attempt as TestAttempt}
      test={(test as MockTest) ?? null}
      review={(review ?? []) as AttemptReviewRow[]}
      leaderboard={(leaderboard ?? []) as LeaderboardRow[]}
      average={Number(average ?? 0)}
    />
  )
}
