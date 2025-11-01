import { DashboardHeader } from "@/components/dashboard-header"
import { ApprovalCard } from "@/components/approval-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCheck, Filter } from "lucide-react"

// Mock data for pending approvals
const pendingApprovals = [
  {
    id: "1",
    productId: "nike-air-max-90",
    productName: "Nike Air Max 90",
    priority: "high" as const,
    changeType: "title" as const,
    current: "Nike Air Max 90",
    suggested: "Nike Air Max 90 Running Shoes - Waterproof Cushioned Athletic Sneakers for Men",
    impact: "+15% discoverability",
    confidence: 92,
  },
  {
    id: "2",
    productId: "adidas-ultraboost",
    productName: "Adidas UltraBoost",
    priority: "medium" as const,
    changeType: "field" as const,
    suggested: "Primeknit Fabric, Boost Foam Midsole, Continental Rubber Outsole",
    impact: "Level 7 → Level 8",
    confidence: 88,
    fieldName: "material",
  },
  {
    id: "3",
    productId: "widget-pack",
    productName: "Widget Pack",
    priority: "low" as const,
    changeType: "description" as const,
    current: "A pack of useful widgets for your home.",
    suggested:
      "Complete widget collection for modern homes. Includes 12 versatile pieces designed for organization and efficiency. Perfect for homeowners, renters, and office spaces. Durable construction with 5-year warranty. Dimensions: 10x8x6 inches. Weight capacity: 50 lbs.",
    impact: "+8% conversion",
    confidence: 75,
  },
  {
    id: "4",
    productId: "samsung-galaxy-buds",
    productName: "Samsung Galaxy Buds Pro",
    priority: "high" as const,
    changeType: "field" as const,
    suggested: "Active Noise Cancellation, 360 Audio, IPX7 Water Resistance, 8-hour battery life",
    impact: "Level 6 → Level 9",
    confidence: 94,
    fieldName: "features",
  },
  {
    id: "5",
    productId: "leather-wallet",
    productName: "Premium Leather Wallet",
    priority: "medium" as const,
    changeType: "title" as const,
    current: "Leather Wallet",
    suggested: "Premium Genuine Leather Wallet - RFID Blocking Bifold with 8 Card Slots",
    impact: "+12% click-through",
    confidence: 85,
  },
  {
    id: "6",
    productId: "yoga-mat",
    productName: "Eco Yoga Mat",
    priority: "low" as const,
    changeType: "description" as const,
    current: "Comfortable yoga mat made from eco-friendly materials.",
    suggested:
      "Premium eco-friendly yoga mat crafted from natural rubber and cork. Non-slip surface provides superior grip during hot yoga and intense workouts. 6mm thick cushioning protects joints. Biodegradable and free from harmful chemicals. Includes carrying strap. Dimensions: 72x24 inches. Perfect for yoga, pilates, and meditation.",
    impact: "+6% conversion",
    confidence: 78,
  },
  {
    id: "7",
    productId: "coffee-maker",
    productName: "Smart Coffee Maker",
    priority: "high" as const,
    changeType: "field" as const,
    suggested: "12-cup capacity, programmable timer, auto shut-off, reusable filter, WiFi enabled",
    impact: "Level 5 → Level 8",
    confidence: 91,
    fieldName: "specifications",
  },
  {
    id: "8",
    productId: "desk-lamp",
    productName: "LED Desk Lamp",
    priority: "medium" as const,
    changeType: "title" as const,
    current: "LED Desk Lamp",
    suggested: "LED Desk Lamp with USB Charging Port - Dimmable Touch Control Reading Light",
    impact: "+10% discoverability",
    confidence: 87,
  },
]

export default function ApprovalsPage() {
  const pendingCount = pendingApprovals.length

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="w-full max-w-[1920px] mx-auto px-8 py-8">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold tracking-tight">Approval Queue</h1>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Bulk Actions
              </Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <CheckCheck className="h-4 w-4 mr-2" />
                Approve All High Priority
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground text-base">
            {pendingCount} pending changes waiting for review. Approve high-impact optimizations to improve catalog
            readiness.
          </p>
        </div>

        {/* Filters and sorting */}
        <div className="flex items-center gap-3 mb-6">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="priority">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="confidence">Confidence</SelectItem>
              <SelectItem value="impact">Impact</SelectItem>
              <SelectItem value="product">Product Name</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all-types">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Change type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-types">All Types</SelectItem>
              <SelectItem value="title">Title Optimization</SelectItem>
              <SelectItem value="field">Missing Fields</SelectItem>
              <SelectItem value="description">Description</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Approval cards */}
        <div className="space-y-4">
          {pendingApprovals.map((approval) => (
            <ApprovalCard key={approval.id} {...approval} />
          ))}
        </div>

        {/* Empty state would go here if no approvals */}
        {pendingApprovals.length === 0 && (
          <div className="text-center py-16">
            <CheckCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
            <p className="text-muted-foreground">No pending approvals at the moment.</p>
          </div>
        )}
      </main>
    </div>
  )
}
