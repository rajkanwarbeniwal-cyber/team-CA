"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Wand2, Loader2, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { generateQuestionsAction } from "@/app/actions/generate-questions"
import { toast } from "sonner"

interface AIGeneratorProps {
  mockTestId: string
  onSuccess?: () => void
}

export function AIQuestionGenerator({ mockTestId, onSuccess }: AIGeneratorProps) {
  const [topic, setTopic] = useState("")
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [questionCount, setQuestionCount] = useState(5)
  const [examType, setExamType] = useState("UPSC")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic")
      return
    }

    setIsLoading(true)
    try {
      const response = await generateQuestionsAction({
        mockTestId,
        topic,
        difficulty,
        questionCount,
        examType,
      })

      if (response.success) {
        setResult(response)
        toast.success(`Generated ${response.questionsCreated} questions using AI`)
        setTopic("")
        onSuccess?.()
      } else {
        toast.error(response.error || response.message)
      }
    } catch (error) {
      toast.error("Failed to generate questions")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="glass rounded-2xl border-0 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-accent" />
          <h3 className="text-lg font-bold">AI Question Generator</h3>
        </div>

        <div className="space-y-4">
          {/* Topic Input */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="topic">Topic/Subject</Label>
            <Input
              id="topic"
              placeholder="e.g., Constitutional Law, World History, Biology"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Difficulty Select */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select value={difficulty} onValueChange={(val) => setDifficulty(val as "easy" | "medium" | "hard")} disabled={isLoading}>
              <SelectTrigger id="difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Question Count */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="count">Number of Questions</Label>
            <Input
              id="count"
              type="number"
              min={1}
              max={20}
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value) || 5)}
              disabled={isLoading}
            />
          </div>

          {/* Exam Type */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="exam">Exam Type</Label>
            <Select value={examType} onValueChange={(val) => val && setExamType(val)} disabled={isLoading}>
              <SelectTrigger id="exam">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UPSC">UPSC</SelectItem>
                <SelectItem value="SSC">SSC</SelectItem>
                <SelectItem value="Banking">Banking</SelectItem>
                <SelectItem value="JEE">JEE</SelectItem>
                <SelectItem value="NEET">NEET</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !topic.trim()}
            className="w-full gap-2"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generate Questions
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Loading skeletons simulating incoming AI questions */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl border-0 p-6 space-y-4"
          aria-busy="true"
          aria-label="Generating questions"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-sm font-medium">AI is writing {questionCount} questions on {topic || "your topic"}...</p>
          </div>
          {Array.from({ length: Math.min(questionCount, 3) }).map((_, idx) => (
            <Card key={idx} className="glass border-0 p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <div className="ml-2 space-y-1.5">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-3/5" />
              </div>
              <Skeleton className="h-3 w-1/4" />
            </Card>
          ))}
        </motion.div>
      )}

      {/* Result Display */}
      {result && result.success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl border-0 p-6 space-y-4 border-l-4 border-green-500"
        >
          <div className="flex items-center gap-2 text-green-600">
            <Check className="h-5 w-5" />
            <h4 className="font-bold">{result.message}</h4>
          </div>

          {result.questions && result.questions.length > 0 && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {result.questions.map((q: any, idx: number) => (
                <Card key={idx} className="glass border-0 p-3 text-sm space-y-2">
                  <p className="font-semibold text-foreground">Q{idx + 1}: {q.question_text}</p>
                  <div className="space-y-1 text-xs text-muted-foreground ml-2">
                    <p>A) {q.option_a}</p>
                    <p>B) {q.option_b}</p>
                    <p>C) {q.option_c}</p>
                    <p>D) {q.option_d}</p>
                  </div>
                  <p className="text-xs">
                    <span className="font-semibold text-primary">Ans:</span> {q.correct_option} |{" "}
                    <span className="text-accent">{q.marks} marks</span>
                  </p>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {result && !result.success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl border-0 p-6 space-y-2 border-l-4 border-red-500"
        >
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <h4 className="font-bold">Error</h4>
          </div>
          <p className="text-sm text-muted-foreground">{result.error || result.message}</p>
        </motion.div>
      )}
    </motion.div>
  )
}
