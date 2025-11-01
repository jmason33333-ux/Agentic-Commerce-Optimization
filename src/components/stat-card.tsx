import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: LucideIcon
  insight: string
  action?: string
}

export function StatCard({ title, value, change, changeType = "neutral", icon: Icon, insight, action }: StatCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-7">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">{title}</p>
            <div className="mt-3 flex items-baseline gap-2">
              <h3 className="text-4xl font-bold tracking-tight">{value}</h3>
              {change && (
                <span
                  className={cn(
                    "text-sm font-semibold",
                    changeType === "positive" && "text-chart-1",
                    changeType === "negative" && "text-destructive",
                    changeType === "neutral" && "text-muted-foreground",
                  )}
                >
                  {change}
                </span>
              )}
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
            <Icon className="h-6 w-6 text-primary" strokeWidth={2} />
          </div>
        </div>
        <div className="mt-5 space-y-2 border-t border-border/50 pt-4">
          <p className="text-sm text-foreground/80 leading-relaxed">{insight}</p>
          {action && <p className="text-sm font-medium text-primary">→ {action}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
