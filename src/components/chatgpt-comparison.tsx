"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Sparkles } from "lucide-react"

interface ChatGPTComparisonProps {
  productName?: string
  beforeLevel?: number
  afterLevel?: number
}

export function ChatGPTComparison({
  productName = "Nike Air Max 90 Trail Running",
  beforeLevel = 4,
  afterLevel = 9,
}: ChatGPTComparisonProps) {
  return (
    <Card className="p-8 border-border/50">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">How Your Product Appears in ChatGPT</h2>
        <p className="text-muted-foreground">See the dramatic difference optimization makes in AI shopping results</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* BEFORE */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
              BEFORE Optimization
            </Badge>
            <span className="text-sm text-muted-foreground">Level {beforeLevel}</span>
          </div>

          <Card className="p-6 bg-muted/30 border-border/50">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="bg-background/80 rounded-lg p-3 border border-border/50">
                    <p className="text-sm text-muted-foreground mb-1">User:</p>
                    <p className="text-sm font-medium">"waterproof running shoes"</p>
                  </div>

                  <div className="bg-background/80 rounded-lg p-4 border border-border/50 space-y-3">
                    <p className="text-sm text-muted-foreground mb-2">ChatGPT: I found some options...</p>

                    <div className="space-y-2 text-sm">
                      <div className="p-2 rounded bg-muted/50">
                        <p className="font-medium">1. Adidas Ultraboost</p>
                        <p className="text-xs text-muted-foreground">$120 • In Stock</p>
                      </div>
                      <div className="p-2 rounded bg-muted/50">
                        <p className="font-medium">2. Generic Running Sneakers</p>
                        <p className="text-xs text-muted-foreground">$65 • In Stock</p>
                      </div>
                      <div className="p-2 rounded bg-muted/50">
                        <p className="font-medium">3. Brooks Ghost 15</p>
                        <p className="text-xs text-muted-foreground">$140 • In Stock</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                <X className="h-4 w-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-900">
                  <span className="font-semibold">Your product NOT shown</span> - Missing key fields and keywords
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* AFTER */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
              AFTER Optimization
            </Badge>
            <span className="text-sm text-muted-foreground">Level {afterLevel}</span>
          </div>

          <Card className="p-6 bg-gradient-to-br from-violet-50 to-cyan-50 border-violet-200">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="bg-white rounded-lg p-3 border border-violet-200">
                    <p className="text-sm text-muted-foreground mb-1">User:</p>
                    <p className="text-sm font-medium">"waterproof running shoes"</p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-violet-200 space-y-3">
                    <p className="text-sm text-muted-foreground mb-2">ChatGPT: Great! Here are top options...</p>

                    <div className="space-y-2 text-sm">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-violet-100 to-cyan-100 border-2 border-violet-400">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-semibold text-violet-900">1. {productName}</p>
                          <Badge className="bg-violet-600 text-white text-xs">Top Match</Badge>
                        </div>
                        <p className="text-xs text-violet-700 mb-2">Waterproof • Trail Running • ★★★★★ (254 reviews)</p>
                        <p className="text-sm font-medium text-violet-900">$89.99 • In Stock</p>
                      </div>
                      <div className="p-2 rounded bg-white/50 border border-border/30">
                        <p className="font-medium">2. Adidas Ultraboost</p>
                        <p className="text-xs text-muted-foreground">$120 • In Stock</p>
                      </div>
                      <div className="p-2 rounded bg-white/50 border border-border/30">
                        <p className="font-medium">3. Brooks Ghost 15</p>
                        <p className="text-xs text-muted-foreground">$140 • In Stock</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <p className="text-sm text-emerald-900">
                  <span className="font-semibold">Your product ranks #1</span> - Optimized for AI discovery
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* What Changed */}
      <Card className="p-6 bg-muted/20 border-border/50">
        <h3 className="font-semibold text-base mb-4">What Changed:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">Added "waterproof" and "trail running" to title</p>
          </div>
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">Completed 8 missing fields (material, weight, etc.)</p>
          </div>
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">Added customer reviews (4.6/5 stars, 254 reviews)</p>
          </div>
          <div className="flex items-start gap-2">
            <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Level {beforeLevel} → Level {afterLevel} in 5 minutes
            </p>
          </div>
        </div>
      </Card>
    </Card>
  )
}
