import { DashboardHeader } from "@/components/dashboard-header"
import { ProductsFilters } from "@/components/products-filters"
import { ProductsTable } from "@/components/products-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, AlertCircle, CheckCircle2, Clock } from "lucide-react"

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="w-full max-w-[1920px] mx-auto px-8 py-8 space-y-8">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-balance">Product Catalog</h1>
            <p className="text-lg text-muted-foreground max-w-2xl text-pretty">
              Monitor compliance levels and optimize your products for AI agent discovery. Higher compliance means
              better visibility and conversion.
            </p>
          </div>
          <Button size="lg" className="gap-2">
            <Package className="h-5 w-5" />
            Add Product
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold">247</p>
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Active in your catalog</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-emerald-700">Ready for AI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-emerald-700">156</p>
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-xs text-emerald-700 mt-2">63% fully optimized</p>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-amber-700">Needs Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-amber-700">68</p>
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-xs text-amber-700 mt-2">Minor improvements needed</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-700">Missing Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-red-700">23</p>
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-xs text-red-700 mt-2">Critical fields required</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-amber-900">Priority Actions</CardTitle>
                <CardDescription className="text-amber-700">
                  23 products need critical data to be AI-ready. Complete these fields to improve discoverability and
                  conversion rates.
                </CardDescription>
              </div>
              <Button variant="default" className="bg-amber-600 hover:bg-amber-700">
                Review Now
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>All Products</CardTitle>
            <CardDescription>Manage your product catalog and optimize for AI agent discovery</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ProductsFilters />
            <ProductsTable />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
