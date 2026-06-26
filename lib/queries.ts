"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import type {
  Category,
  Subcategory,
  MockTest,
  TestAttempt,
  LeaderboardRow,
  Profile,
} from "@/lib/types"

export function useProfile() {
  const supabase = createClient()
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<Profile | null> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return null
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      if (error) throw error
      return data as Profile
    },
  })
}

export function useCategoriesWithTests() {
  const supabase = createClient()
  return useQuery({
    queryKey: ["categories-with-tests"],
    queryFn: async () => {
      // Single optimized query with nested selects
      const { data, error } = await supabase
        .from("mock_tests")
        .select("*, subcategories(*, categories(*))")
        .eq("is_published", true)
        .order("created_at")
      
      if (error) throw error

      // Reshape the result to match expected return type
      const categories = new Map<string, Category>()
      const subcategories = new Map<string, Subcategory>()
      const tests: MockTest[] = []

      for (const test of data || []) {
        tests.push({
          id: test.id,
          title: test.title,
          is_published: test.is_published,
          created_at: test.created_at,
          duration_minutes: test.duration_minutes,
          per_question_seconds: test.per_question_seconds,
          timer_mode: test.timer_mode,
          instructions: test.instructions,
          total_questions: test.total_questions,
          passing_percentage: test.passing_percentage,
          show_answers_after: test.show_answers_after,
          subcategory_id: test.subcategory_id,
        } as unknown as MockTest)

        if (test.subcategories) {
          for (const sub of Array.isArray(test.subcategories) ? test.subcategories : [test.subcategories]) {
            subcategories.set(sub.id, sub as Subcategory)
            if (sub.categories) {
              const cat = Array.isArray(sub.categories) ? sub.categories[0] : sub.categories
              if (cat) categories.set(cat.id, cat as Category)
            }
          }
        }
      }

      return {
        categories: Array.from(categories.values()).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
        subcategories: Array.from(subcategories.values()).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
        tests,
      } as {
        categories: Category[]
        subcategories: Subcategory[]
        tests: MockTest[]
      }
    },
  })
}

export function useMyAttempts() {
  const supabase = createClient()
  return useQuery({
    queryKey: ["my-attempts"],
    queryFn: async (): Promise<(TestAttempt & { mock_tests: MockTest | null })[]> => {
      const { data, error } = await supabase
        .from("test_attempts")
        .select("*, mock_tests(*)")
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
      if (error) throw error
      return data as (TestAttempt & { mock_tests: MockTest | null })[]
    },
  })
}

export function useLeaderboard(mockTestId: string | null) {
  const supabase = createClient()
  return useQuery({
    queryKey: ["leaderboard", mockTestId],
    enabled: !!mockTestId,
    queryFn: async (): Promise<{ rows: LeaderboardRow[]; average: number }> => {
      const [{ data: rows, error }, { data: avg, error: avgErr }] = await Promise.all([
        supabase.rpc("get_leaderboard", { p_mock_test_id: mockTestId }),
        supabase.rpc("get_test_average", { p_mock_test_id: mockTestId }),
      ])
      if (error) throw error
      if (avgErr) throw avgErr
      return { rows: (rows ?? []) as LeaderboardRow[], average: Number(avg ?? 0) }
    },
  })
}
