# Critical Decisions: Quick Start Guide

**Goal**: Make these 10 decisions first to unblock implementation.

---

## 🚨 Top 5 Critical Decisions (Must Decide First)

### 1. Agentic Commerce Optimization Score (#1.1)
**Question**: How do we calculate the 1-10 optimization score?

**Decision**: ✅ **APPROVED - Weighted Multi-Factor Scoring**

**Two-Tier System:**

**Tier 1: Required Fields Check** (Pass/Fail)
- Must have: title, description, price, imageLink, availability, (gtin OR mpn)
- If ANY missing → Status="missing" (BLOCKED from checkout)

**Tier 2: Optimization Score** (100 points → Level 1-10)

**Scoring Breakdown:**

**1. Core Content Quality (25 points)** - Quality writing
- Title optimization (10pts):
  * Has title: 4pts
  * Length 40-150 chars: +3pts
  * Contains brand name: +3pts
- Description richness (10pts):
  * Has description: 4pts
  * Length ≥300 chars: +3pts
  * Contains use cases/benefits: +3pts
- Brand presence (5pts):
  * Has brand: 5pts

**2. Product Identity (20 points)** - What it is
- GTIN/MPN (8pts): Has GTIN or MPN
- Category/Type (4pts): Product type specified
- Material (4pts): Material specified (if physical product)
- Size/Dimensions (4pts): Weight/dimensions specified (if physical product)

**3. Agent-Specific Fields (20 points)** 🤖 - Context for AI
- Use cases & benefits (7pts):
  * Has use cases specified: 4pts
  * Includes key benefits/value props: +3pts
- Target audience & context (7pts):
  * Target audience defined: 4pts
  * Includes ideal scenarios/when to use: +3pts
- Product relationships (6pts):
  * Comparable/similar products: 2pts
  * Works with/compatibility: 2pts
  * Key differentiators vs alternatives: 2pts

**4. Media Quality (15 points)** - Visual proof
- Primary image (8pts): Has image
- Multiple images (4pts): ≥3 images
- Video content (3pts): Has product video

**5. Commerce Readiness (10 points)** - Can it be sold?
- Pricing (3pts): Has price
- Inventory (4pts): In stock (quantity > 0)
- Availability (3pts): Availability status set

**6. SEO Quality (5 points)** - Traditional search
- Meta description (2pts): Custom meta description
- Keywords/tags (2pts): Has product tags
- URL structure (1pt): Clean URL slug

**7. Reviews & Social Proof (3 points)** - Trust signals
- Rating (2pts): Rating ≥4.0 stars
- Review count (1pt): ≥5 reviews

**8. Shipping & Fulfillment (2 points)** - Logistics
- Shipping info (1pt): Shipping details specified
- Ships from location (1pt): Origin location set

**Total: 100 points**

**Level Ranges (Option C):**
- **Level 10**: 90-100 points - "Perfect"
- **Level 9**: 80-89 points - "Excellent"
- **Level 8**: 70-79 points - "Ready" (recommended minimum)
- **Level 7**: 60-69 points - "Good"
- **Level 6**: 50-59 points - "Fair"
- **Level 5**: 40-49 points - "Needs Work"
- **Level 4**: 30-39 points - "Poor"
- **Level 3**: 20-29 points - "Poor"
- **Level 2**: 10-19 points - "Critical"
- **Level 1**: 0-9 points - "Critical"

**Product-Type Specific Scoring:**
- Physical products: All factors apply
- Digital products: Skip material, dimensions, shipping (reallocate 8pts to other categories)
- Service products: Skip material, dimensions, inventory, shipping (reallocate 12pts)

**Aggregation:**
- **Product-level**: Individual product scores (MVP)
- **Store-level**: Average across all products (Phase 1B)
  * Formula: `(sum of all product scores) / (total products * 10) * 10`
  * Example: 500 products averaging 73 points = Store Level 7.3

**Rationale**: Agent-optimized scoring reflects product positioning. Agent-Specific Fields (20pts) equal to Product Identity (20pts) ensures merchants can't reach Level 8+ without rich AI context. Core Content (25pts) remains highest priority for quality writing. First-mover advantage in ChatGPT Shopping market.

---

### 2. Optimization Score Storage (#1.2)
**Question**: Store optimization score or calculate on-demand?

**Decision**: ✅ **APPROVED - Cached on Product model**

**Implementation:**
- Add `optimizationScore: Int` (0-100 raw points)
- Add `optimizationLevel: Int` (1-10 derived from score)
- Add `scoreBreakdown: Json` (detailed point allocation per category)

**Recalculation Triggers:**
- ✅ Shopify sync completes (every 15 min or daily)
- ✅ Merchant manually edits product in dashboard
- ✅ Suggestion approved that modifies product
- ✅ Daily midnight job (safety net for all products)
- ❌ NOT on every inventory change (cost-effective)

**Example scoreBreakdown:**
```json
{
  "coreContent": 20,
  "productIdentity": 16,
  "agentFields": 14,
  "mediaQuality": 12,
  "commerceReadiness": 10,
  "seoQuality": 4,
  "reviews": 2,
  "shipping": 2,
  "total": 80,
  "level": 9,
  "missing": ["video", "target_audience"]
}
```

**Rationale**: Fast queries, enables filtering/sorting, provides transparency. Sync-schedule recalculation balances freshness with cost-effectiveness (96 updates/day vs thousands).

---

### 3. Impact Metrics (#3.1)
**Question**: How do we show merchants the impact of implementing suggestions?

**Decision**: ✅ **APPROVED - Score Impact Only (MVP)**

**What We Show:**
```typescript
// On Suggestion model
scoreImpact: Json {
  category: string,        // "productIdentity", "agentFields", etc.
  points: number,          // Point delta: +8
  currentLevel: number,    // Before: 7
  newLevel: number,        // After: 8
  description: string      // "Adding GTIN: +8 points (Level 7 → 8)"
}
```

**What We DON'T Show (Until We Have Data):**
- ❌ Business impact claims ("+15% discoverability", "+12% CTR")
- ❌ Revenue projections
- ❌ Conversion rate estimates

**Calculation:**
1. Calculate current product score
2. Simulate score if suggestion applied
3. Store delta in scoreImpact field

**Examples:**
- "Adding GTIN: +8 points (Level 7 → 8)"
- "Adding target audience: +4 points (Level 8 → 8)"
- "Optimizing title: +6 points (Level 6 → 7)"

**Phase 2 (90+ days of data):**
- Add business impact metrics backed by real data
- Track ChatGPT Shopping engagement by optimization level
- Measure actual conversion lift

**Rationale**: Transparent, calculable, honest. No unsubstantiated claims. Merchants see exact score impact and clear path to improvement.

---

### 4. Product View Tracking (#4.1)
**Question**: How do we track product views for analytics?

**Decision**: ✅ **APPROVED - Defer to Phase 2**

**MVP Approach:**
- ❌ Skip product view tracking infrastructure
- ✅ Focus on order-based metrics (already tracked via OrderEvent)

**Analytics Page Shows:**
- ✅ Orders (from OrderEvent table)
- ✅ Revenue (from OrderEvent.amount)
- ✅ Traffic Sources (from OrderEvent.sourceChannel)
- ❌ Product Views - Hide this metric or show "N/A"
- ❌ Conversion Rate - Hide this metric or show "N/A"

**Phase 2 Implementation (if customers request):**
```typescript
model ProductView {
  id        String   @id @default(cuid())
  productId String
  product   Product  @relation(...)
  viewedAt  DateTime @default(now())
  source    String?  // "chatgpt", "direct", "search"
  sessionId String?
}

// Endpoint: POST /api/track-view
```

**Rationale**: Faster MVP (~1 week saved), lower complexity, order/revenue data is what merchants care about most. Can add view tracking later if customer demand warrants it. Not a one-way door decision.

---

### 5. Bulk Operations Strategy (#7.1)
**Question**: Synchronous or asynchronous batch operations?

**Decision**: ✅ **APPROVED - Hybrid Approach**

**Strategy:**
- **Small batches (<10 products)**: Synchronous - instant response
- **Large batches (≥10 products)**: Asynchronous - return job ID, show progress

**Implementation:**
```typescript
// Small batch response (synchronous):
{
  success: true,
  results: [
    { productId: "prod_1", suggestionsCreated: 3 },
    { productId: "prod_2", suggestionsCreated: 2 }
  ]
}

// Large batch response (asynchronous):
{
  jobId: "job_abc123",
  status: "pending",
  totalProducts: 50,
  estimatedTime: "~2 minutes"
}

// Progress polling:
{
  id: "job_abc123",
  status: "running",
  progress: 65,        // 0-100%
  completed: 32,
  total: 50
}
```

**Job Queue:** Database-based (existing Job model) - no Redis needed

**UX Benefits:**
- Small batches: Instant gratification (<2 seconds)
- Large batches: Progress visibility, no timeouts
- Merchants can continue working during long operations

**Rationale**: Best of both worlds - fast when possible, reliable when needed. Prevents Vercel/Next.js timeouts on large batches while keeping simple operations instant.

---

## 🔧 Next 5 Important Decisions

### 6. Status Calculation Logic (#2.1)
**Question**: How is product status derived?

**Recommended**: **Option B** - Stored field, updated on changes
- Computed from: compliance level + pending suggestions count
- Status priority: "pending" > "missing" > "ready"

**Decision**: _______________

---

### 7. Confidence Scores (#3.2)
**Question**: Store confidence scores?

**Recommended**: **Option A** - Store explicit field
- Add `confidence: Int` (0-100) to Suggestion model
- Get from LLM response or calculate from suggestion type

**Decision**: _______________

---

### 8. Analytics Aggregation (#4.3)
**Question**: Real-time or pre-calculated analytics?

**Recommended**: **Option C** - Background job (daily aggregation)
- Materialize daily metrics in `AnalyticsDaily` table
- Real-time for current day, pre-calculated for historical

**Decision**: _______________

---

### 9. Shopify Sync (#5.2)
**Question**: What sync settings do we need?

**Recommended**: Store as JSON config initially, migrate to fields later
```typescript
syncSettings: {
  autoSyncEnabled: boolean,
  syncInterval: number, // minutes
  syncInventory: boolean,
  syncPrices: boolean,
  syncNewProducts: boolean
}
```

**Decision**: _______________

---

### 10. Component Migration Order (#8.1)
**Question**: What order should we migrate components?

**Recommended**: 
1. Dashboard (StatCard, PendingActions)
2. Products (ProductsTable, ComplianceIndicator)
3. Approvals (ApprovalCard enhancements)
4. Product Detail (AISuggestionCard)
5. Analytics (charts, KPIs)
6. Settings & Bulk Operations

**Decision**: _______________

---

## 📋 Quick Decision Checklist

**Data Model**:
- [ ] Add `complianceLevel: Int` to Product
- [ ] Add `status: String` to Product (or compute)
- [ ] Add `impact: Json` to Suggestion
- [ ] Add `confidence: Int` to Suggestion
- [ ] Create `ProductView` model for analytics
- [ ] Add `syncSettings: Json` to Workspace

**API Endpoints**:
- [ ] `product.getById` - Product detail with suggestions
- [ ] `product.list` - Filtered/paginated product list
- [ ] `analytics.getMetrics` - Dashboard analytics
- [ ] `analytics.getRevenueTrend` - Chart data
- [ ] `suggestion.bulkApproveByFilter` - Enhanced bulk approve
- [ ] `product.bulkOptimize` - Batch optimization job

**Components**:
- [ ] ComplianceIndicator (10-dot visual)
- [ ] StatCard (dashboard KPIs)
- [ ] ProductsTable (enhanced table)
- [ ] ApprovalCard (enhancements)
- [ ] AISuggestionCard (product detail)

**Business Logic**:
- [ ] Compliance calculation function
- [ ] Status derivation function
- [ ] Impact metric extraction/calculation
- [ ] Analytics aggregation queries

---

## ✅ All Critical Decisions APPROVED

**Status**: 🎉 **COMPLETE - Ready for Implementation**

**Date Finalized**: November 1, 2024

### Decision Summary:

1. ✅ **Optimization Score Calculation**: Weighted multi-factor (100 points), agent fields = 20pts (co-primary)
2. ✅ **Score Storage**: Cached on Product model, recalculate on sync schedule
3. ✅ **Impact Metrics**: Score impact only (no business claims until data backs it up)
4. ✅ **Product View Tracking**: Defer to Phase 2, focus on revenue metrics
5. ✅ **Bulk Operations**: Hybrid approach (sync <10, async ≥10)

### Next Steps:

**Phase 1A - Data Model** (Week 1):
- [ ] Update Prisma schema with optimization score fields
- [ ] Add scoreBreakdown JSON structure
- [ ] Add scoreImpact to Suggestion model
- [ ] Migration script for existing products

**Phase 1B - Backend Logic** (Week 1-2):
- [ ] Implement optimization score calculation function
- [ ] Implement score impact calculation for suggestions
- [ ] Add recalculation triggers (sync, manual edit, approval)
- [ ] Daily background job for score refresh

**Phase 1C - Frontend Components** (Week 2-3):
- [ ] Dashboard components (StatCard, PendingActions)
- [ ] Products table with optimization levels
- [ ] ComplianceIndicator (10-level visual)
- [ ] Score impact display in suggestions

**Estimated Timeline**: 2-3 weeks for MVP implementation

---

**All non-critical decisions documented in**: `DECISION-MATRIX.md` (70+ decisions complete)

