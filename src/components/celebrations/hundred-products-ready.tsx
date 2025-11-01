"use client"

import { Button } from "@/components/ui/button"
import { BarChart3, Share2 } from "lucide-react"
import Link from "next/link"

interface HundredProductsReadyProps {
  averageCompliance: number
  optimizedPercentage: number
  onClose: () => void
}

export function HundredProductsReady({ averageCompliance, optimizedPercentage, onClose }: HundredProductsReadyProps) {
  const handleTweet = () => {
    const text = `Just optimized 100 products for ChatGPT Shopping! 🚀 Average compliance: ${averageCompliance}/10. Ready for the AI commerce revolution.`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(url, "_blank")
  }

  return (
    <div className="text-center space-y-8">
      {/* Celebration Icon */}
      <div className="text-7xl">🚀</div>

      {/* Title */}
      <div className="space-y-3">
        <h2 className="text-3xl font-bold text-slate-900 text-balance">100 Products ChatGPT Shopping Ready!</h2>
        <p className="text-lg text-slate-600">Your catalog is in great shape</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-50 rounded-xl p-4 space-y-1">
          <div className="text-3xl">📊</div>
          <div className="text-2xl font-bold text-slate-900">{averageCompliance}/10</div>
          <div className="text-xs text-slate-600">Average compliance</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 space-y-1">
          <div className="text-3xl">✅</div>
          <div className="text-2xl font-bold text-slate-900">100</div>
          <div className="text-xs text-slate-600">Checkout enabled</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 space-y-1">
          <div className="text-3xl">🎯</div>
          <div className="text-2xl font-bold text-slate-900">{optimizedPercentage}%</div>
          <div className="text-xs text-slate-600">Catalog optimized</div>
        </div>
      </div>

      {/* Achievement */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-2">
        <p className="text-lg font-semibold text-green-900">You're ahead of 90% of merchants.</p>
        <p className="text-sm text-green-700">Next milestone: $10K in ChatGPT sales</p>
      </div>

      {/* CTAs */}
      <div className="flex items-center justify-center gap-3 pt-4">
        <Link href="/">
          <Button variant="outline" size="lg" className="gap-2 bg-transparent">
            <BarChart3 className="w-4 h-4" />
            View Dashboard
          </Button>
        </Link>
        <Button size="lg" className="gap-2 bg-violet-600 hover:bg-violet-700" onClick={handleTweet}>
          <Share2 className="w-4 h-4" />
          Tweet This
        </Button>
      </div>
    </div>
  )
}
