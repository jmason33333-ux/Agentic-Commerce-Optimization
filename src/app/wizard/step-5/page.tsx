"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, AlertCircle, Loader2, ExternalLink, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";

export default function Step5Page() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const [publishableKey, setPublishableKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [testMode, setTestMode] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const { data: config } = trpc.checkout.getStripeConfig.useQuery();
  const configureStripe = trpc.checkout.configureStripe.useMutation({
    onSuccess: () => {
      utils.checkout.getStripeConfig.invalidate();
    },
  });
  const testConnection = trpc.checkout.testStripeConnection.useMutation();
  const updateStep = trpc.wizard.updateStep.useMutation({
    onSuccess: () => {
      utils.wizard.getProgress.invalidate();
    },
  });

  // Load existing config
  useEffect(() => {
    if (config) {
      setPublishableKey(config.stripePublishableKey || "");
      setTestMode(config.testMode ?? true);
    }
  }, [config]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!publishableKey.trim()) {
      newErrors.publishableKey = "Publishable key is required";
    } else if (!publishableKey.startsWith("pk_")) {
      newErrors.publishableKey = "Publishable key must start with pk_";
    }

    if (!secretKey.trim() && !config?.hasSecretKey) {
      newErrors.secretKey = "Secret key is required";
    } else if (secretKey && !secretKey.startsWith("sk_")) {
      newErrors.secretKey = "Secret key must start with sk_";
    }

    if (!webhookSecret.trim() && !config?.hasWebhookSecret) {
      newErrors.webhookSecret = "Webhook secret is required";
    } else if (webhookSecret && !webhookSecret.startsWith("whsec_")) {
      newErrors.webhookSecret = "Webhook secret must start with whsec_";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await configureStripe.mutateAsync({
        publishableKey,
        secretKey: secretKey || "dummy",
        webhookSecret: webhookSecret || "dummy",
        testMode,
      });
      setSecretKey("");
      setWebhookSecret("");
      setTestResult(null);
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : "Failed to save configuration",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testConnection.mutateAsync();
      setTestResult(result);

      if (result.success) {
        await updateStep.mutateAsync({
          step: 5,
          completed: true,
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : "Connection test failed",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleContinue = () => {
    router.push("/wizard/step-6");
  };

  const isConfigured = config?.hasSecretKey && config?.hasWebhookSecret;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Stripe Configuration</h2>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          Connect Stripe to process payments from ChatGPT customers. This means you can
          accept credit cards, Apple Pay, and Google Pay directly through ChatGPT checkout.
        </p>
      </div>

      {/* Test Result */}
      {testResult && (
        <Card
          className={`p-4 ${
            testResult.success
              ? "bg-green-50 border-green-200"
              : "bg-destructive/10 border-destructive/20"
          } flex items-center gap-3`}
        >
          {testResult.success ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-destructive" />
          )}
          <p
            className={`text-sm font-medium ${
              testResult.success ? "text-green-900" : "text-destructive"
            }`}
          >
            {testResult.message}
          </p>
        </Card>
      )}

      {/* Get Stripe Keys */}
      {!isConfigured && (
        <Card className="p-6 bg-secondary/50">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Get Your Stripe API Keys</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Log into your Stripe Dashboard to get your API keys. Use test keys for
                initial setup, then switch to live keys when ready to accept real payments.
              </p>
              <a
                href="https://dashboard.stripe.com/apikeys"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                Open Stripe Dashboard
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </Card>
      )}

      {/* Configuration Form */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Stripe API Keys</h3>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {/* Test Mode Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
            <div className="space-y-0.5">
              <Label htmlFor="testMode">Test Mode</Label>
              <p className="text-xs text-muted-foreground">
                Use test keys for development, live keys for production
              </p>
            </div>
            <Switch
              id="testMode"
              checked={testMode}
              onCheckedChange={setTestMode}
            />
          </div>

          {/* Publishable Key */}
          <div>
            <Label htmlFor="publishableKey">
              Publishable Key <span className="text-destructive">*</span>
            </Label>
            <Input
              id="publishableKey"
              value={publishableKey}
              onChange={(e) => setPublishableKey(e.target.value)}
              placeholder={testMode ? "pk_test_..." : "pk_live_..."}
              className="mt-2 font-mono text-sm"
            />
            {errors.publishableKey && (
              <p className="mt-1 text-sm text-destructive">{errors.publishableKey}</p>
            )}
          </div>

          {/* Secret Key */}
          <div>
            <Label htmlFor="secretKey">
              Secret Key <span className="text-destructive">*</span>
            </Label>
            <div className="relative mt-2">
              <Input
                id="secretKey"
                type={showSecretKey ? "text" : "password"}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder={
                  isConfigured
                    ? "••••••••••••••••"
                    : testMode
                    ? "sk_test_..."
                    : "sk_live_..."
                }
                className="pr-10 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowSecretKey(!showSecretKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showSecretKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.secretKey && (
              <p className="mt-1 text-sm text-destructive">{errors.secretKey}</p>
            )}
            {isConfigured && !secretKey && (
              <p className="mt-1 text-xs text-muted-foreground">
                Leave blank to keep existing secret key
              </p>
            )}
          </div>

          {/* Webhook Secret */}
          <div>
            <Label htmlFor="webhookSecret">
              Webhook Signing Secret <span className="text-destructive">*</span>
            </Label>
            <div className="relative mt-2">
              <Input
                id="webhookSecret"
                type={showWebhookSecret ? "text" : "password"}
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                placeholder={
                  isConfigured ? "••••••••••••••••" : "whsec_..."
                }
                className="pr-10 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showWebhookSecret ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.webhookSecret && (
              <p className="mt-1 text-sm text-destructive">{errors.webhookSecret}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Find this when creating a webhook endpoint in Stripe Dashboard
            </p>
          </div>

          {/* Form Error */}
          {errors.form && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{errors.form}</p>
            </div>
          )}

          {/* Save Button */}
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>Save Configuration</>
              )}
            </Button>

            {isConfigured && (
              <Button
                type="button"
                variant="outline"
                onClick={handleTest}
                disabled={isTesting}
                className="gap-2"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>Test Connection</>
                )}
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Webhook Setup Instructions */}
      {isConfigured && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Webhook Endpoint Setup</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create a webhook endpoint in Stripe to receive payment events:
          </p>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <span className="flex-shrink-0 font-semibold">1.</span>
              <div>
                <p>Go to{" "}
                  <a
                    href="https://dashboard.stripe.com/webhooks"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Stripe Webhooks
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 font-semibold">2.</span>
              <div>
                <p className="mb-2">Add endpoint with this URL:</p>
                <code className="block p-2 bg-secondary rounded text-xs break-all">
                  {process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/stripe
                </code>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 font-semibold">3.</span>
              <p>Select events: <code className="bg-secondary px-1 rounded">payment_intent.succeeded</code></p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 font-semibold">4.</span>
              <p>Copy the webhook signing secret (starts with <code className="bg-secondary px-1 rounded">whsec_</code>) above</p>
            </div>
          </div>
        </Card>
      )}

      {/* Info Box */}
      <div className="rounded-lg bg-secondary p-4">
        <p className="text-sm font-medium mb-2">Security note:</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your Stripe credentials are encrypted with AES-256-GCM before storage and never
          exposed in logs. We use industry-standard security practices to protect your
          payment processing credentials.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button variant="outline" onClick={() => router.push("/wizard/step-4")}>
          Back
        </Button>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">Step 5 of 7</div>
          <Button onClick={handleContinue} disabled={!testResult?.success} size="lg">
            Continue to Checkout Registration
          </Button>
        </div>
      </div>
    </div>
  );
}
