import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, ExternalLink, TrendingUp } from "lucide-react"
import Link from "next/link"

interface ApprovalCardProps {
  id: string
  productId: string
  productName: string
  priority: "high" | "medium" | "low"
  changeType: "title" | "field" | "description"
  current?: string
  suggested: string
  impact: string
  confidence: number
  fieldName?: string
}

export function ApprovalCard({
  id,
  productId,
  productName,
  priority,
  changeType,
  current,
  suggested,
  impact,
  confidence,
  fieldName,
}: ApprovalCardProps) {
  const priorityConfig = {
    high: {
      label: "HIGH PRIORITY",
      className: "bg-red-50 text-red-700 border-red-200",
    },
    medium: {
      label: "MEDIUM",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    low: {
      label: "LOW",
      className: "bg-slate-50 text-slate-600 border-slate-200",
    },
  }

  const changeTypeLabels = {
    title: "Title Optimization",
    field: fieldName ? `Missing Field: ${fieldName}` : "Field Addition",
    description: "Description Enhancement",
  }

  return (
    <Card className="p-6 border-border/50 hover:border-border transition-colors">
      <div className="space-y-4">
        {/* Header with priority and product name */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={priorityConfig[priority].className}>
              {priorityConfig[priority].label}
            </Badge>
            <span className="text-slate-400">•</span>
            <h3 className="font-semibold text-base">{productName}</h3>
          </div>
          <Link href={`/products/${productId}`}>
            <Button variant="ghost" size="sm" className="text-xs">
              View Product
              <ExternalLink className="h-3 w-3 ml-1.5" />
            </Button>
          </Link>
        </div>

        <div className="h-px bg-border/50" />

        {/* Change type */}
        <div>
          <p className="text-sm font-medium text-foreground mb-3">{changeTypeLabels[changeType]}</p>

          {/* Before/After or Suggested content */}
          {current ? (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Current:</span> {current}
              </div>
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border/30" />
                <span className="text-xs text-muted-foreground">→</span>
                <div className="h-px flex-1 bg-border/30" />
              </div>
              <div className="bg-violet-50 rounded-lg p-3 border border-violet-200">
                <p className="text-sm text-foreground font-medium">{suggested}</p>
              </div>
            </div>
          ) : (
            <div className="bg-violet-50 rounded-lg p-3 border border-violet-200">
              <p className="text-sm text-muted-foreground mb-1">AI Suggested:</p>
              <p className="text-sm text-foreground font-medium">{suggested}</p>
            </div>
          )}
        </div>

        {/* Impact and confidence metrics */}
        <div className="flex items-center gap-6 pt-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <div>
              <p className="text-xs text-muted-foreground">Impact</p>
              <p className="text-sm font-semibold text-foreground">{impact}</p>
            </div>
          </div>
          <div className="h-8 w-px bg-border/50" />
          <div>
            <p className="text-xs text-muted-foreground">Confidence</p>
            <p className="text-sm font-semibold text-foreground">{confidence}%</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-2">
          <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
            <Check className="h-4 w-4 mr-1.5" />
            Approve
          </Button>
          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
            <X className="h-4 w-4 mr-1.5" />
            Reject
          </Button>
        </div>
      </div>
    </Card>
  )
}
