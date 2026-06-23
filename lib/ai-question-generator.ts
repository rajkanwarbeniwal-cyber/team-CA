import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

// Schema for AI-generated questions
const QuestionSchema = z.object({
  question_text: z.string().describe("The MCQ question text"),
  option_a: z.string().describe("Option A"),
  option_b: z.string().describe("Option B"),
  option_c: z.string().describe("Option C"),
  option_d: z.string().describe("Option D"),
  correct_option: z.enum(["A", "B", "C", "D"]).describe("The correct answer"),
  marks: z.number().min(1).max(5).describe("Marks for this question"),
  negative_marking: z.number().min(0).max(2).describe("Negative marking for wrong answer"),
  explanation: z.string().describe("Detailed explanation for the correct answer"),
})

const GeneratedQuestionsSchema = z.object({
  questions: z.array(QuestionSchema),
})

export type GeneratedQuestion = z.infer<typeof QuestionSchema>
export type GeneratedQuestions = z.infer<typeof GeneratedQuestionsSchema>

export async function generateMockTestQuestions(
  topic: string,
  difficulty: "easy" | "medium" | "hard",
  questionCount: number = 5,
  examType: string = "UPSC",
): Promise<GeneratedQuestions> {
  const prompt = `
You are an expert exam question creator for ${examType} exams. Generate ${questionCount} high-quality multiple choice questions on the topic: "${topic}".

Difficulty Level: ${difficulty}

Requirements:
- Each question should be clear and unambiguous
- All options should be plausible but only ONE correct
- Include detailed explanations for each answer
- Marks should be appropriate for the difficulty level
- Negative marking should be realistic (typically 1/3 or 1/4 of marks)

Generate exactly ${questionCount} questions in the specified JSON format.
  `

  try {
    const result = await generateObject({
      model: openai("gpt-4-mini"),
      schema: GeneratedQuestionsSchema,
      prompt,
      temperature: 0.7,
    })

    return result.object
  } catch (error) {
    console.error("[v0] AI Generation Error:", error)
    throw new Error(`Failed to generate questions: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function generateQuestionExplanation(
  question: string,
  options: string[],
  correctOption: string,
): Promise<string> {
  const prompt = `
You are an expert tutor. Provide a clear, concise explanation for why the answer to this question is correct.

Question: ${question}
Options: ${options.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`).join("\n")}
Correct Answer: ${correctOption}

Provide a 2-3 sentence explanation that helps students understand the concept.
  `

  try {
    const result = await generateObject({
      model: openai("gpt-4-mini"),
      schema: z.object({
        explanation: z.string(),
      }),
      prompt,
    })

    return result.object.explanation
  } catch (error) {
    console.error("[v0] Explanation Generation Error:", error)
    return "Explanation could not be generated."
  }
}

export async function generateTestCurriculum(
  examType: string,
  syllabus: string[],
): Promise<{ topics: string[]; distribution: Record<string, number> }> {
  const prompt = `
You are a curriculum expert for ${examType} exams. 

Given the syllabus topics: ${syllabus.join(", ")}

Create a balanced mock test curriculum with question distribution across topics. Ensure coverage is proportional to exam importance.

Return a JSON object with:
- topics: array of specific sub-topics to cover
- distribution: object showing how many questions per topic (total should be reasonable for a mock test, e.g., 50-100 questions)
  `

  try {
    const result = await generateObject({
      model: openai("gpt-4-mini"),
      schema: z.object({
        topics: z.array(z.string()),
        distribution: z.record(z.number()),
      }),
      prompt,
    })

    return result.object
  } catch (error) {
    console.error("[v0] Curriculum Generation Error:", error)
    throw new Error("Failed to generate curriculum")
  }
}
