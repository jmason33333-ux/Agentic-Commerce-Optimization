import { cn } from "@/lib/utils"

interface ComplianceIndicatorProps {
  level: number
  className?: string
}

export function ComplianceIndicator({ level, className }: ComplianceIndicatorProps) {
  const getColor = () => {
    if (level >= 8) return "text-emerald-500"
    if (level >= 5) return "text-amber-500"
    return "text-red-500"
  }

  const getDotColor = () => {
    if (level >= 8) return "bg-emerald-500"
    if (level >= 5) return "bg-amber-500"
    return "bg-red-500"
  }

  const getMessage = () => {
    if (level >= 8) return "Excellent. Ready for AI agents"
    if (level >= 5) return "Good. Minor improvements needed"
    return "Needs attention. Critical fields missing"
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center gap-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={cn("h-2 w-2 rounded-full transition-colors", i < level ? getDotColor() : "bg-slate-200")}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className={cn("text-sm font-semibold", getColor())}>{level}/10</span>
        <span className="text-xs text-muted-foreground hidden lg:inline">· {getMessage()}</span>
      </div>
    </div>
  )
}
