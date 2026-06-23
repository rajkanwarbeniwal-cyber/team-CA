import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getTodayQuiz } from "@/lib/daily-quiz-queries"

export default async function DailyQuizPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // For now, show a placeholder. In a full implementation, this would render the quiz UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50 to-pink-50 dark:from-background dark:via-purple-950 dark:to-pink-950 p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">Daily Quiz</h1>
        <p className="text-lg text-muted-foreground">
          The daily quiz interface is being built. Check back soon for the full experience!
        </p>
      </div>
    </div>
  )
}
