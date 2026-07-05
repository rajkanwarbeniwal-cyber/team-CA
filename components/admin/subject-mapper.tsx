"use client"

import { useState } from "react"
import { Layers, Plus, Trash2, Loader2, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { generateQuestionsAction } from "@/app/actions/generate-questions"
import { toast } from "sonner"

interface SubjectRow {
  id: number
  topic: string
  count: number
  difficulty: "easy" | "medium" | "hard"
}

interface SubjectMapperProps {
  mockTestId: string
  examType?: string
  onSuccess?: () => void
}

let nextId = 1

/**
 * Distribute AI question generation across multiple subjects/topics.
 * Each row generates its own batch via the real server action, sequentially.
 */
export function SubjectMapper({ mockTestId, examType = "UPSC", onSuccess }: SubjectMapperProps) {
  const [rows, setRows] = useState<SubjectRow[]>([{ id: 0, topic: "", count: 5, difficulty: "medium" }])
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTopic, setCurrentTopic] = useState<string | null>(null)

  const totalQuestions = rows.reduce((sum, r) => sum + (r.count || 0), 0)

  function addRow() {
    setRows((r) => [...r, { id: nextId++, topic: "", count: 5, difficulty: "medium" }])
  }

  function removeRow(id: number) {
    setRows((r) => (r.length > 1 ? r.filter((row) => row.id !== id) : r))
  }

  function updateRow(id: number, patch: Partial<SubjectRow>) {
    setRows((r) => r.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  async function handleGenerateAll() {
    const valid = rows.filter((r) => r.topic.trim() && r.count > 0)
    if (valid.length === 0) {
      toast.error("Add at least one subject with a topic name")
      return
    }

    setRunning(true)
    setProgress(0)
    let created = 0
    let failed = 0

    for (let i = 0; i < valid.length; i++) {
      const row = valid[i]
      setCurrentTopic(row.topic)
      try {
        const res = await generateQuestionsAction({
          mockTestId,
          topic: row.topic,
          difficulty: row.difficulty,
          questionCount: row.count,
          examType,
        })
        if (res.success) {
          created += res.questionsCreated ?? 0
        } else {
          failed++
          toast.error(`${row.topic}: ${res.error || res.message}`)
        }
      } catch {
        failed++
        toast.error(`${row.topic}: generation failed`)
      }
      setProgress(Math.round(((i + 1) / valid.length) * 100))
    }

    setCurrentTopic(null)
    setRunning(false)

    if (created > 0) {
      toast.success(`Generated ${created} questions across ${valid.length - failed} subject${valid.length - failed === 1 ? "" : "s"}`)
      onSuccess?.()
    }
  }

  return (
    <div className="glass rounded-2xl border-0 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-accent" />
          <h3 className="text-lg font-bold">Subject Mapper</h3>
        </div>
        <Badge variant="secondary">{totalQuestions} questions total</Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        Split question generation across multiple subjects. Each subject is generated as its own AI batch.
      </p>

      <div className="space-y-3">
        {rows.map((row, idx) => (
          <div key={row.id} className="flex flex-col gap-2 rounded-lg border border-border/60 p-3 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor={`topic-${row.id}`} className="text-xs">
                Subject {idx + 1}
              </Label>
              <Input
                id={`topic-${row.id}`}
                placeholder="e.g., Indian Polity"
                value={row.topic}
                onChange={(e) => updateRow(row.id, { topic: e.target.value })}
                disabled={running}
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:w-24">
              <Label htmlFor={`count-${row.id}`} className="text-xs">
                Questions
              </Label>
              <Input
                id={`count-${row.id}`}
                type="number"
                min={1}
                max={50}
                value={row.count}
                onChange={(e) => updateRow(row.id, { count: Number.parseInt(e.target.value) || 1 })}
                disabled={running}
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:w-32">
              <Label className="text-xs">Difficulty</Label>
              <Select
                value={row.difficulty}
                onValueChange={(v) => v && updateRow(row.id, { difficulty: v as SubjectRow["difficulty"] })}
                disabled={running}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeRow(row.id)}
              disabled={running || rows.length === 1}
              aria-label={`Remove subject ${idx + 1}`}
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" variant="outline" onClick={addRow} disabled={running} className="gap-2 bg-transparent">
          <Plus className="h-4 w-4" />
          Add Subject
        </Button>
        <Button type="button" onClick={handleGenerateAll} disabled={running} className="flex-1 gap-2">
          {running ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {currentTopic ? `Generating ${currentTopic}...` : "Generating..."}
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              Generate All Subjects
            </>
          )}
        </Button>
      </div>

      {running && <Progress value={progress} aria-label="Generation progress" />}
    </div>
  )
}
