# Critical Decisions: Quick Start Guide

**Goal**: Make these 10 decisions first to unblock implementation.

---

## 🚨 Top 5 Critical Decisions (Must Decide First)

### 1. Compliance Level Calculation (#1.1)
**Question**: How do we calculate the 1-10 compliance score?

**Recommended**: **Option A** - Simple field count
```
complianceLevel = (requiredFieldsPresent / totalRequiredFields) * 10
```

**Required Fields** (need confirmation):
- ✅ Title
- ✅ Description  
- ✅ Price
- ✅ Image Link
- ✅ Availability
- ✅ GTIN or MPN
- ✅ Brand
- ✅ Material
- ✅ Weight
- ✅ Weight Unit

**Decision**: _______________

---

### 2. Compliance Storage Strategy (#1.2)
**Question**: Store compliance level or calculate on-demand?

**Recommended**: **Option B** - Cached on Product model
- Add `complianceLevel: Int` field
- Update on: product changes, suggestion approvals
- Background job: Recalculate daily/hourly

**Decision**: _______________

---

### 3. Impact Metrics (#3.1)
**Question**: How do we handle impact strings like "+15% discoverability"?

**Recommended**: **Option B** - Structured JSON
```typescript
impact: {
  type: "discoverability" | "conversion" | "click-through" | "compliance-level",
  value: number,
  unit: "%" | "level" | "points",
  description: string
}
```

**Decision**: _______________

---

### 4. Product View Tracking (#4.1)
**Question**: How do we track product views for analytics?

**Recommended**: **Option B** - Server-side API endpoint
- `POST /api/track-view` called from client
- Store in `ProductView` model
- Track source from referer/UTM params

**Decision**: _______________

---

### 5. Bulk Operations Strategy (#7.1)
**Question**: Synchronous or asynchronous batch operations?

**Recommended**: **Option D** - Hybrid
- Small batches (<10 products): Synchronous
- Large batches (≥10 products): Asynchronous with job queue
- Return job ID for progress tracking

**Decision**: _______________

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

## 🎯 Recommended Defaults (If No Preference)

If you don't have a preference, use these defaults:

1. **Compliance**: Simple field count, cached on Product
2. **Impact**: Structured JSON, extract from LLM response
3. **Tracking**: Server-side API, store in ProductView table
4. **Bulk Ops**: Hybrid (sync <10, async ≥10)
5. **Status**: Stored field, computed from compliance + suggestions
6. **Confidence**: Store as Int, get from LLM
7. **Analytics**: Daily aggregation job
8. **Shopify**: JSON config, sync every 15 minutes
9. **Components**: Start with Dashboard → Products → Approvals
10. **Job Queue**: Database-based (simple, no Redis needed initially)

---

## ⏱️ Estimated Time

**Decision Time**: 1-2 hours to review and decide
**Implementation Time**: Once decisions made, ~2-3 weeks for full implementation

---

**Ready to proceed?** Check off decisions above and we can start implementation!

