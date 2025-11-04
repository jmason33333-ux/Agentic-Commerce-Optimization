"use client";

import { trpc } from "@/lib/trpc/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Package,
  AlertCircle,
  Loader2,
  Settings,
  FileText,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const utils = trpc.useUtils();

  // Fetch data
  const { data: progress } = trpc.wizard.getProgress.useQuery();
  const { data: readiness } = trpc.wizard.getProductReadiness.useQuery();
  const { data: feedStatus } = trpc.feed.getSubmissionStatus.useQuery();

  const submitFeed = trpc.feed.submitFeed.useMutation({
    onSuccess: () => {
      utils.feed.getSubmissionStatus.invalidate();
    },
  });

  const isWizardComplete = progress?.step7_completed;
  const hasSubmittedFeed = !!feedStatus?.lastFeedSubmission;

  const handleResubmitFeed = async () => {
    try {
      await submitFeed.mutateAsync({ format: "TSV" });
    } catch (error) {
      console.error("Failed to submit feed:", error);
    }
  };

  const getRefreshIntervalText = (interval?: string) => {
    if (!interval || interval === "manual") return "Manual only";
    if (interval === "daily") return "Daily";
    if (interval === "15min") return "Every 15 minutes";
    return interval;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          Your store status and quick actions
        </p>
      </div>

      {/* Success Banner */}
      {isWizardComplete && hasSubmittedFeed && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-green-900">
                Your store is live on ChatGPT!
              </h3>
              <p className="mt-1 text-sm text-green-800 leading-relaxed">
                Congratulations! Your products are now discoverable in ChatGPT shopping
                conversations. Customers can browse and purchase directly through ChatGPT.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Wizard In Progress */}
      {!isWizardComplete && (
        <Card className="p-6 bg-amber-50 border-amber-200">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-amber-100 p-3">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-amber-900">
                Setup In Progress
              </h3>
              <p className="mt-1 text-sm text-amber-800 leading-relaxed">
                Complete the setup wizard to launch your store on ChatGPT.
              </p>
            </div>
            <Button
              onClick={() => router.push("/wizard/step-0")}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Continue Setup
            </Button>
          </div>
        </Card>
      )}

      {/* Quick Stats */}
      {readiness && (
        <div className="grid gap-4 md:grid-cols-3">
          {/* Total Products */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-secondary p-3">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{readiness.total}</p>
                <p className="text-sm text-muted-foreground">Total Products</p>
              </div>
            </div>
          </Card>

          {/* Enabled on ChatGPT */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-50 p-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">{readiness.ready}</p>
                <p className="text-sm text-muted-foreground">Enabled on ChatGPT</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              These products have all required fields and are live on ChatGPT
            </p>
          </Card>

          {/* Need Attention */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-amber-50 p-3">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-amber-600">
                  {readiness.incomplete}
                </p>
                <p className="text-sm text-muted-foreground">Need Work</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Products missing required fields can't appear on ChatGPT yet
            </p>
          </Card>
        </div>
      )}

      {/* Feed Status */}
      {hasSubmittedFeed && feedStatus && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Feed Status
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last submitted</p>
                <p className="text-base font-medium">
                  {new Date(feedStatus.lastFeedSubmission).toLocaleString()}
                </p>
              </div>
              {feedStatus.feedStatus && (
                <Badge className="bg-green-600 text-white">
                  {feedStatus.feedStatus}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Auto-refresh interval</p>
                <p className="text-base font-medium">
                  {getRefreshIntervalText(feedStatus.feedRefreshInterval || undefined)}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t">
              <Button
                onClick={handleResubmitFeed}
                disabled={submitFeed.isPending}
                className="gap-2"
              >
                {submitFeed.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting Feed...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Re-submit Feed Now
                  </>
                )}
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                Re-submit your feed after enabling new products or updating product details
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Incomplete Products CTA */}
      {readiness && readiness.incomplete > 0 && (
        <Card className="p-6 bg-secondary/50 border-amber-200">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-amber-50 p-3">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">
                🎯 Complete {readiness.incomplete} Product
                {readiness.incomplete !== 1 ? "s" : ""}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                Add missing fields to enable more products on ChatGPT. This means more
                products available for ChatGPT customers to discover and purchase.
              </p>
              <Button
                onClick={() => router.push("/products?filter=incomplete")}
                variant="outline"
                className="mt-4 gap-2 border-amber-500 text-amber-700 hover:bg-amber-50"
              >
                View Incomplete Products
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Button
            onClick={() => router.push("/products")}
            variant="outline"
            className="h-auto py-4 flex flex-col items-start gap-2"
          >
            <div className="flex items-center gap-2 w-full">
              <Package className="h-5 w-5 text-primary" />
              <span className="font-semibold">Manage Products</span>
            </div>
            <span className="text-xs text-muted-foreground text-left">
              View, edit, and enable products for ChatGPT
            </span>
          </Button>

          <Button
            onClick={() => router.push("/wizard/step-2")}
            variant="outline"
            className="h-auto py-4 flex flex-col items-start gap-2"
          >
            <div className="flex items-center gap-2 w-full">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-semibold">Edit Store Info</span>
            </div>
            <span className="text-xs text-muted-foreground text-left">
              Update policies, return window, and store details
            </span>
          </Button>

          <Button
            onClick={() => router.push("/settings")}
            variant="outline"
            className="h-auto py-4 flex flex-col items-start gap-2"
          >
            <div className="flex items-center gap-2 w-full">
              <Settings className="h-5 w-5 text-primary" />
              <span className="font-semibold">Settings</span>
            </div>
            <span className="text-xs text-muted-foreground text-left">
              Manage workspace, reconnect integrations
            </span>
          </Button>
        </div>
      </Card>

      {/* Info Box */}
      <div className="rounded-lg bg-secondary p-4">
        <p className="text-sm font-medium mb-2">What's next?</p>
        <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <li className="flex gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <span>
              <strong className="text-foreground">Complete incomplete products</strong> -
              Add missing fields so more products appear on ChatGPT
            </span>
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <span>
              <strong className="text-foreground">Re-submit your feed</strong> - After
              enabling new products, re-submit to update ChatGPT
            </span>
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <span>
              <strong className="text-foreground">Monitor customer orders</strong> -
              Check your Shopify dashboard for orders from ChatGPT customers
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
