import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AIExamRunner } from "@/components/exam/ai-exam-runner"

export default async function AIExamPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: test } = await supabase
    .from("ai_mock_tests")
    .select("*")
    .eq("id", testId)
    .eq("user_id", user.id)
    .single()

  if (!test) notFound()

  const { data: questions } = await supabase
    .from("ai_test_questions")
    .select("*")
    .eq("test_id", testId)
    .order("sort_order", { ascending: true })

  if (!questions || questions.length === 0) notFound()

  return <AIExamRunner test={test} questions={questions} />
}
