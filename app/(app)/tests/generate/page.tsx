import type { Metadata } from "next"
import { BrainCircuit } from "lucide-react"
import { AITestGenerator } from "@/components/tests/ai-test-generator"

export const metadata: Metadata = {
  title: "AI Test Generator - Taksha",
  description: "Generate a personalized mock test based on your subject strengths and weak areas.",
}

export default function GenerateTestPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold text-foreground">AI Test Generator</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Get a personalized mock test tailored to your weak areas. The AI focuses 60% of questions
          on subjects you find difficult so you improve faster.
        </p>
      </div>

      <div className="mt-6">
        <AITestGenerator />
      </div>
    </div>
  )
}
