import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ExamRunner } from "@/components/exam/exam-runner"

export default async function ExamPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: test } = await supabase.from("mock_tests").select("*").eq("id", testId).single()
  if (!test) notFound()

  return <ExamRunner test={test} />
}
