"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Zap, FileText, ShoppingCart, RefreshCw, Eye, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"

// Mock selected products data
const selectedProducts = [
  { id: "1", name: "Nike Air Max 90", currentLevel: 8, targetLevel: 9, fieldsToAdd: 3 },
  { id: "2", name: "Adidas UltraBoost 22", currentLevel: 7, targetLevel: 8, fieldsToAdd: 5 },
  { id: "3", name: "Running Socks (3-Pack)", currentLevel: 5, targetLevel: 7, fieldsToAdd: 8 },
  { id: "4", name: "Insulated Water Bottle", currentLevel: 6, targetLevel: 7, fieldsToAdd: 4 },
  { id: "5", name: "Yoga Mat Premium", currentLevel: 9, targetLevel: 10, fieldsToAdd: 2 },
  { id: "6", name: "Wireless Earbuds Pro", currentLevel: 7, targetLevel: 8, fieldsToAdd: 4 },
  { id: "7", name: "Fitness Tracker Watch", currentLevel: 8, targetLevel: 9, fieldsToAdd: 3 },
  { id: "8", name: "Protein Powder Vanilla", currentLevel: 6, targetLevel: 8, fieldsToAdd: 6 },
  { id: "9", name: "Resistance Bands Set", currentLevel: 5, targetLevel: 7, fieldsToAdd: 7 },
  { id: "10", name: "Foam Roller", currentLevel: 9, targetLevel: 9, fieldsToAdd: 0 },
  { id: "11", name: "Gym Bag Large", currentLevel: 7, targetLevel: 8, fieldsToAdd: 4 },
  { id: "12", name: "Jump Rope Speed", currentLevel: 6, targetLevel: 7, fieldsToAdd: 5 },
]

export default function BulkOptimizePage() {
  const [analyzing, setAnalyzing] = useState(true)
  const [progress, setProgress] = useState(0)
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedProducts.map((p) => p.id))

  // Simulate analysis progress
  useEffect(() => {
    if (analyzing && progress < 100) {
      const timer = setTimeout(() => {
        setProgress((prev) => Math.min(prev + 12.5, 100))
      }, 400)
      return () => clearTimeout(timer)
    } else if (progress >= 100) {
      setAnalyzing(false)
    }
  }, [analyzing, progress])

  const totalProducts = selectedProducts.length
  const analyzedCount = Math.floor((progress / 100) * totalProducts)
  const productsToImprove = selectedProducts.filter((p) => p.fieldsToAdd > 0).length
  const alreadyOptimized = selectedProducts.filter((p) => p.fieldsToAdd === 0).length
  const totalFields = selectedProducts.reduce((sum, p) => sum + p.fieldsToAdd, 0)

  const toggleProduct = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]))
  }

  const deselectAll = () => setSelectedIds([])
  const selectAll = () => setSelectedIds(selectedProducts.map((p) => p.id))

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="w-full max-w-[1920px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/products">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Products
                </Button>
              </Link>
              <div className="h-6 w-px bg-slate-200" />
              <h1 className="text-2xl font-semibold text-slate-900">Bulk Optimize</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-[1920px] mx-auto px-8 py-8">
        {/* Selection Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#8B5CF6]" />
              <span className="text-lg font-medium text-slate-900">Selected: {selectedIds.length} products</span>
            </div>
            {selectedIds.length > 0 && (
              <span className="text-sm text-slate-500">• {totalFields} fields to optimize</span>
            )}
          </div>
          <div className="flex gap-2">
            {selectedIds.length === totalProducts ? (
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Deselect All
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="justify-start h-auto py-4 px-4 hover:border-[#8B5CF6] hover:bg-[#F5F3FF] bg-transparent"
            >
              <div className="flex items-start gap-3 w-full">
                <Zap className="h-5 w-5 text-[#8B5CF6] mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-medium text-slate-900">Optimize Titles</div>
                  <div className="text-sm text-slate-500 font-normal">Batch improve all titles for AI readability</div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-4 px-4 hover:border-[#8B5CF6] hover:bg-[#F5F3FF] bg-transparent"
            >
              <div className="flex items-start gap-3 w-full">
                <FileText className="h-5 w-5 text-[#8B5CF6] mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-medium text-slate-900">Fill Missing Fields</div>
                  <div className="text-sm text-slate-500 font-normal">AI completes blank fields automatically</div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-4 px-4 hover:border-[#8B5CF6] hover:bg-[#F5F3FF] bg-transparent"
            >
              <div className="flex items-start gap-3 w-full">
                <ShoppingCart className="h-5 w-5 text-[#8B5CF6] mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-medium text-slate-900">Enable Checkout</div>
                  <div className="text-sm text-slate-500 font-normal">Turn on for ready products (Level 8+)</div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-4 px-4 hover:border-[#8B5CF6] hover:bg-[#F5F3FF] bg-transparent"
            >
              <div className="flex items-start gap-3 w-full">
                <RefreshCw className="h-5 w-5 text-[#8B5CF6] mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-medium text-slate-900">Sync Inventory</div>
                  <div className="text-sm text-slate-500 font-normal">Refresh stock levels from Shopify</div>
                </div>
              </div>
            </Button>
          </div>
        </Card>

        {/* AI Batch Optimization Preview */}
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">AI Batch Optimization Preview</h2>

          {analyzing ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Analyzing {totalProducts} products...</span>
                <span className="font-medium text-slate-900">
                  {analyzedCount}/{totalProducts} analyzed
                </span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Analysis complete</span>
              </div>

              <div className="bg-[#F5F3FF] rounded-lg p-6 space-y-3">
                <h3 className="font-medium text-slate-900 mb-4">Estimated Improvements:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-700">
                      <span className="font-semibold text-[#8B5CF6]">{productsToImprove} products</span> will improve by
                      Level +1 or higher
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-700">
                      <span className="font-semibold text-emerald-600">{alreadyOptimized} products</span> already
                      optimized (no changes needed)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-700">
                      <span className="font-semibold text-slate-900">{totalFields} total fields</span> will be added or
                      improved
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-700">
                      Est. completion time: <span className="font-semibold text-slate-900">2 minutes</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-900">
                  <span className="font-semibold">What this means:</span> These optimizations will make your products
                  more discoverable in ChatGPT Shopping. Higher compliance levels mean better rankings and more
                  conversions.
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Products in Batch */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Products in this batch</h2>
          <div className="space-y-2">
            {selectedProducts.map((product) => {
              const isSelected = selectedIds.includes(product.id)
              const levelChange = product.targetLevel - product.currentLevel

              return (
                <div
                  key={product.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    isSelected ? "bg-[#F5F3FF] border-[#8B5CF6]" : "bg-white border-slate-200 opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isSelected} onCheckedChange={() => toggleProduct(product.id)} />
                    <span className="font-medium text-slate-900">{product.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    {product.fieldsToAdd > 0 ? (
                      <>
                        <span className="text-slate-600">
                          L{product.currentLevel} → L{product.targetLevel}
                        </span>
                        <span className="text-[#8B5CF6] font-medium">+{product.fieldsToAdd} fields</span>
                      </>
                    ) : (
                      <span className="text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Already optimized
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-8">
          <Button variant="outline" size="lg" className="gap-2 bg-transparent">
            <Eye className="h-4 w-4" />
            Preview All Changes
          </Button>
          <Button
            size="lg"
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] gap-2"
            disabled={selectedIds.length === 0 || analyzing}
          >
            <Zap className="h-4 w-4" />
            Apply to {selectedIds.length} Selected
          </Button>
        </div>
      </div>
    </div>
  )
}
