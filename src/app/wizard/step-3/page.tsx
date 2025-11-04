"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Package, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";

export default function Step3Page() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const { data: readiness } = trpc.wizard.getProductReadiness.useQuery();
  const toggleProduct = trpc.wizard.toggleProduct.useMutation({
    onSuccess: () => {
      utils.wizard.getProductReadiness.invalidate();
    },
  });
  const updateStep = trpc.wizard.updateStep.useMutation({
    onSuccess: () => {
      utils.wizard.getProgress.invalidate();
    },
  });

  const handleToggle = async (productId: string, enable: boolean) => {
    try {
      await toggleProduct.mutateAsync({
        productId,
        enableSearch: enable,
        enableCheckout: enable,
      });
    } catch (error) {
      console.error("Failed to toggle product:", error);
    }
  };

  const handleBulkEnable = async () => {
    const compliantProducts = readiness?.products.filter((p) => p.isCompliant) || [];
    for (const product of compliantProducts) {
      if (!product.enableSearch || !product.enableCheckout) {
        await handleToggle(product.id, true);
      }
    }
    setSelectedProducts([]);
  };

  const handleContinue = async () => {
    const enabledCount = readiness?.products.filter(
      (p) => p.enableSearch || p.enableCheckout
    ).length || 0;

    await updateStep.mutateAsync({
      step: 3,
      completed: true,
      data: { enabledProducts: enabledCount },
    });

    router.push("/wizard/step-4");
  };

  const getStatusBadge = (product: any) => {
    if (product.isReady) {
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
          ✓ Ready
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-amber-500 text-amber-700">
        Missing Fields
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Product Review</h2>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          Enable products for ChatGPT search and checkout. This means only products
          with all required fields will appear in ChatGPT shopping conversations.
        </p>
      </div>

      {/* Summary Cards */}
      {readiness && (
        <div className="grid gap-4 md:grid-cols-3">
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

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-50 p-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">{readiness.ready}</p>
                <p className="text-sm text-muted-foreground">Ready to Sell</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-amber-50 p-3">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-amber-600">
                  {readiness.incomplete}
                </p>
                <p className="text-sm text-muted-foreground">Need Attention</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Complete Later Banner */}
      {readiness && readiness.incomplete > 0 && (
        <Card className="p-4 bg-secondary/50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {readiness.incomplete} products have missing required fields
              </p>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                Products with missing fields can't be enabled for ChatGPT.
                You can complete these products in the Products page after finishing this setup wizard.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Bulk Actions */}
      {readiness && readiness.ready > 0 && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="font-semibold text-green-900">
                  {readiness.ready} Products Ready to Sell
                </p>
              </div>
              <p className="text-sm text-green-800 leading-relaxed">
                These products meet all OpenAI requirements. Enable them for ChatGPT
                search and checkout to start selling immediately.
              </p>
            </div>
            <Button
              onClick={handleBulkEnable}
              className="gap-2 bg-green-600 hover:bg-green-700 flex-shrink-0"
              size="lg"
            >
              <CheckCircle2 className="h-4 w-4" />
              Enable All {readiness.ready}
            </Button>
          </div>
        </Card>
      )}

      {/* Products List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Your Products</h3>

        {!readiness || readiness.total === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No products found. Please ensure your Shopify store has products.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {readiness.products.map((product) => (
              <div
                key={product.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
              >
                {/* Product Image */}
                {product.imageLink && (
                  <img
                    src={product.imageLink}
                    alt={product.title}
                    className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                  />
                )}

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{product.title}</h4>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">
                      ${product.price} {product.currency || "USD"}
                    </span>
                    {getStatusBadge(product)}
                  </div>

                  {!product.canEnable && product.missingFields && product.missingFields.length > 0 && (
                    <p className="mt-1 text-xs text-amber-700">
                      <strong>Missing:</strong> {product.missingFields.join(", ")}
                    </p>
                  )}
                </div>

                {/* Toggle */}
                <div className="flex flex-col items-end gap-2">
                  {product.canEnable ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`product-${product.id}`}
                          checked={product.enableSearch && product.enableCheckout}
                          onCheckedChange={(checked) =>
                            handleToggle(product.id, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={`product-${product.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          Enable
                        </label>
                      </div>
                      {(product.enableSearch || product.enableCheckout) && (
                        <Badge className="text-xs bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Enabled
                        </Badge>
                      )}
                    </>
                  ) : (
                    <>
                      <Badge variant="outline" className="text-xs border-amber-500 text-amber-700">
                        Incomplete
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        Complete after setup
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Info Box */}
      <div className="rounded-lg bg-secondary p-4">
        <p className="text-sm font-medium mb-2">How product readiness works:</p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            Products with <strong className="text-foreground">all required fields</strong> can be
            enabled immediately for ChatGPT
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            Required fields: Title, Description, Price, Image, Product URL, Availability, and GTIN or Brand
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            Products missing required fields are blocked until they're completed in the Products page
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <span>
              This means <strong className="text-foreground">only complete products</strong> appear
              in ChatGPT shopping conversations
            </span>
          </li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button variant="outline" onClick={() => router.push("/wizard/step-2")}>
          Back
        </Button>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">Step 3 of 7</div>
          <Button onClick={handleContinue} size="lg">
            Continue to Feed Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}
