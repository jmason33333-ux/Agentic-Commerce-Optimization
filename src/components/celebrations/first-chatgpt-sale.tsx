"use client"

import { Button } from "@/components/ui/button"
import { BarChart3, Share2 } from "lucide-react"
import Link from "next/link"

interface FirstChatGPTSaleProps {
  productName: string
  price: string
  onClose: () => void
}

export function FirstChatGPTSale({ productName, price, onClose }: FirstChatGPTSaleProps) {
  const handleShare = () => {
    const text = `Just made my first sale through ChatGPT Shopping! 🎊 The future of commerce is here.`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(url, "_blank")
  }

  return (
    <div className="text-center space-y-8">
      {/* Celebration Icon */}
      <div className="text-7xl">🎊💰</div>

      {/* Title */}
      <div className="space-y-3">
        <h2 className="text-3xl font-bold text-slate-900 text-balance">You Made Your First ChatGPT Sale!</h2>
        <div className="space-y-1">
          <p className="text-xl font-semibold text-slate-700">{productName}</p>
          <p className="text-2xl font-bold text-green-600">{price}</p>
          <p className="text-sm text-slate-500">Sold via ChatGPT Shopping</p>
        </div>
      </div>

      {/* What's Working */}
      <div className="bg-slate-50 rounded-xl p-6 text-left space-y-4">
        <h3 className="font-semibold text-slate-900 text-center">This is the beginning! Here's what's working:</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span className="text-sm text-slate-700">Product ranked in top 3 for "waterproof shoes"</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span className="text-sm text-slate-700">All required fields completed</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span className="text-sm text-slate-700">4.6 star rating displayed</span>
          </div>
        </div>
      </div>

      {/* Encouragement */}
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
        <p className="text-violet-900 font-medium">Keep optimizing to drive more sales from ChatGPT.</p>
      </div>

      {/* CTAs */}
      <div className="flex items-center justify-center gap-3 pt-4">
        <Link href="/analytics">
          <Button variant="outline" size="lg" className="gap-2 bg-transparent">
            <BarChart3 className="w-4 h-4" />
            View Analytics
          </Button>
        </Link>
        <Button size="lg" className="gap-2 bg-violet-600 hover:bg-violet-700" onClick={handleShare}>
          <Share2 className="w-4 h-4" />
          Share Success
        </Button>
      </div>
    </div>
  )
}
