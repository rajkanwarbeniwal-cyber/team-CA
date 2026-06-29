'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Helper to require admin role for server actions
 * Returns authenticated Supabase client + user, or throws if not admin
 */
export async function requireAdmin() {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('Not authenticated')
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    throw new Error('Profile not found')
  }

  if (profile.role !== 'admin') {
    throw new Error('Only admins can perform this action')
  }

  return { supabase, user }
}

/**
 * Helper to require authentication (any role)
 * Returns authenticated Supabase client + user, or throws if not authenticated
 */
export async function requireAuth() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('Not authenticated')
  }

  return { supabase, user }
}
