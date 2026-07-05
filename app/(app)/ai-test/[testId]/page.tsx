import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AiExamRunner } from "@/components/ai-test/ai-exam-runner"
import { getAiTestWithQuestions } from "@/app/actions/generate-ai-test"

export default async function AiTestRunPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { test, questions } = await getAiTestWithQuestions(testId)

  if (!test) notFound()
  if (questions.length === 0) notFound()

  return <AiExamRunner test={test} questions={questions} />
}
