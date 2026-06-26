"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const EXAM_SUBJECTS: Record<string, string[]> = {
  "UPSC Civil Services": [
    "History",
    "Geography",
    "Polity",
    "Economy",
    "Science & Tech",
    "Environment",
    "Current Affairs",
    "CSAT",
  ],
  "SSC CGL": ["Quantitative Aptitude", "Reasoning", "English", "General Awareness"],
  "SSC CHSL": ["Quantitative Aptitude", "Reasoning", "English", "General Awareness"],
  "IBPS PO": [
    "Quantitative Aptitude",
    "Reasoning",
    "English",
    "General Awareness",
    "Computer",
  ],
  "SBI PO": [
    "Quantitative Aptitude",
    "Reasoning",
    "English",
    "General Awareness",
    "Computer",
  ],
  "Railway NTPC": ["Quantitative Aptitude", "Reasoning", "English", "General Awareness"],
  "State PSC": ["Quantitative Aptitude", "Reasoning", "English", "General Awareness"],
}

type StrengthLevel = "weak" | "average" | "strong"

interface SubjectStrength {
  subjectName: string
  strengthLevel: StrengthLevel | null
}

interface SubjectMapperProps {
  examGoal?: string
}

export function SubjectMapper({ examGoal = "" }: SubjectMapperProps) {
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string>("")
  const [subjects, setSubjects] = useState<SubjectStrength[]>([])
  const [selectedExam, setSelectedExam] = useState(examGoal)

  // Load user and subjects
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        
        if (!user) return
        
        setUserId(user.id)
        
        // If examGoal not provided, fetch from profile
        if (!selectedExam) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("exam_goal")
            .eq("id", user.id)
            .single()
          
          if (profile?.exam_goal) {
            setSelectedExam(profile.exam_goal)
          }
        }
        
        // Load existing strengths
        const { data: strengths, error: strengthsError } = await supabase
          .from("user_subject_strengths")
          .select("*")
          .eq("user_id", user.id)
          .eq("exam_goal", selectedExam || examGoal)
        
        if (strengthsError) {
          console.error("Error loading strengths:", strengthsError)
        }
        
        // Initialize subjects
        const subjectsToDisplay = selectedExam 
          ? EXAM_SUBJECTS[selectedExam] || []
          : examGoal 
          ? EXAM_SUBJECTS[examGoal] || []
          : []
        
        const subjectsMap = new Map<string, StrengthLevel | null>()
        subjectsToDisplay.forEach((subject) => {
          subjectsMap.set(subject, null)
        })
        
        // Fill in existing strengths
        if (strengths && strengths.length > 0) {
          strengths.forEach((strength) => {
            if (subjectsMap.has(strength.subject_name)) {
              subjectsMap.set(strength.subject_name, strength.strength_level as StrengthLevel)
            }
          })
        }
        
        setSubjects(
          subjectsToDisplay.map((subject) => ({
            subjectName: subject,
            strengthLevel: subjectsMap.get(subject) || null,
          }))
        )
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [supabase, examGoal, selectedExam])

  // Update subject strength
  function updateSubjectStrength(subjectName: string, level: StrengthLevel | null) {
    setSubjects((prev) =>
      prev.map((subject) =>
        subject.subjectName === subjectName
          ? { ...subject, strengthLevel: level }
          : subject
      )
    )
  }

  // Save all strengths
  async function handleSave() {
    if (!userId || !selectedExam) {
      toast.error("Please select an exam goal")
      return
    }
    
    setSaving(true)
    try {
      // First, delete existing entries for this exam goal
      await supabase
        .from("user_subject_strengths")
        .delete()
        .eq("user_id", userId)
        .eq("exam_goal", selectedExam)
      
      // Insert new entries
      const dataToInsert = subjects
        .filter((subject) => subject.strengthLevel !== null)
        .map((subject) => ({
          user_id: userId,
          exam_goal: selectedExam,
          subject_name: subject.subjectName,
          strength_level: subject.strengthLevel,
        }))
      
      if (dataToInsert.length > 0) {
        const { error } = await supabase
          .from("user_subject_strengths")
          .insert(dataToInsert)
        
        if (error) {
          toast.error("Failed to save subject strengths")
          console.error("Error:", error)
          return
        }
      }
      
      toast.success("Subject strengths saved successfully")
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Failed to save subject strengths")
    } finally {
      setSaving(false)
    }
  }

  const examDisplay = selectedExam || examGoal
  const currentSubjects = examDisplay ? EXAM_SUBJECTS[examDisplay] : []

  if (loading) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Subject Strength Mapper</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  if (!examDisplay || currentSubjects.length === 0) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Subject Strength Mapper</CardTitle>
          <CardDescription>
            Please save your profile with an exam goal first
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No exam goal selected</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>Subject Strength Mapper</CardTitle>
        <CardDescription>
          Rate your strength in each subject for {examDisplay}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          {subjects.map((subject) => (
            <div key={subject.subjectName} className="flex flex-col gap-2">
              <p className="font-medium text-foreground">{subject.subjectName}</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={
                    subject.strengthLevel === "weak" ? "default" : "outline"
                  }
                  className={
                    subject.strengthLevel === "weak"
                      ? "bg-destructive hover:bg-destructive/90"
                      : ""
                  }
                  onClick={() =>
                    updateSubjectStrength(
                      subject.subjectName,
                      subject.strengthLevel === "weak" ? null : "weak"
                    )
                  }
                >
                  Weak
                </Button>
                <Button
                  type="button"
                  variant={
                    subject.strengthLevel === "average" ? "default" : "outline"
                  }
                  className={
                    subject.strengthLevel === "average"
                      ? "bg-warning hover:bg-warning/90"
                      : ""
                  }
                  onClick={() =>
                    updateSubjectStrength(
                      subject.subjectName,
                      subject.strengthLevel === "average" ? null : "average"
                    )
                  }
                >
                  Average
                </Button>
                <Button
                  type="button"
                  variant={
                    subject.strengthLevel === "strong" ? "default" : "outline"
                  }
                  className={
                    subject.strengthLevel === "strong"
                      ? "bg-success hover:bg-success/90"
                      : ""
                  }
                  onClick={() =>
                    updateSubjectStrength(
                      subject.subjectName,
                      subject.strengthLevel === "strong" ? null : "strong"
                    )
                  }
                >
                  Strong
                </Button>
              </div>
            </div>
          ))}

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Subject Strengths
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
