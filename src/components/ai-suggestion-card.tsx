import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Edit2, TrendingUp } from "lucide-react"

interface AISuggestionCardProps {
  title: string
  type: "title" | "field" | "description"
  current?: string
  suggested: string
  impact?: string
  fieldName?: string
  isRequired?: boolean
}

export function AISuggestionCard({
  title,
  type,
  current,
  suggested,
  impact,
  fieldName,
  isRequired,
}: AISuggestionCardProps) {
  return (
    <Card className="p-6 border-border/50 hover:border-border transition-colors">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-base mb-1">{title}</h3>
            {isRequired && (
              <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                Required for Level 10
              </Badge>
            )}
          </div>
          {impact && (
            <div className="flex items-center gap-1.5 text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="font-medium">{impact}</span>
            </div>
          )}
        </div>

        {current && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Current</p>
            <div className="bg-muted/50 rounded-lg p-4 border border-border/30">
              <p className="text-sm text-foreground/80">{current}</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {fieldName ? `AI Suggested: ${fieldName}` : "AI Suggested"}
          </p>
          <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
            <p className="text-sm text-foreground font-medium">{suggested}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
            <Check className="h-4 w-4 mr-1.5" />
            Approve
          </Button>
          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
            <X className="h-4 w-4 mr-1.5" />
            Reject
          </Button>
          {type === "title" && (
            <Button size="sm" variant="ghost">
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
