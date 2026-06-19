import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  hint?: string
  accent?: "primary" | "success" | "warning"
}

const accentMap = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning",
}

export function StatCard({ label, value, icon: Icon, hint, accent = "primary" }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn("flex size-11 items-center justify-center rounded-lg", accentMap[accent])}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-semibold leading-tight text-foreground">{value}</p>
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          {hint && <p className="truncate text-xs text-muted-foreground/70">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
