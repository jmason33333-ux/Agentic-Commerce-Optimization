import { Card } from "@/components/ui/card"
import { Check, AlertTriangle, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ComplianceCategoryCardProps {
  title: string
  completed: number
  total: number
  completedFields: string[]
  missingFields?: Array<{ name: string; recommended?: boolean }>
  notProvidedFields?: string[]
}

export function ComplianceCategoryCard({
  title,
  completed,
  total,
  completedFields,
  missingFields = [],
  notProvidedFields = [],
}: ComplianceCategoryCardProps) {
  const percentage = Math.round((completed / total) * 100)
  const isComplete = completed === total

  return (
    <Card className="p-6 border-border/50 hover:border-violet-200 transition-colors">
      <div className="space-y-4">
        {/* Header with progress */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base text-foreground">
            {title} ({completed}/{total})
          </h3>
          <span
            className={cn(
              "text-sm font-medium",
              isComplete ? "text-emerald-600" : percentage >= 80 ? "text-amber-600" : "text-red-600",
            )}
          >
            {percentage}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all rounded-full",
              isComplete ? "bg-emerald-500" : percentage >= 80 ? "bg-amber-500" : "bg-red-500",
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Completed fields */}
        {completedFields.length > 0 && (
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground leading-relaxed">{completedFields.join(", ")}</p>
          </div>
        )}

        {/* Missing fields */}
        {missingFields.length > 0 && (
          <div className="space-y-2">
            {missingFields.map((field) => (
              <div key={field.name} className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Missing: {field.name}
                    {field.recommended && (
                      <span className="ml-2 text-xs text-amber-600 font-normal">(Recommended)</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Not provided fields */}
        {notProvidedFields.length > 0 && (
          <div className="flex items-start gap-2">
            <Circle className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-slate-500 leading-relaxed">Not provided: {notProvidedFields.join(", ")}</p>
          </div>
        )}
      </div>
    </Card>
  )
}
