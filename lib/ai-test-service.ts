import Anthropic from "@anthropic-ai/sdk"

export interface Question {
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: "A" | "B" | "C" | "D"
  explanation: string
  subject: string
  difficulty: "easy" | "medium" | "hard"
}

export interface SubjectDistribution {
  subject: string
  level: "weak" | "average" | "strong"
  count: number
}

export interface GenerateQuestionsRequest {
  examGoal: string
  questionCount: number
  subjectDistribution: SubjectDistribution[]
}

export interface AITestServiceError {
  code: "MISSING_API_KEY" | "INVALID_RESPONSE" | "PARSE_ERROR" | "API_ERROR" | "EMPTY_RESPONSE"
  message: string
  originalError?: Error
}

class AITestService {
  private anthropic: Anthropic
  private static readonly MODEL = "claude-3-5-sonnet-20241022"
  private static readonly MAX_TOKENS = 16000

  constructor(apiKey?: string) {
    const key = apiKey || process.env.ANTHROPIC_API_KEY
    if (!key) {
      throw this.createError(
        "MISSING_API_KEY",
        "ANTHROPIC_API_KEY environment variable is not set"
      )
    }
    this.anthropic = new Anthropic({ apiKey: key })
  }

  /**
   * Generate mock test questions using Claude 3.5 Sonnet
   * @param request - The request parameters
   * @returns An array of generated questions
   * @throws AITestServiceError if generation fails
   */
  async generateQuestions(request: GenerateQuestionsRequest): Promise<Question[]> {
    const prompt = this.buildPrompt(request)

    try {
      const message = await this.anthropic.messages.create({
        model: AITestService.MODEL,
        max_tokens: AITestService.MAX_TOKENS,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      })

      const responseText = this.extractTextFromMessage(message)
      const questions = this.parseQuestionsJSON(responseText, request.questionCount)

      return questions
    } catch (error) {
      if (error instanceof Error && "error" in error) {
        // This is likely an Anthropic API error
        const apiError = error as { error?: { message?: string } }
        throw this.createError(
          "API_ERROR",
          `Anthropic API error: ${apiError.error?.message || error.message}`,
          error
        )
      }

      // Re-throw if it's already our custom error
      if (this.isAITestServiceError(error)) {
        throw error
      }

      throw this.createError("API_ERROR", "Failed to generate questions from Anthropic", error)
    }
  }

  /**
   * Build the prompt for Claude
   */
  private buildPrompt(request: GenerateQuestionsRequest): string {
    const breakdownLines = request.subjectDistribution.map(
      (s) => `- ${s.subject} (${s.level}): ${s.count} questions`
    )

    return `You are an expert ${request.examGoal} exam question creator for Indian competitive exams.

Generate exactly ${request.questionCount} multiple-choice questions for a ${request.examGoal} aspirant based on the following subject-wise distribution:

${breakdownLines.join("\n")}

Rules:
- Questions marked for "weak" subjects should be at foundational/easy level to build understanding
- Questions marked for "average" subjects should be at medium difficulty
- Questions marked for "strong" subjects should be at advanced/hard level
- Each question must have exactly 4 options (A, B, C, D)
- The correct_option field must be exactly one of: "A", "B", "C", or "D"
- The difficulty field must be exactly one of: "easy", "medium", or "hard"
- Explanations should be concise and educational (2-3 sentences)
- Questions must be relevant to the actual ${request.examGoal} syllabus
- Do NOT repeat questions

Return ONLY a valid JSON array with exactly ${request.questionCount} objects. Each object must have these exact fields:
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
  }

  /**
   * Extract text content from Anthropic message response
   */
  private extractTextFromMessage(message: Anthropic.Message): string {
    if (!message.content || message.content.length === 0) {
      throw this.createError("INVALID_RESPONSE", "Anthropic returned empty response content")
    }

    const textContent = message.content.find((block) => block.type === "text")
    if (!textContent || textContent.type !== "text") {
      throw this.createError(
        "INVALID_RESPONSE",
        "Anthropic response does not contain text content"
      )
    }

    return textContent.text
  }

  /**
   * Parse and validate the JSON response from Claude
   */
  private parseQuestionsJSON(jsonString: string, expectedCount: number): Question[] {
    const cleanedJSON = this.cleanJSON(jsonString)

    let questions: unknown
    try {
      questions = JSON.parse(cleanedJSON)
    } catch (error) {
      throw this.createError(
        "PARSE_ERROR",
        `Failed to parse JSON response: ${error instanceof Error ? error.message : "Unknown error"}`,
        error instanceof Error ? error : new Error("Unknown parsing error")
      )
    }

    if (!Array.isArray(questions)) {
      throw this.createError(
        "INVALID_RESPONSE",
        "Parsed response is not an array of questions"
      )
    }

    if (questions.length === 0) {
      throw this.createError("EMPTY_RESPONSE", "AI returned no questions")
    }

    // Validate and cast each question
    const validatedQuestions = questions.map((q, index) => this.validateQuestion(q, index))

    return validatedQuestions
  }

  /**
   * Validate a single question object
   */
  private validateQuestion(q: unknown, index: number): Question {
    if (!q || typeof q !== "object") {
      throw this.createError(
        "INVALID_RESPONSE",
        `Question at index ${index} is not a valid object`
      )
    }

    const question = q as Record<string, unknown>

    // Validate required string fields
    const stringFields = ["question_text", "option_a", "option_b", "option_c", "explanation"]
    for (const field of stringFields) {
      if (typeof question[field] !== "string") {
        throw this.createError(
          "INVALID_RESPONSE",
          `Question ${index}: '${field}' must be a non-empty string`
        )
      }
    }

    // Validate options D
    if (typeof question.option_d !== "string") {
      throw this.createError(
        "INVALID_RESPONSE",
        `Question ${index}: 'option_d' must be a non-empty string`
      )
    }

    // Validate correct_option
    const correctOption = question.correct_option
    if (!["A", "B", "C", "D"].includes(correctOption as string)) {
      throw this.createError(
        "INVALID_RESPONSE",
        `Question ${index}: 'correct_option' must be one of A, B, C, D (got ${correctOption})`
      )
    }

    // Validate difficulty
    const difficulty = question.difficulty
    if (!["easy", "medium", "hard"].includes(difficulty as string)) {
      throw this.createError(
        "INVALID_RESPONSE",
        `Question ${index}: 'difficulty' must be one of easy, medium, hard (got ${difficulty})`
      )
    }

    // Validate subject
    if (typeof question.subject !== "string") {
      throw this.createError("INVALID_RESPONSE", `Question ${index}: 'subject' must be a string`)
    }

    return {
      question_text: question.question_text as string,
      option_a: question.option_a as string,
      option_b: question.option_b as string,
      option_c: question.option_c as string,
      option_d: question.option_d as string,
      correct_option: correctOption as "A" | "B" | "C" | "D",
      explanation: question.explanation as string,
      subject: question.subject as string,
      difficulty: difficulty as "easy" | "medium" | "hard",
    }
  }

  /**
   * Clean JSON string by removing markdown fences and whitespace
   */
  private cleanJSON(jsonString: string): string {
    return jsonString
      .replace(/^```(?:json)?\s*/i, "") // Remove opening markdown fence
      .replace(/```\s*$/i, "") // Remove closing markdown fence
      .trim()
  }

  /**
   * Create an error object
   */
  private createError(
    code: AITestServiceError["code"],
    message: string,
    originalError?: Error
  ): AITestServiceError {
    return {
      code,
      message,
      originalError,
    }
  }

  /**
   * Type guard for AITestServiceError
   */
  private isAITestServiceError(error: unknown): error is AITestServiceError {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      "message" in error &&
      typeof (error as Record<string, unknown>).code === "string"
    )
  }
}

/**
 * Create a singleton instance of AITestService
 */
let serviceInstance: AITestService | null = null

export function getAITestService(): AITestService {
  if (!serviceInstance) {
    serviceInstance = new AITestService()
  }
  return serviceInstance
}

/**
 * For testing: allow creating a new instance with custom API key
 */
export function createAITestService(apiKey: string): AITestService {
  return new AITestService(apiKey)
}

export default AITestService
