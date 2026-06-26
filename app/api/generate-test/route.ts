import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@/lib/supabase/server"

const SUBJECT_WEIGHTS = { weak: 0.6, average: 0.3, strong: 0.1 } as const

interface RawQuestion {
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: string
  explanation: string
  subject: string
  difficulty: string
}

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
    const total = strengthsToDistribution(strengths, questionCount)

    // Build subject breakdown string for prompt
    const breakdownLines = total.map(
      (s) => `- ${s.subject} (${s.level}): ${s.count} questions`
    )

    const prompt = `You are an expert ${profile.exam_goal} exam question creator for Indian competitive exams.

Generate exactly ${questionCount} multiple-choice questions for a ${profile.exam_goal} aspirant based on the following subject-wise distribution:

${breakdownLines.join("\n")}

Rules:
- Questions marked for "weak" subjects should be at foundational/easy level to build understanding
- Questions marked for "average" subjects should be at medium difficulty
- Questions marked for "strong" subjects should be at advanced/hard level
- Each question must have exactly 4 options (A, B, C, D)
- The correct_option field must be exactly one of: "A", "B", "C", or "D"
- The difficulty field must be exactly one of: "easy", "medium", or "hard"
- Explanations should be concise and educational (2-3 sentences)
- Questions must be relevant to the actual ${profile.exam_goal} syllabus
- Do NOT repeat questions

Return ONLY a valid JSON array with exactly ${questionCount} objects. Each object must have these exact fields:
{
  "question_text": string,
  "option_a": string,
  "option_b": string,
  "option_c": string,
  "option_d": string,
  "correct_option": "A" | "B" | "C" | "D",
  "explanation": string,
  "subject": string,
  "difficulty": "easy" | "medium" | "hard"
}

Return only the JSON array, no markdown, no explanation text.`

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 16000,
      messages: [{ role: "user", content: prompt }],
    })

    const rawText = message.content[0].type === "text" ? message.content[0].text : ""

    let questions: RawQuestion[]
    try {
      // Strip any accidental markdown fences
      const cleaned = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim()
      questions = JSON.parse(cleaned)
    } catch {
      return NextResponse.json(
        { error: "AI returned malformed JSON. Please try again." },
        { status: 500 }
      )
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "AI returned no questions. Please try again." },
        { status: 500 }
      )
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
