# MVP Launch Branch - Merge Strategy & Implementation Guide

## 🎯 Branch Purpose

This branch contains a **production-ready MVP** with:
- ✅ Unified Wizard (8-step onboarding)
- ✅ Feed Management Dashboard
- ✅ Product Toggles
- ✅ Basic Order Tracking
- ✅ Security Mitigations
- ❌ NO Optimization/AI (deferred to v2)

---

## 📊 Feature Matrix

| Feature | Branch 1 | Branch 2 | MVP Status | v2 Status |
|---------|----------|----------|------------|-----------|
| **Wizard (Steps 0-7)** | - | ✅ | ✅ INCLUDE | - |
| **Shopify OAuth** | - | ✅ | ✅ INCLUDE | - |
| **Feed Generation** | - | ✅ | ✅ INCLUDE | - |
| **Feed Dashboard UI** | ✅ | - | ✅ INCLUDE | - |
| **Product Toggles UI** | ✅ | - | ✅ INCLUDE | - |
| **ACP Checkout** | - | ✅ | ✅ INCLUDE | - |
| **Basic Order Tracking** | ✅ | ✅ | ✅ INCLUDE | - |
| **Optimization Scoring** | ✅ | - | ❌ DEFER | ✅ v2 |
| **AI Suggestions** | ✅ | - | ❌ DEFER | ✅ v2 |
| **Approvals Workflow** | ✅ | - | ❌ DEFER | ✅ v2 |
| **Advanced Analytics** | ✅ | - | ❌ DEFER | ✅ v2 |

---

## 🗂️ Codebase Organization

```
src/
├── app/                          # Next.js pages
│   ├── wizard/                   # ✅ MVP - Wizard flow
│   ├── dashboard/
│   │   ├── feed/                 # ✅ MVP - Feed management
│   │   ├── products/             # ✅ MVP - Product toggles
│   │   └── orders/               # ✅ MVP - Basic order list
│   └── v2/                       # 🔒 v2 ONLY - Optimization features
│       ├── optimize/             # ❌ Defer to v2
│       ├── approvals/            # ❌ Defer to v2
│       └── analytics/            # ❌ Defer to v2
│
├── lib/
│   ├── shopify/                  # ✅ MVP - OAuth & API client
│   ├── services/
│   │   ├── shopifyImport.ts      # ✅ MVP - Basic import (NO scoring)
│   │   └── feedGeneration.ts    # ✅ MVP - Feed generation
│   ├── encryption.ts             # ✅ MVP - Security mitigation
│   ├── security/                 # ✅ MVP - New security utils
│   │   ├── apiKeyManager.ts      # Key encryption/rotation
│   │   ├── rateLimiter.ts        # Rate limiting
│   │   └── monitoring.ts         # Error tracking
│   └── optimization/             # 🔒 v2 ONLY
│       ├── calculate-score.ts    # ❌ Defer to v2
│       ├── calculate-impact.ts   # ❌ Defer to v2
│       └── types.ts              # ❌ Defer to v2
│
├── server/
│   └── routers/
│       ├── wizard.ts             # ✅ MVP - Wizard endpoints
│       ├── feed.ts               # ✅ MVP - Feed management
│       ├── checkout.ts           # ✅ MVP - Checkout config
│       ├── product.ts            # ✅ MVP - Basic CRUD + toggles
│       ├── order.ts              # ✅ MVP - Basic order list
│       └── v2/                   # 🔒 v2 ONLY
│           ├── suggestion.ts     # ❌ Defer to v2
│           ├── optimization.ts   # ❌ Defer to v2
│           └── analytics.ts      # ❌ Defer to v2
│
└── components/
    ├── wizard/                   # ✅ MVP - Wizard UI
    ├── feed/                     # ✅ MVP - Feed dashboard
    ├── products/                 # ✅ MVP - Product toggles
    └── v2/                       # 🔒 v2 ONLY
        ├── optimization/         # ❌ Defer to v2
        ├── suggestions/          # ❌ Defer to v2
        └── approvals/            # ❌ Defer to v2
```

---

## 🛡️ Security Mitigations (MVP)

### **1. API Key Management**

**File:** `src/lib/security/apiKeyManager.ts`

```typescript
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // 32 bytes
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}

/**
 * Encrypt sensitive API keys with AES-256-GCM
 * More secure than CBC - provides authentication
 */
export function encryptApiKey(plaintext: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  // Store as JSON: {encrypted, iv, authTag}
  const data: EncryptedData = {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };

  return JSON.stringify(data);
}

/**
 * Decrypt API key
 */
export function decryptApiKey(ciphertext: string): string {
  const data: EncryptedData = JSON.parse(ciphertext);

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(data.iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));

  let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Rotate encryption key (for security best practices)
 * Call this periodically or after suspected breach
 */
export async function rotateApiKeys(db: PrismaClient) {
  const workspaces = await db.workspace.findMany({
    where: {
      OR: [
        { openaiApiKey: { not: null } },
        { shopifyAccessToken: { not: null } },
      ],
    },
  });

  for (const workspace of workspaces) {
    const updates: any = {};

    if (workspace.openaiApiKey) {
      const decrypted = decryptApiKey(workspace.openaiApiKey);
      updates.openaiApiKey = encryptApiKey(decrypted); // Re-encrypt
    }

    if (workspace.shopifyAccessToken) {
      const decrypted = decryptApiKey(workspace.shopifyAccessToken);
      updates.shopifyAccessToken = encryptApiKey(decrypted);
    }

    await db.workspace.update({
      where: { id: workspace.id },
      data: updates,
    });
  }

  console.log(`✅ Rotated encryption for ${workspaces.length} workspaces`);
}
```

### **2. Rate Limiting**

**File:** `src/lib/security/rateLimiter.ts`

```typescript
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Initialize Redis (use Upstash for serverless)
const redis = Redis.fromEnv();

/**
 * Feed submission rate limiter
 * Limit: 10 submissions per hour per workspace
 */
export const feedRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  analytics: true,
  prefix: 'feed',
});

/**
 * Product toggle rate limiter
 * Limit: 1000 toggles per hour per workspace
 */
export const toggleRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1000, '1 h'),
  analytics: true,
  prefix: 'toggle',
});

/**
 * API key rate limiter (per IP)
 * Limit: 5 attempts per 15 minutes
 */
export const authRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
  prefix: 'auth',
});

/**
 * Helper: Check rate limit and throw if exceeded
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<void> {
  const { success, limit, reset, remaining } = await limiter.limit(identifier);

  if (!success) {
    const resetDate = new Date(reset);
    throw new Error(
      `Rate limit exceeded. ${remaining}/${limit} remaining. Resets at ${resetDate.toISOString()}`
    );
  }
}
```

### **3. Error Monitoring**

**File:** `src/lib/security/monitoring.ts`

```typescript
import * as Sentry from '@sentry/nextjs';

/**
 * Initialize Sentry for error tracking
 */
export function initMonitoring() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1, // 10% of transactions

      // Don't send sensitive data
      beforeSend(event) {
        // Scrub API keys from error messages
        if (event.message) {
          event.message = event.message
            .replace(/sk-[a-zA-Z0-9]+/g, 'sk-***')
            .replace(/pk-[a-zA-Z0-9]+/g, 'pk-***');
        }

        // Scrub request data
        if (event.request) {
          delete event.request.cookies;
          delete event.request.headers?.authorization;
        }

        return event;
      },
    });
  }
}

/**
 * Track security events
 */
export function trackSecurityEvent(
  event: string,
  details: Record<string, any>
) {
  Sentry.captureMessage(`Security: ${event}`, {
    level: 'warning',
    extra: details,
  });

  console.warn(`🔒 Security Event: ${event}`, details);
}

/**
 * Track API key usage
 */
export async function logApiKeyUsage(
  workspaceId: string,
  service: 'openai' | 'shopify' | 'stripe',
  action: string
) {
  // Log to database for audit trail
  await db.auditLog.create({
    data: {
      workspaceId,
      service,
      action,
      timestamp: new Date(),
    },
  });
}
```

### **4. Health Checks**

**File:** `src/app/api/health/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { db } from '@/server/db';

/**
 * Health check endpoint for monitoring
 * GET /api/health
 */
export async function GET() {
  try {
    // Check database connection
    await db.$queryRaw`SELECT 1`;

    // Check Redis (if using rate limiting)
    // await redis.ping();

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0',
      checks: {
        database: 'ok',
        // redis: 'ok',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
```

---

## 📝 Prisma Schema (MVP Only)

**File:** `prisma/schema.prisma`

```prisma
// MVP MODELS ONLY (No optimization fields)

model Workspace {
  id String @id @default(cuid())
  name String
  ownerId String

  // Shopify Integration
  shopifyDomain String? @unique
  shopifyAccessToken String? // Encrypted with AES-256-GCM
  shopifyConnectedAt DateTime?

  // OpenAI Feed Configuration
  openaiMerchantId String?
  openaiApiKey String? // Encrypted with AES-256-GCM
  feedRefreshInterval String? @default("manual") // manual, daily, 15min
  lastFeedSubmission DateTime?
  feedStatus String?

  // Merchant Application
  merchantApplicationStatus String? @default("not_started")
  merchantApplicationDate DateTime?

  // Store Information
  sellerName String?
  sellerUrl String?
  sellerPrivacyPolicy String?
  sellerTos String?
  returnPolicy String?
  returnWindow Int?

  // Wizard Progress
  wizardStep Int? @default(0)
  wizardCompleted Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  owner User @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  products Product[]
  checkoutConfig CheckoutConfig?
  wizardProgress WizardProgress?

  @@index([ownerId])
  @@index([shopifyDomain])
}

model Product {
  id String @id @default(cuid())
  workspaceId String

  // Basic Fields
  title String
  description String? @db.Text
  link String?
  sourceId String? // Shopify product ID

  // Media
  imageLink String?
  additionalImageLinks Json? // Array of strings

  // Pricing
  price Decimal?
  currency String @default("USD")

  // Inventory
  availability String @default("in_stock")
  inventoryQuantity Int @default(0)

  // Identifiers
  gtin String?
  mpn String?
  brand String?

  // Product Details
  condition String @default("new")
  productCategory String?
  weight Decimal?
  weightUnit String?

  // ChatGPT Shopping Toggles (MVP)
  enableSearch Boolean @default(false)
  enableCheckout Boolean @default(false)

  // 🔒 v2 ONLY - Optimization fields (commented out for MVP)
  // optimizationScore Int?
  // optimizationLevel Int?
  // scoreBreakdown Json?
  // status String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@index([workspaceId])
  @@index([sourceId])
}

model WizardProgress {
  id String @id @default(cuid())
  workspaceId String @unique

  // Step Completion
  step0_merchantApplication Boolean @default(false)
  step1_shopifyConnection Boolean @default(false)
  step2_storeInformation Boolean @default(false)
  step3_productReview Boolean @default(false)
  step4_feedSetup Boolean @default(false)
  step5_stripeConnection Boolean @default(false)
  step6_checkoutConfig Boolean @default(false)
  step7_testing Boolean @default(false)

  currentStep Int @default(0)
  completedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
}

model CheckoutConfig {
  id String @id @default(cuid())
  workspaceId String @unique

  // Stripe Configuration
  stripePublishableKey String
  stripeSecretKey String // Encrypted
  stripeWebhookSecret String // Encrypted
  testMode Boolean @default(true)

  // Checkout Endpoints
  checkoutUrl String
  webhookUrl String
  supportedCountries Json // Array of country codes

  // OpenAI Registration
  openaiCheckoutId String?
  registeredAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
}

model CheckoutSession {
  id String @id @default(cuid())
  workspaceId String

  status String @default("not_ready_for_payment")
  currency String @default("USD")

  items Json
  lineItems Json
  totals Json

  buyer Json?
  fulfillmentAddress Json?
  fulfillmentOptionId String?

  paymentProvider String? @default("stripe")
  paymentToken String?

  orderId String?
  orderPermalinkUrl String?

  expiresAt DateTime
  createdAt DateTime @default(now())
  completedAt DateTime?

  @@index([workspaceId])
  @@index([status])
}

model OrderEvent {
  id String @id @default(cuid())
  workspaceId String
  orderId String

  amount Decimal
  currency String @default("USD")

  sourceChannel String @default("CHATGPT_AGENTIC")
  rawPayload Json?

  createdAt DateTime @default(now())

  @@index([workspaceId])
  @@index([orderId])
}

// 🔒 v2 ONLY - Optimization models (commented out for MVP)
// model Suggestion { ... }
// model AuditResult { ... }
// model ChangeLog { ... }
```

---

## 🚀 MVP Implementation Steps

### **Phase 1: Security Setup (Day 1)**

```bash
# 1. Install dependencies
npm install @upstash/redis @upstash/ratelimit @sentry/nextjs

# 2. Set environment variables
ENCRYPTION_KEY=<32-byte-hex-string>  # Generate: openssl rand -hex 32
UPSTASH_REDIS_REST_URL=<url>
UPSTASH_REDIS_REST_TOKEN=<token>
SENTRY_DSN=<optional>

# 3. Update encryption in existing code
# Replace old encryption.ts with new apiKeyManager.ts
```

### **Phase 2: Code Cleanup (Day 2-3)**

```bash
# 1. Remove optimization features
rm -rf src/lib/optimization/
rm src/server/routers/suggestion.ts
rm -rf src/app/v2/

# 2. Simplify Product model
# Remove optimizationScore, optimizationLevel fields

# 3. Simplify wizard Step 3
# Remove scoring, just show basic product info
```

### **Phase 3: Add Security Middleware (Day 3)**

```typescript
// src/server/api/middleware/security.ts
import { middleware } from '../trpc';
import { checkRateLimit, feedRateLimiter } from '@/lib/security/rateLimiter';
import { trackSecurityEvent } from '@/lib/security/monitoring';

export const rateLimitMiddleware = middleware(async ({ ctx, next, path }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  // Apply rate limiting based on endpoint
  if (path.startsWith('feed.submit')) {
    await checkRateLimit(feedRateLimiter, ctx.session.user.workspaceId);
  }

  return next();
});
```

### **Phase 4: Update Routers (Day 4-5)**

```typescript
// Update all routers to use new encryption
import { encryptApiKey, decryptApiKey } from '@/lib/security/apiKeyManager';

// Example: wizard.ts
wizard.completeShopifyOAuth()
  → const encrypted = encryptApiKey(accessToken)
  → Save to database

// Example: feed.ts
feed.submitFeed()
  → const apiKey = decryptApiKey(workspace.openaiApiKey)
  → Use for API call
  → Track usage with logApiKeyUsage()
```

### **Phase 5: Frontend Build (Day 6-10)**

```bash
# Use v0 prompts from Branch 1
# But remove optimization UI elements
# Keep only: Feed Dashboard, Product Toggles, Basic Orders
```

---

## 📋 Testing Checklist

### **Security Tests:**
- [ ] API keys are encrypted in database
- [ ] Cannot decrypt keys without ENCRYPTION_KEY
- [ ] Rate limiting blocks excessive requests
- [ ] Health check endpoint returns 200
- [ ] Sentry captures errors (without sensitive data)
- [ ] Audit log tracks API key usage

### **Feature Tests:**
- [ ] Wizard completes all 7 steps
- [ ] Shopify OAuth works
- [ ] Feed submits to OpenAI
- [ ] Auto-refresh schedules correctly
- [ ] Product toggles update instantly
- [ ] Checkout processes payment
- [ ] Orders appear in dashboard

### **Performance Tests:**
- [ ] Feed generation < 5 seconds (1000 products)
- [ ] Product list loads < 2 seconds
- [ ] Dashboard loads < 1 second

---

## 🔐 Security Compliance Checklist

### **MVP (Must Have):**
- [x] AES-256-GCM encryption for API keys
- [x] SSL/TLS everywhere (Vercel default)
- [x] Rate limiting on sensitive endpoints
- [x] Error monitoring with Sentry
- [x] Audit logs for API key usage
- [x] Health check endpoint
- [x] Privacy Policy
- [x] Terms of Service

### **v2 (After PMF):**
- [ ] SOC 2 Type II certification
- [ ] Penetration testing
- [ ] Key rotation automation
- [ ] Dedicated security engineer
- [ ] Bug bounty program
- [ ] GDPR compliance audit

---

## 📈 Success Metrics (MVP)

### **Week 1:**
- 10 beta merchants onboarded
- 5 complete wizard
- 3 submit feed
- 1 receives order

### **Month 1:**
- 50 merchants
- 80% wizard completion rate
- 60% enable auto-refresh
- $10K+ GMV through platform

### **Month 3:**
- 200 merchants
- Launch v2 (Optimization)
- $50K+ GMV
- 95%+ uptime

---

## 🎯 v2 Roadmap (After MVP)

```
Month 1-2: MVP Launch
  └─ Wizard + Feed + Checkout

Month 3-4: v2 Development
  ├─ Optimization scoring
  ├─ AI suggestions
  ├─ Approvals workflow
  └─ Advanced analytics

Month 5-6: Enterprise Features
  ├─ Multi-store management
  ├─ White-label option
  ├─ Custom AI rules
  └─ SOC 2 certification
```

---

## ✅ Definition of Done (MVP)

MVP is ready to launch when:
- [x] All security mitigations implemented
- [x] Wizard completes end-to-end
- [x] Feed submits successfully
- [x] Checkout processes test payment
- [x] Orders tracked in database
- [x] Frontend UI built from v0 prompts
- [x] Database migrations run
- [x] Environment variables documented
- [x] Privacy Policy & ToS live
- [x] Beta merchants can onboard

---

**Next: Start implementing security mitigations...**
