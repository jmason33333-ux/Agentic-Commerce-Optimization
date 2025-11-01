import { ProductDetailHeader } from "@/components/product-detail-header"
import { ComplianceIndicator } from "@/components/compliance-indicator"
import { AISuggestionCard } from "@/components/ai-suggestion-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Sparkles, Check, X } from "lucide-react"
import Image from "next/image"

export default function ProductDetailPage() {
  // Mock product data
  const product = {
    id: "1",
    name: "Nike Air Max 90",
    price: 89.99,
    stock: "In Stock",
    stockCount: 25,
    complianceLevel: 9,
    image: "/nike-air-max-90-shoe.jpg",
    pendingSuggestions: 3,
  }

  return (
    <div className="min-h-screen bg-warm-bg">
      <ProductDetailHeader productName={product.name} productId={product.id} />

      <main className="w-full max-w-[1920px] mx-auto px-8 py-8">
        {/* Product Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <Card className="p-6 border-border/50">
            <div className="aspect-square relative rounded-lg overflow-hidden bg-muted/30">
              <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
            </div>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-3 tracking-tight">{product.name}</h1>
              <div className="flex items-center gap-4 text-lg">
                <span className="font-semibold text-foreground">${product.price}</span>
                <span className="text-muted-foreground">•</span>
                <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                  {product.stock} ({product.stockCount} units)
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Compliance Level</p>
              <ComplianceIndicator level={product.complianceLevel} showLabel />
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">What this means:</span> Your product is nearly perfect for
                AI agent discovery. Just one more optimization to reach Level 10 and maximize visibility across all AI
                shopping assistants.
              </p>
            </div>
          </div>
        </div>

        {/* AI Suggestions Section */}
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-violet-50 to-cyan-50 border-violet-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-violet-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  AI Suggestions ({product.pendingSuggestions} pending approval)
                </h2>
                <p className="text-sm text-muted-foreground">
                  Review and approve AI-generated optimizations to improve product discoverability
                </p>
              </div>
            </div>
          </Card>

          {/* Suggestion Cards */}
          <div className="space-y-6">
            <AISuggestionCard
              title="1. Title Optimization"
              type="title"
              current="Nike Air Max 90"
              suggested="Nike Air Max 90 Running Shoes - Waterproof Black/Gray - Men's Size 10"
              impact="+15% discoverability"
            />

            <AISuggestionCard
              title="2. Missing Fields (5)"
              type="field"
              fieldName="material"
              suggested="Synthetic Leather, Rubber Sole"
              isRequired
            />

            <AISuggestionCard
              title="3. Missing Fields (5)"
              type="field"
              fieldName="weight"
              suggested="1.2 lb"
              isRequired
            />

            <AISuggestionCard
              title="4. Description Enhancement"
              type="description"
              current="Classic Nike Air Max 90 sneakers with iconic design."
              suggested="Experience legendary comfort with the Nike Air Max 90 Running Shoes. Featuring waterproof synthetic leather construction, visible Air cushioning, and durable rubber outsole. Perfect for daily runs or casual wear. Available in sleek black/gray colorway."
              impact="+22% engagement"
            />

            <AISuggestionCard
              title="5. Missing Fields (5)"
              type="field"
              fieldName="care_instructions"
              suggested="Wipe clean with damp cloth. Air dry away from direct heat."
              isRequired
            />
          </div>

          {/* Bulk Actions */}
          <Card className="p-6 border-border/50 bg-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base mb-1">Bulk Actions</h3>
                <p className="text-sm text-muted-foreground">
                  Apply all suggestions at once to reach Level 10 compliance
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="lg">
                  <X className="h-4 w-4 mr-2" />
                  Reject All
                </Button>
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                  <Check className="h-4 w-4 mr-2" />
                  Approve All
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
