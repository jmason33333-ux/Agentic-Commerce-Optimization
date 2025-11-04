# Cursor Integration Guide: Unified Wizard Implementation

**Complete guide for wiring v0 components to backend APIs**

This guide assumes you have:
1. ✅ Backend implementation complete (see `UNIFIED-WIZARD-BACKEND-IMPLEMENTATION.md`)
2. ✅ Frontend components generated from v0 (see `V0-UNIFIED-WIZARD-PROMPTS.md`)
3. ✅ tRPC configured in your Next.js app

---

## 📋 Table of Contents

1. [Project Structure](#project-structure)
2. [tRPC Setup](#trpc-setup)
3. [Step-by-Step Integration](#step-by-step-integration)
4. [State Management](#state-management)
5. [Error Handling](#error-handling)
6. [Testing](#testing)
7. [Deployment](#deployment)

---

## 1. Project Structure

```
your-app/
├── src/
│   ├── app/
│   │   ├── wizard/
│   │   │   └── page.tsx              # Main wizard page
│   │   └── dashboard/
│   │       └── page.tsx              # Post-wizard dashboard
│   ├── components/
│   │   ├── wizard/
│   │   │   ├── WizardShell.tsx       # From v0 - Prompt #1
│   │   │   ├── Step0MerchantApp.tsx  # From v0 - Prompt #2
│   │   │   ├── Step1Shopify.tsx      # From v0 - Prompt #3
│   │   │   ├── Step2StoreInfo.tsx    # From v0 - Prompt #4
│   │   │   ├── Step3Products.tsx     # From v0 - Prompt #5
│   │   │   ├── Step4Feed.tsx         # From v0 - Prompt #6
│   │   │   ├── Step5Stripe.tsx       # From v0 - Prompt #7
│   │   │   ├── Step6Checkout.tsx     # From v0 - Prompt #8
│   │   │   ├── Step7Testing.tsx      # From v0 - Prompt #9
│   │   │   └── Step8Success.tsx      # From v0 - Prompt #10
│   │   └── ui/                       # shadcn/ui components
│   ├── hooks/
│   │   ├── useWizardProgress.ts      # Custom hook for wizard state
│   │   └── useShopifyAuth.ts         # Shopify OAuth hook
│   ├── lib/
│   │   ├── trpc/
│   │   │   ├── client.ts             # tRPC client setup
│   │   │   └── hooks.ts              # tRPC React hooks
│   │   └── utils.ts
│   └── server/
│       └── api/
│           └── routers/
│               └── wizard.ts         # Backend wizard router
```

---

## 2. tRPC Setup

### 2.1 Client Configuration

**File:** `src/lib/trpc/client.ts`

```typescript
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/api/root';

export const trpc = createTRPCReact<AppRouter>();
```

### 2.2 Provider Setup

**File:** `src/app/providers.tsx`

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

### 2.3 Root Layout Update

**File:** `src/app/layout.tsx`

```typescript
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## 3. Step-by-Step Integration

### 3.1 Main Wizard Controller

**File:** `src/app/wizard/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { WizardShell } from '@/components/wizard/WizardShell';
import { Step0MerchantApp } from '@/components/wizard/Step0MerchantApp';
import { Step1Shopify } from '@/components/wizard/Step1Shopify';
import { Step2StoreInfo } from '@/components/wizard/Step2StoreInfo';
import { Step3Products } from '@/components/wizard/Step3Products';
import { Step4Feed } from '@/components/wizard/Step4Feed';
import { Step5Stripe } from '@/components/wizard/Step5Stripe';
import { Step6Checkout } from '@/components/wizard/Step6Checkout';
import { Step7Testing } from '@/components/wizard/Step7Testing';
import { Step8Success } from '@/components/wizard/Step8Success';
import { toast } from 'sonner';

const TOTAL_STEPS = 8;

export default function WizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [canProceed, setCanProceed] = useState(false);

  // Fetch wizard progress
  const { data: progress, isLoading } = trpc.wizard.getProgress.useQuery();

  // Update step mutation
  const updateStepMutation = trpc.wizard.updateStep.useMutation({
    onSuccess: () => {
      toast.success('Progress saved');
    },
    onError: (error) => {
      toast.error(`Failed to save progress: ${error.message}`);
    },
  });

  // Initialize current step from progress
  useState(() => {
    if (progress?.currentStep !== undefined) {
      setCurrentStep(progress.currentStep);
    }
  });

  const handleNext = async () => {
    // Save current step as completed
    await updateStepMutation.mutateAsync({
      step: currentStep,
      completed: true,
    });

    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
      setCanProceed(false);
    } else {
      // Wizard complete, redirect to dashboard
      router.push('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    // Only available on optional steps
    await updateStepMutation.mutateAsync({
      step: currentStep,
      completed: false,
      data: { skipped: true },
    });
    setCurrentStep(currentStep + 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Step0MerchantApp onValidationChange={setCanProceed} />;
      case 1:
        return <Step1Shopify onValidationChange={setCanProceed} />;
      case 2:
        return <Step2StoreInfo onValidationChange={setCanProceed} />;
      case 3:
        return <Step3Products onValidationChange={setCanProceed} />;
      case 4:
        return <Step4Feed onValidationChange={setCanProceed} />;
      case 5:
        return <Step5Stripe onValidationChange={setCanProceed} />;
      case 6:
        return <Step6Checkout onValidationChange={setCanProceed} />;
      case 7:
        return <Step7Testing onValidationChange={setCanProceed} />;
      default:
        return <Step8Success />;
    }
  };

  if (isLoading) {
    return <div>Loading wizard...</div>;
  }

  return (
    <WizardShell
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
      onNext={handleNext}
      onBack={handleBack}
      onSkip={currentStep === 4 ? handleSkip : undefined} // Only Step 4 is optional
      canProceed={canProceed}
      isLoading={updateStepMutation.isLoading}
    >
      {renderStep()}
    </WizardShell>
  );
}
```

---

### 3.2 Step 0: Merchant Application

**File:** `src/components/wizard/Step0MerchantApp.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { ExternalLink } from 'lucide-react';

interface Step0Props {
  onValidationChange: (isValid: boolean) => void;
}

export function Step0MerchantApp({ onValidationChange }: Step0Props) {
  const [status, setStatus] = useState<string>('not_started');

  // Check current application status
  const { data: applicationStatus } = trpc.wizard.checkMerchantApplication.useQuery();

  // Update application status mutation
  const updateStatusMutation = trpc.wizard.updateMerchantApplication.useMutation();

  useEffect(() => {
    if (applicationStatus) {
      setStatus(applicationStatus.merchantApplicationStatus || 'not_started');
    }
  }, [applicationStatus]);

  useEffect(() => {
    // Can proceed if already approved or marked as applied
    onValidationChange(status === 'approved' || status === 'pending');
  }, [status, onValidationChange]);

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    await updateStatusMutation.mutateAsync({
      status: newStatus as any,
      applicationDate: newStatus === 'pending' ? new Date() : undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      <Alert className="border-amber-500/50 bg-amber-500/10">
        <h3 className="font-semibold">Before We Begin: Merchant Application Required</h3>
        <p className="text-sm text-muted-foreground">
          ChatGPT requires merchant approval before you can start selling
        </p>
      </Alert>

      {/* Status Selector */}
      <RadioGroup value={status} onValueChange={handleStatusChange}>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="not_started" id="not-started" />
            <label htmlFor="not-started">I haven't applied yet</label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pending" id="pending" />
            <label htmlFor="pending">I've applied and waiting for approval</label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="approved" id="approved" />
            <label htmlFor="approved">I'm already approved</label>
          </div>
        </div>
      </RadioGroup>

      {/* Application CTA */}
      {status === 'not_started' && (
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
          <h4 className="mb-4 font-semibold">Apply Now</h4>
          <Button asChild className="w-full">
            <a
              href="https://chatgpt.com/merchants"
              target="_blank"
              rel="noopener noreferrer"
            >
              Apply at chatgpt.com/merchants
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      )}

      {/* Info Note */}
      <Alert>
        <p className="text-sm">
          💡 You can complete setup now and submit your feed later when approved.
          Your progress is saved automatically.
        </p>
      </Alert>
    </div>
  );
}
```

---

### 3.3 Step 1: Shopify Connection

**File:** `src/components/wizard/Step1Shopify.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface Step1Props {
  onValidationChange: (isValid: boolean) => void;
}

export function Step1Shopify({ onValidationChange }: Step1Props) {
  const [shopName, setShopName] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  // Check if already connected
  const { data: progress } = trpc.wizard.getProgress.useQuery();

  // Initiate OAuth mutation
  const initiateOAuthMutation = trpc.wizard.initiateShopifyOAuth.useMutation({
    onSuccess: (data) => {
      // Redirect to Shopify OAuth
      window.location.href = data.authUrl;
    },
    onError: (error) => {
      toast.error(`Connection failed: ${error.message}`);
    },
  });

  useEffect(() => {
    // Check if Shopify is already connected
    const connected = !!progress?.workspace?.shopifyDomain;
    setIsConnected(connected);
    onValidationChange(connected);
  }, [progress, onValidationChange]);

  const handleConnect = () => {
    if (!shopName) {
      toast.error('Please enter your store name');
      return;
    }

    const fullShopDomain = shopName.includes('.myshopify.com')
      ? shopName
      : `${shopName}.myshopify.com`;

    initiateOAuthMutation.mutate({ shop: fullShopDomain });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConnect();
    }
  };

  if (isConnected) {
    return (
      <Card className="border-emerald-500/50 bg-emerald-500/10 p-6">
        <div className="flex items-center gap-4">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          <div>
            <h3 className="font-semibold">Connected to Shopify</h3>
            <p className="text-sm text-muted-foreground">
              {progress?.workspace?.shopifyDomain}
            </p>
            {progress?.step1_data && (
              <Badge className="mt-2">
                {(progress.step1_data as any).productsImported} products imported
              </Badge>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Connect Your Shopify Store</h2>
        <p className="text-muted-foreground">
          We'll automatically import your products, store information, and policies
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl">🔒</div>
            <h4 className="font-semibold">Secure OAuth</h4>
            <p className="text-sm text-muted-foreground">Bank-level encryption</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl">📦</div>
            <h4 className="font-semibold">Auto-Import</h4>
            <p className="text-sm text-muted-foreground">Products, images, inventory</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl">⚡</div>
            <h4 className="font-semibold">Real-Time Sync</h4>
            <p className="text-sm text-muted-foreground">Updates automatically</p>
          </div>
        </Card>
      </div>

      {/* Connection Form */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Shopify Store Name</label>
          <div className="flex gap-2">
            <Input
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="your-store"
              className="flex-1"
              autoFocus
            />
            <span className="flex items-center text-muted-foreground">
              .myshopify.com
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your Shopify store name
          </p>
        </div>

        <Button
          onClick={handleConnect}
          disabled={!shopName || initiateOAuthMutation.isLoading}
          className="w-full"
          size="lg"
        >
          {initiateOAuthMutation.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            'Connect to Shopify'
          )}
        </Button>
      </div>

      {/* Info Alert */}
      <Alert>
        <p className="text-sm">
          You'll be redirected to Shopify to authorize the connection. We only request
          read access to your products and store information.
        </p>
      </Alert>
    </div>
  );
}
```

---

### 3.4 Step 2: Store Information

**File:** `src/components/wizard/Step2StoreInfo.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Step2Props {
  onValidationChange: (isValid: boolean) => void;
}

export function Step2StoreInfo({ onValidationChange }: Step2Props) {
  const [formData, setFormData] = useState({
    sellerName: '',
    sellerUrl: '',
    sellerPrivacyPolicy: '',
    sellerTos: '',
    returnPolicy: '',
    returnWindow: 30,
  });

  // Fetch current progress (has auto-populated data)
  const { data: progress } = trpc.wizard.getProgress.useQuery();

  // Update store info mutation
  const updateMutation = trpc.wizard.updateStoreInfo.useMutation({
    onSuccess: () => {
      toast.success('Store information saved');
    },
    onError: (error) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  useEffect(() => {
    // Auto-populate from Shopify if available
    if (progress?.workspace) {
      setFormData({
        sellerName: progress.workspace.sellerName || '',
        sellerUrl: progress.workspace.sellerUrl || '',
        sellerPrivacyPolicy: progress.workspace.sellerPrivacyPolicy || '',
        sellerTos: progress.workspace.sellerTos || '',
        returnPolicy: progress.workspace.returnPolicy || '',
        returnWindow: progress.workspace.returnWindow || 30,
      });
    }
  }, [progress]);

  useEffect(() => {
    // Validate all required fields
    const isValid =
      formData.sellerName.length > 0 &&
      formData.sellerUrl.length > 0 &&
      formData.sellerPrivacyPolicy.length > 0 &&
      formData.sellerTos.length > 0 &&
      formData.returnPolicy.length >= 50;

    onValidationChange(isValid);
  }, [formData, onValidationChange]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = async () => {
    // Auto-save on blur
    try {
      await updateMutation.mutateAsync(formData);
    } catch (error) {
      // Error already handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Verify Your Store Information</h2>
        <p className="text-muted-foreground">
          This information will appear in ChatGPT when customers shop
        </p>
        <Badge className="mt-2">Auto-populated from Shopify</Badge>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Store Name */}
        <div>
          <Label htmlFor="sellerName">
            Store Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="sellerName"
            value={formData.sellerName}
            onChange={(e) => handleChange('sellerName', e.target.value)}
            onBlur={handleBlur}
            placeholder="Your Store Name"
          />
          <p className="mt-1 text-sm text-muted-foreground">
            This is shown to customers in ChatGPT
          </p>
        </div>

        {/* Store URL */}
        <div>
          <Label htmlFor="sellerUrl">
            Store Website URL <span className="text-red-500">*</span>
          </Label>
          <Input
            id="sellerUrl"
            type="url"
            value={formData.sellerUrl}
            onChange={(e) => handleChange('sellerUrl', e.target.value)}
            onBlur={handleBlur}
            placeholder="https://yourstore.com"
          />
        </div>

        {/* Privacy Policy URL */}
        <div>
          <Label htmlFor="privacyPolicy">
            Privacy Policy URL <span className="text-red-500">*</span>
          </Label>
          <Input
            id="privacyPolicy"
            type="url"
            value={formData.sellerPrivacyPolicy}
            onChange={(e) => handleChange('sellerPrivacyPolicy', e.target.value)}
            onBlur={handleBlur}
            placeholder="https://yourstore.com/privacy"
          />
          {!formData.sellerPrivacyPolicy && (
            <p className="mt-1 text-sm text-amber-500">
              ⚠️ Required by OpenAI
            </p>
          )}
        </div>

        {/* Terms of Service URL */}
        <div>
          <Label htmlFor="tos">
            Terms of Service URL <span className="text-red-500">*</span>
          </Label>
          <Input
            id="tos"
            type="url"
            value={formData.sellerTos}
            onChange={(e) => handleChange('sellerTos', e.target.value)}
            onBlur={handleBlur}
            placeholder="https://yourstore.com/terms"
          />
        </div>

        {/* Return Policy */}
        <div>
          <Label htmlFor="returnPolicy">
            Return Policy <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="returnPolicy"
            value={formData.returnPolicy}
            onChange={(e) => handleChange('returnPolicy', e.target.value)}
            onBlur={handleBlur}
            placeholder="Describe your return policy in plain language..."
            rows={4}
          />
          <p className="mt-1 text-sm text-muted-foreground">
            {formData.returnPolicy.length} / 500 characters (min 50)
          </p>
        </div>

        {/* Return Window */}
        <div>
          <Label htmlFor="returnWindow">
            Return Window <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.returnWindow.toString()}
            onValueChange={(value) => handleChange('returnWindow', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="45">45 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Auto-save indicator */}
      {updateMutation.isLoading && (
        <p className="text-sm text-muted-foreground">Saving...</p>
      )}
      {updateMutation.isSuccess && (
        <p className="text-sm text-emerald-500">✓ Saved</p>
      )}
    </div>
  );
}
```

---

### 3.5 Step 3: Product Readiness

**File:** `src/components/wizard/Step3Products.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface Step3Props {
  onValidationChange: (isValid: boolean) => void;
}

export function Step3Products({ onValidationChange }: Step3Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'ready' | 'incomplete'>('all');

  // Fetch product readiness data
  const { data: readiness, isLoading } = trpc.wizard.getProductReadiness.useQuery();

  // Toggle product mutation
  const toggleMutation = trpc.wizard.toggleProduct.useMutation({
    onSuccess: () => {
      // Refetch readiness data
      utils.wizard.getProductReadiness.invalidate();
    },
  });

  const utils = trpc.useUtils();

  useEffect(() => {
    // Can proceed if at least one product is enabled
    const hasEnabled = readiness?.products?.some(
      (p) => p.enableSearch || p.enableCheckout
    );
    onValidationChange(!!hasEnabled);
  }, [readiness, onValidationChange]);

  const handleToggle = async (
    productId: string,
    field: 'enableSearch' | 'enableCheckout',
    value: boolean
  ) => {
    await toggleMutation.mutateAsync({
      productId,
      [field]: value,
    });
  };

  const filteredProducts = readiness?.products?.filter((p) => {
    // Apply search filter
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Apply status filter
    if (filter === 'ready' && !p.isCompliant) return false;
    if (filter === 'incomplete' && p.isCompliant) return false;

    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="text-3xl font-bold text-emerald-500">
            {readiness?.ready || 0}
          </div>
          <p className="text-sm text-muted-foreground">Ready to Sell</p>
        </Card>
        <Card className="p-4">
          <div className="text-3xl font-bold text-red-500">
            {readiness?.incomplete || 0}
          </div>
          <p className="text-sm text-muted-foreground">Need Attention</p>
        </Card>
        <Card className="p-4">
          <div className="text-3xl font-bold text-purple-500">
            {Math.round(((readiness?.ready || 0) / (readiness?.total || 1)) * 100)}%
          </div>
          <p className="text-sm text-muted-foreground">Compliance Rate</p>
        </Card>
      </div>

      {/* Info Banner */}
      <Alert className="border-amber-500/50 bg-amber-500/10">
        <p className="text-sm">
          Only products meeting OpenAI requirements can be enabled. You can optimize
          the incomplete products after setup completes.
        </p>
      </Alert>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <div className="flex gap-2">
          <Badge
            variant={filter === 'all' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setFilter('all')}
          >
            All ({readiness?.total})
          </Badge>
          <Badge
            variant={filter === 'ready' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setFilter('ready')}
          >
            Ready ({readiness?.ready})
          </Badge>
          <Badge
            variant={filter === 'incomplete' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setFilter('incomplete')}
          >
            Incomplete ({readiness?.incomplete})
          </Badge>
        </div>
      </div>

      {/* Product List */}
      <div className="space-y-3">
        {filteredProducts?.map((product) => (
          <Card key={product.id} className="p-4">
            <div className="flex items-center gap-4">
              {/* Product Image */}
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="h-16 w-16 rounded object-cover"
                />
              )}

              {/* Product Info */}
              <div className="flex-1">
                <h4 className="font-semibold">{product.title}</h4>
                <p className="text-sm text-muted-foreground">{product.price}</p>
                {product.isCompliant ? (
                  <Badge className="mt-1 bg-emerald-500">Complete</Badge>
                ) : (
                  <Badge variant="destructive" className="mt-1">
                    {(product.missingFields as string[])?.length || 0} fields missing
                  </Badge>
                )}
              </div>

              {/* Toggle Controls */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🔍 Search</span>
                  <Switch
                    checked={product.enableSearch}
                    onCheckedChange={(checked) =>
                      handleToggle(product.id, 'enableSearch', checked)
                    }
                    disabled={!product.canEnable}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">🛒 Checkout</span>
                  <Switch
                    checked={product.enableCheckout}
                    onCheckedChange={(checked) =>
                      handleToggle(product.id, 'enableCheckout', checked)
                    }
                    disabled={!product.canEnable}
                  />
                </div>
              </div>
            </div>

            {/* Show missing fields for incomplete products */}
            {!product.isCompliant && (
              <div className="mt-3 border-t pt-3">
                <p className="text-sm font-medium">Missing Fields:</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {(product.missingFields as string[])?.map((field) => (
                    <Badge key={field} variant="outline" className="text-xs">
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

### 3.6 Remaining Steps (4-7)

**For Steps 4-7**, follow the same pattern:

1. **Import tRPC hooks** for the relevant endpoints
2. **Use mutations** for write operations (updateStoreInfo, submitFeed, etc.)
3. **Use queries** for read operations (getConfig, getStatus, etc.)
4. **Handle loading states** with skeletons/spinners
5. **Handle errors** with toast notifications
6. **Validate** before allowing progression
7. **Auto-save** where appropriate

Example skeleton for Step 5 (Stripe):

```typescript
export function Step5Stripe({ onValidationChange }: StepProps) {
  const [credentials, setCredentials] = useState({...});
  const configureMutation = trpc.checkout.configureStripe.useMutation();
  const testMutation = trpc.checkout.testStripeConnection.useMutation();

  // ... implementation following same patterns
}
```

---

## 4. State Management

### 4.1 Custom Hook: useWizardProgress

**File:** `src/hooks/useWizardProgress.ts`

```typescript
import { trpc } from '@/lib/trpc/client';
import { useCallback } from 'react';

export function useWizardProgress() {
  const utils = trpc.useUtils();

  const { data: progress, isLoading } = trpc.wizard.getProgress.useQuery();

  const updateStep = trpc.wizard.updateStep.useMutation({
    onSuccess: () => {
      // Invalidate and refetch
      utils.wizard.getProgress.invalidate();
    },
  });

  const markStepComplete = useCallback(
    async (step: number, data?: any) => {
      await updateStep.mutateAsync({
        step,
        completed: true,
        data,
      });
    },
    [updateStep]
  );

  const isStepComplete = useCallback(
    (step: number) => {
      const fieldName = `step${step}_completed` as keyof typeof progress;
      return progress?.[fieldName] || false;
    },
    [progress]
  );

  return {
    progress,
    isLoading,
    markStepComplete,
    isStepComplete,
    currentStep: progress?.currentStep || 0,
  };
}
```

### 4.2 Shopify OAuth Callback Handler

**File:** `src/app/api/auth/shopify/callback/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { completeShopifyOAuth } from '@/server/api/routers/wizard';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const shop = searchParams.get('shop');
  const state = searchParams.get('state');

  if (!code || !shop || !state) {
    return NextResponse.redirect('/wizard?error=invalid_oauth');
  }

  try {
    // Call backend to complete OAuth
    // This would use your tRPC backend endpoint
    // For now, redirect back to wizard

    return NextResponse.redirect('/wizard?step=1&oauth=success');
  } catch (error) {
    return NextResponse.redirect('/wizard?error=oauth_failed');
  }
}
```

---

## 5. Error Handling

### 5.1 Global Error Boundary

**File:** `src/components/ErrorBoundary.tsx`

```typescript
'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-6">
          <Alert variant="destructive" className="max-w-lg">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription className="mt-2">
              {this.state.error?.message || 'An unexpected error occurred'}
            </AlertDescription>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Reload Page
            </Button>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 5.2 tRPC Error Handling

```typescript
// In any component using tRPC
const mutation = trpc.wizard.updateStep.useMutation({
  onError: (error) => {
    if (error.data?.code === 'UNAUTHORIZED') {
      toast.error('Please log in to continue');
      router.push('/login');
    } else if (error.data?.code === 'BAD_REQUEST') {
      toast.error(`Validation error: ${error.message}`);
    } else {
      toast.error('An unexpected error occurred');
      console.error(error);
    }
  },
});
```

---

## 6. Testing

### 6.1 Component Tests

```typescript
// src/components/wizard/__tests__/Step1Shopify.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Step1Shopify } from '../Step1Shopify';

describe('Step1Shopify', () => {
  it('renders connection form', () => {
    render(<Step1Shopify onValidationChange={() => {}} />);
    expect(screen.getByPlaceholderText('your-store')).toBeInTheDocument();
  });

  it('validates store name format', () => {
    const onValidationChange = jest.fn();
    render(<Step1Shopify onValidationChange={onValidationChange} />);

    const input = screen.getByPlaceholderText('your-store');
    fireEvent.change(input, { target: { value: 'test-store' } });

    expect(onValidationChange).toHaveBeenCalledWith(false);
  });
});
```

### 6.2 Integration Tests

```typescript
// src/app/wizard/__tests__/wizard-flow.test.tsx
import { render, screen } from '@testing-library/react';
import WizardPage from '../page';

describe('Wizard Flow', () => {
  it('progresses through steps', async () => {
    render(<WizardPage />);

    // Start at step 0
    expect(screen.getByText(/merchant application/i)).toBeInTheDocument();

    // Test progression logic
    // ...
  });
});
```

---

## 7. Deployment

### 7.1 Environment Variables

```env
# .env.local
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# Shopify
SHOPIFY_CLIENT_ID="your_client_id"
SHOPIFY_CLIENT_SECRET="your_client_secret"
SHOPIFY_REDIRECT_URI="http://localhost:3000/api/auth/shopify/callback"

# OpenAI
OPENAI_API_KEY="sk-..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."

# Encryption
ENCRYPTION_KEY="your_32_character_key_here"
```

### 7.2 Deployment Checklist

- [ ] Update environment variables for production
- [ ] Set up database migrations (Prisma)
- [ ] Configure Shopify app for production URLs
- [ ] Update Stripe webhook endpoints
- [ ] Test full OAuth flow in production
- [ ] Set up error monitoring (Sentry)
- [ ] Configure analytics (PostHog, Amplitude)
- [ ] Test wizard flow end-to-end
- [ ] Load test with 1000+ products

---

## ✅ Quick Start

1. **Install dependencies:**
   ```bash
   npm install @trpc/server @trpc/client @trpc/react-query
   npm install @tanstack/react-query
   npm install sonner # For toast notifications
   ```

2. **Generate v0 components:**
   - Visit v0.dev
   - Paste each prompt from `V0-UNIFIED-WIZARD-PROMPTS.md`
   - Download and add to `src/components/wizard/`

3. **Wire up tRPC:**
   - Copy backend router from `UNIFIED-WIZARD-BACKEND-IMPLEMENTATION.md`
   - Add to `src/server/api/routers/wizard.ts`
   - Update `src/server/api/root.ts` to include wizard router

4. **Implement each step:**
   - Start with Step 0 (simplest)
   - Test each step before moving to next
   - Use examples above as templates

5. **Test the flow:**
   ```bash
   npm run dev
   # Navigate to /wizard
   # Complete each step
   # Verify data persists
   ```

---

## 🎯 Success Criteria

Wizard is ready when:
- [ ] All 8 steps render correctly
- [ ] Validation works for each step
- [ ] Data saves to backend
- [ ] Progress persists on refresh
- [ ] Shopify OAuth works end-to-end
- [ ] Product import completes successfully
- [ ] Feed submission works
- [ ] Checkout registration succeeds
- [ ] Tests complete successfully
- [ ] Mobile responsive
- [ ] Error handling works
- [ ] Can complete full flow in < 10 minutes

---

**You're ready to build! Start with Step 0 and work your way through. Good luck! 🚀**
