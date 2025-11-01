"use client";

import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const { data: workspaces, isLoading: isLoadingWorkspaces } =
    trpc.workspace.list.useQuery();

  const activeWorkspaceId = useMemo(() => workspaces?.[0]?.id ?? null, [
    workspaces,
  ]);

  const statsQuery = trpc.workspace.getStats.useQuery(
    { workspaceId: activeWorkspaceId ?? "" },
    { enabled: !!activeWorkspaceId }
  );

  const syncMutation = trpc.product.sync.useMutation({
    onSuccess: () => {
      // Best-effort refresh of stats after triggering sync
      statsQuery.refetch();
    },
  });

  const isBusy =
    isLoadingWorkspaces || statsQuery.isLoading || syncMutation.isPending;

  // Simple dashboard filters
  const [riskFilter, setRiskFilter] = useState<"MEDIUM,HIGH" | "ALL">(
    "MEDIUM,HIGH"
  );
  const [issueTypesFilter, setIssueTypesFilter] = useState<string[]>([
    "missing_gtin",
    "checkout_disabled",
    "no_image",
    "missing_price",
    "availability_zero",
    "missing_brand",
    "missing_material",
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Workspace metrics and quick actions
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsQuery.data?.totalProducts ?? "--"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checkout Enabled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsQuery.data?.checkoutEnabled ?? "--"}
            </div>
            <p className="text-xs text-muted-foreground">
              Disabled: {statsQuery.data?.checkoutDisabled ?? "--"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsQuery.data?.pending?.changeDriving ?? "--"}
            </div>
            <p className="text-xs text-muted-foreground">
              Total: {statsQuery.data?.pending?.total ?? "--"} | Products: {statsQuery.data?.pending?.productsWithChangeDrivingPending ?? "--"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsQuery.data?.lastSyncAt
                ? new Date(statsQuery.data.lastSyncAt).toLocaleString()
                : "--"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average SEO Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsQuery.data?.avgSeoScore != null
                ? Math.round(statsQuery.data.avgSeoScore)
                : "--"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsQuery.data?.compliancePercent != null
                ? `${statsQuery.data.compliancePercent}%`
                : "--"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agentic Orders (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsQuery.data?.agenticOrders30d
                ? statsQuery.data.agenticOrders30d.count
                : "--"}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue: {statsQuery.data?.agenticOrders30d?.revenue ?? "--"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() =>
            activeWorkspaceId &&
            syncMutation.mutate({ workspaceId: activeWorkspaceId })
          }
          disabled={!activeWorkspaceId || isBusy}
        >
          Sync Now
        </Button>
        <Button
          variant="secondary"
          onClick={() => router.push("/products/import")}
          disabled={!activeWorkspaceId}
        >
          Upload CSV
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push("/products")}
          disabled={!activeWorkspaceId}
        >
          View Products
        </Button>
        <div className="ml-auto flex flex-wrap gap-2 items-center">
          <select
            className="border rounded px-2 py-1 text-sm"
            value={riskFilter}
            onChange={(e) =>
              setRiskFilter(e.target.value as "MEDIUM,HIGH" | "ALL")
            }
          >
            <option value="MEDIUM,HIGH">MEDIUM/HIGH</option>
            <option value="ALL">All Risks</option>
          </select>
          <select
            multiple
            className="border rounded px-2 py-1 text-sm min-w-[220px] h-[80px]"
            value={issueTypesFilter}
            onChange={(e) =>
              setIssueTypesFilter(
                Array.from(e.target.selectedOptions).map((o) => o.value)
              )
            }
          >
            {[
              "missing_gtin",
              "checkout_disabled",
              "no_image",
              "missing_price",
              "availability_zero",
              "missing_brand",
              "missing_material",
            ].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <Button
            variant="ghost"
            onClick={() => {
              const riskParam =
                riskFilter === "ALL" ? "" : `risk=${encodeURIComponent(riskFilter)}`;
              const typeParam =
                issueTypesFilter.length > 0
                  ? `issueTypes=${encodeURIComponent(issueTypesFilter.join(","))}`
                  : "";
              const qs = [riskParam, typeParam].filter(Boolean).join("&");
              router.push(`/changes${qs ? `?${qs}` : ""}`);
            }}
            disabled={!activeWorkspaceId}
          >
            View Pending Changes
          </Button>
        </div>
      </div>
    </div>
  );
}


