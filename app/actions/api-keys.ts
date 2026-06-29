"use server"

import { revalidateTag } from "next/cache"
import { requireAdmin } from "@/lib/auth-guard"
import { encrypt } from "@/lib/crypto"

export async function addApiKey(provider: string, keyName: string, apiKey: string) {
  const { supabase, user } = await requireAdmin()

  // Real AES-256-GCM encryption
  const encrypted = encrypt(apiKey)

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
  const { supabase } = await requireAdmin()

  const encrypted = encrypt(apiKey)

  const { error } = await supabase
    .from("api_keys")
    .update({ encrypted_value: encrypted })
    .eq("id", id)

  if (error) throw new Error(error.message)

  revalidateTag("api-keys", "max")
  return { success: true }
}

export async function deleteApiKey(id: number) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase
    .from("api_keys")
    .delete()
    .eq("id", id)

  if (error) throw new Error(error.message)

  revalidateTag("api-keys", "max")
  return { success: true }
}

/**
 * Retrieve and decrypt an API key. Only server code can call this function.
 * Never return the raw key to client components.
 */
export async function getApiKey(provider: string, keyName: string) {
  const { supabase } = await requireAdmin()

  // Get the API key (for internal server use only)
  const { data } = await supabase
    .from("api_keys")
    .select("encrypted_value")
    .eq("provider", provider)
    .eq("key_name", keyName)
    .eq("is_active", true)
    .single()

  if (!data) return null

  // Decrypt using AES-256-GCM
  let decrypted: string
  try {
    const { decrypt } = await import("@/lib/crypto")
    decrypted = decrypt(data.encrypted_value)
  } catch (error) {
    throw new Error(`Failed to decrypt API key: ${error instanceof Error ? error.message : "Unknown error"}`)
  }

  return decrypted
}

export async function listApiKeys() {
  const { supabase } = await requireAdmin()

  // Get all API keys (without exposing the actual values)
  const { data: keys } = await supabase
    .from("api_keys")
    .select("id, provider, key_name, is_active, created_at")
    .order("created_at", { ascending: false })

  return keys || []
}
