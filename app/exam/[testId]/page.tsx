import { notFound, redirect } from "next/navigation"
import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { ExamRunner } from "@/components/exam/exam-runner"

// Server-side metadata generation for dynamic exam pages
export async function generateMetadata({ params }: { params: Promise<{ testId: string }> }): Promise<Metadata> {
  const { testId } = await params
  const supabase = await createClient()

  try {
    // Fetch test details from database
    const { data: test, error } = await supabase
      .from("mock_tests")
      .select("id, title, description, duration_minutes, difficulty")
      .eq("id", testId)
      .single()

    if (error || !test) {
      return {
        title: "Exam Not Found",
        description: "The exam you're looking for doesn't exist.",
      }
    }

    // Format duration for display
    const durationText =
      test.duration_minutes >= 60
        ? `${Math.floor(test.duration_minutes / 60)}h ${test.duration_minutes % 60}m`
        : `${test.duration_minutes} minutes`

    // Create SEO-friendly title
    const seoTitle = `${test.title} - Mock Test | Taksha`

    // Create comprehensive description
    const seoDescription = test.description
      ? `${test.description} | ${durationText} | Difficulty: ${test.difficulty || "Not specified"} | Taksha`
      : `Take the ${test.title} mock test on Taksha. Duration: ${durationText}. Difficulty: ${test.difficulty || "Medium"}. Prepare for competitive exams with our interactive test platform.`

    // Construct canonical URL
    const canonicalUrl = `https://taksha.edu/exam/${testId}`

    // OG image (can be customized or use a default)
    const ogImage = {
      url: "https://taksha.edu/taksha-badge-en.png",
      width: 1200,
      height: 630,
      alt: `${test.title} - Mock Test on Taksha`,
    }

    return {
      title: seoTitle,
      description: seoDescription,
      keywords: [
        test.title,
        "mock test",
        "practice exam",
        test.difficulty,
        "competitive exam",
        "Taksha",
      ],
      authors: [{ name: "Taksha" }],
      creator: "Taksha",
      openGraph: {
        type: "website",
        url: canonicalUrl,
        title: seoTitle,
        description: seoDescription,
        images: [ogImage],
        siteName: "Taksha",
      },
      twitter: {
        card: "summary_large_image",
        title: seoTitle,
        description: seoDescription,
        images: ["https://taksha.edu/taksha-badge-en.png"],
        creator: "@taksha",
      },
      alternates: {
        canonical: canonicalUrl,
      },
      // Structured data for search engines
      other: {
        "application/ld+json": JSON.stringify({
          "@context": "https://schema.org",
          "@type": "EducationalActivity",
          name: test.title,
          description: seoDescription,
          duration: formatISO8601Duration(test.duration_minutes),
          difficultyLevel: test.difficulty || "Medium",
          provider: {
            "@type": "Organization",
            name: "Taksha",
            url: "https://taksha.edu",
            logo: "https://taksha.edu/taksha-logo.png",
          },
        }),
      },
    }
  } catch (error) {
    console.error("[v0] Error generating metadata:", error)
    return {
      title: "Mock Test - Taksha",
      description: "Take a mock test on Taksha and prepare for competitive exams.",
    }
  }
}

// Helper function to convert minutes to ISO 8601 duration format
function formatISO8601Duration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  let duration = "PT"
  if (hours > 0) duration += `${hours}H`
  if (mins > 0) duration += `${mins}M`
  
  return duration || "PT0M"
}

export default async function ExamPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: test } = await supabase.from("mock_tests").select("*").eq("id", testId).single()
  if (!test) notFound()

  return <ExamRunner test={test} />
}
