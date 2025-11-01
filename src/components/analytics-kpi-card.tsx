import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnalyticsKpiCardProps {
  title: string
  value: string
  change: string
  changeType: "positive" | "negative" | "neutral"
  icon: LucideIcon
}

export function AnalyticsKpiCard({ title, value, change, changeType, icon: Icon }: AnalyticsKpiCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary">
            <Icon className="h-5 w-5 text-primary" strokeWidth={2} />
          </div>
          <span
            className={cn(
              "text-sm font-semibold px-2.5 py-1 rounded-full",
              changeType === "positive" && "text-emerald-700 bg-emerald-50",
              changeType === "negative" && "text-red-700 bg-red-50",
              changeType === "neutral" && "text-slate-700 bg-slate-50",
            )}
          >
            {change}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
        </div>
      </CardContent>
    </Card>
  )
}
