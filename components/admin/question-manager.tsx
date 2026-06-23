"use client"

import { useState } from "react"
import { ArrowLeft, Plus, Pencil, CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { useAdminQuestions, useSaveQuestion, useDeleteQuestion } from "@/lib/admin-queries"
import { OPTION_KEYS, type MockTest, type OptionKey, type Question } from "@/lib/types"
import { DeleteButton } from "@/components/admin/delete-button"

export function QuestionManager({ test, onBack }: { test: MockTest; onBack: () => void }) {
  const { data: questions, isLoading } = useAdminQuestions(test.id)
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState<Question | null>(null)
  const saveQ = useSaveQuestion()
  const delQ = useDeleteQuestion()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to tests">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="font-semibold">{test.title}</h2>
            <p className="text-xs text-muted-foreground">{questions?.length ?? 0} questions</p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEdit(null)
            setOpen(true)
          }}
        >
          <Plus className="h-4 w-4" /> Add Question
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {(questions ?? []).map((q, i) => (
            <Card key={q.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium leading-relaxed">
                    <span className="text-muted-foreground">Q{i + 1}.</span> {q.question_text}
                  </p>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Edit question"
                      onClick={() => {
                        setEdit(q)
                        setOpen(true)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <DeleteButton
                      label="Delete this question permanently?"
                      onConfirm={() =>
                        delQ.mutate(q.id, {
                          onSuccess: () => toast.success("Question deleted"),
                          onError: (e) => toast.error(e.message),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
                  {(["A", "B", "C", "D"] as OptionKey[]).map((k) => {
                    const text = k === "A" ? q.option_a : k === "B" ? q.option_b : k === "C" ? q.option_c : q.option_d
                    const correct = q.correct_option === k
                    return (
                      <div
                        key={k}
                        className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs ${
                          correct ? "border-success bg-success/10 text-foreground" : "border-border text-muted-foreground"
                        }`}
                      >
                        {correct ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        ) : (
                          <span className="font-semibold">{k}</span>
                        )}
                        {text}
                      </div>
                    )
                  })}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-[10px]">
                    +{q.marks} / -{q.negative_marks}
                  </Badge>
                  {q.explanation && <span className="truncate">Explanation added</span>}
                </div>
              </CardContent>
            </Card>
          ))}
          {(questions ?? []).length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                No questions yet. Add your first question.
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <QuestionDialog
        open={open}
        onOpenChange={setOpen}
        initial={edit}
        testId={test.id}
        nextOrder={questions?.length ?? 0}
        saving={saveQ.isPending}
        onSave={(payload) =>
          saveQ.mutate(payload, {
            onSuccess: () => {
              toast.success(edit ? "Question updated" : "Question added")
              setOpen(false)
            },
            onError: (e) => toast.error(e.message),
          })
        }
      />
    </div>
  )
}

function QuestionDialog({
  open,
  onOpenChange,
  initial,
  testId,
  nextOrder,
  onSave,
  saving,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  initial: Question | null
  testId: string
  nextOrder: number
  onSave: (p: Partial<Question> & { mock_test_id: string; question_text: string }) => void
  saving: boolean
}) {
  const [text, setText] = useState("")
  const [a, setA] = useState("")
  const [b, setB] = useState("")
  const [c, setC] = useState("")
  const [d, setD] = useState("")
  const [correct, setCorrect] = useState<OptionKey>("A")
  const [explanation, setExplanation] = useState("")
  const [marks, setMarks] = useState(1)
  const [negative, setNegative] = useState(0.25)

  function handleOpen(v: boolean) {
    if (v) {
      setText(initial?.question_text ?? "")
      setA(initial?.option_a ?? "")
      setB(initial?.option_b ?? "")
      setC(initial?.option_c ?? "")
      setD(initial?.option_d ?? "")
      setCorrect(initial?.correct_option ?? "A")
      setExplanation(initial?.explanation ?? "")
      setMarks(initial?.marks ?? 1)
      setNegative(initial?.negative_marks ?? 0.25)
    }
    onOpenChange(v)
  }

  const valid = text.trim() && a.trim() && b.trim() && c.trim() && d.trim()

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-h-[90svh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Question" : "New Question"}</DialogTitle>
          <DialogDescription>Enter the question, four options, correct answer, and explanation.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="q-text">Question</Label>
            <Textarea id="q-text" value={text} onChange={(e) => setText(e.target.value)} rows={2} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="opt-a">Option A</Label>
              <Input id="opt-a" value={a} onChange={(e) => setA(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="opt-b">Option B</Label>
              <Input id="opt-b" value={b} onChange={(e) => setB(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="opt-c">Option C</Label>
              <Input id="opt-c" value={c} onChange={(e) => setC(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="opt-d">Option D</Label>
              <Input id="opt-d" value={d} onChange={(e) => setD(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Correct Answer</Label>
              <Select value={correct} onValueChange={(v) => setCorrect(v as OptionKey)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPTION_KEYS.map((k) => (
                    <SelectItem key={k} value={k}>
                      Option {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="q-marks">Marks</Label>
              <Input
                id="q-marks"
                type="number"
                step="0.25"
                value={marks}
                onChange={(e) => setMarks(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="q-neg">Negative Marks</Label>
              <Input
                id="q-neg"
                type="number"
                step="0.25"
                value={negative}
                onChange={(e) => setNegative(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="q-exp">Explanation (shown in review)</Label>
            <Textarea id="q-exp" value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!valid || saving}
            onClick={() =>
              onSave({
                id: initial?.id,
                mock_test_id: testId,
                question_text: text.trim(),
                option_a: a.trim(),
                option_b: b.trim(),
                option_c: c.trim(),
                option_d: d.trim(),
                correct_option: correct,
                explanation: explanation.trim() || null,
                marks,
                negative_marks: negative,
                sort_order: initial?.sort_order ?? nextOrder,
              })
            }
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
