import { AlertCircle, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface PendingAction {
  title: string
  description: string
  priority: "high" | "medium" | "low"
  action: string
}

const actions: PendingAction[] = [
  {
    title: "12 Products Missing AI Descriptions",
    description: "These products lack optimized descriptions for AI shopping agents, reducing discoverability by 40%.",
    priority: "high",
    action: "Generate Descriptions",
  },
  {
    title: "Schema Markup Incomplete",
    description: "8 product pages need structured data updates to improve AI agent parsing and search visibility.",
    priority: "medium",
    action: "Update Schema",
  },
]

export function PendingActions() {
  return (
    <Card className="border-accent-foreground/20 bg-accent/30">
      <CardContent className="p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-foreground/10">
            <AlertCircle className="h-5 w-5 text-accent-foreground" strokeWidth={2} />
          </div>
          <div className="flex-1 space-y-5">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Action Required</h3>
              <p className="mt-1 text-sm text-foreground/70">
                Address these items to maximize your catalog's AI agent readiness
              </p>
            </div>
            <div className="space-y-4">
              {actions.map((action, index) => (
                <div key={index} className="flex items-start justify-between gap-4 rounded-lg bg-card p-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">{action.title}</h4>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          action.priority === "high" && "bg-destructive/10 text-destructive",
                          action.priority === "medium" && "bg-accent-foreground/10 text-accent-foreground",
                          action.priority === "low" && "bg-muted text-muted-foreground",
                        )}
                      >
                        {action.priority}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{action.description}</p>
                  </div>
                  <Button size="sm" className="shrink-0">
                    {action.action}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
