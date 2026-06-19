export type Role = "student" | "admin"
export type TimerMode = "total" | "per_question"
export type Difficulty = "easy" | "medium" | "hard"
export type OptionKey = "A" | "B" | "C" | "D"
export type AttemptStatus = "in_progress" | "completed"

export interface Profile {
  id: string
  full_name: string | null
  role: Role
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  sort_order: number
  created_at: string
}

export interface Subcategory {
  id: string
  category_id: string
  name: string
  slug: string
  description: string | null
  sort_order: number
  created_at: string
}

export interface MockTest {
  id: string
  subcategory_id: string
  title: string
  description: string | null
  duration_minutes: number
  timer_mode: TimerMode
  per_question_seconds: number
  difficulty: Difficulty
  is_published: boolean
  created_at: string
}

export interface Question {
  id: string
  mock_test_id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: OptionKey
  explanation: string | null
  marks: number
  negative_marks: number
  sort_order: number
  created_at: string
}

export interface TestAttempt {
  id: string
  user_id: string
  mock_test_id: string
  status: AttemptStatus
  score: number
  total_questions: number
  correct_count: number
  wrong_count: number
  skipped_count: number
  percentage: number
  time_taken_seconds: number
  started_at: string
  completed_at: string | null
}

export interface AttemptAnswer {
  id: string
  attempt_id: string
  question_id: string
  selected_option: OptionKey | null
  is_correct: boolean
  is_bookmarked: boolean
  is_skipped: boolean
  created_at: string
}

export interface LeaderboardRow {
  rank: number
  display_name: string
  percentage: number
  is_current_user: boolean
}

// Composite shapes used across the UI
export interface SubcategoryWithCount extends Subcategory {
  test_count: number
}

export interface CategoryWithSubcategories extends Category {
  subcategories: Subcategory[]
}

export interface MockTestWithMeta extends MockTest {
  question_count: number
  subcategory_name?: string
  category_name?: string
}

// A question as exposed to the client DURING an exam (no correct answer leaked)
export interface ExamQuestion {
  id: string
  mock_test_id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  marks: number
  negative_marks: number
  sort_order: number
}

// A row from the get_attempt_review RPC (full review payload, owner only)
export interface AttemptReviewRow {
  question_id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: OptionKey
  explanation: string | null
  selected_option: OptionKey | null
  is_correct: boolean
  is_bookmarked: boolean
  is_skipped: boolean
  sort_order: number
}

export const OPTION_KEYS: OptionKey[] = ["A", "B", "C", "D"]

export function optionText(q: { option_a: string; option_b: string; option_c: string; option_d: string }, key: OptionKey) {
  return key === "A" ? q.option_a : key === "B" ? q.option_b : key === "C" ? q.option_c : q.option_d
}
