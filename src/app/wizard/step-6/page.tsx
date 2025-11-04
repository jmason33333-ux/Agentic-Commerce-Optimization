"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import { useState } from "react";

export default function Step6Page() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  const { data: config } = trpc.checkout.getCheckoutConfig.useQuery();
  const registerCheckout = trpc.checkout.registerCheckout.useMutation({
    onSuccess: () => {
      utils.checkout.getCheckoutConfig.invalidate();
    },
  });
  const updateStep = trpc.wizard.updateStep.useMutation({
    onSuccess: () => {
      utils.wizard.getProgress.invalidate();
    },
  });

  const handleRegister = async () => {
    setIsRegistering(true);
    setRegistrationError(null);

    try {
      await registerCheckout.mutateAsync();
      await updateStep.mutateAsync({
        step: 6,
        completed: true,
      });
    } catch (error) {
      setRegistrationError(
        error instanceof Error
          ? error.message
          : "Failed to register checkout with OpenAI"
      );
    } finally {
      setIsRegistering(false);
    }
  };

  const handleContinue = () => {
    router.push("/wizard/step-7");
  };

  const isRegistered = !!config?.openaiCheckoutId;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Checkout Registration</h2>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          Register your checkout endpoint with OpenAI. This means ChatGPT knows where
          to send customers when they're ready to purchase your products.
        </p>
      </div>

      {/* Registration Status */}
      {isRegistered && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-green-100 p-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900">Checkout Registered</h3>
              <p className="mt-1 text-sm text-green-800">
                Your checkout endpoint is registered with OpenAI.
              </p>
              {config.openaiCheckoutId && (
                <p className="mt-2 text-xs font-mono text-green-700">
                  Checkout ID: {config.openaiCheckoutId}
                </p>
              )}
              {config.registeredAt && (
                <p className="mt-1 text-xs text-green-700">
                  Registered on {new Date(config.registeredAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* What Gets Registered */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">What Gets Registered</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-sm">Checkout Endpoint URL</p>
              <code className="mt-1 block text-xs text-muted-foreground break-all">
                {config?.checkoutUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/checkout/sessions`}
              </code>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-sm">Webhook Endpoint URL</p>
              <code className="mt-1 block text-xs text-muted-foreground break-all">
                {config?.webhookUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/openai`}
              </code>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-sm">Payment Provider</p>
              <p className="mt-1 text-xs text-muted-foreground">Stripe</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-sm">Supported Countries</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {(config?.supportedCountries || ["US"]).map((country) => (
                  <Badge key={country} variant="secondary" className="text-xs">
                    {country}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Registration Error */}
      {registrationError && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">Registration Failed</p>
            <p className="mt-1 text-sm text-destructive">{registrationError}</p>
          </div>
        </div>
      )}

      {/* Register Button */}
      {!isRegistered && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Ready to Register</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            When you click Register, we'll send your checkout configuration to OpenAI's
            Commerce API. This allows ChatGPT to create checkout sessions and process
            orders through your system.
          </p>

          <div className="space-y-4">
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-sm font-medium mb-2">Pre-registration checklist:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  Shopify store connected
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  Store information complete
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  Products enabled for checkout
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  Product feed submitted to OpenAI
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  Stripe configured and tested
                </li>
              </ul>
            </div>

            <Button
              onClick={handleRegister}
              disabled={isRegistering}
              size="lg"
              className="gap-2"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Registering with OpenAI...
                </>
              ) : (
                <>Register Checkout with OpenAI</>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* How It Works */}
      <div className="rounded-lg bg-secondary p-4">
        <p className="text-sm font-medium mb-2">How checkout works:</p>
        <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
          <li>Customer shops in ChatGPT and adds your products to cart</li>
          <li>ChatGPT calls your checkout endpoint to create a session</li>
          <li>Customer enters payment info (secured by Stripe)</li>
          <li>Your system processes the order and fulfills from Shopify</li>
          <li>Customer receives order confirmation and tracking</li>
        </ol>
      </div>

      {/* Documentation Link */}
      <Card className="p-4 bg-secondary/30">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium">Need help with checkout integration?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Review OpenAI's Agentic Commerce Protocol documentation for detailed
              information about checkout flows and webhook handling.
            </p>
          </div>
          <a
            href="https://platform.openai.com/docs/agentic-commerce"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1 flex-shrink-0"
          >
            View Docs
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button variant="outline" onClick={() => router.push("/wizard/step-5")}>
          Back
        </Button>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">Step 6 of 7</div>
          <Button onClick={handleContinue} disabled={!isRegistered} size="lg">
            Continue to Testing & Launch
          </Button>
        </div>
      </div>
    </div>
  );
}
