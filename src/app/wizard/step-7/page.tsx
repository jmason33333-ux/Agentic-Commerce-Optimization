"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Loader2, Rocket, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function Step7Page() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const runTests = trpc.wizard.runSetupTests.useMutation();
  const updateStep = trpc.wizard.updateStep.useMutation({
    onSuccess: () => {
      utils.wizard.getProgress.invalidate();
    },
  });

  const handleRunTests = async () => {
    setIsTesting(true);
    try {
      const results = await runTests.mutateAsync();
      setTestResults(results);
    } catch (error) {
      console.error("Tests failed:", error);
    } finally {
      setIsTesting(false);
    }
  };

  const handleLaunch = async () => {
    await updateStep.mutateAsync({
      step: 7,
      completed: true,
    });
    router.push("/dashboard");
  };

  const getTestStatus = (passed: boolean) => {
    return passed ? (
      <CheckCircle2 className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-destructive" />
    );
  };

  const allTestsPassed = testResults && Object.values(testResults).every((v) => v === true);
  const testsRun = testResults !== null;
  const passedTests = testResults ? Object.values(testResults).filter((v) => v === true).length : 0;
  const totalTests = 7;
  const progressPercentage = testsRun ? (passedTests / totalTests) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Testing & Launch</h2>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          Run comprehensive tests to verify your setup. This means your store is
          fully configured and ready to start selling on ChatGPT.
        </p>
      </div>

      {/* Test Progress */}
      {testsRun && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold">Test Results</p>
              <p className="text-sm text-muted-foreground">
                {passedTests} of {totalTests} tests passed
              </p>
            </div>
            <Badge
              className={
                allTestsPassed
                  ? "bg-green-500"
                  : "bg-amber-500"
              }
            >
              {allTestsPassed ? "All Tests Passed" : `${passedTests}/${totalTests} Passed`}
            </Badge>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </Card>
      )}

      {/* Run Tests Button */}
      {!testsRun && (
        <Card className="p-6 text-center">
          <div className="mx-auto max-w-md space-y-4">
            <div className="mx-auto rounded-full bg-secondary p-4 w-fit">
              <Rocket className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Ready to Test Your Setup</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                We'll verify all integrations are working correctly before you launch.
                This takes about 30 seconds.
              </p>
            </div>
            <Button
              onClick={handleRunTests}
              disabled={isTesting}
              size="lg"
              className="gap-2"
            >
              {isTesting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>Run Setup Tests</>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Test Results */}
      {testsRun && testResults && (
        <div className="space-y-3">
          <Card className="p-4 flex items-center gap-3">
            {getTestStatus(testResults.shopifyConnection)}
            <div className="flex-1">
              <p className="font-medium text-sm">Shopify Connection</p>
              <p className="text-xs text-muted-foreground">
                Verify Shopify store is connected and accessible
              </p>
            </div>
            <Badge variant={testResults.shopifyConnection ? "default" : "destructive"}>
              {testResults.shopifyConnection ? "Pass" : "Fail"}
            </Badge>
          </Card>

          <Card className="p-4 flex items-center gap-3">
            {getTestStatus(testResults.storeInfo)}
            <div className="flex-1">
              <p className="font-medium text-sm">Store Information</p>
              <p className="text-xs text-muted-foreground">
                Verify all required store details and policies are complete
              </p>
            </div>
            <Badge variant={testResults.storeInfo ? "default" : "destructive"}>
              {testResults.storeInfo ? "Pass" : "Fail"}
            </Badge>
          </Card>

          <Card className="p-4 flex items-center gap-3">
            {getTestStatus(testResults.productsReady)}
            <div className="flex-1">
              <p className="font-medium text-sm">Products Ready</p>
              <p className="text-xs text-muted-foreground">
                At least one product enabled for search or checkout
              </p>
            </div>
            <Badge variant={testResults.productsReady ? "default" : "destructive"}>
              {testResults.productsReady ? "Pass" : "Fail"}
            </Badge>
          </Card>

          <Card className="p-4 flex items-center gap-3">
            {getTestStatus(testResults.feedConfiguration)}
            <div className="flex-1">
              <p className="font-medium text-sm">Feed Configuration</p>
              <p className="text-xs text-muted-foreground">
                OpenAI merchant credentials configured correctly
              </p>
            </div>
            <Badge variant={testResults.feedConfiguration ? "default" : "destructive"}>
              {testResults.feedConfiguration ? "Pass" : "Fail"}
            </Badge>
          </Card>

          <Card className="p-4 flex items-center gap-3">
            {getTestStatus(testResults.stripeConnection)}
            <div className="flex-1">
              <p className="font-medium text-sm">Stripe Connection</p>
              <p className="text-xs text-muted-foreground">
                Stripe payment credentials configured correctly
              </p>
            </div>
            <Badge variant={testResults.stripeConnection ? "default" : "destructive"}>
              {testResults.stripeConnection ? "Pass" : "Fail"}
            </Badge>
          </Card>

          <Card className="p-4 flex items-center gap-3">
            {getTestStatus(testResults.checkoutEndpoints)}
            <div className="flex-1">
              <p className="font-medium text-sm">Checkout Endpoints</p>
              <p className="text-xs text-muted-foreground">
                Checkout URLs configured and accessible
              </p>
            </div>
            <Badge variant={testResults.checkoutEndpoints ? "default" : "destructive"}>
              {testResults.checkoutEndpoints ? "Pass" : "Fail"}
            </Badge>
          </Card>

          <Card className="p-4 flex items-center gap-3">
            {getTestStatus(testResults.openaiRegistration)}
            <div className="flex-1">
              <p className="font-medium text-sm">OpenAI Registration</p>
              <p className="text-xs text-muted-foreground">
                Checkout registered with OpenAI Commerce API
              </p>
            </div>
            <Badge variant={testResults.openaiRegistration ? "default" : "destructive"}>
              {testResults.openaiRegistration ? "Pass" : "Fail"}
            </Badge>
          </Card>
        </div>
      )}

      {/* Failed Tests Warning */}
      {testsRun && !allTestsPassed && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900">
              Some tests failed
            </p>
            <p className="mt-1 text-sm text-amber-800">
              Please go back and fix the failing steps before launching. All tests must
              pass to ensure your store works correctly on ChatGPT.
            </p>
          </div>
        </div>
      )}

      {/* Launch Card */}
      {allTestsPassed && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-green-100 p-3">
              <Rocket className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900">
                Ready to Launch!
              </h3>
              <p className="mt-2 text-sm text-green-800 leading-relaxed">
                All systems are go! Your store is fully configured and ready to start
                selling on ChatGPT. Click Launch to complete the setup wizard and go
                to your dashboard.
              </p>
              <div className="mt-6">
                <Button
                  onClick={handleLaunch}
                  size="lg"
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Rocket className="h-4 w-4" />
                  Launch Your Store
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* What's Next */}
      {allTestsPassed && (
        <div className="rounded-lg bg-secondary p-4">
          <p className="text-sm font-medium mb-3">What happens next:</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              Your products are live and discoverable in ChatGPT
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              Customers can browse and purchase through ChatGPT conversations
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              Orders will appear in your Shopify dashboard for fulfillment
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              Monitor sales and analytics in your dashboard
            </li>
          </ul>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={() => router.push("/wizard/step-6")}
        >
          Back
        </Button>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">Step 7 of 7</div>
          {testsRun && !allTestsPassed && (
            <Button
              variant="outline"
              onClick={handleRunTests}
              disabled={isTesting}
            >
              Re-run Tests
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
