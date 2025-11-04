# Agentic Commerce Setup Platform

**The fastest way for Shopify merchants to sell on ChatGPT**

A guided setup wizard that helps Shopify merchants connect their store, configure product feeds, and enable checkout for OpenAI's Agentic Commerce Protocol (ACP).

## 🎯 MVP Focus: Setup First, Optimization Later

This platform gets merchants live on ChatGPT in **under 30 minutes** by focusing on the essentials:
- ✅ Shopify OAuth connection
- ✅ Automated product feed generation & submission
- ✅ Stripe checkout configuration
- ✅ OpenAI Commerce API registration

**Product optimization features** (AI suggestions, SEO scoring) are coming in **v2** as a fast follow.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- PostgreSQL database
- Shopify Partner account (for OAuth app)
- Upstash Redis account (free tier works)
- OpenAI Commerce API merchant account

### 1. Clone & Install

```bash
git clone https://github.com/jmason33333-ux/Agentic-Commerce-Optimization.git
cd Agentic-Commerce-Optimization
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

**Required Variables:**

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Security (CRITICAL)
ENCRYPTION_KEY="generate-with-node-see-below"  # 64 hex chars
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# Shopify OAuth
SHOPIFY_CLIENT_ID="your-client-id"
SHOPIFY_CLIENT_SECRET="your-client-secret"
SHOPIFY_REDIRECT_URI="http://localhost:3000/api/auth/shopify/callback"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Generate Encryption Key:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Database Setup

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, tRPC
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js with email magic links
- **Security**: AES-256-GCM encryption, Upstash rate limiting, Sentry monitoring
- **Integrations**: Shopify OAuth, OpenAI Commerce API, Stripe

### Security Architecture

**MVP Security Mitigations** (see `MVP-MERGE-STRATEGY.md` for details):

1. **Encryption**: AES-256-GCM with authenticated encryption (prevents tampering)
2. **Rate Limiting**:
   - Feed submissions: 10/hour per workspace
   - Product toggles: 1000/hour per workspace
   - Auth attempts: 5/15min per IP
3. **Monitoring**: Sentry with PII scrubbing and API key usage logging
4. **Health Checks**: `/api/health` endpoint for uptime monitoring

### Data Flow

```
Merchant → Wizard → Shopify OAuth → Product Import
         ↓
    Feed Generation → OpenAI Commerce API
         ↓
    Checkout Config → Stripe → OpenAI Registration
         ↓
    ChatGPT ← Product Search & Checkout
```

## 📋 Wizard Flow (7 Steps)

### Step 0: Merchant Application
- Link to OpenAI merchant application
- Status tracking (not_started, pending, approved, rejected)

### Step 1: Shopify Connection
- OAuth flow with proper scopes
- Automatic store info import (name, URL, policies)
- Product sync in background

### Step 2: Store Information
- Review/edit seller name, URLs, return policy
- Required for ACP compliance

### Step 3: Product Review
- Enable products for search/checkout
- Compliance validation (70+ score required)
- Bulk toggle capabilities

### Step 4: Feed Configuration
- Enter OpenAI Merchant ID & API Key
- Choose feed format (TSV, CSV, JSON)
- Set auto-refresh interval (manual, daily, 15min)

### Step 5: Stripe Configuration
- Enter Stripe publishable/secret keys
- Configure webhook secret
- Test connection

### Step 6: Checkout Registration
- Register checkout URL with OpenAI
- Webhook endpoint setup
- Test end-to-end flow

### Step 7: Testing & Launch
- Run comprehensive setup tests
- Verify all integrations
- Mark wizard complete

## 🔧 API Reference

### tRPC Routers

#### `wizard`
- `getProgress()` - Get wizard state for workspace
- `updateStep({ step, completed, data })` - Update step progress
- `initiateShopifyOAuth({ shop })` - Start OAuth flow
- `completeShopifyOAuth({ shop, code, state })` - Complete OAuth & import
- `updateStoreInfo({ ...storeInfo })` - Update seller information
- `getProductReadiness()` - Get product compliance summary
- `toggleProduct({ productId, enableSearch, enableCheckout })` - Toggle product
- `runSetupTests()` - Run all validation tests

#### `feed`
- `configureOpenAI({ merchantId, apiKey, autoRefreshInterval })` - Save OpenAI credentials
- `generateFeed({ format })` - Generate product feed
- `previewFeed({ format })` - Preview first 10 products
- `submitFeed({ format })` - Submit to OpenAI Commerce API
- `getSubmissionStatus()` - Get last submission status
- `getConfiguration()` - Get feed configuration

#### `checkout`
- `configureStripe({ publishableKey, secretKey, webhookSecret, testMode })` - Configure Stripe
- `getStripeConfig()` - Get current config (secrets masked)
- `testStripeConnection()` - Verify Stripe credentials
- `updateSupportedCountries({ countries })` - Set supported countries
- `registerCheckout()` - Register with OpenAI
- `getCheckoutConfig()` - Get checkout configuration

### ACP REST Endpoints

```
POST   /api/checkout/sessions           - Create checkout session
GET    /api/checkout/sessions/:id       - Retrieve session
POST   /api/checkout/sessions/:id       - Update session
POST   /api/checkout/sessions/:id/complete - Complete with payment
POST   /api/checkout/sessions/:id/cancel   - Cancel session
```

### Health & Monitoring

```
GET    /api/health                      - Health check endpoint
```

Returns:
- Database connectivity & latency
- Redis status
- Environment variable validation
- Process uptime

## 🔐 Security Best Practices

### API Key Management

**Never log API keys:**
```typescript
import { logApiKeyUsage } from '@/lib/security/monitoring';

// ✅ Good: Log usage, not the key
await logApiKeyUsage(workspaceId, 'openai', 'feed_submission');

// ❌ Bad: Don't log the actual key
console.log('Using API key:', apiKey);
```

**Always encrypt before storing:**
```typescript
import { encryptApiKey, decryptApiKey } from '@/lib/security/apiKeyManager';

// Storing
const encrypted = encryptApiKey(plainApiKey);
await db.workspace.update({ data: { openaiApiKey: encrypted } });

// Retrieving
const apiKey = decryptApiKey(workspace.openaiApiKey);
```

### Rate Limiting

```typescript
import { checkRateLimit, feedRateLimiter } from '@/lib/security/rateLimiter';

// Before expensive operations
await checkRateLimit(feedRateLimiter, workspaceId);
```

### Key Rotation

```bash
# Generate new encryption key
NEW_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Run rotation script
npx tsx scripts/rotate-encryption-keys.ts --old-key $OLD_KEY --new-key $NEW_KEY
```

## 📊 Monitoring & Debugging

### Health Checks

```bash
curl http://localhost:3000/api/health
```

### Sentry Error Tracking

Errors are automatically captured with:
- PII scrubbing (API keys, emails, etc.)
- Workspace context
- Request metadata

### Rate Limit Status

Check Redis directly:
```bash
# In Upstash console, check keys:
feed:workspace_123      # Feed submission count
toggle:workspace_123    # Product toggle count
auth:192.168.1.1       # Auth attempt count (by IP)
```

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
2. **Import to Vercel**
3. **Set Environment Variables** (all required vars from `.env.example`)
4. **Deploy**

### Environment Variable Checklist

Before deploying, verify all required variables are set:

- [ ] `DATABASE_URL` - PostgreSQL connection
- [ ] `ENCRYPTION_KEY` - 64 hex characters
- [ ] `UPSTASH_REDIS_REST_URL` - Rate limiting
- [ ] `UPSTASH_REDIS_REST_TOKEN` - Rate limiting
- [ ] `SHOPIFY_CLIENT_ID` - OAuth
- [ ] `SHOPIFY_CLIENT_SECRET` - OAuth
- [ ] `SHOPIFY_REDIRECT_URI` - OAuth callback
- [ ] `NEXTAUTH_SECRET` - Auth sessions
- [ ] `NEXTAUTH_URL` - Production URL
- [ ] `NEXT_PUBLIC_APP_URL` - Production URL
- [ ] `SENTRY_DSN` - (Optional) Error monitoring

### Database Migrations

```bash
# Production migration
npx prisma migrate deploy
```

### Health Check Setup

Configure your monitoring service (Pingdom, UptimeRobot, etc.):
- **URL**: `https://your-domain.com/api/health`
- **Method**: GET
- **Expected Status**: 200
- **Check Interval**: 1 minute

## 📁 Project Structure

```
src/
├── app/                          # Next.js 14 App Router
│   ├── api/
│   │   ├── checkout/            # ACP checkout endpoints
│   │   ├── health/              # Health check
│   │   └── webhooks/            # OpenAI & Shopify webhooks
│   └── (dashboard)/             # Protected dashboard routes
├── lib/
│   ├── security/                # 🔐 Security utilities (MVP)
│   │   ├── apiKeyManager.ts     # AES-256-GCM encryption
│   │   ├── rateLimiter.ts       # Upstash Redis rate limiting
│   │   └── monitoring.ts        # Sentry + audit logging
│   ├── shopify/                 # Shopify OAuth & API client
│   └── services/                # Business logic
│       ├── shopifyImport.ts     # Product import
│       └── feedGeneration.ts    # Feed generation & submission
├── server/
│   ├── routers/                 # tRPC routers
│   │   ├── wizard.ts            # Wizard flow endpoints
│   │   ├── feed.ts              # Feed management
│   │   └── checkout.ts          # Checkout configuration
│   └── db.ts                    # Prisma client
└── components/                   # React components

v2/                              # 🚀 FUTURE: Optimization features
└── (deferred to fast follow)
```

## 🛣️ Roadmap

### ✅ MVP (Current - v1.0)
- [x] Unified wizard backend (7 steps)
- [x] Shopify OAuth integration
- [x] Product feed generation & submission
- [x] Stripe checkout configuration
- [x] ACP REST endpoints
- [x] Security mitigations (encryption, rate limiting, monitoring)
- [x] Health check endpoint
- [ ] Frontend wizard UI (in progress)

### 🔜 v2 (Fast Follow)
- [ ] Product optimization scoring (8-category system)
- [ ] AI-powered metadata suggestions
- [ ] Compliance audit (25 field checks)
- [ ] Products dashboard with filters
- [ ] Order attribution tracking
- [ ] Analytics dashboard

### 📈 v3 (Future)
- [ ] Multi-platform support (Etsy, WooCommerce)
- [ ] Advanced analytics & A/B testing
- [ ] Bulk operations & CSV export
- [ ] Team collaboration features
- [ ] White-label capabilities

## 📚 Documentation

- **MVP Implementation Guide**: `MVP-MERGE-STRATEGY.md`
- **Complete Architecture Analysis**: `docs/COMPLETE-PRODUCT-COHESION-ANALYSIS.md`
- **Executive Summary**: `docs/EXECUTIVE-SUMMARY.md`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/jmason33333-ux/Agentic-Commerce-Optimization/issues)
- **Discussions**: [GitHub Discussions](https://github.com/jmason33333-ux/Agentic-Commerce-Optimization/discussions)

---

**Built for the future of AI-powered commerce** 🚀
