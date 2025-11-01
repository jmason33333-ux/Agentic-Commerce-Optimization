import { Button } from "@/components/ui/button"
import { ArrowRight, ExternalLink } from "lucide-react"
import Link from "next/link"

interface FirstProductOptimizedProps {
  productName: string
  productId: string
  beforeLevel: number
  afterLevel: number
  onClose: () => void
}

export function FirstProductOptimized({
  productName,
  productId,
  beforeLevel,
  afterLevel,
  onClose,
}: FirstProductOptimizedProps) {
  return (
    <div className="text-center space-y-8">
      {/* Celebration Icon */}
      <div className="text-7xl">🎉</div>

      {/* Title */}
      <div className="space-y-3">
        <h2 className="text-3xl font-bold text-slate-900 text-balance">First Product Optimized!</h2>
        <p className="text-lg text-slate-600">{productName} is now ChatGPT Shopping ready</p>
      </div>

      {/* Before/After */}
      <div className="inline-flex items-center gap-3 px-6 py-3 bg-violet-50 rounded-xl">
        <span className="text-sm font-medium text-slate-600">Before:</span>
        <span className="text-2xl font-bold text-slate-400">Level {beforeLevel}</span>
        <ArrowRight className="w-5 h-5 text-violet-600" />
        <span className="text-sm font-medium text-slate-600">After:</span>
        <span className="text-2xl font-bold text-violet-600">Level {afterLevel}</span>
      </div>

      {/* Changes Applied */}
      <div className="bg-slate-50 rounded-xl p-6 text-left space-y-3">
        <h3 className="font-semibold text-slate-900 text-center mb-4">Changes applied:</h3>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span className="text-sm text-slate-700">Optimized title for AI discoverability</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span className="text-sm text-slate-700">Added 5 missing fields</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span className="text-sm text-slate-700">Enhanced product description</span>
          </div>
        </div>
      </div>

      {/* Impact */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-center justify-center gap-2 text-amber-900">
          <span className="text-2xl">📈</span>
          <span className="font-semibold">+30% chance of appearing in relevant searches</span>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex items-center justify-center gap-3 pt-4">
        <Link href={`/products/${productId}`}>
          <Button variant="outline" size="lg" className="gap-2 bg-transparent">
            <ExternalLink className="w-4 h-4" />
            View Product
          </Button>
        </Link>
        <Link href="/products">
          <Button size="lg" className="gap-2 bg-violet-600 hover:bg-violet-700">
            Optimize More
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
