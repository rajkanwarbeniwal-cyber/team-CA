import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!exchangeError) {
      // Session created successfully
      const { data: userData } = await supabase.auth.getUser()
      
      if (userData.user) {
        // Check if user profile exists
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", userData.user.id)
          .single()
        
        // If new user (no profile), redirect to profile setup
        if (!profile) {
          return NextResponse.redirect(`${origin}/auth/setup-profile`)
        }
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
