import { createClient } from "@/lib/supabase/client"
import type { DailyQuiz, DailyQuizAttempt, UserStats, ExamQuestion } from "@/lib/types"

export async function getTodayQuiz() {
  const supabase = createClient()
  const { data } = await supabase
    .from("daily_quizzes")
    .select("*")
    .eq("quiz_date", new Date().toISOString().split("T")[0])
    .single()

  return data as DailyQuiz | null
}

export async function getQuizQuestions(quizId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from("daily_quiz_questions")
    .select("question_id")
    .eq("daily_quiz_id", quizId)
    .order("sort_order")

  if (!data) return []

  const questionIds = data.map((d: any) => d.question_id)
  const { data: questions } = await supabase
    .from("questions")
    .select("id, mock_test_id, question_text, option_a, option_b, option_c, option_d, marks, negative_marks, sort_order")
    .in("id", questionIds)

  return questions as ExamQuestion[]
}

export async function getUserStats() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", user.id)
    .single()

  return data as UserStats | null
}

export async function getTodayAttempt() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = new Date().toISOString().split("T")[0]
  const { data: quiz } = await supabase
    .from("daily_quizzes")
    .select("id")
    .eq("quiz_date", today)
    .single()

  if (!quiz) return null

  const { data: attempt } = await supabase
    .from("daily_quiz_attempts")
    .select("*")
    .eq("user_id", user.id)
    .eq("daily_quiz_id", quiz.id)
    .single()

  return attempt as DailyQuizAttempt | null
}

export async function createDailyQuizAttempt(dailyQuizId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data: attempt, error } = await supabase
    .from("daily_quiz_attempts")
    .insert({
      user_id: user.id,
      daily_quiz_id: dailyQuizId,
    })
    .select()
    .single()

  if (error) throw error
  return attempt as DailyQuizAttempt
}

export async function completeDailyQuizAttempt(
  attemptId: string,
  score: number,
  totalMarks: number,
  correctCount: number,
  wrongCount: number,
  skippedCount: number,
  timeTaken: number
) {
  const supabase = createClient()

  const { data: attempt, error } = await supabase
    .from("daily_quiz_attempts")
    .update({
      score,
      total_marks: totalMarks,
      correct_count: correctCount,
      wrong_count: wrongCount,
      skipped_count: skippedCount,
      time_taken_seconds: timeTaken,
      completed_at: new Date().toISOString(),
    })
    .eq("id", attemptId)
    .select()
    .single()

  if (error) throw error

  // Update user stats and check for achievements
  await updateUserStatsAfterQuiz(score, totalMarks)

  return attempt as DailyQuizAttempt
}

async function updateUserStatsAfterQuiz(score: number, totalMarks: number) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const today = new Date().toISOString().split("T")[0]
  const { data: existing } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!existing) {
    // Create new stats
    await supabase.from("user_stats").insert({
      user_id: user.id,
      current_streak: 1,
      longest_streak: 1,
      points: Math.round((score / totalMarks) * 100),
      total_quizzes_attempted: 1,
      last_quiz_date: today,
    })
  } else {
    // Update existing stats
    const lastDate = existing.last_quiz_date ? new Date(existing.last_quiz_date) : null
    const today_d = new Date(today)
    const yesterday = new Date(today_d)
    yesterday.setDate(yesterday.getDate() - 1)

    let newStreak = existing.current_streak
    if (lastDate && lastDate.toISOString().split("T")[0] === yesterday.toISOString().split("T")[0]) {
      newStreak = existing.current_streak + 1
    } else if (!lastDate || lastDate.toISOString().split("T")[0] !== today) {
      newStreak = 1
    }

    const newLongest = Math.max(newStreak, existing.longest_streak)
    const newPoints = existing.points + Math.round((score / totalMarks) * 100)

    await supabase
      .from("user_stats")
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        points: newPoints,
        total_quizzes_attempted: existing.total_quizzes_attempted + 1,
        last_quiz_date: today,
      })
      .eq("user_id", user.id)
  }
}
