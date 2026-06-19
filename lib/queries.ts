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
      const { data: categories, error: catErr } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order")
      if (catErr) throw catErr

      const { data: subcategories, error: subErr } = await supabase
        .from("subcategories")
        .select("*")
        .order("sort_order")
      if (subErr) throw subErr

      const { data: tests, error: testErr } = await supabase
        .from("mock_tests")
        .select("*")
        .eq("is_published", true)
        .order("created_at")
      if (testErr) throw testErr

      return { categories, subcategories, tests } as {
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
