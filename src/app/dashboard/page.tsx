"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to Agent Commerce SEO - Optimize your store for AI shopping
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg SEO Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Run your first audit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Eligible Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Connect your store
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Instant Checkout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Products ready
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Agentic Orders (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Connect your store
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">1. Create a Workspace</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Set up a workspace for your Shopify or Etsy store
            </p>
            <Button>Create Workspace</Button>
          </div>

          <div>
            <h3 className="font-semibold mb-2">2. Connect Your Store</h3>
            <p className="text-sm text-muted-foreground">
              Connect your Shopify store using an API access token
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">3. Run an Audit</h3>
            <p className="text-sm text-muted-foreground">
              Analyze your products and get AI-powered optimization suggestions
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">4. Review & Apply Suggestions</h3>
            <p className="text-sm text-muted-foreground">
              Approve or reject AI suggestions before they're applied to your store
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
