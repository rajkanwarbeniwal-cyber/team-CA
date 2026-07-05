# AI Test Service - Code Snippets

Ready-to-use code examples for the Anthropic API integration.

## Basic Usage

### Generate Questions (Simplest)
```typescript
import { getAITestService } from "@/lib/ai-test-service"

const questions = await getAITestService().generateQuestions({
  examGoal: "JEE",
  questionCount: 50,
  subjectDistribution: [
    { subject: "Math", level: "weak", count: 30 },
    { subject: "Physics", level: "average", count: 15 },
    { subject: "Chemistry", level: "strong", count: 5 }
  ]
})
```

## With Error Handling

### Error Handling (Recommended)
```typescript
import { getAITestService } from "@/lib/ai-test-service"
import type { AITestServiceError } from "@/lib/ai-test-service"

const generateTest = async () => {
  try {
    const questions = await getAITestService().generateQuestions({
      examGoal: "JEE",
      questionCount: 50,
      subjectDistribution: [
        { subject: "Math", level: "weak", count: 30 },
        { subject: "Physics", level: "average", count: 15 },
        { subject: "Chemistry", level: "strong", count: 5 }
      ]
    })
    
    console.log(`✓ Generated ${questions.length} questions`)
    return questions
  } catch (error) {
    const aiError = error as AITestServiceError
    console.error(`✗ [${aiError.code}] ${aiError.message}`)
    throw error
  }
}
```

## API Route Integration

### Current Implementation (In app/api/generate-test/route.ts)
```typescript
import { NextRequest, NextResponse } from "next/server"
import { getAITestService } from "@/lib/ai-test-service"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { questionCount, durationMinutes } = body

    // ... validation code ...

    // Get AI service and generate questions
    const aiTestService = getAITestService()
    const questions = await aiTestService.generateQuestions({
      examGoal: profile.exam_goal,
      questionCount,
      subjectDistribution
    })

    // Save to database and return
    const { data: test } = await supabase
      .from("ai_mock_tests")
      .insert({ /* ... */ })
      .select()
      .single()

    // Insert questions
    const questionsPayload = questions.map((q, i) => ({
      test_id: test.id,
      ...q,
      sort_order: i + 1
    }))

    await supabase.from("ai_test_questions").insert(questionsPayload)

    return NextResponse.json({ testId: test.id })
  } catch (error) {
    console.error("[generate-test] error:", error)
    return NextResponse.json(
      { error: "Failed to generate test" },
      { status: 500 }
    )
  }
}
```

## Testing & Development

### Test with Custom API Key
```typescript
import { createAITestService } from "@/lib/ai-test-service"

const testService = createAITestService(process.env.ANTHROPIC_API_KEY!)

try {
  const questions = await testService.generateQuestions({
    examGoal: "JEE",
    questionCount: 5,  // Small number for testing
    subjectDistribution: [
      { subject: "Math", level: "weak", count: 5 }
    ]
  })
  
  console.log(JSON.stringify(questions, null, 2))
} catch (error) {
  console.error("Test failed:", error)
}
```

### Debug Logging
```typescript
const generateQuestions = async (params) => {
  console.log("[DEBUG] Request:", JSON.stringify(params, null, 2))
  
  try {
    const questions = await getAITestService().generateQuestions(params)
    console.log("[DEBUG] Generated questions:", questions.length)
    console.log("[DEBUG] First question:", questions[0])
    return questions
  } catch (error) {
    const aiError = error as AITestServiceError
    console.log("[DEBUG] Error code:", aiError.code)
    console.log("[DEBUG] Error message:", aiError.message)
    console.log("[DEBUG] Original error:", aiError.originalError)
    throw error
  }
}
```

## Type Definitions

### If You Need to Define Types Elsewhere
```typescript
import type { 
  Question, 
  GenerateQuestionsRequest, 
  SubjectDistribution,
  AITestServiceError 
} from "@/lib/ai-test-service"

// Now you can use these types
const request: GenerateQuestionsRequest = {
  examGoal: "JEE",
  questionCount: 50,
  subjectDistribution: [
    { subject: "Math", level: "weak", count: 30 }
  ]
}

const handleError = (error: AITestServiceError) => {
  if (error.code === "MISSING_API_KEY") {
    console.error("API key not configured")
  }
}
```

## Component Integration

### In a React Component (Client-Side Call to API)
```typescript
"use client"

import { useState } from "react"
import { toast } from "sonner"

export function TestGenerator() {
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/generate-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionCount: 50,
          durationMinutes: 60
        })
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Failed to generate test")
        return
      }

      toast.success("Test generated!")
      // Redirect or process testId...
      window.location.href = `/exam/ai/${data.testId}`
    } catch (error) {
      toast.error("An error occurred")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleGenerate} disabled={loading}>
      {loading ? "Generating..." : "Generate Test"}
    </button>
  )
}
```

## Database Integration

### Save Generated Questions to Database
```typescript
import { createClient } from "@/lib/supabase/server"
import { getAITestService } from "@/lib/ai-test-service"

const saveGeneratedTest = async (userId: string, examGoal: string) => {
  const supabase = await createClient()

  // Generate questions
  const questions = await getAITestService().generateQuestions({
    examGoal,
    questionCount: 50,
    subjectDistribution: [
      { subject: "Math", level: "weak", count: 30 },
      { subject: "Physics", level: "average", count: 15 },
      { subject: "Chemistry", level: "strong", count: 5 }
    ]
  })

  // Create test record
  const { data: test, error: testErr } = await supabase
    .from("ai_mock_tests")
    .insert({
      user_id: userId,
      title: `${examGoal} - 50 Questions`,
      exam_goal: examGoal,
      total_questions: questions.length,
      duration_minutes: 60,
      is_ai_generated: true
    })
    .select()
    .single()

  if (testErr || !test) {
    throw new Error("Failed to create test record")
  }

  // Insert questions
  const questionsPayload = questions.map((q, i) => ({
    test_id: test.id,
    question_text: q.question_text,
    option_a: q.option_a,
    option_b: q.option_b,
    option_c: q.option_c,
    option_d: q.option_d,
    correct_option: q.correct_option,
    explanation: q.explanation,
    subject: q.subject,
    difficulty: q.difficulty,
    sort_order: i + 1
  }))

  const { error: qErr } = await supabase
    .from("ai_test_questions")
    .insert(questionsPayload)

  if (qErr) {
    // Rollback test
    await supabase.from("ai_mock_tests").delete().eq("id", test.id)
    throw new Error("Failed to save questions")
  }

  return test
}
```

## Error Handling Patterns

### Pattern 1: Try-Catch with Type Guard
```typescript
try {
  const questions = await getAITestService().generateQuestions({/* ... */})
} catch (error) {
  if (error && typeof error === "object" && "code" in error) {
    const aiError = error as AITestServiceError
    switch (aiError.code) {
      case "MISSING_API_KEY":
        console.error("Configure ANTHROPIC_API_KEY")
        break
      case "PARSE_ERROR":
        console.error("Invalid JSON from Claude")
        break
      case "INVALID_RESPONSE":
        console.error("Unexpected response structure")
        break
      case "API_ERROR":
        console.error("Claude API error")
        break
      case "EMPTY_RESPONSE":
        console.error("No questions returned")
        break
    }
  }
}
```

### Pattern 2: Next.js Error Response
```typescript
import { NextResponse } from "next/server"

try {
  const questions = await getAITestService().generateQuestions({/* ... */})
} catch (error) {
  const message = 
    error && typeof error === "object" && "message" in error
      ? (error as { message: string }).message
      : "Failed to generate questions"

  return NextResponse.json(
    { error: message },
    { status: 500 }
  )
}
```

### Pattern 3: Toast Notification
```typescript
import { toast } from "sonner"

try {
  const questions = await getAITestService().generateQuestions({/* ... */})
  toast.success("Questions generated successfully!")
} catch (error) {
  const message = 
    error && typeof error === "object" && "message" in error
      ? (error as { message: string }).message
      : "Failed to generate questions"
  
  toast.error(message)
}
```

## Environment Setup

### .env.local (Development)
```bash
ANTHROPIC_API_KEY=sk-ant-v7-YOUR_KEY_HERE
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Vercel Environment Variables (Production)
```bash
# In Vercel Project Settings > Environment Variables
ANTHROPIC_API_KEY=sk-ant-v7-YOUR_KEY_HERE
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Testing Helpers

### Validate Distribution Adds Up
```typescript
const validateDistribution = (distribution: SubjectDistribution[]) => {
  const total = distribution.reduce((sum, d) => sum + d.count, 0)
  const expected = distribution.length > 0 
    ? distribution.reduce((_, d) => d.count) 
    : 0
  
  console.log(`Distribution: ${total} questions`)
  return total > 0
}

// Usage
const distribution = [
  { subject: "Math", level: "weak" as const, count: 30 },
  { subject: "Physics", level: "average" as const, count: 15 },
  { subject: "Chemistry", level: "strong" as const, count: 5 }
]

console.assert(
  validateDistribution(distribution),
  "Invalid distribution"
)
```

### Mock Service for Testing
```typescript
// For unit tests, you can create a mock
const mockAITestService = {
  generateQuestions: async () => [
    {
      question_text: "What is 2+2?",
      option_a: "3",
      option_b: "4",
      option_c: "5",
      option_d: "6",
      correct_option: "B" as const,
      explanation: "2+2 equals 4",
      subject: "Math",
      difficulty: "easy" as const
    }
  ]
}

export { mockAITestService }
```

---

**Pro Tips:**
- Always validate the API key is set before calling the service
- Start with small question counts (5-10) for testing
- Log both successful and failed generations for analytics
- Cache successful generations to reduce API calls
- Monitor token usage in your Anthropic dashboard
