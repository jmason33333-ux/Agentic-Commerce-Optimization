"use client";

import { usePathname, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Check } from "lucide-react";

const WIZARD_STEPS = [
  { number: 0, label: "Merchant Application", path: "/wizard/step-0" },
  { number: 1, label: "Shopify Connection", path: "/wizard/step-1" },
  { number: 2, label: "Store Information", path: "/wizard/step-2" },
  { number: 3, label: "Product Review", path: "/wizard/step-3" },
  { number: 4, label: "Feed Configuration", path: "/wizard/step-4" },
  { number: 5, label: "Stripe Configuration", path: "/wizard/step-5" },
  { number: 6, label: "Checkout Registration", path: "/wizard/step-6" },
  { number: 7, label: "Testing & Launch", path: "/wizard/step-7" },
];

export default function WizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: progress } = trpc.wizard.getProgress.useQuery();

  const currentStepNumber = WIZARD_STEPS.find((s) => s.path === pathname)?.number ?? 0;

  const isStepCompleted = (stepNum: number): boolean => {
    if (!progress) return false;
    const fieldName = `step${stepNum}_completed` as keyof typeof progress;
    return progress[fieldName] === true;
  };

  const canAccessStep = (stepNum: number): boolean => {
    // Always allow access to current step
    if (stepNum === currentStepNumber) return true;
    // Allow access to completed steps
    if (isStepCompleted(stepNum)) return true;
    // Allow access if previous step is completed
    if (stepNum === 0) return true;
    return isStepCompleted(stepNum - 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Setup Wizard
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Get your store ready to sell on ChatGPT in under 30 minutes
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Save & Exit
            </button>
          </div>
        </div>
      </header>

      {/* Progress Stepper */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-8 py-8">
          <nav aria-label="Progress">
            <ol className="flex items-center justify-between gap-4">
              {WIZARD_STEPS.map((step, index) => {
                const isCompleted = isStepCompleted(step.number);
                const isCurrent = step.number === currentStepNumber;
                const canAccess = canAccessStep(step.number);

                return (
                  <li key={step.number} className="flex flex-1 items-center">
                    <button
                      onClick={() => canAccess && router.push(step.path)}
                      disabled={!canAccess}
                      className="group flex flex-col items-center gap-2 disabled:cursor-not-allowed"
                    >
                      {/* Step Circle */}
                      <div
                        className={`
                          flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors
                          ${
                            isCompleted
                              ? "bg-primary text-primary-foreground"
                              : isCurrent
                              ? "border-2 border-primary bg-background text-primary"
                              : "border-2 border-border bg-background text-muted-foreground group-hover:border-primary group-disabled:hover:border-border"
                          }
                        `}
                      >
                        {isCompleted ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <span>{step.number}</span>
                        )}
                      </div>

                      {/* Step Label */}
                      <span
                        className={`
                          text-xs font-medium text-center max-w-[120px] transition-colors
                          ${
                            isCurrent
                              ? "text-primary"
                              : isCompleted
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }
                        `}
                      >
                        {step.label}
                      </span>
                    </button>

                    {/* Connector Line */}
                    {index < WIZARD_STEPS.length - 1 && (
                      <div
                        className={`
                          mx-2 h-0.5 flex-1 transition-colors
                          ${
                            isCompleted
                              ? "bg-primary"
                              : "bg-border"
                          }
                        `}
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-8 py-12">{children}</main>
    </div>
  );
}
