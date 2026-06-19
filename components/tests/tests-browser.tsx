"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Clock, FileQuestion, Timer, Gauge, Search } from "lucide-react"
import { useCategoriesWithTests } from "@/lib/queries"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import type { Difficulty } from "@/lib/types"

const difficultyStyle: Record<Difficulty, string> = {
  easy: "bg-success/10 text-success border-success/20",
  medium: "bg-warning/15 text-warning border-warning/30",
  hard: "bg-destructive/10 text-destructive border-destructive/20",
}

export function TestsBrowser() {
  const { data, isLoading } = useCategoriesWithTests()
  const [activeCat, setActiveCat] = useState<string>("all")
  const [search, setSearch] = useState("")

  const subById = useMemo(() => {
    const map = new Map<string, { name: string; categoryId: string }>()
    data?.subcategories.forEach((s) => map.set(s.id, { name: s.name, categoryId: s.category_id }))
    return map
  }, [data])

  const filtered = useMemo(() => {
    if (!data) return []
    return data.tests.filter((t) => {
      const sub = subById.get(t.subcategory_id)
      const matchesCat = activeCat === "all" || sub?.categoryId === activeCat
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase())
      return matchesCat && matchesSearch
    })
  }, [data, activeCat, search, subById])

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Mock tests</h1>
        <p className="text-sm text-muted-foreground">Choose a test and start practicing under real exam conditions.</p>
      </div>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {isLoading ? (
          <Skeleton className="h-10 w-72" />
        ) : (
          <Tabs value={activeCat} onValueChange={setActiveCat}>
            <TabsList className="flex-wrap">
              <TabsTrigger value="all">All</TabsTrigger>
              {data?.categories.map((c) => (
                <TabsTrigger key={c.id} value={c.id}>
                  {c.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)
        ) : filtered.length === 0 ? (
          <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
            No tests match your filters.
          </p>
        ) : (
          filtered.map((t) => {
            const sub = subById.get(t.subcategory_id)
            const qCount = t.questions?.[0]?.count ?? 0
            return (
              <Card key={t.id} className="flex flex-col">
                <CardHeader className="gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="font-medium">
                      {sub?.name ?? "Test"}
                    </Badge>
                    <Badge variant="outline" className={difficultyStyle[t.difficulty]}>
                      <Gauge className="mr-1 size-3" /> {t.difficulty}
                    </Badge>
                  </div>
                  <h3 className="text-base font-semibold leading-snug text-foreground text-pretty">{t.title}</h3>
                </CardHeader>
                <CardContent className="flex-1">
                  {t.description && <p className="line-clamp-2 text-sm text-muted-foreground">{t.description}</p>}
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <FileQuestion className="size-3.5" /> {qCount} questions
                    </span>
                    <span className="inline-flex items-center gap-1">
                      {t.timer_mode === "total" ? <Clock className="size-3.5" /> : <Timer className="size-3.5" />}
                      {t.timer_mode === "total" ? `${t.duration_minutes} min total` : `${t.per_question_seconds}s / Q`}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full" disabled={qCount === 0}>
                    <Link href={`/tests/${t.id}`}>{qCount === 0 ? "No questions yet" : "Start test"}</Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
