"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronLeft, Zap } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Category, Subcategory, MockTest } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

type Step = "category" | "subcategory" | "test"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } },
  hover: { y: -4, transition: { duration: 0.2 } },
}

export function CascadingExamSelector() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [step, setStep] = useState<Step>("category")
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [tests, setTests] = useState<MockTest[]>([])

  // Load categories on mount
  useEffect(() => {
    async function load() {
      const { data: cats, error: catErr } = await supabase
        .from("categories")
        .select("*")
        .order("name")

      if (!catErr && cats) {
        setCategories(cats)
      }
      setLoading(false)
    }

    load()
  }, [supabase])

  // Load subcategories when category selected
  useEffect(() => {
    if (!selectedCategory) return

    async function load() {
      const { data: subs, error: subErr } = await supabase
        .from("subcategories")
        .select("*")
        .eq("category_id", selectedCategory?.id ?? "")
        .order("name")

      if (!subErr && subs) {
        setSubcategories(subs)
      }
    }

    load()
  }, [selectedCategory, supabase])

  // Load tests when subcategory selected
  useEffect(() => {
    if (!selectedSubcategory) return

    async function load() {
      const { data: tst, error: tstErr } = await supabase
        .from("mock_tests")
        .select("*")
        .eq("subcategory_id", selectedSubcategory?.id ?? "")
        .eq("is_published", true)
        .order("created_at")

      if (!tstErr && tst) {
        setTests(tst)
      }
    }

    load()
  }, [selectedSubcategory, supabase])

  const handleSelectCategory = (cat: Category) => {
    setSelectedCategory(cat)
    setSelectedSubcategory(null)
    setStep("subcategory")
  }

  const handleSelectSubcategory = (sub: Subcategory) => {
    setSelectedSubcategory(sub)
    setStep("test")
  }

  const handleBackStep = () => {
    if (step === "test") {
      setStep("subcategory")
      setSelectedSubcategory(null)
    } else if (step === "subcategory") {
      setStep("category")
      setSelectedCategory(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-purple-50 to-pink-50 dark:from-background dark:via-purple-950 dark:to-pink-950">
        <div className="glass flex flex-col items-center gap-4 p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading exams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50 to-pink-50 dark:from-background dark:via-purple-950 dark:to-pink-950 px-4 py-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-balance">
                {step === "category" && "Choose Your Exam"}
                {step === "subcategory" && `${selectedCategory?.name}`}
                {step === "test" && `${selectedSubcategory?.name} Tests`}
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                {step === "category" && "Select an exam category to begin"}
                {step === "subcategory" && "Pick your target exam"}
                {step === "test" && "Choose a mock test"}
              </p>
            </div>
            {step !== "category" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackStep}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            )}
          </div>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          {step === "category" && selectedCategory == null &&
            categories.map((cat) => {
              const subCount = subcategories?.filter(s => s.category_id === cat.id).length ?? 0
              return (
                <motion.button
                  key={cat.id}
                  variants={cardVariants}
                  whileHover="hover"
                  onClick={() => handleSelectCategory(cat)}
                  className="glass group relative overflow-hidden rounded-2xl p-6 text-left transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative z-10">
                    <div className="mb-4 inline-flex rounded-full bg-primary/20 px-3 py-1">
                      <span className="text-xs font-semibold text-primary">Exam Series</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{cat.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {subCount} exam tracks
                    </p>
                  </div>
                </motion.button>
              )
            })}

          {step === "subcategory" && selectedCategory != null &&
            subcategories.map((sub) => (
              <motion.button
                key={sub.id}
                variants={cardVariants}
                whileHover="hover"
                onClick={() => handleSelectSubcategory(sub)}
                className="glass group relative overflow-hidden rounded-2xl p-6 text-left transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="mb-4 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-accent" />
                    <span className="text-xs font-semibold text-accent">Professional Track</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{sub.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {tests.filter(t => t.subcategory_id === sub.id).length} mock tests available
                  </p>
                </div>
              </motion.button>
            ))}

          {step === "test" && selectedSubcategory != null &&
            tests.map((tst) => {
              const qCount = tst.question_count ?? 0
              return (
                <motion.div
                  key={tst.id}
                  variants={cardVariants}
                  className="glass group relative overflow-hidden rounded-2xl p-6"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-accent/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <Link href={`/exam/${tst.id}`} className="relative z-10 block">
                    <div className="mb-4 flex items-center justify-between">
                      <Badge variant="outline">{qCount} Questions</Badge>
                      <span className="text-xs font-semibold text-accent">
                        {tst.duration_minutes || 120} min
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                      {tst.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {tst.description || "Full-length mock test"}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                      Start Test
                      <span>→</span>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
        </motion.div>

        {/* Empty state */}
        {((step === "category" && categories.length === 0) ||
          (step === "subcategory" && subcategories.length === 0) ||
          (step === "test" && tests.length === 0)) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass mt-12 rounded-2xl p-12 text-center"
          >
            <p className="text-lg text-muted-foreground">No items available. Please try again later.</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
