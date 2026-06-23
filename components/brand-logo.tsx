import Image from "next/image"
import { cn } from "@/lib/utils"

export function BrandLogo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="/taksha-icon.png"
        alt="Taksha logo"
        width={36}
        height={36}
        className="h-9 w-9 rounded-full object-cover"
        priority
      />
      {showText && <span className="text-lg font-semibold tracking-tight">Taksha</span>}
    </div>
  )
}
