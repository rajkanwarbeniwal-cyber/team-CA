"use client"

import { useState } from "react"
import { Plus, Pencil, FileQuestion, ListChecks } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
import { useSaveTest, useDeleteTest } from "@/lib/admin-queries"
import type { MockTest, Subcategory, TimerMode } from "@/lib/types"
import { DeleteButton } from "@/components/admin/delete-button"

type TestWithCount = MockTest & { questions: { count: number }[] }

export function TestManager({
  tests,
  subcategories,
  onManageQuestions,
}: {
  tests: TestWithCount[]
  subcategories: Subcategory[]
  onManageQuestions: (test: MockTest) => void
}) {
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState<MockTest | null>(null)
  const saveTest = useSaveTest()
  const delTest = useDeleteTest()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{tests.length} mock tests</p>
        <Button
          size="sm"
          onClick={() => {
            setEdit(null)
            setOpen(true)
          }}
          disabled={subcategories.length === 0}
        >
          <Plus className="h-4 w-4" /> Add Test
        </Button>
      </div>

      <div className="grid gap-3">
        {tests.map((t) => {
          const count = t.questions?.[0]?.count ?? 0
          const sub = subcategories.find((s) => s.id === t.subcategory_id)
          return (
            <Card key={t.id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{t.title}</p>
                    <Badge variant={t.is_published ? "default" : "secondary"} className="text-[10px]">
                      {t.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {sub?.name ?? "—"} · {count} questions ·{" "}
                    {t.timer_mode === "total" ? `${t.duration_minutes} min total` : `${t.per_question_seconds}s / question`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={() => onManageQuestions(t)}>
                    <FileQuestion className="h-4 w-4" /> Questions
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${t.title}`}
                    onClick={() => {
                      setEdit(t)
                      setOpen(true)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <DeleteButton
                    label={`Delete test "${t.title}"? All its questions and attempts will be removed.`}
                    onConfirm={() =>
                      delTest.mutate(t.id, {
                        onSuccess: () => toast.success("Test deleted"),
                        onError: (e) => toast.error(e.message),
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
        {tests.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-sm text-muted-foreground">
              <ListChecks className="h-8 w-8" />
              No tests yet.{subcategories.length === 0 ? " Create a category and subcategory first." : ""}
            </CardContent>
          </Card>
        )}
      </div>

      <TestDialog
        open={open}
        onOpenChange={setOpen}
        initial={edit}
        subcategories={subcategories}
        saving={saveTest.isPending}
        onSave={(payload) =>
          saveTest.mutate(payload, {
            onSuccess: () => {
              toast.success(edit ? "Test updated" : "Test created")
              setOpen(false)
            },
            onError: (e) => toast.error(e.message),
          })
        }
      />
    </div>
  )
}

function TestDialog({
  open,
  onOpenChange,
  initial,
  subcategories,
  onSave,
  saving,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  initial: MockTest | null
  subcategories: Subcategory[]
  onSave: (p: Partial<MockTest> & { title: string; subcategory_id: string }) => void
  saving: boolean
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [subcategoryId, setSubcategoryId] = useState("")
  const [timerMode, setTimerMode] = useState<TimerMode>("total")
  const [duration, setDuration] = useState(30)
  const [perQ, setPerQ] = useState(60)
  const [published, setPublished] = useState(true)

  function handleOpen(v: boolean) {
    if (v) {
      setTitle(initial?.title ?? "")
      setDescription(initial?.description ?? "")
      setSubcategoryId(initial?.subcategory_id ?? "")
      setTimerMode(initial?.timer_mode ?? "total")
      setDuration(initial?.duration_minutes ?? 30)
      setPerQ(initial?.per_question_seconds ?? 60)
      setPublished(initial?.is_published ?? true)
    }
    onOpenChange(v)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-h-[90svh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Test" : "New Mock Test"}</DialogTitle>
          <DialogDescription>Configure the test details and timer behavior.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-title">Title</Label>
            <Input
              id="test-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="UPSC Prelims Mock 1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="test-desc">Description</Label>
            <Textarea id="test-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Subcategory</Label>
            <Select value={subcategoryId} onValueChange={(v) => setSubcategoryId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select subcategory" />
              </SelectTrigger>
              <SelectContent>
                {subcategories.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Timer Mode</Label>
            <Select value={timerMode} onValueChange={(v) => setTimerMode(v as TimerMode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total">Total time for the whole test</SelectItem>
                <SelectItem value="per_question">Per-question timer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {timerMode === "total" ? (
            <div className="space-y-2">
              <Label htmlFor="test-duration">Total Duration (minutes)</Label>
              <Input
                id="test-duration"
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="test-perq">Seconds per Question</Label>
              <Input
                id="test-perq"
                type="number"
                min={5}
                value={perQ}
                onChange={(e) => setPerQ(Number(e.target.value))}
              />
            </div>
          )}
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Label htmlFor="test-pub">Published</Label>
              <p className="text-xs text-muted-foreground">Visible to students when on.</p>
            </div>
            <Switch id="test-pub" checked={published} onCheckedChange={setPublished} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!title.trim() || !subcategoryId || saving}
            onClick={() =>
              onSave({
                id: initial?.id,
                title: title.trim(),
                description: description.trim() || null,
                subcategory_id: subcategoryId,
                timer_mode: timerMode,
                duration_minutes: duration,
                per_question_seconds: perQ,
                is_published: published,
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
