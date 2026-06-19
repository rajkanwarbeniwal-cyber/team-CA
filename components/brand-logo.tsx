import { GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"

export function BrandLogo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <GraduationCap className="h-5 w-5" />
      </span>
      {showText && <span className="text-lg font-semibold tracking-tight">ExamForge</span>}
    </div>
  )
}
