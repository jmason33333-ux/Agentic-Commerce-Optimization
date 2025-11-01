import { DashboardHeader } from "@/components/dashboard-header"
import { SettingsSidebar } from "@/components/settings-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { CheckCircle2, RefreshCw, Unplug, Clock, Package } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-warm-bg">
      <DashboardHeader />

      <div className="flex">
        <SettingsSidebar />

        <main className="flex-1 p-8 w-full max-w-[1920px] mx-auto">
          <div className="mx-auto max-w-4xl space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-balance">Settings</h1>
              <p className="mt-2 text-muted-foreground text-pretty">
                Manage your Shopify integration and catalog sync preferences
              </p>
            </div>

            {/* Shopify Integration Status */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="space-y-1 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Shopify Integration</CardTitle>
                  <Badge variant="outline" className="gap-1.5 border-green-200 bg-green-50 text-green-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Connected
                  </Badge>
                </div>
                <CardDescription>Your store is connected and syncing automatically</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border border-border/40 bg-muted/30 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Store URL</p>
                      <p className="text-sm text-muted-foreground mt-0.5">mystore.myshopify.com</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                      Active
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Last sync</p>
                        <p className="text-sm font-medium">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Products synced</p>
                        <p className="text-sm font-medium">247 products</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <RefreshCw className="h-4 w-4" />
                    Sync Now
                  </Button>
                  <Button variant="outline" className="gap-2 text-destructive hover:text-destructive bg-transparent">
                    <Unplug className="h-4 w-4" />
                    Disconnect
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Auto-Sync Settings */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl">Auto-Sync Settings</CardTitle>
                <CardDescription>Configure how and when your catalog syncs with Shopify</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-5">
                  <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-sync" className="text-sm font-medium">
                        Enable auto-sync
                      </Label>
                      <p className="text-xs text-muted-foreground">Automatically sync changes every 15 minutes</p>
                    </div>
                    <Switch id="auto-sync" defaultChecked />
                  </div>

                  <div className="space-y-3 pl-4">
                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <Label htmlFor="sync-inventory" className="text-sm font-medium">
                          Sync inventory changes
                        </Label>
                        <p className="text-xs text-muted-foreground">Update stock levels in real-time</p>
                      </div>
                      <Switch id="sync-inventory" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <Label htmlFor="sync-prices" className="text-sm font-medium">
                          Sync price changes
                        </Label>
                        <p className="text-xs text-muted-foreground">Keep pricing up to date automatically</p>
                      </div>
                      <Switch id="sync-prices" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <Label htmlFor="sync-new" className="text-sm font-medium">
                          Sync new products
                        </Label>
                        <p className="text-xs text-muted-foreground">Automatically add new products to catalog</p>
                      </div>
                      <Switch id="sync-new" defaultChecked />
                    </div>
                  </div>
                </div>

                <Button className="bg-primary hover:bg-primary/90">Save Changes</Button>
              </CardContent>
            </Card>

            {/* Smart Checkout Rules */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl">Smart Checkout Rules</CardTitle>
                <CardDescription>Automatically enable checkout based on product quality signals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border border-border/40 bg-muted/20 p-6">
                  <p className="text-sm font-medium mb-4">Auto-enable checkout when:</p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Inventory ≥ 5 units</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Ensures sufficient stock for AI agent recommendations
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Rating ≥ 4.0 stars</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Only recommend high-quality products to maintain trust
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">No "custom" or "preorder" tags</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Avoids products with complex fulfillment requirements
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>

                <Button variant="outline">Edit Rules</Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
