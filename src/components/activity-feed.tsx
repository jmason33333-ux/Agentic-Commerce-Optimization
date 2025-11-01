import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, TrendingUp, AlertTriangle, Sparkles } from "lucide-react"

interface Activity {
  id: string
  type: "success" | "improvement" | "warning" | "insight"
  title: string
  description: string
  impact: string
  timestamp: string
}

const activities: Activity[] = [
  {
    id: "1",
    type: "success",
    title: "AI Descriptions Generated",
    description: "24 products now have optimized AI-ready descriptions",
    impact: "Expected 15% increase in AI agent conversions",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    type: "improvement",
    title: "Search Visibility Improved",
    description: "Schema markup updates deployed across catalog",
    impact: "AI agents can now parse 95% of product data",
    timestamp: "5 hours ago",
  },
  {
    id: "3",
    type: "insight",
    title: "New Optimization Opportunity",
    description: "AI agents are requesting size charts more frequently",
    impact: "Add structured size data to reduce bounce rate",
    timestamp: "1 day ago",
  },
  {
    id: "4",
    type: "warning",
    title: "Image Quality Alert",
    description: "6 products have images below AI agent quality threshold",
    impact: "May reduce product visibility in visual search",
    timestamp: "1 day ago",
  },
]

const iconMap = {
  success: CheckCircle2,
  improvement: TrendingUp,
  warning: AlertTriangle,
  insight: Sparkles,
}

const colorMap = {
  success: "text-chart-1",
  improvement: "text-chart-4",
  warning: "text-accent-foreground",
  insight: "text-primary",
}

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold tracking-tight">Recent Activity</CardTitle>
        <p className="text-sm text-muted-foreground">Track optimization progress and actionable insights</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const Icon = iconMap[activity.type]
          return (
            <div
              key={activity.id}
              className="flex gap-4 rounded-lg border border-border/50 p-4 transition-colors hover:bg-muted/30"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary ${colorMap[activity.type]}`}
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-sm leading-tight">{activity.title}</h4>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.timestamp}</span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{activity.description}</p>
                <div className="flex items-center gap-2 pt-1">
                  <Badge variant="secondary" className="text-xs font-medium">
                    Impact: {activity.impact}
                  </Badge>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
