import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ForumFeed } from "@/components/community/forum-feed"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export const metadata = {
  title: "Community Forum — Taksha",
  description: "Connect, discuss, and share knowledge with the Taksha community",
}

export default async function CommunityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-balance">Community Forum</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Connect with students, share knowledge, and discuss exam strategies
          </p>
        </div>
        <Link href="/community/create">
          <Button size="lg" className="gradient-purple-pink text-white gap-2">
            <Plus className="h-5 w-5" />
            New Discussion
          </Button>
        </Link>
      </div>

      {/* Forum Feed */}
      <ForumFeed />
    </div>
  )
}
