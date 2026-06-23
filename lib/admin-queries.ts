"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import type { Category, Subcategory, MockTest, Question } from "@/lib/types"

// ---------------- Reads ----------------
export function useAdminData() {
  const supabase = createClient()
  return useQuery({
    queryKey: ["admin-data"],
    queryFn: async () => {
      const [cats, subs, tests] = await Promise.all([
        supabase.from("categories").select("*").order("sort_order"),
        supabase.from("subcategories").select("*").order("sort_order"),
        supabase.from("mock_tests").select("*, questions(count)").order("created_at"),
      ])
      if (cats.error) throw cats.error
      if (subs.error) throw subs.error
      if (tests.error) throw tests.error
      return {
        categories: cats.data as Category[],
        subcategories: subs.data as Subcategory[],
        tests: tests.data as (MockTest & { questions: { count: number }[] })[],
      }
    },
  })
}

export function useAdminQuestions(testId: string | null) {
  const supabase = createClient()
  return useQuery({
    queryKey: ["admin-questions", testId],
    enabled: !!testId,
    queryFn: async (): Promise<Question[]> => {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("mock_test_id", testId)
        .order("sort_order")
      if (error) throw error
      return data as Question[]
    },
  })
}

// ---------------- Generic upsert/delete helpers ----------------
function useInvalidate() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: ["admin-data"] })
    qc.invalidateQueries({ queryKey: ["admin-questions"] })
    qc.invalidateQueries({ queryKey: ["categories-with-tests"] })
  }
}

export function useSaveCategory() {
  const supabase = createClient()
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async (payload: Partial<Category> & { name: string; slug: string }) => {
      if (payload.id) {
        const { error } = await supabase.from("categories").update(payload).eq("id", payload.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("categories").insert(payload)
        if (error) throw error
      }
    },
    onSuccess: invalidate,
  })
}

export function useDeleteCategory() {
  const supabase = createClient()
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })
}

export function useSaveSubcategory() {
  const supabase = createClient()
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async (payload: Partial<Subcategory> & { name: string; slug: string; category_id: string }) => {
      if (payload.id) {
        const { error } = await supabase.from("subcategories").update(payload).eq("id", payload.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("subcategories").insert(payload)
        if (error) throw error
      }
    },
    onSuccess: invalidate,
  })
}

export function useDeleteSubcategory() {
  const supabase = createClient()
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("subcategories").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })
}

export function useSaveTest() {
  const supabase = createClient()
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async (payload: Partial<MockTest> & { title: string; subcategory_id: string }) => {
      if (payload.id) {
        const { error } = await supabase.from("mock_tests").update(payload).eq("id", payload.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("mock_tests").insert(payload)
        if (error) throw error
      }
    },
    onSuccess: invalidate,
  })
}

export function useDeleteTest() {
  const supabase = createClient()
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("mock_tests").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })
}

export function useSaveQuestion() {
  const supabase = createClient()
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async (payload: Partial<Question> & { mock_test_id: string; question_text: string }) => {
      if (payload.id) {
        const { error } = await supabase.from("questions").update(payload).eq("id", payload.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("questions").insert(payload)
        if (error) throw error
      }
    },
    onSuccess: invalidate,
  })
}

export function useDeleteQuestion() {
  const supabase = createClient()
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("questions").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })
}
