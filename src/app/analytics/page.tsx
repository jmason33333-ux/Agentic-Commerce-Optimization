import { DashboardHeader } from "@/components/dashboard-header"
import { AnalyticsKpiCard } from "@/components/analytics-kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, ShoppingCart, DollarSign, TrendingUp, ChevronDown } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

// Mock data for revenue trend
const revenueTrendData = [
  { date: "Jan 1", revenue: 120 },
  { date: "Jan 3", revenue: 180 },
  { date: "Jan 5", revenue: 240 },
  { date: "Jan 7", revenue: 320 },
  { date: "Jan 9", revenue: 380 },
  { date: "Jan 11", revenue: 450 },
  { date: "Jan 13", revenue: 420 },
  { date: "Jan 15", revenue: 380 },
  { date: "Jan 17", revenue: 340 },
  { date: "Jan 19", revenue: 280 },
  { date: "Jan 21", revenue: 220 },
  { date: "Jan 23", revenue: 180 },
  { date: "Jan 25", revenue: 240 },
  { date: "Jan 27", revenue: 320 },
  { date: "Jan 29", revenue: 400 },
  { date: "Jan 31", revenue: 480 },
]

// Mock data for top products
const topProducts = [
  { rank: 1, name: "Nike Air Max 90", sales: 28, revenue: "$2,519.72" },
  { rank: 2, name: "Adidas UltraBoost", sales: 12, revenue: "$1,438.88" },
  { rank: 3, name: "Running Socks", sales: 7, revenue: "$97.93" },
]

// Mock data for sources
const sourcesData = [
  { source: "ChatGPT Shopping", percentage: 68, value: 68 },
  { source: "Direct Referral", percentage: 22, value: 22 },
  { source: "Unknown", percentage: 10, value: 10 },
]

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-warm-bg">
      <DashboardHeader />
      <main className="w-full max-w-[1920px] mx-auto px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-balance">Analytics</h1>
            <p className="mt-2 text-muted-foreground">
              Track your ChatGPT Shopping performance and understand what's driving sales
            </p>
          </div>
          <Button variant="outline" className="gap-2 bg-transparent">
            Last 30 days
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <AnalyticsKpiCard title="Product Views" value="12.4K" change="+23%" changeType="positive" icon={Eye} />
          <AnalyticsKpiCard title="Orders" value="47" change="+12%" changeType="positive" icon={ShoppingCart} />
          <AnalyticsKpiCard title="Revenue" value="$4,280" change="+18%" changeType="positive" icon={DollarSign} />
          <AnalyticsKpiCard
            title="Conversion Rate"
            value="3.8%"
            change="+0.4%"
            changeType="positive"
            icon={TrendingUp}
          />
        </div>

        {/* Revenue Trend Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">ChatGPT Sales Trend</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Daily revenue from ChatGPT Shopping over the last 30 days
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "8px 12px",
                    }}
                    formatter={(value: number) => [`$${value}`, "Revenue"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: "#8B5CF6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 border-t border-border/50 pt-4">
              <p className="text-sm text-foreground/80 leading-relaxed">
                <span className="font-semibold text-foreground">Strong upward trend.</span> Revenue has increased 18%
                this period, with peak performance mid-month. ChatGPT Shopping is driving consistent growth.
              </p>
              <p className="text-sm font-medium text-primary mt-2">
                → Focus on maintaining product compliance to sustain this momentum
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Top Performing Products */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Top Performing Products</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Products generating the most revenue from ChatGPT Shopping
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product) => (
                  <div
                    key={product.rank}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {product.rank}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                      </div>
                    </div>
                    <p className="text-lg font-semibold">{product.revenue}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t border-border/50 pt-4">
                <p className="text-sm text-foreground/80 leading-relaxed">
                  <span className="font-semibold text-foreground">Nike Air Max 90 dominates.</span> This product
                  accounts for 59% of total revenue. Consider optimizing similar products.
                </p>
                <p className="text-sm font-medium text-primary mt-2">
                  → Review and optimize your other Nike products for similar success
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Traffic Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Traffic Sources</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Where your product views are coming from</p>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sourcesData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                      type="category"
                      dataKey="source"
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={130}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "8px 12px",
                      }}
                      formatter={(value: number) => [`${value}%`, "Traffic"]}
                    />
                    <Bar dataKey="value" fill="#8B5CF6" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {sourcesData.map((source) => (
                  <div key={source.source} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{source.source}</span>
                    <span className="text-sm font-semibold text-primary">{source.percentage}%</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t border-border/50 pt-4">
                <p className="text-sm text-foreground/80 leading-relaxed">
                  <span className="font-semibold text-foreground">ChatGPT is your primary channel.</span> 68% of traffic
                  comes from ChatGPT Shopping, validating your optimization efforts.
                </p>
                <p className="text-sm font-medium text-primary mt-2">
                  → Continue improving product compliance to maximize this high-intent traffic
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
