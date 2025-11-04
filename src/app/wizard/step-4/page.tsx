"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, AlertCircle, Loader2, ExternalLink, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";

export default function Step4Page() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const [merchantId, setMerchantId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<"manual" | "daily" | "15min">("daily");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: config } = trpc.feed.getConfiguration.useQuery();
  const { data: submissionStatus } = trpc.feed.getSubmissionStatus.useQuery();
  const configureOpenAI = trpc.feed.configureOpenAI.useMutation({
    onSuccess: () => {
      utils.feed.getConfiguration.invalidate();
    },
  });
  const submitFeed = trpc.feed.submitFeed.useMutation({
    onSuccess: () => {
      utils.feed.getSubmissionStatus.invalidate();
    },
  });
  const updateStep = trpc.wizard.updateStep.useMutation({
    onSuccess: () => {
      utils.wizard.getProgress.invalidate();
    },
  });

  // Load existing config
  useEffect(() => {
    if (config) {
      setMerchantId(config.openaiMerchantId || "");
      setRefreshInterval(config.feedRefreshInterval || "daily");
      // API key is masked, don't overwrite if user is editing
    }
  }, [config]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!merchantId.trim()) {
      newErrors.merchantId = "Merchant ID is required";
    }

    if (!apiKey.trim() && !config?.hasCredentials) {
      newErrors.apiKey = "API Key is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveConfig = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await configureOpenAI.mutateAsync({
        merchantId,
        apiKey: apiKey || "dummy", // Backend handles if unchanged
        autoRefreshInterval: refreshInterval,
      });
      setApiKey(""); // Clear after save
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : "Failed to save configuration",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitFeed = async () => {
    setIsSubmitting(true);
    try {
      await submitFeed.mutateAsync({ format: "TSV" });
      await updateStep.mutateAsync({
        step: 4,
        completed: true,
      });
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Failed to submit feed",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    router.push("/wizard/step-5");
  };

  const isConfigured = config?.hasCredentials;
  const hasSubmitted = !!submissionStatus?.lastFeedSubmission;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Feed Configuration</h2>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          Connect your OpenAI Commerce API credentials and configure your product feed.
          This means ChatGPT will know about your products and can recommend them to customers.
        </p>
      </div>

      {/* Status Badge */}
      {hasSubmitted && (
        <Card className="p-4 bg-green-50 border-green-200 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900">Feed Submitted Successfully</p>
            <p className="text-xs text-green-800">
              Last submitted: {new Date(submissionStatus.lastFeedSubmission).toLocaleString()}
            </p>
          </div>
          {submissionStatus.feedStatus && (
            <Badge className="bg-green-600">{submissionStatus.feedStatus}</Badge>
          )}
        </Card>
      )}

      {/* Get Credentials */}
      {!isConfigured && (
        <Card className="p-6 bg-secondary/50">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Get Your OpenAI Credentials</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                You need an OpenAI Commerce API account to submit product feeds.
                Apply for merchant access if you haven't already.
              </p>
              <a
                href="https://platform.openai.com/merchant/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                Open Merchant Dashboard
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </Card>
      )}

      {/* Configuration Form */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">OpenAI API Configuration</h3>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {/* Merchant ID */}
          <div>
            <Label htmlFor="merchantId">
              Merchant ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="merchantId"
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
              placeholder="merchant_abc123xyz"
              className="mt-2"
            />
            {errors.merchantId && (
              <p className="mt-1 text-sm text-destructive">{errors.merchantId}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Find this in your OpenAI Merchant Dashboard
            </p>
          </div>

          {/* API Key */}
          <div>
            <Label htmlFor="apiKey">
              API Key <span className="text-destructive">*</span>
            </Label>
            <div className="relative mt-2">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  isConfigured ? "••••••••••••••••" : "sk-proj-..."
                }
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.apiKey && (
              <p className="mt-1 text-sm text-destructive">{errors.apiKey}</p>
            )}
            {isConfigured && !apiKey && (
              <p className="mt-1 text-xs text-muted-foreground">
                Leave blank to keep existing API key
              </p>
            )}
          </div>

          {/* Refresh Interval */}
          <div>
            <Label htmlFor="refreshInterval">Auto-Refresh Interval</Label>
            <Select value={refreshInterval} onValueChange={(v: any) => setRefreshInterval(v)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual Only</SelectItem>
                <SelectItem value="daily">Daily (Recommended)</SelectItem>
                <SelectItem value="15min">Every 15 Minutes</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-muted-foreground">
              How often to automatically sync your product catalog with OpenAI
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
          <Button
            type="button"
            onClick={handleSaveConfig}
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
        </form>
      </Card>

      {/* Submit Feed */}
      {isConfigured && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Submit Product Feed</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Generate and submit your product feed to OpenAI. This makes your products
            discoverable in ChatGPT shopping conversations.
          </p>

          {errors.submit && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 flex gap-3 mb-4">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{errors.submit}</p>
            </div>
          )}

          <Button
            onClick={handleSubmitFeed}
            disabled={isSubmitting}
            className="gap-2"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting Feed...
              </>
            ) : (
              <>Submit Product Feed to OpenAI</>
            )}
          </Button>
        </Card>
      )}

      {/* Info Box */}
      <div className="rounded-lg bg-secondary p-4">
        <p className="text-sm font-medium mb-2">What happens when you submit:</p>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            Your enabled products are formatted as a TSV feed
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            Feed is securely transmitted to OpenAI's Commerce API
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            ChatGPT can immediately recommend your products to customers
          </li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button variant="outline" onClick={() => router.push("/wizard/step-3")}>
          Back
        </Button>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">Step 4 of 7</div>
          <Button onClick={handleContinue} disabled={!hasSubmitted} size="lg">
            Continue to Stripe Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}
