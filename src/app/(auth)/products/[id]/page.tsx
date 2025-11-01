"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;

  const { data: product, isLoading } = trpc.product.getById.useQuery(
    { id: productId },
    { enabled: !!productId }
  );

  if (!productId) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Product</h2>
        <p className="text-muted-foreground">Details and recent activity</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{product?.title || "Loading…"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {isLoading ? (
            <div>Loading…</div>
          ) : product ? (
            <>
              <div>
                <span className="text-muted-foreground">Enable Checkout:</span>
                <span className="ml-2 font-medium">
                  {product.enableCheckout ? "Yes" : "No"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Price:</span>
                <span className="ml-2 font-medium">
                  {product.price ?? "--"} {product.currency}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Availability:</span>
                <span className="ml-2 font-medium">{product.availability}</span>
              </div>
            </>
          ) : (
            <div>Product not found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


