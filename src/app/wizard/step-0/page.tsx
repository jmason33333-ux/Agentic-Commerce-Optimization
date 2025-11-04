"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function Step0Page() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: application } = trpc.wizard.checkMerchantApplication.useQuery();
  const updateApplication = trpc.wizard.updateMerchantApplication.useMutation({
    onSuccess: () => {
      utils.wizard.checkMerchantApplication.invalidate();
      utils.wizard.getProgress.invalidate();
    },
  });
  const updateStep = trpc.wizard.updateStep.useMutation({
    onSuccess: () => {
      utils.wizard.getProgress.invalidate();
    },
  });

  const [isUpdating, setIsUpdating] = useState(false);

  const status = application?.merchantApplicationStatus || "not_started";

  const handleStatusUpdate = async (newStatus: "pending" | "approved" | "rejected") => {
    setIsUpdating(true);
    try {
      await updateApplication.mutateAsync({
        status: newStatus,
        applicationDate: newStatus === "pending" ? new Date() : undefined,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleContinue = async () => {
    if (status === "approved") {
      await updateStep.mutateAsync({
        step: 0,
        completed: true,
      });
      router.push("/wizard/step-1");
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "not_started":
        return (
          <Badge variant="outline" className="gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            Not Started
          </Badge>
        );
      case "pending":
        return (
          <Badge className="gap-1.5 bg-amber-500 hover:bg-amber-600">
            <Clock className="h-3.5 w-3.5" />
            Pending Review
          </Badge>
        );
      case "approved":
        return (
          <Badge className="gap-1.5 bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1.5">
            <XCircle className="h-3.5 w-3.5" />
            Rejected
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">
          OpenAI Merchant Application
        </h2>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          Before selling on ChatGPT, you need to be approved as an OpenAI Commerce merchant.
          This means your store meets OpenAI's quality and compliance standards.
        </p>
      </div>

      {/* Current Status Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Application Status
            </p>
            {getStatusBadge()}
          </div>

          {application?.merchantApplicationDate && (
            <p className="text-sm text-muted-foreground">
              Applied on{" "}
              {new Date(application.merchantApplicationDate).toLocaleDateString()}
            </p>
          )}
        </div>

        {status === "pending" && (
          <div className="mt-6 rounded-lg bg-secondary p-4">
            <p className="text-sm text-secondary-foreground leading-relaxed">
              <strong>Your application is under review.</strong> OpenAI typically responds
              within 3-5 business days. You'll receive an email once your application is reviewed.
            </p>
          </div>
        )}

        {status === "rejected" && (
          <div className="mt-6 rounded-lg bg-destructive/10 border border-destructive/20 p-4">
            <p className="text-sm text-destructive-foreground leading-relaxed">
              <strong>Your application needs attention.</strong> Check your email from OpenAI
              for specific feedback. You can address their concerns and reapply.
            </p>
          </div>
        )}

        {status === "approved" && (
          <div className="mt-6 rounded-lg bg-green-50 border border-green-200 p-4">
            <p className="text-sm text-green-900 leading-relaxed">
              <strong>Congratulations!</strong> Your store is approved to sell on ChatGPT.
              You can now continue with the setup wizard.
            </p>
          </div>
        )}
      </Card>

      {/* What You'll Need */}
      {status === "not_started" && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">What You'll Need</h3>
          <ul className="space-y-3">
            {[
              "A registered business with valid tax identification",
              "Professional product catalog with clear images and descriptions",
              "Return and refund policy that meets OpenAI standards",
              "Privacy policy and terms of service",
              "Customer support contact information",
            ].map((requirement, index) => (
              <li key={index} className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">{requirement}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Action Cards */}
      <div className="space-y-4">
        {status === "not_started" && (
          <Card className="p-6 bg-secondary/50">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">
                  Step 1: Apply to OpenAI Commerce
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Complete the application form on OpenAI's merchant portal. You'll need
                  your business information, product samples, and store policies.
                </p>
                <a
                  href="https://platform.openai.com/merchant/apply"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  Open Application Portal
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </Card>
        )}

        {status === "not_started" && (
          <Card className="p-6 bg-secondary/50">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">
                  Step 2: Update Your Status
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  After submitting your application, update your status here so we can
                  track your progress.
                </p>
                <Button
                  onClick={() => handleStatusUpdate("pending")}
                  disabled={isUpdating}
                >
                  I've Submitted My Application
                </Button>
              </div>
            </div>
          </Card>
        )}

        {(status === "pending" || status === "rejected") && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Update Application Status</h3>
            <div className="flex flex-wrap gap-3">
              {status === "pending" && (
                <>
                  <Button
                    onClick={() => handleStatusUpdate("approved")}
                    disabled={isUpdating}
                    className="gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Mark as Approved
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusUpdate("rejected")}
                    disabled={isUpdating}
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Mark as Rejected
                  </Button>
                </>
              )}
              {status === "rejected" && (
                <Button
                  onClick={() => handleStatusUpdate("pending")}
                  disabled={isUpdating}
                  className="gap-2"
                >
                  <Clock className="h-4 w-4" />
                  I've Reapplied
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div className="text-sm text-muted-foreground">
          Step 0 of 7
        </div>
        <Button
          onClick={handleContinue}
          disabled={status !== "approved"}
          size="lg"
        >
          Continue to Shopify Connection
        </Button>
      </div>
    </div>
  );
}
