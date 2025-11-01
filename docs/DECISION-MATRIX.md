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

**Decision**: _______________

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

**Decision**: _______________

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

**Decision**: Create helper function? Y/N

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

**Decision**: _______________

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
- [ ] **E)** Combination: _______________

**Decision**: _______________

**Source Categories**:
- ChatGPT Shopping: _______________
- Direct: _______________
- Search: _______________
- Other: _______________

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
- [ ] **A)** OAuth 2.0 (App Store app)
- [ ] **B)** Private app (API key + secret)
- [ ] **C)** Custom app (embedded app)
- [ ] **D)** Manual API key entry

**Decision**: _______________

**Required Credentials**:
- [ ] Store URL
- [ ] Access Token
- [ ] API Version
- [ ] Webhook Secret
- [ ] Other: _______________

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
- [ ] **A)** Next.js API route + cron (Vercel Cron)
- [ ] **B)** Background worker (BullMQ, Bull, etc.)
- [ ] **C)** Database-based scheduler
- [ ] **D)** External service (Upstash QStash, etc.)

**Decision**: _______________

**Job Types**:
- [ ] Full catalog sync
- [ ] Incremental sync (webhooks)
- [ ] Inventory-only sync
- [ ] Price-only sync

---

## 6. Smart Checkout Rules

### 6.1 Rule Configuration
**Question**: How do we store checkout rules?

**Options**:
- [ ] **A)** JSON field on Workspace (`checkoutRules: Json`)
- [ ] **B)** Separate table (`CheckoutRule`)
- [ ] **C)** Hard-coded logic (no config)
- [ ] **D)** Separate config file

**Decision**: _______________

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
- Inventory ≥ _____ units
- Rating ≥ _____ stars
- Exclude tags: _______________
- Compliance ≥ _____ level
- Required fields: _______________

---

### 6.2 Rule Evaluation
**Question**: When do we evaluate checkout rules?

**Options**:
- [ ] **A)** On product sync
- [ ] **B)** On compliance calculation
- [ ] **C)** On-demand (when viewing product)
- [ ] **D)** Background job (periodic check)

**Decision**: _______________

**Auto-enable Behavior**:
- [ ] Automatically set `enableCheckout: true` when rules met
- [ ] Only suggest, require manual approval
- [ ] Log but don't auto-enable

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
- [ ] **B)** Database-based (Prisma + polling)
- [ ] **C)** Vercel/Next.js built-in (if available)
- [ ] **D)** External service (Upstash, Inngest, etc.)

**Decision**: _______________

**Job Features Needed**:
- [ ] Progress tracking (0-100%)
- [ ] Status updates (pending/running/completed/failed)
- [ ] Retry logic
- [ ] Job cancellation
- [ ] Job history

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

**Decision**: Implementation approach for each?

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

**Decision**: Confirm or modify?

---

### 8.2 Component Library
**Question**: Which component library to use?

**Options**:
- [ ] **A)** shadcn/ui (current)
- [ ] **B)** Copy components from v0 repo as-is
- [ ] **C)** Rebuild from scratch
- [ ] **D)** Hybrid (adapt v0 components to shadcn)

**Decision**: _______________

**Missing shadcn Components**:
- [ ] Progress (need to add)
- [ ] Avatar (need to add)
- [ ] Other: _______________

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
- [ ] **C)** Use CSS variables for easy theming
- [ ] **D)** Create theme config

**Decision**: _______________

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

**Decision**: _______________

---

### 9.2 Pagination Strategy
**Question**: How do we paginate large lists?

**Options**:
- [ ] **A)** Offset-based (`skip`/`take`)
- [ ] **B)** Cursor-based (`cursor`/`limit`)
- [ ] **C)** Page-based (`page`/`pageSize`)

**Decision**: _______________

**Default Page Size**: _____ items

---

### 9.3 Filtering & Sorting
**Question**: How do we handle filters and sorting?

**Filter Types**:
- [ ] Query string parameters
- [ ] POST body (JSON)
- [ ] tRPC input object

**Sorting**:
- [ ] Single field: `sortBy: "name" | "price" | ...`
- [ ] Multiple fields: `sort: [{ field: "name", order: "asc" }]`
- [ ] Predefined sorts: `sort: "name_asc" | "price_desc"`

**Decision**: _______________

---

## 10. Data Migration & Seed Data

### 10.1 Existing Data
**Question**: What do we do with existing products?

**Options**:
- [ ] **A)** Calculate compliance for all existing products
- [ ] **B)** Set default compliance (what value? _____)
- [ ] **C)** Leave null, calculate on-demand
- [ ] **D)** Migration script to backfill

**Decision**: _______________

---

### 10.2 Seed Data
**Question**: Do we need seed/test data?

**Options**:
- [ ] **A)** Yes, create seed script
- [ ] **B)** No, use production data
- [ ] **C)** Conditional (dev only)

**Decision**: _______________

**Seed Data Includes**:
- [ ] Sample products
- [ ] Sample suggestions
- [ ] Sample orders
- [ ] Sample analytics

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
- [ ] **A)** Database (materialized fields)
- [ ] **B)** Redis
- [ ] **C)** Next.js cache (unstable_cache)
- [ ] **D)** No caching

**Decision**: _______________

**Cache TTL**: _____ minutes/hours

---

### 11.2 Query Optimization
**Question**: How do we optimize expensive queries?

**Optimizations**:
- [ ] Database indexes (which fields?)
- [ ] Query batching
- [ ] DataLoader pattern
- [ ] Query result pagination
- [ ] Other: _______________

**Decision**: _______________

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

**Decision**: Confirm format?

---

### 12.2 Validation Rules
**Question**: Where do we validate?

**Options**:
- [ ] **A)** tRPC input validation (Zod)
- [ ] **B)** Database constraints
- [ ] **C)** Business logic layer
- [ ] **D)** All of the above

**Decision**: _______________

---

## 13. Security & Permissions

### 13.1 Access Control
**Question**: How do we handle permissions?

**Options**:
- [ ] **A)** Workspace-based (all workspace members can access)
- [ ] **B)** Role-based (ADMIN, USER, VIEWER)
- [ ] **C)** Feature flags
- [ ] **D)** No permissions (single user)

**Decision**: _______________

**Permission Checks**:
- [ ] View products: _______________
- [ ] Edit products: _______________
- [ ] Approve suggestions: _______________
- [ ] Bulk operations: _______________
- [ ] Settings: _______________

---

### 13.2 API Rate Limiting
**Question**: Do we need rate limiting?

**Options**:
- [ ] **A)** Yes, implement rate limiting
- [ ] **B)** No, not needed
- [ ] **C)** Per-user limits
- [ ] **D)** Per-workspace limits

**Decision**: _______________

**Limits**:
- Requests per minute: _____
- Requests per hour: _____
- Bulk operations: _____ per day

---

## 14. Testing Strategy

### 14.1 Test Coverage
**Question**: What should we test?

**Test Types**:
- [ ] Unit tests (business logic)
- [ ] Integration tests (API endpoints)
- [ ] E2E tests (user flows)
- [ ] Component tests (React components)

**Decision**: Priority order?

---

### 14.2 Test Data
**Question**: How do we handle test data?

**Options**:
- [ ] **A)** In-memory database
- [ ] **B)** Test database (separate from dev)
- [ ] **C)** Fixtures/mocks
- [ ] **D)** Combination

**Decision**: _______________

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

**Decision**: List all new vars?

---

### 15.2 Feature Flags
**Question**: Do we need feature flags?

**Flags**:
- [ ] `ENABLE_ANALYTICS`
- [ ] `ENABLE_BULK_OPERATIONS`
- [ ] `ENABLE_SHOPIFY_SYNC`
- [ ] `ENABLE_SMART_CHECKOUT`
- [ ] Other: _______________

**Decision**: _______________

---

## Decision Summary

**Total Decisions**: ~75

**Critical Path Decisions** (must decide first):
1. Compliance calculation method (#1.1)
2. Compliance storage strategy (#1.2)
3. Impact metrics handling (#3.1)
4. View tracking approach (#4.1)
5. Bulk operations strategy (#7.1)

**Estimated Time to Complete Decisions**: _____ hours/days

**Next Review Date**: _______________

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

