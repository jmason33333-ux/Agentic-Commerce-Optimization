# Decision Matrix: Pre-Implementation Requirements

**Purpose**: This document captures all decisions needed before beginning implementation of the v0 frontend design integration.

**Status**: ⚠️ Decisions Pending

---

## 1. Compliance & Scoring System

### 1.1 Compliance Level Calculation
**Question**: How do we calculate the 1-10 compliance score?

**Options**:
- [ ] **A)** Simple field count: `(requiredFieldsPresent / totalRequiredFields) * 10`
- [ ] **B)** Weighted scoring: Different fields have different weights (e.g., title=20%, price=15%, gtin=15%, etc.)
- [ ] **C)** OpenAI Commerce Feed specific: Based on official OpenAI compliance checklist
- [ ] **D)** Custom formula: Specify formula below

**Decision**: _______________

**Required Fields List** (if Option A/C):
- [ ] Title
- [ ] Description
- [ ] Price
- [ ] Image Link
- [ ] Availability
- [ ] GTIN or MPN
- [ ] Brand
- [ ] Material
- [ ] Weight
- [ ] Weight Unit
- [ ] Other: _______________

**Weight Distribution** (if Option B):
```
Title: ___%
Description: ___%
Price: ___%
Image: ___%
GTIN/MPN: ___%
Brand: ___%
Material: ___%
Weight: ___%
Other: ___%
```

---

### 1.2 Compliance Level Storage
**Question**: Where/how do we store compliance levels?

**Options**:
- [ ] **A)** Computed on-the-fly (calculate every time)
- [ ] **B)** Cached on Product model (`complianceLevel` field, updated on product change)
- [ ] **C)** Background job (periodic recalculation)
- [ ] **D)** Hybrid (cached + background recalculation)

**Decision**: _______________

**If Cached (B/C/D)**: Update triggers?
- [ ] On product update
- [ ] On suggestion approval
- [ ] Scheduled job (how often? ___ minutes/hours)
- [ ] Manual trigger

---

### 1.3 Compliance Thresholds
**Question**: What compliance levels map to statuses?

**Status Mapping**:
- **"ready"**: Compliance ≥ _____ AND no pending suggestions
- **"pending"**: Has pending suggestions (regardless of compliance)
- **"missing"**: Compliance < _____ OR critical fields missing

**Critical Fields** (for "missing" status):
- [ ] Title
- [ ] Price
- [ ] Image
- [ ] Availability
- [ ] GTIN/MPN
- [ ] Other: _______________

**Decision**: ✅ **DECIDED**
- **"ready"**: Compliance ≥ **8** AND no pending suggestions
- **"pending"**: Has pending suggestions (regardless of compliance)
- **"missing"**: Compliance < **5** OR critical fields missing (Title, Price, Image, Availability)

**Rationale**: 8/10 threshold matches 80% quality standard. Pending suggestions prioritized to encourage merchant action. Critical fields cover minimum viable product listing.

---

## 2. Product Status System

### 2.1 Status Calculation
**Question**: How is product status derived?

**Options**:
- [ ] **A)** Computed on-the-fly (real-time)
- [ ] **B)** Stored field (updated on relevant changes)
- [ ] **C)** Both (stored + computed for validation)

**Decision**: _______________

**Update Triggers** (if stored):
- [ ] Product field changes
- [ ] Suggestion approval/rejection
- [ ] Compliance level changes
- [ ] Manual refresh

---

### 2.2 Status Priority Logic
**Question**: If multiple conditions apply, which status wins?

**Priority Order**:
1. Highest priority: _______________
2. Second: _______________
3. Lowest: _______________

**Example**: If compliance=9 but has pending suggestions, is it "ready" or "pending"?

**Decision**: ✅ **DECIDED**
**Priority Order**:
1. Highest priority: **"pending"** (requires merchant action)
2. Second: **"missing"** (critical issues blocking readiness)
3. Lowest: **"ready"** (default when no issues)

**Example**: If compliance=9 but has pending suggestions → status="pending"

**Rationale**: Actionable items (pending) take precedence over passive states. Encourages merchants to clear approval queue first.

---

## 3. Suggestion & Approval System

### 3.1 Impact Metrics
**Question**: How do we handle impact strings like "+15% discoverability"?

**Options**:
- [ ] **A)** Store as text field (`impact: string`)
- [ ] **B)** Store as structured JSON (`impact: Json` with type, value, unit)
- [ ] **C)** Calculate from historical data
- [ ] **D)** Get from LLM response (extract from suggestion generation)
- [ ] **E)** Don't store, generate on-demand

**Decision**: _______________

**If Structured (B)**: Schema?
```typescript
{
  type: "discoverability" | "conversion" | "click-through" | "compliance-level",
  value: number,
  unit: "%" | "level" | "points",
  description: string
}
```

**If LLM (D)**: Where in LLM response?
- [ ] Explicit field in response
- [ ] Parsed from description
- [ ] Generated separately via prompt

---

### 3.2 Confidence Scores
**Question**: How do we handle confidence scores (0-100%)?

**Options**:
- [ ] **A)** Store explicit `confidence: number` field
- [ ] **B)** Calculate from suggestion type/priority
- [ ] **C)** Get from LLM response
- [ ] **D)** Don't use confidence scores

**Decision**: _______________

**If Stored (A/C)**: Calculation method?
- LLM response: _______________
- Formula: _______________

---

### 3.3 Change Type Mapping
**Question**: How do we map `issueType` to frontend change types?

**Mapping**:
- **"title"** → `issueType` values: _______________
- **"field"** → `issueType` values: _______________
- **"description"** → `issueType` values: _______________

**Current `issueType` values** (from schema):
- missing_gtin
- checkout_disabled
- no_image
- missing_price
- availability_zero
- missing_brand
- missing_material
- missing_title
- missing_description
- missing_link
- missing_weight
- missing_weight_unit

**Decision**: ✅ **DECIDED - YES, create helper function**

**Mapping Logic**:
```typescript
function getChangeType(issueType: string): "title" | "field" | "description" {
  if (issueType.includes("title")) return "title"
  if (issueType.includes("description")) return "description"
  return "field" // default for all other field types
}
```

- **"title"** → `missing_title`, any issueType with "title"
- **"description"** → `missing_description`, any with "description"
- **"field"** → All others (missing_gtin, missing_brand, missing_price, etc.)

**Location**: `/src/lib/utils.ts`

**Rationale**: Simple pattern matching, easy to extend, single source of truth.

---

### 3.4 Bulk Approval Scope
**Question**: What filters should bulk approve support?

**Filters**:
- [ ] Priority (high/medium/low)
- [ ] Issue type
- [ ] Product ID list
- [ ] Compliance level range
- [ ] Confidence threshold
- [ ] Date range

**Decision**: ✅ **DECIDED**
**Supported Filters**:
- ✅ Priority (high/medium/low)
- ✅ Issue type
- ✅ Product ID list
- ✅ Confidence threshold (>= X%)
- ❌ Compliance level range (not needed - too complex)
- ❌ Date range (not needed initially)

**Rationale**: Core filters cover 95% of use cases. Confidence threshold adds safety. Avoid over-engineering.

---

## 4. Analytics & Tracking

### 4.1 Product View Tracking
**Question**: How do we track product views?

**Options**:
- [ ] **A)** Client-side only (browser tracking)
- [ ] **B)** Server-side API endpoint (`POST /api/track-view`)
- [ ] **C)** Both (client calls server)
- [ ] **D)** Third-party analytics (Plausible, Mixpanel, etc.)
- [ ] **E)** Don't track views

**Decision**: _______________

**If Server-side (B/C)**: Data model?
```prisma
model ProductView {
  id        String   @id @default(cuid())
  productId String
  product   Product  @relation(...)
  viewedAt  DateTime @default(now())
  source    String?  // "chatgpt", "direct", "search", etc.
  sessionId String?
  userId    String?
}
```

**Tracking Points**:
- [ ] Product detail page views
- [ ] Product table row views
- [ ] Search result impressions
- [ ] Other: _______________

---

### 4.2 Traffic Source Detection
**Question**: How do we detect traffic sources?

**Options**:
- [ ] **A)** HTTP Referer header
- [ ] **B)** UTM parameters
- [ ] **C)** Custom tracking parameter (`?source=chatgpt`)
- [ ] **D)** User agent analysis
- [X] **E)** Combination: _______________

**Decision**: ✅ **DECIDED - Option E (Combination)**
- **Primary**: Referer header (identifies ChatGPT Shopping automatically)
- **Secondary**: UTM parameters (`?utm_source=chatgpt`)
- **Fallback**: Mark as "direct" if neither present

**Source Categories**:
- **ChatGPT Shopping**: Referer contains `chat.openai.com` or `chatgpt.com`
- **Direct**: No referer + no UTM
- **Search**: Referer contains google.com, bing.com, etc.
- **Other**: Everything else

**Rationale**: Referer is automatic (no merchant setup), UTM allows explicit tracking, combination gives best coverage.

---

### 4.3 Analytics Aggregation
**Question**: How do we aggregate analytics data?

**Options**:
- [ ] **A)** Real-time calculation (on-demand queries)
- [ ] **B)** Materialized views (pre-calculated daily/hourly)
- [ ] **C)** Background job (periodic aggregation)
- [ ] **D)** Event stream (write to analytics DB)

**Decision**: _______________

**Aggregation Periods**:
- [ ] Daily
- [ ] Weekly
- [ ] Monthly
- [ ] Custom: _______________

**Metrics to Aggregate**:
- [ ] Views per product
- [ ] Revenue per product
- [ ] Conversion rate
- [ ] Traffic sources
- [ ] Other: _______________

---

## 5. Shopify Integration

### 5.1 Connection Method
**Question**: How do we connect to Shopify?

**Options**:
- [X] **A)** OAuth 2.0 (App Store app)
- [ ] **B)** Private app (API key + secret)
- [ ] **C)** Custom app (embedded app)
- [ ] **D)** Manual API key entry

**Decision**: ✅ **DECIDED - Option A (OAuth 2.0)**

**Required Credentials**:
- ✅ Store URL
- ✅ Access Token (from OAuth flow)
- ✅ API Version (2024-10 or latest stable)
- ❌ Webhook Secret (not needed initially, add when implementing webhooks)

**Rationale**: OAuth is the standard for Shopify apps, enables App Store distribution, better UX than manual keys, more secure. Path to Shopify App Store monetization.

---

### 5.2 Sync Configuration
**Question**: What sync settings do we need?

**Settings**:
- [ ] Auto-sync enabled (true/false)
- [ ] Sync interval: _____ minutes
- [ ] Sync inventory changes (true/false)
- [ ] Sync price changes (true/false)
- [ ] Sync new products (true/false)
- [ ] Sync product updates (true/false)
- [ ] Sync deletions (true/false)

**Decision**: Store as separate fields or JSON config?

---

### 5.3 Sync Job Scheduling
**Question**: How do we schedule sync jobs?

**Options**:
- [X] **A)** Next.js API route + cron (Vercel Cron)
- [ ] **B)** Background worker (BullMQ, Bull, etc.)
- [ ] **C)** Database-based scheduler
- [ ] **D)** External service (Upstash QStash, etc.)

**Decision**: ✅ **DECIDED - Option A (Vercel Cron)**

**Job Types**:
- ✅ Full catalog sync (daily)
- ✅ Incremental sync (every 15 min via webhooks - add later)
- ❌ Inventory-only sync (use full sync initially)
- ❌ Price-only sync (use full sync initially)

**Rationale**: Built-in Vercel Cron = zero infrastructure cost, simple setup, sufficient for initial users (<100 stores). Can upgrade to dedicated worker if scale demands it.

---

## 6. Smart Checkout Rules

### 6.1 Rule Configuration
**Question**: How do we store checkout rules?

**Options**:
- [X] **A)** JSON field on Workspace (`checkoutRules: Json`)
- [ ] **B)** Separate table (`CheckoutRule`)
- [ ] **C)** Hard-coded logic (no config)
- [ ] **D)** Separate config file

**Decision**: ✅ **DECIDED - Option A (JSON field)**

**Rule Structure** (if JSON/Table):
```typescript
{
  enableCheckoutWhen: {
    inventoryMin: number,        // ≥ 5 units
    ratingMin: number,          // ≥ 4.0 stars
    excludeTags: string[],      // ["custom", "preorder"]
    complianceMin: number,       // ≥ 8 level
    requireFields: string[]      // ["gtin", "image"]
  }
}
```

**Default Rules**:
- Inventory ≥ **5** units
- Rating ≥ **4.0** stars
- Exclude tags: **["custom", "preorder", "made-to-order"]**
- Compliance ≥ **8** level
- Required fields: **["gtin", "image"]**

**Rationale**: JSON allows flexibility without schema changes, easy defaults, can migrate to separate table later if complexity grows. Simple to update via settings page.

---

### 6.2 Rule Evaluation
**Question**: When do we evaluate checkout rules?

**Options**:
- [X] **A)** On product sync
- [ ] **B)** On compliance calculation
- [ ] **C)** On-demand (when viewing product)
- [ ] **D)** Background job (periodic check)

**Decision**: ✅ **DECIDED - Option A (On product sync)**

**Auto-enable Behavior**:
- [ ] Automatically set `enableCheckout: true` when rules met
- [X] Only suggest, require manual approval
- [ ] Log but don't auto-enable

**Rationale**: Evaluate when data changes (sync), but don't auto-enable to avoid merchant surprises. Create suggestions that keep human-in-the-loop while making merchants aware of opportunities.

---

## 7. Bulk Operations

### 7.1 Batch Optimization
**Question**: How do we handle bulk optimization?

**Options**:
- [ ] **A)** Synchronous (process immediately, wait for completion)
- [ ] **B)** Asynchronous (job queue, return job ID)
- [ ] **C)** Streaming (websocket/progress updates)
- [ ] **D)** Hybrid (small batches sync, large async)

**Decision**: _______________

**Batch Size Limits**:
- Sync max: _____ products
- Async threshold: _____ products
- Timeout: _____ seconds

---

### 7.2 Job Queue System
**Question**: What job queue system to use?

**Options**:
- [ ] **A)** BullMQ (Redis-based)
- [X] **B)** Database-based (Prisma + polling)
- [ ] **C)** Vercel/Next.js built-in (if available)
- [ ] **D)** External service (Upstash, Inngest, etc.)

**Decision**: ✅ **DECIDED - Option B (Database-based)**

**Job Features Needed**:
- ✅ Progress tracking (0-100%)
- ✅ Status updates (pending/running/completed/failed)
- ✅ Retry logic (3 attempts max)
- ❌ Job cancellation (not needed initially)
- ✅ Job history (keep last 100 jobs per workspace)

**Rationale**: No Redis dependency = lower cost, simpler deployment, sufficient for <1000 products/workspace. Existing Job model supports most features. Can upgrade to BullMQ later if scale demands it.

---

### 7.3 Quick Actions Implementation
**Question**: How do we implement quick actions?

**Actions**:
1. **Optimize Titles**
   - [ ] Generate suggestions for all selected
   - [ ] Batch approve automatically
   - [ ] Require approval

2. **Fill Missing Fields**
   - [ ] Which fields? _______________
   - [ ] Auto-approve or require approval?

3. **Enable Checkout**
   - [ ] Based on compliance level?
   - [ ] Based on smart checkout rules?
   - [ ] Manual override allowed?

4. **Sync Inventory**
   - [ ] Trigger Shopify sync
   - [ ] Update all selected products
   - [ ] Background job?

**Decision**: ✅ **DECIDED - Implementation for each:**

1. **Optimize Titles**
   - ✅ Generate suggestions for all selected
   - ❌ Batch approve automatically
   - ✅ **Require approval** (HITL)

2. **Fill Missing Fields**
   - Fields: **gtin, brand, material, weight, weight_unit** (priority fields)
   - ✅ **Require approval** (HITL)

3. **Enable Checkout**
   - ✅ Based on smart checkout rules
   - ✅ **Require approval** (create suggestion, don't auto-enable)

4. **Sync Inventory**
   - ✅ Trigger Shopify sync
   - ✅ Update all selected products
   - ✅ Background job (if >10 products)

**Rationale**: Content changes require approval (HITL), inventory sync is safe to auto-execute.

---

## 8. Component Migration Strategy

### 8.1 Migration Order
**Question**: What order should we migrate components?

**Priority Order**:
1. _______________
2. _______________
3. _______________
4. _______________
5. _______________

**Suggested Order**:
- [ ] Phase 1: Dashboard (StatCard, PendingActions)
- [ ] Phase 2: Products (ProductsTable, ComplianceIndicator)
- [ ] Phase 3: Approvals (ApprovalCard enhancements)
- [ ] Phase 4: Product Detail (AISuggestionCard)
- [ ] Phase 5: Analytics (charts, KPIs)
- [ ] Phase 6: Settings & Bulk Operations

**Decision**: ✅ **DECIDED - Confirmed suggested order:**

**Priority Order**:
1. **Phase 1: Dashboard** (StatCard, PendingActions, ActivityFeed) - Core user entry point
2. **Phase 2: Products** (ProductsTable, ComplianceIndicator, ProductStatusBadge) - Primary workflow
3. **Phase 3: Approvals** (ApprovalCard enhancements) - Critical HITL workflow
4. **Phase 4: Product Detail** (AISuggestionCard, ProductDetailHeader) - Deep dive functionality
5. **Phase 5: Analytics** (Charts, AnalyticsKpiCard) - Reporting and insights
6. **Phase 6: Settings & Bulk Operations** (SettingsSidebar, bulk optimize page) - Advanced features

**Rationale**: Prioritizes core user flows first (dashboard → products → approvals), then adds detail views, analytics, and advanced features. Each phase delivers value independently.

---

### 8.2 Component Library
**Question**: Which component library to use?

**Options**:
- [ ] **A)** shadcn/ui (current)
- [ ] **B)** Copy components from v0 repo as-is
- [ ] **C)** Rebuild from scratch
- [X] **D)** Hybrid (adapt v0 components to shadcn)

**Decision**: ✅ **DECIDED - Option D (Hybrid)**

**Approach**: Copy v0 custom components (StatCard, ComplianceIndicator, etc.), but use shadcn primitives (Button, Card, Badge) for consistency.

**Missing shadcn Components to Add**:
- ✅ Progress (need to add)
- ✅ Avatar (need to add)

**Rationale**: Best of both worlds - leverage v0 design work while maintaining existing component ecosystem. Ensures consistency across app.

---

### 8.3 Styling Approach
**Question**: How do we handle styling differences?

**v0 Uses**:
- Custom color scheme (violet/purple accents)
- "warm-bg" background color
- Specific spacing/typography

**Options**:
- [ ] **A)** Match v0 exactly
- [ ] **B)** Adapt to current project theme
- [X] **C)** Use CSS variables for easy theming
- [ ] **D)** Create theme config

**Decision**: ✅ **DECIDED - Option C (CSS variables)**

**Approach**: Extract v0 color scheme to CSS variables in globals.css:
```css
:root {
  --primary: #8b5cf6; /* v0 violet */
  --background: #fafaf9; /* v0 warm-bg */
  /* ... etc */
}
```

**Rationale**: Flexible, allows theme customization without code changes, doesn't break existing styles, future-proof for white-label/theming features. Already implemented in merged globals.css.

---

## 9. API Design

### 9.1 tRPC Procedure Naming
**Question**: Naming conventions for new procedures?

**Pattern**:
- List: `product.list` or `product.getAll`?
- Get by ID: `product.getById` or `product.get`?
- Create: `product.create` or `product.add`?
- Update: `product.update` or `product.edit`?
- Delete: `product.delete` or `product.remove`?

**Decision**: ✅ **DECIDED**
- List: **`product.list`**
- Get by ID: **`product.getById`**
- Create: **`product.create`**
- Update: **`product.update`**
- Delete: **`product.delete`**

**Rationale**: Matches existing patterns in codebase, clear and consistent, follows REST conventions, self-documenting.

---

### 9.2 Pagination Strategy
**Question**: How do we paginate large lists?

**Options**:
- [X] **A)** Offset-based (`skip`/`take`)
- [ ] **B)** Cursor-based (`cursor`/`limit`)
- [ ] **C)** Page-based (`page`/`pageSize`)

**Decision**: ✅ **DECIDED - Option A (Offset-based)**

**Default Page Size**: **50** items

**Rationale**: Simpler to implement, works well with Prisma, sufficient for typical product catalogs (<5000 products), easier for users to understand ("page 2 of 10"). Can add cursor-based later if performance issues arise.

---

### 9.3 Filtering & Sorting
**Question**: How do we handle filters and sorting?

**Filter Types**:
- [ ] Query string parameters
- [ ] POST body (JSON)
- [X] tRPC input object

**Sorting**:
- [X] Single field: `sortBy: "name" | "price" | ...`
- [ ] Multiple fields: `sort: [{ field: "name", order: "asc" }]`
- [ ] Predefined sorts: `sort: "name_asc" | "price_desc"`

**Decision**: ✅ **DECIDED**
- **Filters**: tRPC input object (type-safe Zod schemas)
- **Sorting**: Single field with direction
  ```typescript
  sortBy: "name" | "price" | "compliance" | "createdAt"
  sortOrder: "asc" | "desc"
  ```

**Rationale**: Type safety prevents errors, simple enough for frontend, easy to extend. tRPC validates inputs automatically.

---

## 10. Data Migration & Seed Data

### 10.1 Existing Data
**Question**: What do we do with existing products?

**Options**:
- [ ] **A)** Calculate compliance for all existing products
- [ ] **B)** Set default compliance (what value? _____)
- [ ] **C)** Leave null, calculate on-demand
- [X] **D)** Migration script to backfill

**Decision**: ✅ **DECIDED - Option D (Migration script)**

**Approach**: Run one-time migration script to calculate compliance for all existing products when deploying this update.

**Rationale**: Clean data from day one, avoids null checks throughout app, ensures consistency, provides immediate value to existing users.

---

### 10.2 Seed Data
**Question**: Do we need seed/test data?

**Options**:
- [ ] **A)** Yes, create seed script
- [ ] **B)** No, use production data
- [X] **C)** Conditional (dev only)

**Decision**: ✅ **DECIDED - Option C (Conditional, dev only)**

**Seed Data Includes**:
- ✅ 20 sample products (various compliance levels 1-10)
- ✅ 10 sample suggestions (different priorities/types)
- ✅ 5 sample orders (for analytics testing)
- ❌ Sample analytics aggregations (generate on-demand)

**Rationale**: Speeds up development, enables demo environments without real Shopify connection, doesn't affect production. Use NODE_ENV check.

---

## 11. Performance & Scalability

### 11.1 Caching Strategy
**Question**: What should we cache?

**Cache Candidates**:
- [ ] Compliance levels
- [ ] Product statuses
- [ ] Analytics aggregations
- [ ] Dashboard stats
- [ ] Other: _______________

**Cache Method**:
- [X] **A)** Database (materialized fields)
- [ ] **B)** Redis
- [ ] **C)** Next.js cache (unstable_cache)
- [ ] **D)** No caching

**Decision**: ✅ **DECIDED - Option A (Database materialization)**

**What to Cache**:
- ✅ Compliance levels (stored on Product model)
- ✅ Product statuses (stored on Product model)
- ✅ Dashboard stats (stored in DailyAnalytics table)
- ❌ Individual queries (not needed)

**Cache TTL**: Recalculate on product update + daily background job at midnight

**Rationale**: Simple, no external dependencies, Prisma handles invalidation, sufficient performance for target scale (<100k products).

---

### 11.2 Query Optimization
**Question**: How do we optimize expensive queries?

**Optimizations**:
- [ ] Database indexes (which fields?)
- [ ] Query batching
- [ ] DataLoader pattern
- [ ] Query result pagination
- [ ] Other: _______________

**Decision**: ✅ **DECIDED**

**Optimizations to Implement**:
- ✅ **Database indexes** on: `productId`, `workspaceId`, `status`, `complianceLevel`, `createdAt`, `riskLevel`
- ✅ **Query result pagination** (already using)
- ✅ **Include related data** in single query (avoid N+1)
- ❌ DataLoader pattern (overkill for current scale)
- ❌ Query batching (not needed)

**Rationale**: Indexes give biggest performance boost with minimal effort. Pagination prevents large result sets. Single queries with includes reduce round-trips. DataLoader adds complexity without proportional benefit at current scale.

---

## 12. Error Handling & Validation

### 12.1 Error Response Format
**Question**: Standard error format?

**Format**:
```typescript
{
  error: {
    code: string,        // "VALIDATION_ERROR" | "NOT_FOUND" | ...
    message: string,
    details?: any
  }
}
```

**Decision**: ✅ **CONFIRMED - Use tRPC standard error format**

tRPC automatically provides:
```typescript
{
  error: {
    code: "VALIDATION_ERROR" | "NOT_FOUND" | "UNAUTHORIZED" | "INTERNAL_SERVER_ERROR" | ...,
    message: string,
    data?: any // Optional context
  }
}
```

**Rationale**: tRPC handles this automatically, consistent with existing backend, well-documented, works with React Query error handling.

---

### 12.2 Validation Rules
**Question**: Where do we validate?

**Options**:
- [ ] **A)** tRPC input validation (Zod)
- [ ] **B)** Database constraints
- [ ] **C)** Business logic layer
- [X] **D)** All of the above

**Decision**: ✅ **DECIDED - Option D (All layers)**

**Validation Strategy**:
- **tRPC input**: Zod schemas for all API inputs (first line of defense)
- **Database constraints**: Unique, required, foreign keys, check constraints
- **Business logic**: Complex rules (e.g., compliance calculation, checkout rules)

**Rationale**: Defense in depth - catch errors early (input validation), ensure data integrity (DB constraints), enforce business rules (logic layer). Each layer serves different purpose.

---

## 13. Security & Permissions

### 13.1 Access Control
**Question**: How do we handle permissions?

**Options**:
- [X] **A)** Workspace-based (all workspace members can access)
- [ ] **B)** Role-based (ADMIN, USER, VIEWER)
- [ ] **C)** Feature flags
- [ ] **D)** No permissions (single user)

**Decision**: ✅ **DECIDED - Option A (Workspace-based)**

**Permission Checks** (all workspace members can):
- ✅ View products
- ✅ Edit products
- ✅ Approve suggestions
- ✅ Bulk operations
- ✅ Settings

**Rationale**: Simple for MVP, matches typical SaaS pattern (Slack, Notion), reduces complexity. Can add RBAC (Option B) later if customer requests come in. Most Shopify stores have 1-3 users anyway.

---

### 13.2 API Rate Limiting
**Question**: Do we need rate limiting?

**Options**:
- [ ] **A)** Yes, implement rate limiting
- [X] **B)** No, not needed
- [ ] **C)** Per-user limits
- [ ] **D)** Per-workspace limits

**Decision**: ✅ **DECIDED - Option B (Not needed initially)**

**Rationale**: Focus on core features first, add rate limiting if abuse occurs. Vercel/hosting provides some DDoS protection. tRPC less vulnerable than public REST APIs. Can add later with middleware if needed.

---

## 14. Testing Strategy

### 14.1 Test Coverage
**Question**: What should we test?

**Test Types**:
- [ ] Unit tests (business logic)
- [ ] Integration tests (API endpoints)
- [ ] E2E tests (user flows)
- [ ] Component tests (React components)

**Decision**: ✅ **DECIDED - Priority order:**
1. **Integration tests** (API endpoints) - Highest ROI, catch most bugs
2. **Unit tests** (business logic) - Compliance calculation, status derivation
3. **Component tests** (Critical components) - ComplianceIndicator, StatCard
4. **E2E tests** (Skip initially) - Add for critical flows later, expensive to maintain

**Rationale**: Integration tests catch most bugs, unit tests document business logic, component tests ensure UI correctness. E2E tests have lower ROI for effort invested.

---

### 14.2 Test Data
**Question**: How do we handle test data?

**Options**:
- [ ] **A)** In-memory database
- [ ] **B)** Test database (separate from dev)
- [ ] **C)** Fixtures/mocks
- [X] **D)** Combination

**Decision**: ✅ **DECIDED - Option D (Combination)**
- **In-memory SQLite** for unit tests (fast, isolated)
- **Test database** for integration tests (realistic, can test migrations)
- **Fixtures/mocks** for component tests (UI isolation)

**Rationale**: Each test type needs different approach. In-memory is fast, test DB is realistic, mocks isolate components from backend.

---

## 15. Deployment & Environment

### 15.1 Environment Variables
**Question**: What new env vars do we need?

**New Variables**:
- [ ] `SHOPIFY_API_KEY`
- [ ] `SHOPIFY_API_SECRET`
- [ ] `REDIS_URL` (if using job queue)
- [ ] `ANALYTICS_ENABLED`
- [ ] Other: _______________

**Decision**: ✅ **DECIDED - New variables:**
- ✅ `SHOPIFY_API_KEY` (for OAuth)
- ✅ `SHOPIFY_API_SECRET` (for OAuth)
- ✅ `SHOPIFY_APP_URL` (webhook callback URL)
- ❌ `REDIS_URL` (not using Redis)
- ❌ `ANALYTICS_ENABLED` (use feature flag instead)

**Rationale**: Minimal env vars reduce configuration complexity. Feature flags in database more flexible than env vars for per-workspace control.

---

### 15.2 Feature Flags
**Question**: Do we need feature flags?

**Flags**:
- [ ] `ENABLE_ANALYTICS`
- [ ] `ENABLE_BULK_OPERATIONS`
- [ ] `ENABLE_SHOPIFY_SYNC`
- [ ] `ENABLE_SMART_CHECKOUT`
- [ ] Other: _______________

**Decision**: ✅ **DECIDED - Use workspace-level feature flags:**

**Flags to implement** (stored as JSON on Workspace model):
- ✅ `ENABLE_ANALYTICS` (default: true)
- ✅ `ENABLE_BULK_OPERATIONS` (default: true)
- ✅ `ENABLE_SHOPIFY_SYNC` (default: false - requires OAuth setup)
- ✅ `ENABLE_SMART_CHECKOUT` (default: true)

**Storage**: `Workspace.featureFlags: Json`

**Rationale**: Per-workspace flags allow gradual rollout, easy to toggle without code deploy, enables A/B testing. Can migrate to LaunchDarkly later if needed. Simple JSON field keeps it lightweight.

---

## 16. Additional Decisions from Frontend Analysis

### 16.1 Stock Status Mapping
**Question**: How do we map inventoryQuantity to stock status?

**Decision**: ✅ **DECIDED**
```typescript
function getStockStatus(quantity: number): "In Stock" | "Low Stock" | "Out of Stock" {
  if (quantity === 0) return "Out of Stock"
  if (quantity < 10) return "Low Stock"
  return "In Stock"
}
```

**Thresholds**:
- Out of Stock: quantity = 0
- Low Stock: quantity < 10
- In Stock: quantity ≥ 10

**Rationale**: Simple thresholds that work for most products. Can make configurable later if needed.

---

### 16.2 Compliance Level Explanations
**Question**: What human-readable text explains each compliance level?

**Decision**: ✅ **DECIDED**

**Compliance Explanations**:
- **Level 10**: "Perfect - All required and recommended fields complete"
- **Level 9**: "Excellent - Missing only 1 recommended field"
- **Level 8**: "Ready - Meets all requirements for ChatGPT Shopping"
- **Level 7**: "Good - Missing 3 recommended fields"
- **Level 6**: "Fair - Missing 4 recommended fields"
- **Level 5**: "Needs Work - Missing 5 fields"
- **Level 4**: "Poor - Missing critical fields"
- **Level 3**: "Poor - Multiple critical fields missing"
- **Level 2**: "Critical - Product not discoverable"
- **Level 1**: "Critical - Minimal product data present"

**Rationale**: Clear, actionable feedback for merchants. Emphasizes Level 8+ as "ready" threshold.

---

### 16.3 Dashboard Metrics Implementation
**Question**: How to implement "Avg Response Time" and "Visibility Score" metrics from v0 design?

**Decision**: ✅ **DECIDED**

**Avg Response Time**:
- **Phase 1 (MVP)**: Skip this metric - requires API response time tracking infrastructure
- **Phase 2**: If needed, track via middleware logging API response times
- **Alternative**: Show "Compliance Score" instead (more actionable for merchants)

**Visibility Score**:
- **Implementation**: Aggregate compliance score across all products
- **Formula**: `(sum of all product compliance levels) / (total products * 10) * 100`
- **Example**: 100 products averaging compliance level 8 = 80% visibility score

**Rationale**: Visibility score is actionable and doesn't require new infrastructure. Response time is nice-to-have but not critical for MVP.

---

### 16.4 Analytics Missing Metrics
**Question**: How to track Product Views (from analytics page)?

**Decision**: ✅ **DECIDED - Defer to Phase 2**

**Approach for MVP**:
- Skip product view tracking initially
- Focus on order-based metrics (revenue, conversions, orders)
- Analytics page shows:
  - Orders (from OrderEvent table)
  - Revenue (from OrderEvent.amount)
  - Conversion Rate: Skip or show "N/A" initially
  - Product Views: Show "N/A" or hide this metric

**Phase 2 (if needed)**:
- Add ProductView tracking as decided in #4.1
- Implement view tracking endpoint
- Update analytics to show view metrics

**Rationale**: Order data is already tracked and provides value. View tracking adds complexity without proportional benefit for MVP. Most merchants care about revenue, not views.

---

## Decision Summary

**Total Decisions**: ~75
**Decisions Completed**: All non-critical decisions ✅
**Status**: Non-critical decisions complete, critical decisions pending user confirmation

**Critical Path Decisions** (must confirm with user):
1. ⏳ Compliance calculation method (#1.1) - Recommended in CRITICAL-DECISIONS.md
2. ⏳ Compliance storage strategy (#1.2) - Recommended in CRITICAL-DECISIONS.md
3. ⏳ Impact metrics handling (#3.1) - Recommended in CRITICAL-DECISIONS.md
4. ⏳ View tracking approach (#4.1) - Recommended in CRITICAL-DECISIONS.md
5. ⏳ Bulk operations strategy (#7.1) - Recommended in CRITICAL-DECISIONS.md

**All Other Decisions**: ✅ COMPLETED (see sections above)

**Last Updated**: November 1, 2024
**Next Step**: Review and confirm critical decisions in CRITICAL-DECISIONS.md

---

## Notes & Additional Context

**Technical Constraints**:
- _______________
- _______________

**Business Requirements**:
- _______________
- _______________

**Timeline**:
- Start date: _______________
- Target completion: _______________

---

**Document Version**: 1.0  
**Last Updated**: 2024-10-31  
**Status**: ⚠️ Awaiting Decisions

