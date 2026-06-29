"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export interface UpdateProfilePayload {
  full_name: string
  exam_goal: string
  target_year: number | null
  attempt_number: string
  target_state: string
}

export async function updateProfile(payload: UpdateProfilePayload) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  // Validate required fields
  if (!payload.full_name?.trim()) {
    return { success: false, error: "Full name is required" }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: payload.full_name.trim(),
      exam_goal: payload.exam_goal || null,
      target_year: payload.target_year || null,
      attempt_number: payload.attempt_number || null,
      target_state: payload.target_state || null,
    })
    .eq("id", user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/profile")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const file = formData.get("avatar") as File
  if (!file || file.size === 0) {
    return { success: false, error: "No file provided" }
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return { success: false, error: "Only image files are allowed" }
  }

  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    return { success: false, error: "Image must be smaller than 2MB" }
  }

  const fileExt = file.name.split(".").pop()
  const filePath = `avatars/${user.id}.${fileExt}`
  const arrayBuffer = await file.arrayBuffer()

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("user-content")
    .upload(filePath, arrayBuffer, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    return { success: false, error: uploadError.message }
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from("user-content")
    .getPublicUrl(filePath)

  // Update profile avatar_url
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  revalidatePath("/profile")
  return { success: true, avatarUrl: publicUrl }
}
