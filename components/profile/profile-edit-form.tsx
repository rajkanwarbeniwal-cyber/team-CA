"use client"

import { useRef, useState, useTransition } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { updateProfile, uploadAvatar } from "@/app/actions/update-profile"
import type { Profile } from "@/lib/types"

const EXAM_GOALS = [
  "UPSC CSE",
  "UPSC CDS",
  "UPSC CAPF",
  "SSC CGL",
  "SSC CHSL",
  "SSC MTS",
  "SSC CPO",
  "IBPS PO",
  "IBPS Clerk",
  "SBI PO",
  "SBI Clerk",
  "RBI Grade B",
  "RRB NTPC",
  "RRB Group D",
  "NDA",
  "State PCS",
  "State Police",
  "Other",
]

const ATTEMPT_OPTIONS = [
  "1st Attempt",
  "2nd Attempt",
  "3rd Attempt",
  "4th Attempt",
  "5th or more",
]

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Other",
]

const CURRENT_YEAR = new Date().getFullYear()
const TARGET_YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR + i)

interface ProfileEditFormProps {
  profile: Profile
  email: string
}

export function ProfileEditForm({ profile, email }: ProfileEditFormProps) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url)
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")
  const [saveMessage, setSaveMessage] = useState("")

  // Form state mirrors the profile fields
  const [fullName, setFullName] = useState(profile.full_name ?? "")
  const [examGoal, setExamGoal] = useState(profile.exam_goal ?? "")
  const [targetYear, setTargetYear] = useState(profile.target_year?.toString() ?? "")
  const [attemptNumber, setAttemptNumber] = useState(profile.attempt_number ?? "")
  const [targetState, setTargetState] = useState(profile.target_state ?? "")

  const initials = (profile.full_name ?? "S")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)
    setIsUploadingAvatar(true)

    const formData = new FormData()
    formData.append("avatar", file)

    const result = await uploadAvatar(formData)
    setIsUploadingAvatar(false)

    if (result.success && result.avatarUrl) {
      setAvatarPreview(result.avatarUrl)
      queryClient.invalidateQueries({ queryKey: ["profile"] })
    } else {
      // Revert preview on error
      setAvatarPreview(profile.avatar_url)
      setSaveStatus("error")
      setSaveMessage(result.error ?? "Failed to upload photo")
      setTimeout(() => setSaveStatus("idle"), 3000)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaveStatus("idle")

    startTransition(async () => {
      const result = await updateProfile({
        full_name: fullName,
        exam_goal: examGoal,
        target_year: targetYear ? Number(targetYear) : null,
        attempt_number: attemptNumber,
        target_state: targetState,
      })

      if (result.success) {
        setSaveStatus("success")
        setSaveMessage("Profile updated successfully")
        queryClient.invalidateQueries({ queryKey: ["profile"] })
      } else {
        setSaveStatus("error")
        setSaveMessage(result.error ?? "Failed to update profile")
      }

      setTimeout(() => setSaveStatus("idle"), 3000)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Avatar Upload */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="relative shrink-0">
          <Avatar className="h-24 w-24 border-4 border-border">
            <AvatarImage src={avatarPreview ?? undefined} alt={profile.full_name ?? "Profile photo"} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-opacity hover:opacity-90 disabled:opacity-50"
            aria-label="Change profile photo"
          >
            {isUploadingAvatar
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Camera className="h-4 w-4" />
            }
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleAvatarChange}
            aria-label="Upload profile photo"
          />
        </div>
        <div>
          <p className="font-semibold text-foreground">{profile.full_name ?? "Student"}</p>
          <p className="text-sm text-muted-foreground">{email}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            JPG, PNG or WebP. Max 2 MB.
          </p>
        </div>
      </div>

      {/* Personal Info */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Personal Information
        </legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Full Name <span className="text-destructive">*</span></Label>
            <Input
              id="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
              maxLength={100}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              value={email}
              disabled
              className="cursor-not-allowed opacity-60"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
          </div>
        </div>
      </fieldset>

      {/* Exam Preparation Details */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Exam Preparation
        </legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="exam_goal">Target Exam</Label>
            <Select value={examGoal} onValueChange={(v) => v && setExamGoal(v)}>
              <SelectTrigger id="exam_goal">
                <SelectValue placeholder="Select your target exam" />
              </SelectTrigger>
              <SelectContent>
                {EXAM_GOALS.map((goal) => (
                  <SelectItem key={goal} value={goal}>{goal}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="attempt_number">Attempt Number</Label>
            <Select value={attemptNumber} onValueChange={(v) => v && setAttemptNumber(v)}>
              <SelectTrigger id="attempt_number">
                <SelectValue placeholder="Which attempt is this?" />
              </SelectTrigger>
              <SelectContent>
                {ATTEMPT_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="target_year">Target Year</Label>
            <Select value={targetYear} onValueChange={(v) => v && setTargetYear(v)}>
              <SelectTrigger id="target_year">
                <SelectValue placeholder="Which year are you targeting?" />
              </SelectTrigger>
              <SelectContent>
                {TARGET_YEARS.map((yr) => (
                  <SelectItem key={yr} value={yr.toString()}>{yr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="target_state">Home State</Label>
            <Select value={targetState} onValueChange={(v) => v && setTargetState(v)}>
              <SelectTrigger id="target_state">
                <SelectValue placeholder="Select your state" />
              </SelectTrigger>
              <SelectContent>
                {INDIAN_STATES.map((state) => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </fieldset>

      {/* Status Message */}
      {saveStatus !== "idle" && (
        <div
          className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${
            saveStatus === "success"
              ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
          role="alert"
        >
          {saveStatus === "success"
            ? <CheckCircle className="h-4 w-4 shrink-0" />
            : <AlertCircle className="h-4 w-4 shrink-0" />
          }
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} className="min-w-32">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
