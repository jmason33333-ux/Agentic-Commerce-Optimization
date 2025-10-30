# Agent Commerce SEO - Cursor Development Prompt

## Project Overview

You are building **Agent Commerce SEO**, an MVP that helps Shopify/Etsy merchants rank higher in AI and agentic commerce surfaces like ChatGPT Instant Checkout. This is a supervised, human-in-the-loop (HITL) system that optimizes product catalogs using AI while requiring human approval before applying changes.

## Current Implementation Status

### ✅ What's Already Built

**Core Infrastructure:**
- Complete Next.js 14 App Router setup with TypeScript
- tRPC API with type-safe procedures
- Prisma schema with 100% OpenAI Commerce Feed Spec compliance (70+ fields)
- PostgreSQL database integration
- NextAuth.js authentication (Google OAuth)
- shadcn/ui component library

**Data Model:**
- `User` model with multi-workspace support
- `Workspace` model with Shopify integration + seller policies (6 OpenAI spec fields)
- `Product` model with complete OpenAI spec fields:
  - Control flags: `enableSearch`, `enableCheckout`
  - Required fields: GTIN, MPN, brand, material, weight, imageLink, availability
  - Optional fields: color, size, gender, ageGroup, reviews, popularity, etc.
  - Change tracking: `lastSyncedAt`, `contentHash`, `lastOptimizedAt`
- `ProductChange` model for change approval workflow
- `Job` model for async processing queue
- `Order` model with agentic attribution tracking

**Backend Systems:**
- Job processor (`src/lib/jobs/processor.ts`) with:
  - Shopify product sync with intelligent field mapping
  - Content hash-based change detection (SHA256)
  - 30+ OpenAI spec compliance audit rules
  - Risk-based change categorization (LOW/MEDIUM/HIGH)
- Shopify integration (`src/lib/shopify/client.ts`)
- OpenAI LLM provider (`src/lib/llm/openai-provider.ts`) with spec-compliant prompts
- CSV import system supporting Shopify export + custom OpenAI format

**API Routes:**
- tRPC routers: workspace, product, csv
- CSV upload endpoint: `/api/csv/upload`
- CSV template generator: `/api/csv/template`

**Frontend Components:**
- Basic layout with authenticated routes
- Workspace selector
- Product listing (needs full build-out)
- Change approval interface (needs full build-out)

### 🚧 What Needs to be Built

**High Priority:**

1. **Frontend UI/UX** - Complete the core user experience:
   - Dashboard with key metrics (total products, optimized %, pending changes, agentic orders)
   - Product catalog view with filtering, sorting, search
   - CSV import interface with drag-drop + format selector
   - Product detail view showing OpenAI spec compliance score
   - Change approval workflow UI (approve/reject/edit changes)
   - Shopify connection flow with OAuth
   - Settings page for workspace configuration

2. **Change Management System:**
   - Build approval queue UI
   - Implement change diff visualization
   - Add bulk approve/reject functionality
   - Create change history log

3. **LLM Optimization Pipeline:**
   - Connect job processor to LLM provider
   - Implement optimization suggestions display
   - Add re-run optimization for individual products
   - Create batch optimization scheduler

4. **Analytics & Reporting:**
   - Agentic order detection and attribution
   - Performance dashboards
   - Compliance scorecards
   - Export reports

**Medium Priority:**

5. **Advanced Features:**
   - Product variant grouping (`itemGroupId`)
   - Image optimization suggestions
   - A/B testing for product descriptions
   - Multi-workspace agency support

6. **Integration Enhancements:**
   - Etsy connector (similar to Shopify)
   - Bulk CSV export
   - Webhook handlers for real-time Shopify updates

## Tech Stack Reference

```typescript
// Core Framework
- Next.js 14 (App Router, Server Components)
- TypeScript (strict mode)
- React 18

// API & Data
- tRPC v10 (type-safe API)
- Prisma (ORM)
- PostgreSQL (database)
- Zod (validation)

// Authentication
- NextAuth.js v4
- Google OAuth provider

// UI Components
- shadcn/ui (Radix UI primitives)
- Tailwind CSS
- Lucide icons

// AI & Integrations
- OpenAI SDK (gpt-4-turbo for optimization)
- Shopify Admin API
- @shopify/shopify-api package

// Dev Tools
- ESLint
- Prettier
- TypeScript strict mode
```

## File Structure Overview

```
src/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   │   ├── auth/         # NextAuth handlers
│   │   ├── csv/          # CSV upload & templates
│   │   └── trpc/         # tRPC endpoint
│   ├── (auth)/           # Authenticated routes
│   │   ├── dashboard/    # Main dashboard
│   │   ├── products/     # Product catalog
│   │   ├── changes/      # Change approval queue
│   │   └── settings/     # Workspace settings
│   └── layout.tsx        # Root layout
│
├── server/                # tRPC backend
│   ├── routers/
│   │   ├── workspace.ts  # Workspace CRUD
│   │   ├── product.ts    # Product operations
│   │   ├── csv.ts        # CSV import/export
│   │   └── _app.ts       # Router aggregation
│   ├── context.ts        # tRPC context with auth
│   └── trpc.ts           # tRPC initialization
│
├── lib/
│   ├── shopify/
│   │   └── client.ts     # Shopify Admin API client
│   ├── llm/
│   │   ├── openai-provider.ts      # OpenAI integration
│   │   └── openai-spec-prompt.ts   # Optimization prompt
│   ├── csv/
│   │   └── parser.ts     # CSV parsing & validation
│   └── jobs/
│       └── processor.ts  # Job queue processor
│
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── workspace-selector.tsx
│   ├── product-card.tsx
│   └── change-approval.tsx
│
└── prisma/
    └── schema.prisma     # Database schema (100% OpenAI spec)
```

## OpenAI Commerce Feed Specification - Critical Fields

Your data model is 100% compliant. Key required fields:

**Control Flags (REQUIRED):**
- `enableSearch` - Whether product appears in search (default: true)
- `enableCheckout` - Whether checkout is enabled (default: false until verified)

**Product Identification (REQUIRED - need GTIN OR MPN):**
- `gtin` - Global Trade Item Number (UPC/EAN)
- `mpn` - Manufacturer Part Number
- `brand` - Brand name

**Product Information (REQUIRED):**
- `title`, `description`, `price`, `currency`
- `link` - Product page URL
- `imageLink` - Primary product image (REQUIRED)
- `material` - What it's made of
- `weight` + `weightUnit` - Shipping weight

**Availability (REQUIRED):**
- `availability` - enum: "in_stock", "out_of_stock", "preorder", "backorder"
- `inventoryQuantity` - Stock count

**Grouping & Variants:**
- `itemGroupId` - Groups color/size variants together
- `color`, `size`, `gender`, `ageGroup` - Variant attributes

**Performance Signals (RECOMMENDED):**
- `productReviewCount`, `productReviewRating` - Social proof
- `popularityScore` - 0.00-1.00 scale
- `additionalImageLinks` - Array of additional product images

## Key Technical Considerations

### 1. Content Hash Strategy
```typescript
// In src/lib/jobs/processor.ts
const contentHash = crypto
  .createHash('sha256')
  .update(JSON.stringify({
    title: product.title,
    description: product.description,
    imageLink: product.imageLink,
    // ... other optimizable fields
  }))
  .digest('hex');

// Skip LLM call if hash unchanged
if (existingProduct.contentHash === contentHash) {
  console.log('Content unchanged, skipping optimization');
  return;
}
```

### 2. Risk-Based Change Management
```typescript
// Classify changes by risk level
const riskLevel =
  changedFields.includes('price') || changedFields.includes('inventoryQuantity')
    ? 'HIGH'
  : changedFields.includes('enableCheckout') || changedFields.includes('enableSearch')
    ? 'MEDIUM'
  : 'LOW'; // title, description, metadata
```

### 3. OpenAI Spec Compliance Audits
The system runs 30+ validation rules. Key checks in `src/lib/jobs/processor.ts`:
- Required fields presence
- GTIN format validation (8/12/13/14 digits)
- Image URL accessibility
- Price > 0 validation
- Material field completeness
- Availability enum validation

### 4. Shopify Field Mapping
```typescript
// Smart mapping from Shopify to OpenAI spec
{
  gtin: variant?.barcode,           // Barcode → GTIN
  mpn: variant?.sku,                // SKU → MPN
  brand: product.vendor,            // Vendor → Brand
  weight: variant?.grams / 1000,    // Grams → KG
  availability: qty > 0 ? "in_stock" : "out_of_stock",
  itemGroupId: hasMultipleVariants ? product.id : null,
  // Extract color/size from product options
}
```

### 5. Job Processing Pattern
```typescript
// Database-backed queue (no Redis needed for MVP)
const job = await db.job.create({
  data: {
    workspaceId,
    type: 'SHOPIFY_SYNC',
    status: 'PENDING',
  }
});

// Process asynchronously
await processJob(job.id);
```

## Environment Variables Needed

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/agent_commerce"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# OpenAI
OPENAI_API_KEY="sk-..."

# Shopify (optional for testing)
SHOPIFY_API_KEY="your-shopify-api-key"
SHOPIFY_API_SECRET="your-shopify-api-secret"
```

## Getting Started Workflow

1. **Set up environment:**
   ```bash
   npm install
   cp .env.example .env.local
   # Fill in environment variables
   ```

2. **Initialize database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Start development:**
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

4. **Test CSV import:**
   - Download template: `GET /api/csv/template?format=shopify`
   - Fill in sample products
   - Upload via tRPC: `csv.importProducts`

5. **Build missing UI components:**
   - Start with dashboard (show workspace stats)
   - Build product catalog with table view
   - Add CSV upload interface with drag-drop
   - Create change approval queue

## Suggested Next Steps (Priority Order)

### Step 1: Complete Dashboard
**File:** `src/app/(auth)/dashboard/page.tsx`

Build a dashboard showing:
- Total products count
- Products with `enableCheckout: true` vs `false`
- Pending changes count
- Recent sync status
- Quick actions (sync now, upload CSV, view products)

Use tRPC queries:
```typescript
const { data: stats } = trpc.workspace.getStats.useQuery({ workspaceId });
```

### Step 2: Build Product Catalog
**File:** `src/app/(auth)/products/page.tsx`

Features needed:
- Table view with key fields (title, price, gtin, brand, enableCheckout)
- Compliance score indicator (% of recommended fields filled)
- Filter by: `enableCheckout`, `enableSearch`, compliance level
- Sort by: recently updated, price, title
- Search by: title, GTIN, MPN
- Bulk actions: enable checkout, run optimization

Use shadcn/ui Table component + tRPC infinite query:
```typescript
const { data, fetchNextPage } = trpc.product.list.useInfiniteQuery({
  workspaceId,
  limit: 50,
});
```

### Step 3: CSV Upload Interface
**File:** `src/app/(auth)/products/import/page.tsx`

Features:
- Drag-drop file upload (use `react-dropzone`)
- Format selector (Shopify vs OpenAI spec)
- Preview table showing first 5 rows
- Validation errors display
- Dry-run preview before import
- Import button with progress indicator

Flow:
1. Upload file → `/api/csv/upload`
2. Preview → `csv.previewCSV` mutation
3. Import → `csv.importProducts` mutation

### Step 4: Change Approval Queue
**File:** `src/app/(auth)/changes/page.tsx`

Features:
- List all pending `ProductChange` records
- Show diff view (before/after)
- Risk level indicator (LOW/MEDIUM/HIGH)
- Approve/reject buttons
- Bulk approve for LOW risk changes
- Edit before approve option

Use tRPC:
```typescript
const { data: changes } = trpc.product.listPendingChanges.useQuery({ workspaceId });
const approveMutation = trpc.product.approveChange.useMutation();
```

### Step 5: Product Detail View
**File:** `src/app/(auth)/products/[id]/page.tsx`

Features:
- All OpenAI spec fields displayed
- Compliance checklist (30+ rules)
- Image preview
- Optimization history
- "Re-run optimization" button
- Quick edit form
- Shopify link (if synced from Shopify)

### Step 6: Shopify Connection Flow
**File:** `src/app/(auth)/settings/integrations/page.tsx`

Features:
- OAuth connection button
- Store domain input
- Connection status indicator
- Sync frequency settings
- Manual sync trigger
- Disconnect button

Implement Shopify OAuth flow following their docs.

### Step 7: LLM Optimization Display
Enhance product detail view to show:
- LLM suggestions for title, description
- Compliance improvements
- SEO keyword recommendations
- Accept/reject suggestion buttons

## Important Notes

### CSV Import is Ready to Use
The CSV import system is fully implemented. You can:
- Upload Shopify product export CSVs
- Upload custom OpenAI spec format CSVs
- Download templates: `/api/csv/template?format=shopify` or `?format=openai`
- Preview before importing with `dryRun: true`

### Multi-Workspace Support
The system supports multiple workspaces per user (agency use case):
- Every query requires `workspaceId`
- Use `WorkspaceSelector` component in nav
- Filter all data by current workspace

### Human-in-the-Loop Critical
NEVER auto-apply LLM suggestions. Always:
1. Create `ProductChange` record with `status: PENDING`
2. Show in approval queue
3. Wait for user approval
4. Apply change to `Product` table
5. Update `ProductChange` to `APPROVED`

### Testing Without Shopify
Use CSV import for local testing:
1. Download Shopify template
2. Fill in 5-10 sample products
3. Upload via UI
4. Test optimization workflow

### OpenAI Spec Compliance is Critical
The ranking algorithm uses 10 levels based on field completeness:
- **Level 10**: All required + recommended fields filled
- **Level 7-9**: Most required fields + some recommended
- **Level 4-6**: Required fields only
- **Level 1-3**: Missing critical fields

Aim for Level 8+ for best ChatGPT Shopping placement.

## Code Style & Patterns

### Use Server Components by Default
```typescript
// app/(auth)/dashboard/page.tsx
export default async function DashboardPage() {
  // Can directly access database here if needed
  const session = await getServerSession(authOptions);
  return <DashboardClient />;
}
```

### Client Components for Interactivity
```typescript
'use client';

export function ProductTable() {
  const { data } = trpc.product.list.useQuery({ ... });
  return <Table>...</Table>;
}
```

### Type-Safe tRPC Patterns
```typescript
// Always use Zod schemas for input validation
export const productRouter = router({
  list: protectedProcedure
    .input(z.object({
      workspaceId: z.string(),
      search: z.string().optional(),
      enableCheckout: z.boolean().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.product.findMany({
        where: {
          workspaceId: input.workspaceId,
          title: input.search ? { contains: input.search } : undefined,
          enableCheckout: input.enableCheckout,
        },
      });
    }),
});
```

### Error Handling
```typescript
import { TRPCError } from '@trpc/server';

if (!workspace) {
  throw new TRPCError({
    code: 'NOT_FOUND',
    message: 'Workspace not found',
  });
}
```

## Resources

- OpenAI Commerce Spec: https://developers.openai.com/commerce/specs/feed
- Shopify Admin API: https://shopify.dev/docs/api/admin-rest
- tRPC Docs: https://trpc.io/docs
- shadcn/ui: https://ui.shadcn.com
- Prisma Docs: https://www.prisma.io/docs

## Success Criteria

You'll know the MVP is ready when:
1. ✅ User can upload CSV and see products in catalog
2. ✅ Compliance score shows for each product
3. ✅ LLM generates optimization suggestions
4. ✅ User can approve/reject changes via UI
5. ✅ Approved changes apply to product records
6. ✅ Dashboard shows key metrics
7. ✅ (Optional) Shopify OAuth connection works

## Questions to Consider

As you build, think about:
- How to visualize the compliance score? (Progress bar? Letter grade?)
- Should we batch LLM optimization calls to save costs?
- How to handle variant products? (Show parent + children?)
- What's the UX for bulk operations? (Select multiple → approve all?)
- Should we add a "test mode" to avoid hitting OpenAI during dev?

---

**You have a solid foundation. Focus on building the frontend UI and connecting it to the existing tRPC backend. The data model and business logic are production-ready.**

Good luck! 🚀
