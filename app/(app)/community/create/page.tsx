import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export const metadata = {
  title: "New Discussion — Taksha Community",
}

export default async function CreatePostPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Link href="/community">
        <Button variant="ghost" className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back to Forum
        </Button>
      </Link>

      <div>
        <h1 className="text-4xl font-bold">Start a Discussion</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Share your question or experience with the community
        </p>
      </div>

      {/* Form will be built in next iteration */}
      <div className="glass rounded-2xl border-0 p-8 text-center">
        <p className="text-muted-foreground">
          The forum post creation form is being built. Check back soon!
        </p>
      </div>
    </div>
  )
}
