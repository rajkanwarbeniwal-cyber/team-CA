"use server"

import { revalidateTag } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { generateMockTestQuestions } from "@/lib/ai-question-generator"

// Map exam goals to their subject syllabus for personalized question generation
const EXAM_SYLLABUS: Record<string, { subjects: string[]; totalQuestions: number; duration: number }> = {
  "UPSC CSE": {
    subjects: ["Indian History", "Indian Polity", "Indian Economy", "Geography", "Environment & Ecology", "Science & Technology", "Current Affairs"],
    totalQuestions: 20,
    duration: 24,
  },
  "SSC CGL": {
    subjects: ["General Intelligence & Reasoning", "General Awareness", "Quantitative Aptitude", "English Comprehension"],
    totalQuestions: 20,
    duration: 20,
  },
  "IBPS PO": {
    subjects: ["Reasoning Ability", "Quantitative Aptitude", "English Language", "General Awareness", "Computer Knowledge"],
    totalQuestions: 20,
    duration: 20,
  },
  "SBI PO": {
    subjects: ["Reasoning & Computer Aptitude", "Data Analysis & Interpretation", "General Economy & Banking Awareness", "English Language"],
    totalQuestions: 20,
    duration: 20,
  },
  "RRB NTPC": {
    subjects: ["Mathematics", "General Intelligence & Reasoning", "General Awareness"],
    totalQuestions: 15,
    duration: 18,
  },
  "NDA": {
    subjects: ["Mathematics", "Physics", "Chemistry", "General Knowledge & English"],
    totalQuestions: 20,
    duration: 24,
  },
  "State PCS": {
    subjects: ["Indian History", "Indian Polity", "Geography", "General Science", "Current Affairs"],
    totalQuestions: 20,
    duration: 24,
  },
  "JEE": {
    subjects: ["Physics", "Chemistry", "Mathematics"],
    totalQuestions: 18,
    duration: 36,
  },
  "NEET": {
    subjects: ["Physics", "Chemistry", "Biology – Botany", "Biology – Zoology"],
    totalQuestions: 20,
    duration: 24,
  },
}

const DEFAULT_SYLLABUS = {
  subjects: ["General Knowledge", "Reasoning", "Current Affairs", "Mathematics"],
  totalQuestions: 15,
  duration: 18,
}

export type GenerateAiTestResult =
  | { success: true; testId: string; title: string; totalQuestions: number }
  | { success: false; error: string }

export async function generateAiTest(): Promise<GenerateAiTestResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Not authenticated" }

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, exam_goal, target_year, attempt_number, target_state")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    return { success: false, error: "Could not load your profile. Please complete your profile first." }
  }

  if (!profile.exam_goal) {
    return { success: false, error: "Please set your target exam in your profile before generating a test." }
  }

  const syllabus = EXAM_SYLLABUS[profile.exam_goal] ?? DEFAULT_SYLLABUS
  const { subjects, totalQuestions, duration } = syllabus

  // Determine difficulty based on attempt number
  const difficulty: "easy" | "medium" | "hard" =
    profile.attempt_number === "1st attempt" ? "easy"
    : profile.attempt_number === "2nd attempt" || profile.attempt_number === "3rd attempt" ? "medium"
    : "hard"

  // Distribute questions across subjects
  const questionsPerSubject = Math.floor(totalQuestions / subjects.length)
  const remainder = totalQuestions % subjects.length

  const title = `${profile.exam_goal} – AI Test · ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`

  // Create the test record first
  const { data: testRecord, error: testInsertError } = await supabase
    .from("ai_mock_tests")
    .insert({
      user_id: user.id,
      title,
      is_ai_generated: true,
      exam_goal: profile.exam_goal,
      total_questions: totalQuestions,
      duration_minutes: duration,
    })
    .select("id")
    .single()

  if (testInsertError || !testRecord) {
    console.error("[v0] AI test insert error:", testInsertError)
    return { success: false, error: "Failed to create test. Please try again." }
  }

  const testId = testRecord.id

  // Generate questions for each subject in parallel
  try {
    const subjectResults = await Promise.all(
      subjects.map(async (subject, subjectIdx) => {
        const count = questionsPerSubject + (subjectIdx < remainder ? 1 : 0)
        if (count === 0) return []

        const generated = await generateMockTestQuestions(
          subject,
          difficulty,
          count,
          profile.exam_goal!,
        )

        return generated.questions.map((q) => ({
          subject,
          question_text: q.question_text,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          correct_option: q.correct_option,
          explanation: q.explanation,
          difficulty,
        }))
      }),
    )

    // Flatten and assign sort_order
    const allQuestions = subjectResults
      .flat()
      .map((q, idx) => ({ ...q, test_id: testId, sort_order: idx + 1 }))

    const { error: questionsInsertError } = await supabase
      .from("ai_test_questions")
      .insert(allQuestions)

    if (questionsInsertError) {
      console.error("[v0] AI questions insert error:", questionsInsertError)
      // Clean up the test record
      await supabase.from("ai_mock_tests").delete().eq("id", testId)
      return { success: false, error: "Failed to save questions. Please try again." }
    }

    revalidateTag(`ai-tests-${user.id}`)

    return {
      success: true,
      testId,
      title,
      totalQuestions: allQuestions.length,
    }
  } catch (error) {
    console.error("[v0] AI generation failed:", error)
    // Clean up the test record on failure
    await supabase.from("ai_mock_tests").delete().eq("id", testId)
    return {
      success: false,
      error: error instanceof Error ? error.message : "AI generation failed. Please try again.",
    }
  }
}

export type AiMockTest = {
  id: string
  title: string
  exam_goal: string
  total_questions: number
  duration_minutes: number
  created_at: string
}

export async function getMyAiTests(): Promise<AiMockTest[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("ai_mock_tests")
    .select("id, title, exam_goal, total_questions, duration_minutes, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    console.error("[v0] getMyAiTests error:", error)
    return []
  }

  return data ?? []
}

export type AiTestQuestion = {
  id: string
  test_id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: string
  explanation: string
  difficulty: string
  subject: string
  sort_order: number
}

export async function getAiTestWithQuestions(testId: string): Promise<{
  test: AiMockTest | null
  questions: AiTestQuestion[]
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { test: null, questions: [] }

  const [{ data: test }, { data: questions }] = await Promise.all([
    supabase
      .from("ai_mock_tests")
      .select("id, title, exam_goal, total_questions, duration_minutes, created_at")
      .eq("id", testId)
      .eq("user_id", user.id) // Security: only own tests
      .single(),
    supabase
      .from("ai_test_questions")
      .select("*")
      .eq("test_id", testId)
      .order("sort_order"),
  ])

  return {
    test: test ?? null,
    questions: (questions ?? []) as AiTestQuestion[],
  }
}
