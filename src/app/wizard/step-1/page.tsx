"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Store, Package, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function Step1Page() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [shopDomain, setShopDomain] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const { data: progress } = trpc.wizard.getProgress.useQuery();
  const initiateOAuth = trpc.wizard.initiateShopifyOAuth.useMutation();
  const completeOAuth = trpc.wizard.completeShopifyOAuth.useMutation();
  const updateStep = trpc.wizard.updateStep.useMutation({
    onSuccess: () => {
      utils.wizard.getProgress.invalidate();
    },
  });

  const isConnected = !!progress?.workspace?.shopifyDomain;
  const connectedDomain = progress?.workspace?.shopifyDomain;

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const shop = params.get("shop");
    const state = params.get("state");

    if (code && shop && state) {
      handleOAuthCallback(shop, code, state);
    }
  }, []);

  const handleOAuthCallback = async (shop: string, code: string, state: string) => {
    setIsConnecting(true);
    setConnectionError(null);

    try {
      const result = await completeOAuth.mutateAsync({ shop, code, state });
      await updateStep.mutateAsync({
        step: 1,
        completed: true,
        data: {
          shopDomain: shop,
          productsImported: result.productsImported,
        },
      });
      await utils.wizard.getProgress.invalidate();

      // Clean up URL
      window.history.replaceState({}, document.title, "/wizard/step-1");
    } catch (error) {
      setConnectionError(
        error instanceof Error
          ? error.message
          : "Failed to connect to Shopify. Please try again."
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnect = async () => {
    if (!shopDomain.trim()) {
      setConnectionError("Please enter your Shopify store domain");
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      const result = await initiateOAuth.mutateAsync({
        shop: shopDomain.trim().toLowerCase(),
      });

      // Redirect to Shopify OAuth
      window.location.href = result.authUrl;
    } catch (error) {
      setConnectionError(
        error instanceof Error
          ? error.message
          : "Failed to start connection. Please check your store domain."
      );
      setIsConnecting(false);
    }
  };

  const handleContinue = async () => {
    router.push("/wizard/step-2");
  };

  const formatShopDomain = (value: string) => {
    // Remove https://, http://, and .myshopify.com if user includes them
    let formatted = value.replace(/^https?:\/\//, "");
    formatted = formatted.replace(/\.myshopify\.com.*$/, "");
    return formatted;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Connect Your Shopify Store</h2>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          Connect your Shopify store to automatically import products, store information,
          and policies. This means your product catalog is instantly ready for ChatGPT.
        </p>
      </div>

      {/* Connection Status */}
      {isConnected && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-green-100 p-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900">Store Connected</h3>
              <p className="mt-1 text-sm text-green-800">
                <strong>{connectedDomain}</strong> is connected and ready.{" "}
                {progress?.workspace?.sellerName && (
                  <>Your products from <strong>{progress.workspace.sellerName}</strong> have been imported.</>
                )}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Connection Form */}
      {!isConnected && (
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Enter Your Store Domain</h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="shopDomain">Shopify Store Domain</Label>
                  <div className="mt-2 flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="shopDomain"
                        type="text"
                        placeholder="your-store"
                        value={shopDomain}
                        onChange={(e) => setShopDomain(formatShopDomain(e.target.value))}
                        onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                        disabled={isConnecting}
                        className="pr-32"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        .myshopify.com
                      </span>
                    </div>
                    <Button
                      onClick={handleConnect}
                      disabled={isConnecting || !shopDomain.trim()}
                      className="gap-2"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Store className="h-4 w-4" />
                          Connect
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Example: <span className="font-mono">your-store</span> (we'll add .myshopify.com)
                  </p>
                </div>

                {connectionError && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 flex gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                    <p className="text-sm text-destructive">{connectionError}</p>
                  </div>
                )}
              </div>
            </div>

            {/* What Happens Next */}
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-sm font-medium mb-3">What happens when you connect:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  You'll be redirected to Shopify to authorize access
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  We'll securely import your products and store information
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  Your policies (return, privacy, TOS) will be auto-filled
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  Products will be analyzed for ChatGPT readiness
                </li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* What We Import */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">What We Import from Shopify</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              <span className="font-medium">Store Information</span>
            </div>
            <ul className="ml-7 space-y-1 text-sm text-muted-foreground">
              <li>• Store name and URL</li>
              <li>• Privacy policy</li>
              <li>• Terms of service</li>
              <li>• Return policy</li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <span className="font-medium">Product Catalog</span>
            </div>
            <ul className="ml-7 space-y-1 text-sm text-muted-foreground">
              <li>• Product titles & descriptions</li>
              <li>• Prices and inventory</li>
              <li>• Images and variants</li>
              <li>• Collections and tags</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Security Note */}
      <div className="rounded-lg bg-secondary/50 p-4 text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground">Your data is secure.</strong> We use
          industry-standard AES-256-GCM encryption for all credentials. Your Shopify
          access token is encrypted before storage and never exposed in logs.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={() => router.push("/wizard/step-0")}
        >
          Back
        </Button>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">Step 1 of 7</div>
          <Button
            onClick={handleContinue}
            disabled={!isConnected}
            size="lg"
          >
            Continue to Store Information
          </Button>
        </div>
      </div>
    </div>
  );
}
