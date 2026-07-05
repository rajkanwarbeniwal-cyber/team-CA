import { NextRequest, NextResponse } from "next/server"
import { getAITestService } from "@/lib/ai-test-service"
import { createClient } from "@/lib/supabase/server"

const SUBJECT_WEIGHTS = { weak: 0.6, average: 0.3, strong: 0.1 } as const

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { questionCount, durationMinutes } = body as {
      questionCount: number
      durationMinutes: number
    }

    if (![20, 50, 100].includes(questionCount) || ![30, 60, 90].includes(durationMinutes)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 })
    }

    // Fetch user's profile (exam goal)
    const { data: profile } = await supabase
      .from("profiles")
      .select("exam_goal, full_name")
      .eq("id", user.id)
      .single()

    if (!profile?.exam_goal) {
      return NextResponse.json(
        { error: "Please set your exam goal in your profile first." },
        { status: 422 }
      )
    }

    // Fetch subject strengths
    const { data: strengths } = await supabase
      .from("user_subject_strengths")
      .select("subject_name, strength_level")
      .eq("user_id", user.id)
      .eq("exam_goal", profile.exam_goal)

    if (!strengths || strengths.length === 0) {
      return NextResponse.json(
        { error: "Please map your subject strengths in your profile first." },
        { status: 422 }
      )
    }

    // Calculate question distribution
    const subjectDistribution = strengthsToDistribution(
      strengths,
      questionCount
    ) as Array<{ subject: string; level: "weak" | "average" | "strong"; count: number }>

    // Use the AI test service to generate questions
    const aiTestService = getAITestService()

    let questions: Awaited<ReturnType<typeof aiTestService.generateQuestions>>

    try {
      questions = await aiTestService.generateQuestions({
        examGoal: profile.exam_goal,
        questionCount,
        subjectDistribution,
      })
    } catch (error) {
      const errorMessage =
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : "Failed to generate questions. Please try again."

      console.error("[generate-test] AI service error:", error)
      return NextResponse.json({ error: errorMessage }, { status: 500 })
    }

    // Insert the test record
    const testTitle = `AI Test — ${profile.exam_goal} (${questionCount}Q / ${durationMinutes}min)`
    const { data: test, error: testErr } = await supabase
      .from("ai_mock_tests")
      .insert({
        user_id: user.id,
        title: testTitle,
        exam_goal: profile.exam_goal,
        total_questions: questions.length,
        duration_minutes: durationMinutes,
        is_ai_generated: true,
      })
      .select()
      .single()

    if (testErr || !test) {
      return NextResponse.json({ error: "Failed to save test." }, { status: 500 })
    }

    // Insert questions
    const questionsPayload = questions.map((q, i) => ({
      test_id: test.id,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: q.correct_option,
      explanation: q.explanation,
      subject: q.subject,
      difficulty: q.difficulty,
      sort_order: i + 1,
    }))

    const { error: qErr } = await supabase.from("ai_test_questions").insert(questionsPayload)

    if (qErr) {
      // Clean up orphaned test
      await supabase.from("ai_mock_tests").delete().eq("id", test.id)
      return NextResponse.json({ error: "Failed to save questions." }, { status: 500 })
    }

    return NextResponse.json({ testId: test.id })
  } catch (err) {
    console.error("[generate-test] unexpected error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ---- helpers ----

function strengthsToDistribution(
  strengths: { subject_name: string; strength_level: string }[],
  total: number
) {
  // Compute raw weighted counts
  const totalWeight = strengths.reduce(
    (sum, s) => sum + (SUBJECT_WEIGHTS[s.strength_level as keyof typeof SUBJECT_WEIGHTS] ?? 0.1),
    0
  )

  let distribution = strengths.map((s) => {
    const weight = SUBJECT_WEIGHTS[s.strength_level as keyof typeof SUBJECT_WEIGHTS] ?? 0.1
    return {
      subject: s.subject_name,
      level: s.strength_level,
      count: Math.round((weight / totalWeight) * total),
    }
  })

  // Fix rounding drift — adjust the first subject
  const assigned = distribution.reduce((sum, s) => sum + s.count, 0)
  if (distribution.length > 0) {
    distribution[0].count += total - assigned
    if (distribution[0].count < 1) distribution[0].count = 1
  }

  // Ensure every subject gets at least 1 question
  distribution = distribution.map((s) => ({ ...s, count: Math.max(s.count, 1) }))

  return distribution
}
