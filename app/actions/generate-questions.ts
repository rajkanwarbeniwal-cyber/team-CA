"use server"

import { z } from "zod"
import { generateMockTestQuestions, type GeneratedQuestion } from "@/lib/ai-question-generator"
import { requireAdmin } from "@/lib/auth-guard"

const GenerateQuestionsSchema = z.object({
  mockTestId: z.string().uuid("Invalid mock test ID"),
  topic: z.string().min(1, "Topic is required").max(100),
  difficulty: z.enum(["easy", "medium", "hard"]),
  questionCount: z.number().int().min(1, "At least 1 question required").max(50, "Maximum 50 questions per request"),
  examType: z.string().min(1).max(50),
})

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
    // Validate input with Zod schema
    const validated = GenerateQuestionsSchema.parse(req)

    // Check admin role using auth-guard helper
    const { supabase } = await requireAdmin()

    // Generate questions using AI
    console.log("[v0] Generating questions for:", validated.topic)
    const generated = await generateMockTestQuestions(
      validated.topic,
      validated.difficulty,
      validated.questionCount,
      validated.examType,
    )

    // Insert questions into database
    const questionsToInsert = generated.questions.map((q: GeneratedQuestion, idx: number) => ({
      mock_test_id: validated.mockTestId,
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
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      const zodError = error as unknown as { issues?: z.ZodIssue[] }
      return {
        success: false,
        message: "Invalid request parameters",
        error: (zodError.issues || []).map((e: z.ZodIssue) => `${e.path.join(".")}: ${e.message}`).join("; "),
      }
    }

    // Handle auth errors
    if (error instanceof Error && error.message.includes("admin")) {
      return {
        success: false,
        message: "Not authorized",
        error: error.message,
      }
    }

    return {
      success: false,
      message: "Error generating questions",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
