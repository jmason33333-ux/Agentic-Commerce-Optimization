import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ComplianceIndicator } from "@/components/compliance-indicator"
import { ComplianceCategoryCard } from "@/components/compliance-category-card"
import { ChevronLeft, AlertTriangle, FileText, Download } from "lucide-react"

export default function ProductCompliancePage() {
  // Mock product data
  const product = {
    id: "1",
    name: "Nike Air Max 90",
    complianceLevel: 9,
  }

  return (
    <div className="min-h-screen bg-warm-bg">
      {/* Header with breadcrumb */}
      <div className="border-b border-border/50 bg-white sticky top-0 z-10">
        <div className="w-full max-w-[1920px] mx-auto px-8 py-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
            <Link href="/products" className="hover:text-foreground transition-colors">
              Products
            </Link>
            <span>/</span>
            <Link href={`/products/${product.id}`} className="hover:text-foreground transition-colors">
              {product.name}
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Compliance</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/products/${product.id}`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Back to Product
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Compliance Scorecard</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <FileText className="h-4 w-4" />
                View Full Field List
              </Button>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="w-full max-w-[1920px] mx-auto px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Overall Score */}
          <Card className="p-8 border-border/50">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Overall Compliance Level</h2>
              <ComplianceIndicator level={product.complianceLevel} className="scale-110" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your product is performing excellently. You're just one field away from perfect compliance and maximum
                AI agent visibility.
              </p>
            </div>
          </Card>

          {/* What's Missing Callout */}
          <Card className="p-6 border-amber-200 bg-amber-50">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-foreground">What You're Missing to Reach Level 10</h3>
                  <p className="text-sm text-muted-foreground">Complete these fields to maximize discoverability</p>
                </div>
              </div>

              <div className="pl-13 space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span className="font-medium text-sm text-foreground">
                      video_link <span className="text-amber-600 font-normal">(Recommended)</span>
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                    Adding a product video increases conversion by ~15% in ChatGPT Shopping. Videos help AI agents
                    better understand and recommend your product.
                  </p>
                  <div className="pl-6">
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                      + Add Video URL
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Category Breakdown */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Field Completeness by Category</h2>

            <ComplianceCategoryCard
              title="Basic Data"
              completed={6}
              total={6}
              completedFields={["id", "title", "description", "link", "gtin", "mpn"]}
            />

            <ComplianceCategoryCard
              title="Item Info"
              completed={8}
              total={9}
              completedFields={[
                "brand",
                "category",
                "material",
                "weight",
                "condition",
                "dimensions",
                "color",
                "gender",
              ]}
              missingFields={[{ name: "age_group" }]}
            />

            <ComplianceCategoryCard
              title="Media"
              completed={4}
              total={5}
              completedFields={["image_link", "additional_image_link (4 images)"]}
              missingFields={[{ name: "video_link", recommended: true }]}
              notProvidedFields={["model_3d_link"]}
            />

            <ComplianceCategoryCard
              title="Social Proof"
              completed={3}
              total={3}
              completedFields={[
                "product_review_count (254)",
                "product_review_rating (4.6/5)",
                "popularity_score (4.7/5)",
              ]}
            />

            <ComplianceCategoryCard
              title="Pricing & Availability"
              completed={5}
              total={5}
              completedFields={["price", "availability", "inventory_count", "sale_price", "sale_price_effective_date"]}
            />

            <ComplianceCategoryCard
              title="Shipping"
              completed={4}
              total={4}
              completedFields={["shipping_weight", "shipping_length", "shipping_width", "shipping_height"]}
            />
          </div>

          {/* Bottom Actions */}
          <Card className="p-6 border-border/50 bg-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base mb-1">Need Help Improving Compliance?</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI can automatically suggest optimizations for missing fields
                </p>
              </div>
              <Button size="lg" className="bg-violet-600 hover:bg-violet-700">
                Generate AI Suggestions
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
