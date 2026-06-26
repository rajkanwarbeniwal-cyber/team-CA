"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Upload } from "lucide-react"

const EXAM_GOALS = [
  "UPSC Civil Services",
  "SSC CGL",
  "SSC CHSL",
  "IBPS PO",
  "SBI PO",
  "Railway NTPC",
  "State PSC",
]

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
]

const ATTEMPT_NUMBERS = ["1st", "2nd", "3rd", "4th+"]
const TARGET_YEARS = ["2025", "2026", "2027", "2028"]

interface ProfileFormData {
  fullName: string
  examGoal: string
  targetState: string
  attemptNumber: string
  targetYear: string
  avatarUrl: string
}

export function ProfileForm() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: "",
    examGoal: "",
    targetState: "",
    attemptNumber: "",
    targetYear: "",
    avatarUrl: "",
  })
  const [userId, setUserId] = useState<string>("")

  // Load profile data on mount
  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      
      if (!user) return
      
      setUserId(user.id)
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      
      if (error && error.code !== "PGRST116") {
        console.error("Error loading profile:", error)
        return
      }
      
      if (data) {
        setFormData({
          fullName: data.full_name || "",
          examGoal: data.exam_goal || "",
          targetState: data.target_state || "",
          attemptNumber: data.attempt_number || "",
          targetYear: data.target_year?.toString() || "",
          avatarUrl: data.avatar_url || "",
        })
      }
    }
    
    loadProfile()
  }, [supabase])

  // Handle avatar upload
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    setUploading(true)
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true })
      
      if (uploadError) {
        toast.error("Failed to upload avatar")
        return
      }
      
      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName)
      
      setFormData((prev) => ({
        ...prev,
        avatarUrl: data.publicUrl,
      }))
      
      toast.success("Avatar uploaded successfully")
    } catch (error) {
      console.error("Avatar upload error:", error)
      toast.error("Failed to upload avatar")
    } finally {
      setUploading(false)
    }
  }

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name")
      return
    }
    
    if (!formData.examGoal) {
      toast.error("Please select an exam goal")
      return
    }
    
    if (formData.examGoal === "State PSC" && !formData.targetState) {
      toast.error("Please select a state")
      return
    }
    
    if (!formData.attemptNumber) {
      toast.error("Please select attempt number")
      return
    }
    
    if (!formData.targetYear) {
      toast.error("Please select target year")
      return
    }
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            id: userId,
            full_name: formData.fullName,
            exam_goal: formData.examGoal,
            target_state: formData.examGoal === "State PSC" ? formData.targetState : null,
            attempt_number: formData.attemptNumber,
            target_year: parseInt(formData.targetYear),
            avatar_url: formData.avatarUrl,
          },
          { onConflict: "id" }
        )
        .select()
      
      if (error) {
        toast.error("Failed to save profile")
        console.error("Error:", error)
        return
      }
      
      toast.success("Profile updated successfully")
      router.refresh()
    } catch (error) {
      console.error("Submit error:", error)
      toast.error("Failed to save profile")
    } finally {
      setLoading(false)
    }
  }

  const showStateSelector = formData.examGoal === "State PSC"
  const initials = formData.fullName
    ? formData.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "UP"

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Update your exam details and personal information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Avatar Upload */}
          <div className="flex flex-col gap-3">
            <Label>Profile Photo</Label>
            <div className="flex items-end gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={formData.avatarUrl} alt={formData.fullName} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    onClick={(e) => {
                      e.preventDefault()
                      e.currentTarget.parentElement?.querySelector("input")?.click()
                    }}
                    className="cursor-pointer"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Photo
                      </>
                    )}
                  </Button>
                </label>
                <p className="text-xs text-muted-foreground">
                  Max 5MB, JPG/PNG
                </p>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="Asha Verma"
              value={formData.fullName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  fullName: e.target.value,
                }))
              }
            />
          </div>

          {/* Exam Goal */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="examGoal">Exam Goal</Label>
            <Select
              value={formData.examGoal}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  examGoal: value,
                  targetState: "", // Reset state when exam changes
                }))
              }
            >
              <SelectTrigger id="examGoal">
                <SelectValue placeholder="Select exam goal" />
              </SelectTrigger>
              <SelectContent>
                {EXAM_GOALS.map((goal) => (
                  <SelectItem key={goal} value={goal}>
                    {goal}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* State Selector (conditional) */}
          {showStateSelector && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="targetState">Target State</Label>
              <Select
                value={formData.targetState}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    targetState: value,
                  }))
                }
              >
                <SelectTrigger id="targetState">
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Attempt Number */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="attemptNumber">Attempt Number</Label>
            <Select
              value={formData.attemptNumber}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  attemptNumber: value,
                }))
              }
            >
              <SelectTrigger id="attemptNumber">
                <SelectValue placeholder="Select attempt number" />
              </SelectTrigger>
              <SelectContent>
                {ATTEMPT_NUMBERS.map((num) => (
                  <SelectItem key={num} value={num}>
                    {num} Attempt
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Year */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="targetYear">Target Year</Label>
            <Select
              value={formData.targetYear}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  targetYear: value,
                }))
              }
            >
              <SelectTrigger id="targetYear">
                <SelectValue placeholder="Select target year" />
              </SelectTrigger>
              <SelectContent>
                {TARGET_YEARS.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
