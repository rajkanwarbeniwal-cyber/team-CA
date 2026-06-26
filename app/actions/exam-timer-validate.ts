"use server"

import { createClient } from "@/lib/supabase/server"

interface TimerValidationResult {
  isValid: boolean
  remainingSeconds: number
  serverTime: number
  adjustedDeadline: number
  isExpired: boolean
}

/**
 * Server-side timer validation to prevent client-side clock manipulation
 * Compares server time with stored start time and validates remaining time
 */
export async function validateExamTimer(
  attemptId: string,
  timerMode: "total" | "per_question",
  totalDurationMinutes: number
): Promise<TimerValidationResult> {
  const supabase = await createClient()

  // Get the test attempt record
  const { data: attempt, error: attemptError } = await supabase
    .from("test_attempts")
    .select("started_at, completed_at, status")
    .eq("id", attemptId)
    .single()

  if (attemptError || !attempt) {
    throw new Error("Exam attempt not found")
  }

  if (attempt.status === "completed" || attempt.completed_at) {
    throw new Error("This exam has already been completed")
  }

  // Get server time
  const serverTime = Date.now()
  const startTime = new Date(attempt.started_at).getTime()

  // Calculate elapsed time in seconds
  const elapsedSeconds = Math.floor((serverTime - startTime) / 1000)
  const totalDurationSeconds = totalDurationMinutes * 60

  // Calculate remaining time
  const remainingSeconds = Math.max(0, totalDurationSeconds - elapsedSeconds)
  const isExpired = remainingSeconds <= 0

  // Adjusted deadline based on server calculation
  const adjustedDeadline = startTime + totalDurationSeconds * 1000

  return {
    isValid: !isExpired,
    remainingSeconds,
    serverTime,
    adjustedDeadline,
    isExpired,
  }
}

/**
 * Get validated remaining seconds for per-question timer
 * Returns time remaining for the current question
 */
export async function validatePerQuestionTimer(
  attemptId: string,
  perQuestionSeconds: number,
  questionStartTime: number // Client-provided time when question was navigated to
): Promise<{
  remainingSeconds: number
  isExpired: boolean
  serverTime: number
}> {
  // Validate that the question start time is reasonable (within last hour)
  const serverTime = Date.now()
  const timeSinceQuestionStart = Math.floor((serverTime - questionStartTime) / 1000)

  if (timeSinceQuestionStart < 0 || timeSinceQuestionStart > 3600) {
    throw new Error("Invalid question start time")
  }

  const remainingSeconds = Math.max(0, perQuestionSeconds - timeSinceQuestionStart)
  const isExpired = remainingSeconds <= 0

  return {
    remainingSeconds,
    isExpired,
    serverTime,
  }
}

/**
 * Validate answer submission to ensure it's within time limits
 * Call this before saving an answer to the database
 */
export async function validateAnswerSubmission(
  attemptId: string,
  totalDurationMinutes: number,
  timerMode: "total" | "per_question"
): Promise<{ isAllowed: boolean; reason?: string }> {
  try {
    const validation = await validateExamTimer(attemptId, timerMode, totalDurationMinutes)

    if (validation.isExpired) {
      return {
        isAllowed: false,
        reason: "Time limit exceeded. Your exam has ended.",
      }
    }

    return { isAllowed: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Timer validation failed"
    return {
      isAllowed: false,
      reason: message,
    }
  }
}
