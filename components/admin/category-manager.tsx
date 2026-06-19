"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, FolderTree } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
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
import {
  useSaveCategory,
  useDeleteCategory,
  useSaveSubcategory,
  useDeleteSubcategory,
} from "@/lib/admin-queries"
import type { Category, Subcategory } from "@/lib/types"
import { DeleteButton } from "@/components/admin/delete-button"

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function CategoryManager({
  categories,
  subcategories,
}: {
  categories: Category[]
  subcategories: Subcategory[]
}) {
  const [catOpen, setCatOpen] = useState(false)
  const [subOpen, setSubOpen] = useState(false)
  const [editCat, setEditCat] = useState<Category | null>(null)
  const [editSub, setEditSub] = useState<Subcategory | null>(null)
  const [defaultCatId, setDefaultCatId] = useState<string>("")

  const saveCat = useSaveCategory()
  const delCat = useDeleteCategory()
  const saveSub = useSaveSubcategory()
  const delSub = useDeleteSubcategory()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Categories</CardTitle>
          <Button
            size="sm"
            onClick={() => {
              setEditCat(null)
              setCatOpen(true)
            }}
          >
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.map((cat) => {
            const subs = subcategories.filter((s) => s.category_id === cat.id)
            return (
              <div key={cat.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.description ?? cat.slug}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditCat(cat)
                        setCatOpen(true)
                      }}
                      aria-label={`Edit ${cat.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <DeleteButton
                      label={`Delete category "${cat.name}"? This removes all its tests and questions.`}
                      onConfirm={() =>
                        delCat.mutate(cat.id, {
                          onSuccess: () => toast.success("Category deleted"),
                          onError: (e) => toast.error(e.message),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {subs.map((s) => (
                    <Badge key={s.id} variant="secondary" className="gap-1 pr-1">
                      {s.name}
                      <button
                        type="button"
                        className="ml-1 rounded p-0.5 hover:text-primary"
                        onClick={() => {
                          setEditSub(s)
                          setDefaultCatId(cat.id)
                          setSubOpen(true)
                        }}
                        aria-label={`Edit ${s.name}`}
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        className="rounded p-0.5 hover:text-destructive"
                        onClick={() =>
                          delSub.mutate(s.id, {
                            onSuccess: () => toast.success("Subcategory deleted"),
                            onError: (e) => toast.error(e.message),
                          })
                        }
                        aria-label={`Delete ${s.name}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7"
                    onClick={() => {
                      setEditSub(null)
                      setDefaultCatId(cat.id)
                      setSubOpen(true)
                    }}
                  >
                    <Plus className="h-3 w-3" /> Subcategory
                  </Button>
                </div>
              </div>
            )
          })}
          {categories.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
              <FolderTree className="h-8 w-8" />
              No categories yet. Add one to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category dialog */}
      <CategoryDialog
        open={catOpen}
        onOpenChange={setCatOpen}
        initial={editCat}
        onSave={(payload) =>
          saveCat.mutate(payload, {
            onSuccess: () => {
              toast.success(editCat ? "Category updated" : "Category created")
              setCatOpen(false)
            },
            onError: (e) => toast.error(e.message),
          })
        }
        saving={saveCat.isPending}
      />

      {/* Subcategory dialog */}
      <SubcategoryDialog
        open={subOpen}
        onOpenChange={setSubOpen}
        initial={editSub}
        categories={categories}
        defaultCategoryId={defaultCatId}
        onSave={(payload) =>
          saveSub.mutate(payload, {
            onSuccess: () => {
              toast.success(editSub ? "Subcategory updated" : "Subcategory created")
              setSubOpen(false)
            },
            onError: (e) => toast.error(e.message),
          })
        }
        saving={saveSub.isPending}
      />
    </div>
  )
}

function CategoryDialog({
  open,
  onOpenChange,
  initial,
  onSave,
  saving,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  initial: Category | null
  onSave: (p: { id?: string; name: string; slug: string; description: string | null }) => void
  saving: boolean
}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  // sync when opening
  function handleOpen(v: boolean) {
    if (v) {
      setName(initial?.name ?? "")
      setDescription(initial?.description ?? "")
    }
    onOpenChange(v)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Category" : "New Category"}</DialogTitle>
          <DialogDescription>Top-level grouping like Central Exams or Banking.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Name</Label>
            <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Central Exams" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-desc">Description</Label>
            <Textarea
              id="cat-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!name.trim() || saving}
            onClick={() =>
              onSave({
                id: initial?.id,
                name: name.trim(),
                slug: slugify(name),
                description: description.trim() || null,
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

function SubcategoryDialog({
  open,
  onOpenChange,
  initial,
  categories,
  defaultCategoryId,
  onSave,
  saving,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  initial: Subcategory | null
  categories: Category[]
  defaultCategoryId: string
  onSave: (p: { id?: string; name: string; slug: string; category_id: string; description: string | null }) => void
  saving: boolean
}) {
  const [name, setName] = useState("")
  const [categoryId, setCategoryId] = useState("")

  function handleOpen(v: boolean) {
    if (v) {
      setName(initial?.name ?? "")
      setCategoryId(initial?.category_id ?? defaultCategoryId)
    }
    onOpenChange(v)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Subcategory" : "New Subcategory"}</DialogTitle>
          <DialogDescription>Exam group like UPSC, SSC, or IBPS PO.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sub-name">Name</Label>
            <Input id="sub-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="UPSC" />
          </div>
          <div className="space-y-2">
            <Label>Parent Category</Label>
            <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!name.trim() || !categoryId || saving}
            onClick={() =>
              onSave({
                id: initial?.id,
                name: name.trim(),
                slug: slugify(name),
                category_id: categoryId,
                description: null,
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
