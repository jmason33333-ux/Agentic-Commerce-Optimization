"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  AlertCircle,
  CheckCircle2,
  Search,
  Loader2,
  Edit,
} from "lucide-react";

type FilterStatus = "all" | "enabled" | "incomplete";

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const utils = trpc.useUtils();

  const initialFilter = (searchParams.get("filter") || "all") as FilterStatus;
  const [filterStatus, setFilterStatus] = useState<FilterStatus>(initialFilter);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const { data: readiness, isLoading } = trpc.wizard.getProductReadiness.useQuery();
  const toggleProduct = trpc.wizard.toggleProduct.useMutation({
    onSuccess: () => {
      utils.wizard.getProductReadiness.invalidate();
    },
  });

  const filteredProducts = readiness?.products?.filter((product) => {
    // Apply status filter
    if (filterStatus === "enabled" && (!product.enableSearch && !product.enableCheckout)) {
      return false;
    }
    if (filterStatus === "incomplete" && product.isReady) {
      return false;
    }

    // Apply search query
    if (searchQuery && !product.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  }) || [];

  const handleToggleProduct = async (productId: string, enable: boolean) => {
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
    const productsToEnable = filteredProducts.filter(
      (p) => selectedProducts.includes(p.id) && p.canEnable
    );

    for (const product of productsToEnable) {
      await handleToggleProduct(product.id, true);
    }
    setSelectedProducts([]);
  };

  const handleBulkDisable = async () => {
    const productsToDisable = filteredProducts.filter((p) =>
      selectedProducts.includes(p.id)
    );

    for (const product of productsToDisable) {
      await handleToggleProduct(product.id, false);
    }
    setSelectedProducts([]);
  };

  const toggleSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleAllSelection = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Products</h2>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          View and manage your product catalog. Enable products with all required fields
          for ChatGPT search and checkout.
        </p>
      </div>

      {/* Quick Stats */}
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
                <p className="text-sm text-muted-foreground">Enabled on ChatGPT</p>
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
                <p className="text-sm text-muted-foreground">Incomplete</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters and Actions */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Status Filter */}
            <Select
              value={filterStatus}
              onValueChange={(value: FilterStatus) => setFilterStatus(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="enabled">Enabled Only</SelectItem>
                <SelectItem value="incomplete">Incomplete Only</SelectItem>
              </SelectContent>
            </Select>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-[250px]"
              />
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedProducts.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedProducts.length} selected
              </span>
              <Button
                size="sm"
                onClick={handleBulkEnable}
                disabled={toggleProduct.isPending}
                className="gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Enable
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkDisable}
                disabled={toggleProduct.isPending}
                className="gap-2"
              >
                Disable
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Products List */}
      <Card className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground">No products found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery
                ? "Try adjusting your search or filter"
                : "Your products will appear here after Shopify sync"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Select All */}
            <div className="flex items-center gap-3 pb-3 border-b">
              <Checkbox
                checked={
                  selectedProducts.length === filteredProducts.length &&
                  filteredProducts.length > 0
                }
                onCheckedChange={toggleAllSelection}
              />
              <span className="text-sm font-medium text-muted-foreground">
                Select All ({filteredProducts.length})
              </span>
            </div>

            {/* Product Rows */}
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
              >
                {/* Checkbox */}
                <Checkbox
                  checked={selectedProducts.includes(product.id)}
                  onCheckedChange={() => toggleSelection(product.id)}
                  className="mt-1"
                />

                {/* Product Image */}
                {product.imageLink && (
                  <img
                    src={product.imageLink}
                    alt={product.title}
                    className="h-20 w-20 rounded-lg object-cover flex-shrink-0"
                  />
                )}

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-base truncate">{product.title}</h4>
                  <div className="mt-1 flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-medium text-foreground">
                      ${product.price} {product.currency || "USD"}
                    </span>

                    {/* Status Badge */}
                    {product.isReady ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        ✓ Ready
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-500 text-amber-700">
                        Missing Fields
                      </Badge>
                    )}

                    {/* Enabled Badge */}
                    {(product.enableSearch || product.enableCheckout) && (
                      <Badge className="bg-green-500 text-white">
                        Enabled on ChatGPT
                      </Badge>
                    )}
                  </div>

                  {/* Missing Fields */}
                  {!product.canEnable && product.missingFields && product.missingFields.length > 0 && (
                    <p className="mt-2 text-xs text-amber-700">
                      <strong>Missing:</strong> {product.missingFields.join(", ")}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-2">
                  {product.canEnable ? (
                    <>
                      <Checkbox
                        id={`enable-${product.id}`}
                        checked={product.enableSearch && product.enableCheckout}
                        onCheckedChange={(checked) =>
                          handleToggleProduct(product.id, checked as boolean)
                        }
                        disabled={toggleProduct.isPending}
                      />
                      <label
                        htmlFor={`enable-${product.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {product.enableSearch && product.enableCheckout
                          ? "Enabled"
                          : "Enable"}
                      </label>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/products/${product.id}`)}
                      className="gap-2 border-amber-500 text-amber-700 hover:bg-amber-50"
                    >
                      <Edit className="h-3 w-3" />
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Info Box */}
      {readiness && readiness.incomplete > 0 && (
        <div className="rounded-lg bg-secondary p-4">
          <p className="text-sm font-medium mb-2">How to complete products:</p>
          <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <li className="flex gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span>
                Click <strong className="text-foreground">Complete</strong> on any
                incomplete product to add missing fields
              </span>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span>
                Required fields: Title, Description, Price, Image, Product URL,
                Availability, and GTIN or Brand
              </span>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span>
                After enabling products, re-submit your feed from the Dashboard to update
                ChatGPT
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
