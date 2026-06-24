"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidateTag } from "next/cache"

export async function addApiKey(provider: string, keyName: string, apiKey: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    throw new Error("Only admins can manage API keys")
  }

  // Simple encryption (in production, use proper encryption)
  const encrypted = Buffer.from(apiKey).toString("base64")

  // Insert API key
  const { error } = await supabase
    .from("api_keys")
    .insert({
      provider,
      key_name: keyName,
      encrypted_value: encrypted,
      created_by: user.id,
    })

  if (error) throw new Error(error.message)

  revalidateTag("api-keys", "max")
  return { success: true }
}

export async function updateApiKey(id: number, apiKey: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    throw new Error("Only admins can manage API keys")
  }

  const encrypted = Buffer.from(apiKey).toString("base64")

  const { error } = await supabase
    .from("api_keys")
    .update({ encrypted_value: encrypted })
    .eq("id", id)

  if (error) throw new Error(error.message)

  revalidateTag("api-keys", "max")
  return { success: true }
}

export async function deleteApiKey(id: number) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    throw new Error("Only admins can manage API keys")
  }

  const { error } = await supabase
    .from("api_keys")
    .delete()
    .eq("id", id)

  if (error) throw new Error(error.message)

  revalidateTag("api-keys", "max")
  return { success: true }
}

export async function getApiKey(provider: string, keyName: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Get the API key (for internal use only)
  const { data } = await supabase
    .from("api_keys")
    .select("encrypted_value")
    .eq("provider", provider)
    .eq("key_name", keyName)
    .eq("is_active", true)
    .single()

  if (!data) return null

  // Decrypt
  const decrypted = Buffer.from(data.encrypted_value, "base64").toString()
  return decrypted
}

export async function listApiKeys() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    throw new Error("Only admins can access API keys")
  }

  // Get all API keys (without exposing the actual values)
  const { data: keys } = await supabase
    .from("api_keys")
    .select("id, provider, key_name, is_active, created_at")
    .order("created_at", { ascending: false })

  return keys || []
}
