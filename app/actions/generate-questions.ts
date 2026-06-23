"use server"

import { generateMockTestQuestions, type GeneratedQuestion } from "@/lib/ai-question-generator"
import { createClient } from "@/lib/supabase/server"

export interface GenerateQuestionsRequest {
  mockTestId: string
  topic: string
  difficulty: "easy" | "medium" | "hard"
  questionCount: number
  examType: string
}

export interface GenerateQuestionsResponse {
  success: boolean
  message: string
  questionsCreated?: number
  questions?: GeneratedQuestion[]
  error?: string
}

export async function generateQuestionsAction(
  req: GenerateQuestionsRequest,
): Promise<GenerateQuestionsResponse> {
  try {
    // Check admin role
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: "Not authenticated", error: "User not found" }
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return { success: false, message: "Not authorized", error: "Only admins can generate questions" }
    }

    // Generate questions using AI
    console.log("[v0] Generating questions for:", req.topic)
    const generated = await generateMockTestQuestions(
      req.topic,
      req.difficulty,
      req.questionCount,
      req.examType,
    )

    // Insert questions into database
    const questionsToInsert = generated.questions.map((q: GeneratedQuestion, idx: number) => ({
      mock_test_id: req.mockTestId,
      question_text: q.question_text,
      options: {
        A: q.option_a,
        B: q.option_b,
        C: q.option_c,
        D: q.option_d,
      },
      correct_option: q.correct_option,
      marks: q.marks,
      negative_marking: q.negative_marking,
      explanation: q.explanation,
      sort_order: idx + 1,
    }))

    const { data: inserted, error: insertError } = await supabase
      .from("questions")
      .insert(questionsToInsert)
      .select()

    if (insertError) {
      console.error("[v0] Insert error:", insertError)
      return { success: false, message: "Failed to save questions", error: insertError.message }
    }

    console.log("[v0] Successfully created", inserted?.length || 0, "questions")

    return {
      success: true,
      message: `Successfully generated and saved ${inserted?.length || 0} questions`,
      questionsCreated: inserted?.length || 0,
      questions: generated.questions,
    }
  } catch (error) {
    console.error("[v0] Generation action error:", error)
    return {
      success: false,
      message: "Error generating questions",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
