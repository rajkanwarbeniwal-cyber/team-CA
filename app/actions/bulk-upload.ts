"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidateTag } from "next/cache"
import * as XLSX from "xlsx"

export interface BulkUploadRow {
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: "A" | "B" | "C" | "D"
  marks?: number
  negative_marks?: number
  explanation?: string
  mock_test_id: string
}

export async function bulkUploadQuestions(fileBuffer: ArrayBuffer, mockTestId: string) {
  const supabase = await createClient()

  // Verify user is authenticated and is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    throw new Error("Only admins can upload questions")
  }

  // Verify mock test exists and is editable
  const { data: mockTest } = await supabase
    .from("mock_tests")
    .select("id")
    .eq("id", mockTestId)
    .single()

  if (!mockTest) {
    throw new Error("Mock test not found")
  }

  try {
    // Parse Excel/CSV file
    const workbook = XLSX.read(fileBuffer, { type: "array" })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    if (!sheet) throw new Error("No data found in spreadsheet")

    const rows = XLSX.utils.sheet_to_json<BulkUploadRow>(sheet)

    if (rows.length === 0) {
      throw new Error("No rows found in spreadsheet")
    }

    // Validate required fields
    const invalidRows = rows.filter(
      (row, idx) =>
        !row.question_text ||
        !row.option_a ||
        !row.option_b ||
        !row.option_c ||
        !row.option_d ||
        !row.correct_option ||
        !["A", "B", "C", "D"].includes(row.correct_option)
    )

    if (invalidRows.length > 0) {
      throw new Error(
        `Invalid data in rows. Ensure all required fields are present and correct_option is A/B/C/D.`
      )
    }

    // Get existing questions count for sort_order
    const { data: existingQuestions, error: countError } = await supabase
      .from("questions")
      .select("sort_order", { count: "exact" })
      .eq("mock_test_id", mockTestId)
      .order("sort_order", { ascending: false })
      .limit(1)

    if (countError) throw new Error(countError.message)

    let nextSortOrder = existingQuestions && existingQuestions.length > 0 
      ? (existingQuestions[0]?.sort_order || 0) + 1 
      : 0

    // Prepare batch insert data
    const questionsToInsert = rows.map((row, idx) => ({
      mock_test_id: mockTestId,
      question_text: row.question_text.trim(),
      option_a: row.option_a.trim(),
      option_b: row.option_b.trim(),
      option_c: row.option_c.trim(),
      option_d: row.option_d.trim(),
      correct_option: row.correct_option.toUpperCase() as "A" | "B" | "C" | "D",
      marks: row.marks ?? 1,
      negative_marks: row.negative_marks ?? 0,
      explanation: row.explanation?.trim() || null,
      sort_order: nextSortOrder + idx,
    }))

    // Batch insert with chunking for large datasets
    const CHUNK_SIZE = 100
    for (let i = 0; i < questionsToInsert.length; i += CHUNK_SIZE) {
      const chunk = questionsToInsert.slice(i, i + CHUNK_SIZE)
      const { error: insertError } = await supabase
        .from("questions")
        .insert(chunk)

      if (insertError) {
        throw new Error(`Error inserting questions: ${insertError.message}`)
      }
    }

    // Update mock_test question_count
    const { error: updateError } = await supabase
      .from("mock_tests")
      .update({ question_count: nextSortOrder + questionsToInsert.length })
      .eq("id", mockTestId)

    if (updateError) {
      throw new Error(`Error updating mock test: ${updateError.message}`)
    }

    revalidateTag(`mock-test-${mockTestId}`, "max")
    revalidateTag("mock-tests", "max")

    return {
      success: true,
      uploadedCount: questionsToInsert.length,
      message: `Successfully uploaded ${questionsToInsert.length} questions`,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error occurred"
    throw new Error(`Bulk upload failed: ${message}`)
  }
}
