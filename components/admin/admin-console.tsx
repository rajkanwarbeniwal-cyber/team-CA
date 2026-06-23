"use client"

import { useState } from "react"
import { FolderTree, ListChecks, FileQuestion } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { StatCard } from "@/components/dashboard/stat-card"
import { useAdminData } from "@/lib/admin-queries"
import { CategoryManager } from "@/components/admin/category-manager"
import { TestManager } from "@/components/admin/test-manager"
import { QuestionManager } from "@/components/admin/question-manager"
import type { MockTest } from "@/lib/types"

export function AdminConsole() {
  const { data, isLoading } = useAdminData()
  const [activeTest, setActiveTest] = useState<MockTest | null>(null)

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-56" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    )
  }

  const totalQuestions = data.tests.reduce((sum, t) => sum + (t.questions?.[0]?.count ?? 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Console</h1>
        <p className="text-sm text-muted-foreground">Manage categories, tests, and question banks.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Categories" value={data.categories.length} icon={FolderTree} />
        <StatCard label="Mock Tests" value={data.tests.length} icon={ListChecks} accent="warning" />
        <StatCard label="Total Questions" value={totalQuestions} icon={FileQuestion} accent="success" />
      </div>

      {activeTest ? (
        <QuestionManager test={activeTest} onBack={() => setActiveTest(null)} />
      ) : (
        <Tabs defaultValue="tests">
          <TabsList>
            <TabsTrigger value="tests">Mock Tests</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          <TabsContent value="tests" className="mt-4">
            <TestManager
              tests={data.tests}
              subcategories={data.subcategories}
              onManageQuestions={(t) => setActiveTest(t)}
            />
          </TabsContent>
          <TabsContent value="categories" className="mt-4">
            <CategoryManager categories={data.categories} subcategories={data.subcategories} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
