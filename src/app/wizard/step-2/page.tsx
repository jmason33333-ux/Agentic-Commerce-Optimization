"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function Step2Page() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: progress } = trpc.wizard.getProgress.useQuery();

  const [formData, setFormData] = useState({
    sellerName: "",
    sellerUrl: "",
    sellerPrivacyPolicy: "",
    sellerTos: "",
    returnPolicy: "",
    returnWindow: 30,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const updateStoreInfo = trpc.wizard.updateStoreInfo.useMutation({
    onSuccess: () => {
      utils.wizard.getProgress.invalidate();
    },
  });

  const updateStep = trpc.wizard.updateStep.useMutation({
    onSuccess: () => {
      utils.wizard.getProgress.invalidate();
    },
  });

  // Load initial data from workspace
  useEffect(() => {
    if (progress?.workspace) {
      setFormData({
        sellerName: progress.workspace.sellerName || "",
        sellerUrl: progress.workspace.sellerUrl || "",
        sellerPrivacyPolicy: progress.workspace.sellerPrivacyPolicy || "",
        sellerTos: progress.workspace.sellerTos || "",
        returnPolicy: progress.workspace.returnPolicy || "",
        returnWindow: progress.workspace.returnWindow || 30,
      });
    }
  }, [progress]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.sellerName.trim()) {
      newErrors.sellerName = "Store name is required";
    }

    if (!formData.sellerUrl.trim()) {
      newErrors.sellerUrl = "Store URL is required";
    } else if (!formData.sellerUrl.startsWith("http")) {
      newErrors.sellerUrl = "Store URL must start with https://";
    }

    if (!formData.sellerPrivacyPolicy.trim()) {
      newErrors.sellerPrivacyPolicy = "Privacy policy URL is required";
    } else if (!formData.sellerPrivacyPolicy.startsWith("http")) {
      newErrors.sellerPrivacyPolicy = "Privacy policy URL must start with https://";
    }

    if (!formData.sellerTos.trim()) {
      newErrors.sellerTos = "Terms of service URL is required";
    } else if (!formData.sellerTos.startsWith("http")) {
      newErrors.sellerTos = "Terms of service URL must start with https://";
    }

    if (!formData.returnPolicy.trim()) {
      newErrors.returnPolicy = "Return policy is required";
    }

    if (formData.returnWindow < 1 || formData.returnWindow > 365) {
      newErrors.returnWindow = "Return window must be between 1 and 365 days";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await updateStoreInfo.mutateAsync(formData);
      await updateStep.mutateAsync({
        step: 2,
        completed: true,
        data: formData,
      });
    } catch (error) {
      setErrors({
        form:
          error instanceof Error
            ? error.message
            : "Failed to save store information",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleContinue = async () => {
    await handleSave();
    if (Object.keys(errors).length === 0) {
      router.push("/wizard/step-3");
    }
  };

  const isComplete = progress?.step2_completed;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Store Information</h2>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          Review and update your store information. This means customers on ChatGPT
          will see accurate policies and can make informed purchase decisions.
        </p>
      </div>

      {/* Completion Status */}
      {isComplete && (
        <Card className="p-4 bg-green-50 border-green-200 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <p className="text-sm text-green-900">
            <strong>Store information saved.</strong> You can edit these details anytime
            before final launch.
          </p>
        </Card>
      )}

      {/* Form */}
      <Card className="p-6">
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {/* Seller Name */}
          <div>
            <Label htmlFor="sellerName">
              Store Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sellerName"
              value={formData.sellerName}
              onChange={(e) =>
                setFormData({ ...formData, sellerName: e.target.value })
              }
              placeholder="My Awesome Store"
              className="mt-2"
            />
            {errors.sellerName && (
              <p className="mt-1 text-sm text-destructive">{errors.sellerName}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              This is how your store appears to customers on ChatGPT
            </p>
          </div>

          {/* Seller URL */}
          <div>
            <Label htmlFor="sellerUrl">
              Store URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sellerUrl"
              type="url"
              value={formData.sellerUrl}
              onChange={(e) =>
                setFormData({ ...formData, sellerUrl: e.target.value })
              }
              placeholder="https://yourstore.com"
              className="mt-2"
            />
            {errors.sellerUrl && (
              <p className="mt-1 text-sm text-destructive">{errors.sellerUrl}</p>
            )}
          </div>

          {/* Privacy Policy */}
          <div>
            <Label htmlFor="sellerPrivacyPolicy">
              Privacy Policy URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sellerPrivacyPolicy"
              type="url"
              value={formData.sellerPrivacyPolicy}
              onChange={(e) =>
                setFormData({ ...formData, sellerPrivacyPolicy: e.target.value })
              }
              placeholder="https://yourstore.com/pages/privacy-policy"
              className="mt-2"
            />
            {errors.sellerPrivacyPolicy && (
              <p className="mt-1 text-sm text-destructive">
                {errors.sellerPrivacyPolicy}
              </p>
            )}
          </div>

          {/* Terms of Service */}
          <div>
            <Label htmlFor="sellerTos">
              Terms of Service URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sellerTos"
              type="url"
              value={formData.sellerTos}
              onChange={(e) =>
                setFormData({ ...formData, sellerTos: e.target.value })
              }
              placeholder="https://yourstore.com/pages/terms-of-service"
              className="mt-2"
            />
            {errors.sellerTos && (
              <p className="mt-1 text-sm text-destructive">{errors.sellerTos}</p>
            )}
          </div>

          {/* Return Policy */}
          <div>
            <Label htmlFor="returnPolicy">
              Return Policy <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="returnPolicy"
              value={formData.returnPolicy}
              onChange={(e) =>
                setFormData({ ...formData, returnPolicy: e.target.value })
              }
              placeholder="Describe your return policy in plain language..."
              rows={4}
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.returnPolicy && (
              <p className="mt-1 text-sm text-destructive">{errors.returnPolicy}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Clear return policies build customer trust and increase conversions
            </p>
          </div>

          {/* Return Window */}
          <div>
            <Label htmlFor="returnWindow">
              Return Window (Days) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="returnWindow"
              type="number"
              min={1}
              max={365}
              value={formData.returnWindow}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  returnWindow: parseInt(e.target.value) || 30,
                })
              }
              className="mt-2 max-w-xs"
            />
            {errors.returnWindow && (
              <p className="mt-1 text-sm text-destructive">{errors.returnWindow}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Number of days customers have to return items (typically 30-90 days)
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
              <>Save Store Information</>
            )}
          </Button>
        </form>
      </Card>

      {/* Why This Matters */}
      <div className="rounded-lg bg-secondary p-4">
        <p className="text-sm font-medium mb-2">Why this matters:</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          OpenAI's Agentic Commerce Protocol requires transparent policies. ChatGPT shows
          customers your return policy, privacy policy, and terms before checkout.{" "}
          <strong className="text-foreground">Clear policies increase customer trust and conversion rates.</strong>
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button variant="outline" onClick={() => router.push("/wizard/step-1")}>
          Back
        </Button>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">Step 2 of 7</div>
          <Button onClick={handleContinue} disabled={isSaving} size="lg">
            Continue to Product Review
          </Button>
        </div>
      </div>
    </div>
  );
}
