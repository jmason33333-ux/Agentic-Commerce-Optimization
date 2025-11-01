import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ProductStatusBadgeProps {
  status: "ready" | "pending" | "missing"
  count?: number
  className?: string
}

export function ProductStatusBadge({ status, count, className }: ProductStatusBadgeProps) {
  const config = {
    ready: {
      label: "Ready",
      description: "Fully optimized",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
    },
    pending: {
      label: "Pending",
      description: count ? `${count} items need attention` : "Needs review",
      className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
    },
    missing: {
      label: "Missing",
      description: count ? `${count} critical fields` : "Action required",
      className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
    },
  }

  const { label, description, className: statusClassName } = config[status]

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <Badge variant="outline" className={cn("w-fit font-medium", statusClassName)}>
        {label}
      </Badge>
      <span className="text-xs text-muted-foreground">{description}</span>
    </div>
  )
}
