# Agent Commerce SEO

A human-in-the-loop (HITL) application that helps Shopify and Etsy merchants optimize their product catalogs for AI-powered shopping experiences like ChatGPT Instant Checkout.

## Features

- **Product Catalog Scanning**: Automatically fetch and analyze products from Shopify/Etsy
- **AI-Powered Optimization**: Generate suggestions using LLM to improve metadata, descriptions, tags, and more
- **Human-in-the-Loop**: All changes require human approval before being applied
- **Risk Assessment**: Suggestions are categorized as low/medium/high risk
- **Change Logging**: Full audit trail of all modifications
- **Analytics Dashboard**: Track agentic orders, SEO scores, and product eligibility
- **Async Job Processing**: Handle large catalogs with background job queue

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, tRPC
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js with email magic links
- **LLM**: OpenAI (with provider-swappable interface)
- **State Management**: TanStack Query (React Query)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database (Railway, Supabase, or local)
- Shopify Custom App credentials (Admin API access token)
- OpenAI API key
- Email service (for magic link auth)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/jmason33333-ux/Agentic-Commerce-Optimization.git
cd Agentic-Commerce-Optimization
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Email (for magic links)
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@example.com"
EMAIL_SERVER_PASSWORD="your-password"
EMAIL_FROM="noreply@example.com"

# OpenAI
OPENAI_API_KEY="sk-..."
```

4. **Set up the database**

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Shopify Setup

### Creating a Shopify Custom App

1. **Go to your Shopify Admin** → Settings → Apps and sales channels
2. **Click "Develop apps"** → "Create an app"
3. **Configure Admin API scopes**:
   - `read_products`
   - `write_products`
   - `read_product_listings`
   - `write_metafields`
   - `read_orders` (for order attribution)
4. **Install the app** to your store
5. **Copy the Admin API access token**

### Connecting Your Store

1. Create a workspace in the app
2. Click "Connect Shopify"
3. Enter:
   - **Shop Domain**: `your-store.myshopify.com`
   - **Access Token**: Your Admin API access token

## How It Works

### 1. Product Sync

```typescript
// Run product sync
await trpc.product.sync.mutate({ workspaceId });
```

This fetches all products from Shopify and stores them locally with a content hash for change detection.

### 2. Audit Run

```typescript
// Run an audit
await trpc.audit.run.mutate({ workspaceId });
```

The audit process:
- Runs rule-based checks (missing images, low inventory, etc.)
- Calls LLM to generate AI suggestions for each product
- Creates `Suggestion` records with risk levels
- Calculates an SEO score (0-100)

### 3. Review Suggestions

```typescript
// List pending suggestions
const suggestions = await trpc.suggestion.list.query({
  workspaceId,
  status: "PENDING",
});

// Approve a suggestion
await trpc.suggestion.approve.mutate({ id: suggestionId });

// Bulk approve low-risk suggestions
await trpc.suggestion.bulkApprove.mutate({
  workspaceId,
  riskLevel: "LOW",
});
```

### 4. Apply Changes

```typescript
// Apply approved suggestions
await trpc.suggestion.apply.mutate({
  suggestionIds: [id1, id2, id3],
});
```

This writes changes back to Shopify:
- Updates product metadata (title, description, tags)
- Writes to `agent_seo.*` metafield namespace
- Creates change log entries
- Marks suggestions as "APPLIED"

### 5. Track Results

The app tracks agentic orders via:
- Shopify webhooks (`orders/create`)
- Heuristics: discount codes, note attributes, tags
- Manual CSV import

## LLM Configuration

### Default: OpenAI

Set in `.env`:

```env
LLM_PROVIDER="openai"
LLM_MODEL="gpt-4o-mini"
LLM_TIMEOUT_MS=20000
MAX_TOKENS=800
```

### Adding Anthropic (Claude)

Create `src/lib/llm/anthropic-provider.ts`:

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { LLMProvider, ProductInput, LLMSuggestion } from "./types";

export class AnthropicProvider implements LLMProvider {
  async generateSuggestions(product: ProductInput): Promise<LLMSuggestion[]> {
    // Implementation
  }
}
```

Update `src/lib/llm/index.ts` to include the new provider.

## Audit Rules

The following rule-based checks run on every product:

| Issue Type | Severity | Condition |
|------------|----------|-----------|
| `no_image` | High | No product images |
| `availability_zero` | High | Inventory ≤ 0 |
| `missing_price` | High | No price set |
| `instant_checkout_off` | Medium | IC not enabled |
| `missing_audience` | Medium | Description < 50 chars |
| `missing_tags` | Low | No tags |

LLM suggestions augment these with smart metadata recommendations.

## Risk Levels

- **LOW**: Safe text/metadata additions (tags, audience, use cases)
- **MEDIUM**: Flags and settings (Instant Checkout, primary seller)
- **HIGH**: Price or inventory changes (requires extra caution)

## Auto-Apply

Enable auto-apply for low-risk suggestions in workspace settings:

```typescript
await trpc.workspace.update.mutate({
  id: workspaceId,
  autoApplyLowRisk: true,
});
```

When enabled, LOW risk suggestions are automatically applied without human review.

## Order Attribution

### Webhook Setup

Create a Shopify webhook for `orders/create`:

```
URL: https://your-app.com/api/shopify/orders-create
Format: JSON
API Version: 2025-01
```

### Detection Heuristics

The app detects agentic orders by checking:
1. **Note attributes**: `source=chatgpt_agentic`
2. **Tags**: `chatgpt`, `agentic`
3. **Discount codes**: `AICHANNEL`, `CHATGPT`, `AGENTIC`

### Manual Import

Upload CSV with columns: `order_id, amount, currency, source_channel`

## API Reference

### tRPC Routers

#### `workspace`
- `list()` - List user's workspaces
- `getById(id)` - Get workspace details
- `create({ name, platform, shopDomain })` - Create workspace
- `update({ id, ...settings })` - Update settings
- `connectShopify({ workspaceId, shopDomain, accessToken })` - Connect Shopify
- `delete(id)` - Delete workspace

#### `product`
- `list({ workspaceId, limit, offset })` - List products
- `getById(id)` - Get product details with audit history
- `sync({ workspaceId })` - Sync products from Shopify (async)

#### `audit`
- `run({ workspaceId })` - Run audit (async)
- `getHistory({ workspaceId })` - Get audit job history

#### `suggestion`
- `list({ workspaceId, status?, riskLevel?, productId? })` - List suggestions
- `approve({ id })` - Approve suggestion
- `reject({ id })` - Reject suggestion
- `bulkApprove({ workspaceId, riskLevel? })` - Bulk approve
- `apply({ suggestionIds })` - Apply approved suggestions to Shopify

#### `analytics`
- `dashboard({ workspaceId })` - Get dashboard metrics
- `ordersOverTime({ workspaceId, days? })` - Get order history

#### `job`
- `getStatus({ jobId })` - Poll job status
- `list({ workspaceId })` - List recent jobs

## Database Schema

See `prisma/schema.prisma` for full schema. Key tables:

- **User** - User accounts with roles
- **Workspace** - Store/client workspaces
- **Product** - Synced product catalog
- **AuditResult** - Audit scores and issues
- **Suggestion** - HITL suggestion queue
- **OrderEvent** - Order attribution data
- **ChangeLog** - Full modification history
- **Job** - Async job queue

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Railway

1. Create new project from GitHub repo
2. Add PostgreSQL service
3. Set environment variables
4. Deploy

### Database Hosting

- **Vercel Postgres** (easiest with Vercel)
- **Railway Postgres**
- **Supabase**
- **PlanetScale**

## Development

```bash
# Run dev server
npm run dev

# Run Prisma Studio
npm run db:studio

# Generate Prisma Client
npm run db:generate

# Create migration
npm run db:migrate

# Lint
npm run lint

# Build
npm run build

# Start production server
npm start
```

## Roadmap

- [ ] Complete frontend for Suggestions Queue
- [ ] Product detail page with change history
- [ ] Analytics charts (Recharts integration)
- [ ] CSV export functionality
- [ ] Etsy integration
- [ ] Anthropic/Claude LLM provider
- [ ] BullMQ/Redis job queue
- [ ] Shopify OAuth (public app)
- [ ] Webhook verification (HMAC)
- [ ] Multi-workspace dashboard
- [ ] Batch operations UI

## Architecture Decisions

### Why tRPC?
Type-safe API with zero codegen, perfect for monorepo Next.js setup.

### Why DB-backed jobs?
Simple to start, easy to upgrade to BullMQ/Redis later.

### Why metafields?
Non-destructive metadata storage in dedicated `agent_seo.*` namespace.

### Why content hash?
Skip expensive LLM calls when product hasn't changed.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For issues and questions, please open a GitHub issue.

---

Built with ❤️ for the future of AI-powered commerce
