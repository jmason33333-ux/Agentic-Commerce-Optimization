"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ChangesPage() {
  const searchParams = useSearchParams();

  const riskParam = searchParams.get("risk"); // e.g. "MEDIUM,HIGH"
  const issueTypesParam = searchParams.get("issueTypes"); // e.g. "missing_gtin,checkout_disabled"

  const { data: workspaces } = trpc.workspace.list.useQuery();
  const workspaceId = workspaces?.[0]?.id ?? null;

  const riskLevel = useMemo(() => {
    if (!riskParam) return undefined;
    // If multiple provided, prefer HIGH > MEDIUM; or leave undefined and filter client-side later.
    const parts = riskParam.split(",");
    return parts.includes("HIGH") ? "HIGH" : parts.includes("MEDIUM") ? "MEDIUM" : undefined;
  }, [riskParam]);

  const issueTypes = useMemo(() => {
    if (!issueTypesParam) return undefined;
    return issueTypesParam.split(",").filter(Boolean);
  }, [issueTypesParam]);

  const { data: suggestions, isLoading } = trpc.suggestion.list.useQuery(
    workspaceId
      ? {
          workspaceId,
          status: "PENDING",
          riskLevel: riskLevel as any,
          issueTypes,
        }
      : ({} as any),
    { enabled: !!workspaceId }
  );

  const { data: summary } = trpc.suggestion.getSummary.useQuery(
    workspaceId
      ? {
          workspaceId,
          status: "PENDING",
          issueTypes,
        }
      : ({} as any),
    { enabled: !!workspaceId }
  );

  const approveMutation = trpc.suggestion.approve.useMutation();
  const rejectMutation = trpc.suggestion.reject.useMutation();
  const utils = trpc.useUtils();

  // Toolbar (client-side view of current filters)
  const displayRisk = riskParam || "ALL";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pending Changes</h2>
        <p className="text-muted-foreground">
          {riskParam ? `Risk: ${riskParam}` : "All risks"}
          {issueTypes && issueTypes.length > 0
            ? ` · Types: ${issueTypes.join(", ")}`
            : ""}
        </p>
      </div>

      {/* Toolbar */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-center text-sm">
            <div>
              <span className="mr-2 text-muted-foreground">Risk:</span>
              <span className="font-medium">{displayRisk}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Issue Types:</span>
              <span className="font-medium">
                {issueTypes && issueTypes.length > 0
                  ? issueTypes.join(", ")
                  : "All"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Summary Row */}
          <div className="mb-4 text-sm text-muted-foreground flex flex-wrap gap-4">
            <div>
              <span className="font-medium">By Risk:</span>
              <span className="ml-2">
                {summary?.countsByRisk
                  ?.map((r) => `${r.riskLevel}: ${r.count}`)
                  .join(" · ") || "--"}
              </span>
            </div>
            <div>
              <span className="font-medium">Top Types:</span>
              <span className="ml-2">
                {summary?.countsByIssueType
                  ?.slice(0, 5)
                  .map((i) => `${i.issueType}: ${i.count}`)
                  .join(" · ") || "--"}
              </span>
            </div>
          </div>

          {isLoading ? (
            <div>Loading…</div>
          ) : (
            <div className="space-y-6">
              {/* Group by issue type with per-group bulk approve */}
              {Object.entries(
                (suggestions || []).reduce((acc: Record<string, any[]>, s: any) => {
                  acc[s.issueType] = acc[s.issueType] || [];
                  acc[s.issueType].push(s);
                  return acc;
                }, {})
              ).map(([issueType, items]) => (
                <div key={issueType} className="rounded border">
                  <div className="flex items-center justify-between p-3 border-b">
                    <div className="font-medium">
                      {issueType} <span className="text-muted-foreground">({items.length})</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={async () => {
                        await trpc.suggestion.bulkApproveByFilter.mutate({
                          workspaceId: workspaceId!,
                          status: "PENDING",
                          riskLevels: riskParam ? (riskParam.split(",") as any) : undefined,
                          issueTypes: [issueType],
                        } as any);
                        await Promise.all([
                          utils.suggestion.list.invalidate(),
                          utils.suggestion.getSummary.invalidate(),
                        ]);
                      }}
                    >
                      Approve All ({issueType})
                    </Button>
                  </div>
                  <div className="p-3 space-y-3">
                    {items.map((s) => (
                      <div key={s.id} className="rounded border p-3">
                        <div className="text-sm text-muted-foreground">
                          {s.riskLevel} · {s.issueType}
                        </div>
                        <div className="font-medium">
                          <Link className="underline" href={`/products/${s.product?.id}`}>
                            {s.product?.title}
                          </Link>
                        </div>
                        {/* Diff preview (lightweight) */}
                        <div className="mt-2 space-y-1 text-sm">
                          {(() => {
                            const p = s.product as any;
                            const payload = (s as any).aiPayload || {};
                            const rows: JSX.Element[] = [];
                            if (payload.title && payload.title !== p?.title) {
                              rows.push(
                                <div key="title">
                                  <span className="text-muted-foreground">Title:</span>
                                  <span className="ml-2 line-through opacity-70">{p?.title ?? "--"}</span>
                                  <span className="ml-2 font-medium">→ {payload.title}</span>
                                </div>
                              );
                            }
                            if (payload.description || payload.description_append) {
                              rows.push(
                                <div key="description">
                                  <span className="text-muted-foreground">Description:</span>
                                  <span className="ml-2 font-medium">
                                    {payload.description
                                      ? "Proposed replacement"
                                      : "Append"}
                                  </span>
                                </div>
                              );
                            }
                            if (payload.tags_to_add && Array.isArray(payload.tags_to_add)) {
                              rows.push(
                                <div key="tags">
                                  <span className="text-muted-foreground">Tags +</span>
                                  <span className="ml-2 font-medium">{payload.tags_to_add.join(", ")}</span>
                                </div>
                              );
                            }
                            if (
                              typeof payload.enableCheckout === "boolean" &&
                              payload.enableCheckout !== p?.enableCheckout
                            ) {
                              rows.push(
                                <div key="enableCheckout">
                                  <span className="text-muted-foreground">Enable Checkout:</span>
                                  <span className="ml-2 line-through opacity-70">{p?.enableCheckout ? "Yes" : "No"}</span>
                                  <span className="ml-2 font-medium">→ {payload.enableCheckout ? "Yes" : "No"}</span>
                                </div>
                              );
                            }
                            if (payload.price && String(payload.price) !== String(p?.price)) {
                              rows.push(
                                <div key="price">
                                  <span className="text-muted-foreground">Price:</span>
                                  <span className="ml-2 line-through opacity-70">{p?.price ?? "--"}</span>
                                  <span className="ml-2 font-medium">→ {payload.price}</span>
                                </div>
                              );
                            }
                            if (
                              typeof payload.inventoryQuantity === "number" &&
                              payload.inventoryQuantity !== p?.inventoryQuantity
                            ) {
                              rows.push(
                                <div key="inventoryQuantity">
                                  <span className="text-muted-foreground">Inventory:</span>
                                  <span className="ml-2 line-through opacity-70">{p?.inventoryQuantity ?? "--"}</span>
                                  <span className="ml-2 font-medium">→ {payload.inventoryQuantity}</span>
                                </div>
                              );
                            }
                            return rows.length > 0 ? (
                              <div className="mt-1 space-y-1">{rows}</div>
                            ) : null;
                          })()}
                        </div>
                        <div className="mt-2 flex gap-2">
                          <Button
                            size="sm"
                            onClick={async () => {
                              await approveMutation.mutateAsync({ id: s.id });
                              await Promise.all([
                                utils.suggestion.list.invalidate(),
                                utils.suggestion.getSummary.invalidate(),
                              ]);
                            }}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={async () => {
                              await rejectMutation.mutateAsync({ id: s.id });
                              await Promise.all([
                                utils.suggestion.list.invalidate(),
                                utils.suggestion.getSummary.invalidate(),
                              ]);
                            }}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {(!suggestions || suggestions.length === 0) && (
                <div className="text-sm text-muted-foreground">No suggestions found.</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


