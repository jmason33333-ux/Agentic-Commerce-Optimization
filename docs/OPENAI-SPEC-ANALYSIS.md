# OpenAI Commerce Feed Specification Analysis

## TL;DR - What You Asked For

You asked me to review the OpenAI Commerce Feed spec and provide recommendations. Here's the summary:

### ❌ **Current Starter Kit: NOT SPEC COMPLIANT**

The MVP I built has **~15 product fields**. The OpenAI spec requires **70+ fields** across 13 categories.

### 🚨 **Critical Issues**

**25+ REQUIRED fields are missing**, which means:
- ❌ Products **will NOT appear** in ChatGPT Shopping
- ❌ Instant checkout **will NOT work**
- ❌ Product ranking **will be poor** even if visible

### ✅ **Good News**

The architecture is sound! The fixes are:
1. **Schema expansion** (add missing fields)
2. **Audit rule updates** (check spec compliance)
3. **Shopify mapping** (extract/infer missing data)
4. **LLM prompt update** (use spec requirements)

---

## What's Missing (Organized by Priority)

### 🔴 **CRITICAL - Required Fields (Product won't show without these)**

| Category | Missing Fields | Impact |
|----------|----------------|--------|
| **OpenAI Flags** | `enable_search`, `enable_checkout` (wrong field name) | Product hidden |
| **Basic Data** | `link` (product URL), `gtin` OR `mpn`, `brand` field | Product hidden |
| **Item Info** | `weight`+unit, `material`, `product_category`, `condition` | Product hidden |
| **Availability** | `availability` enum (have count, not enum) | Product hidden |
| **Merchant Info** | `seller_name`, `seller_url`, `seller_privacy_policy`, `seller_tos` | Checkout blocked |
| **Returns** | `return_policy`, `return_window` | Product hidden |

### 🟡 **HIGH PRIORITY - Recommended Fields (Ranking suffers without these)**

| Category | Missing Fields | Impact |
|----------|----------------|--------|
| **Variants** | `item_group_id`, `color`, `size`, `size_system`, `gender` | Poor variant handling |
| **Media** | `additional_image_link` (as array), `video_link`, `3d_model` | Lower trust/conversion |
| **Reviews** | `product_review_count`, `product_review_rating` | Lower ranking |
| **Performance** | `popularity_score`, `return_rate` | Lower ranking |
| **Price** | `sale_price`, `sale_price_effective_date`, `pricing_trend` | Missed promo opportunities |

### 🟢 **MEDIUM PRIORITY - Optional Fields (Nice to have)**

| Category | Missing Fields | Impact |
|----------|----------------|--------|
| **Related Products** | `related_product_id`, `relationship_type` | No cross-sell |
| **Q&A** | `q_and_a` field | Less helpful product pages |
| **Compliance** | `warning`, `age_restriction` | Legal risk for certain products |
| **Geo Tagging** | `geo_price`, `geo_availability` | No regional customization |
| **Fulfillment** | `shipping` details, `delivery_estimate`, `pickup_method` | Less transparent shipping |

---

## Detailed Field Comparison

### Current Schema (MVP)
```prisma
model Product {
  id                     String
  workspaceId            String
  sourceId               String
  title                  String          ✅ (but needs max 150 char validation)
  description            String?         ✅ (but needs max 5000 char validation)
  price                  Decimal?        ✅ (but needs currency validation)
  currency               String
  inventory              Int             ⚠️ (have count, need enum)
  tags                   Json?           ⚠️ (generic, not spec fields)
  vendor                 String?         ⚠️ (should be 'brand')
  productType            String?         ⚠️ (should be 'product_category')
  images                 Json?           ⚠️ (should be imageLink + additionalImageLinks)
  isPrimarySeller        Boolean         ❓ (not in spec)
  instantCheckoutEnabled Boolean         ⚠️ (should be 'enableCheckout')
  contentHash            String?         ✅ (internal use, OK)
  rawSource              Json?           ✅ (internal use, OK)
}
```

### Required Schema (OpenAI Spec)
```prisma
model Product {
  // All of the above, PLUS:

  // REQUIRED
  enableSearch           Boolean         ❌ Missing
  enableCheckout         Boolean         ⚠️ Wrong name
  link                   String          ❌ Missing (CRITICAL)
  gtin                   String?         ❌ Missing (CRITICAL)
  mpn                    String?         ❌ Missing (CRITICAL)
  brand                  String          ❌ Missing (CRITICAL)
  condition              String          ❌ Missing
  productCategory        String          ❌ Missing (CRITICAL)
  material               String          ❌ Missing (CRITICAL)
  weight                 Decimal         ❌ Missing (CRITICAL)
  weightUnit             String          ❌ Missing (CRITICAL)
  imageLink              String          ❌ Missing (CRITICAL)
  availability           String          ❌ Missing (CRITICAL)

  // RECOMMENDED
  itemGroupId            String?         ❌ Missing
  color                  String?         ❌ Missing
  size                   String?         ❌ Missing
  gender                 String?         ❌ Missing
  additionalImageLinks   Json?           ❌ Missing
  videoLink              String?         ❌ Missing
  productReviewCount     Int?            ❌ Missing
  productReviewRating    Decimal?        ❌ Missing
  salePrice              Decimal?        ❌ Missing
  relatedProductIds      Json?           ❌ Missing

  // ... 40+ more fields (see schema-v2-openai-compliant.prisma)
}
```

---

## Impact on Current Audit Logic

### Current Audit Rules (MVP)
```typescript
// Checks only 6 issues:
- no_image
- availability_zero
- instant_checkout_off
- missing_audience
- missing_price
- missing_tags
```

### Required Audit Rules (OpenAI Spec)
```typescript
// Must check 30+ issues:

// CRITICAL (blocks product)
- missing_enable_search
- missing_enable_checkout
- missing_link
- missing_gtin_and_mpn
- missing_brand
- missing_weight
- missing_material
- missing_category
- missing_image_link
- missing_availability_enum
- missing_seller_info
- missing_return_policy

// HIGH (ranking penalty)
- checkout_disabled
- missing_variant_group (if has variants)
- missing_color (apparel)
- missing_size (apparel)
- missing_additional_images
- thin_description (<200 chars)

// MEDIUM (optimization)
- missing_reviews
- missing_video
- missing_sale_price (if on sale)
- missing_related_products

// See openai-audit-rules.md for full list
```

---

## Impact on LLM Prompt

### Current LLM Prompt (MVP)
- Generic "improve for AI shopping"
- No specific spec requirements
- ~200 words

### Required LLM Prompt (OpenAI Spec)
- Must reference specific OpenAI spec fields
- Must explain ranking factors
- Must distinguish required vs. recommended
- Must provide spec-compliant suggestions
- ~1,500 words

See: `src/lib/llm/openai-spec-prompt.ts` for the updated prompt.

---

## What Needs to Change

### 1. Database Schema ⚠️ Breaking Change

**File:** `prisma/schema.prisma`
**Action:** Add 55+ new fields to Product model, 6 fields to Workspace model
**Migration:** `npx prisma migrate dev --name openai-spec-compliance`
**Effort:** 2-4 hours
**Reference:** `prisma/schema-v2-openai-compliant.prisma`

### 2. Shopify Product Sync

**File:** `src/lib/shopify.ts`
**Action:** Map Shopify fields to OpenAI spec fields
**Key changes:**
- Extract GTIN from barcode
- Extract MPN from SKU
- Map vendor → brand
- Map product_type → product_category
- Build product URL from shop domain + handle
- Extract color/size from options
- Map inventory count → availability enum
**Effort:** 4-6 hours

### 3. Audit Engine

**File:** `src/lib/jobs/processor.ts`
**Action:** Completely rewrite `runRuleChecks()`
**Changes:**
- Check 30+ spec requirements (up from 6)
- Add severity levels (critical|high|medium|low)
- Add spec references to each issue
- Check workspace-level requirements
- Validate field formats (URLs, enums, units)
**Effort:** 6-8 hours
**Reference:** See MIGRATION-TO-OPENAI-SPEC.md section 3

### 4. LLM Prompt

**File:** `src/lib/llm/openai-provider.ts`
**Action:** Replace SYSTEM_PROMPT with OpenAI spec version
**Changes:**
- List all REQUIRED fields
- List all RECOMMENDED fields
- Explain ranking factors
- Provide spec-compliant examples
**Effort:** 2-3 hours
**Reference:** `src/lib/llm/openai-spec-prompt.ts`

### 5. Workspace Settings

**Files:** tRPC router, frontend components
**Action:** Collect merchant info and return policy
**New fields to collect:**
- Seller name
- Seller website URL
- Privacy policy URL
- Terms of service URL
- Return policy URL
- Return window (days)
**Effort:** 4-6 hours (backend) + 4-6 hours (frontend)

### 6. Feed Export

**File:** `src/app/api/feed/openai/route.ts` (NEW)
**Action:** Create endpoint to export OpenAI-compliant feed
**Formats:** JSON, CSV, XML
**Effort:** 4-6 hours
**Reference:** See MIGRATION-TO-OPENAI-SPEC.md section 4

### 7. UI Updates

**Files:** Dashboard, Product Detail, Suggestions Queue
**Action:** Show spec compliance metrics
**New UI elements:**
- "Spec Compliance: 65%" badge
- "Missing Required Fields" alert
- Spec reference on each suggestion
- Field coverage heatmap
**Effort:** 8-12 hours

---

## Migration Strategy

### Option A: Big Bang (Recommended)

1. Migrate schema (add all fields at once)
2. Update sync, audit, LLM in parallel
3. Test thoroughly
4. Deploy

**Pros:** Clean, spec-compliant from day 1
**Cons:** 5-7 days of work before next deploy
**Total Effort:** 34-51 hours

### Option B: Phased

**Phase 1:** Add REQUIRED fields only (1-2 days)
**Phase 2:** Add RECOMMENDED fields (1-2 days)
**Phase 3:** Add OPTIONAL fields (1-2 days)
**Phase 4:** Feed export + UI polish (2-3 days)

**Pros:** Incremental progress, earlier deploys
**Cons:** More migrations, temporary non-compliance
**Total Effort:** 34-51 hours (same, but spread out)

---

## Recommended Next Steps

### Immediate (Today):

1. ✅ Review this analysis
2. ⬜ Decide on migration strategy (Big Bang vs. Phased)
3. ⬜ Create development branch
4. ⬜ Start schema migration

### This Week:

1. ⬜ Implement Phase 1 (REQUIRED fields)
2. ⬜ Update Shopify sync
3. ⬜ Rewrite audit rules
4. ⬜ Update LLM prompt
5. ⬜ Test with real Shopify data

### Next Week:

1. ⬜ Implement Phase 2 (RECOMMENDED fields)
2. ⬜ Add workspace merchant info collection
3. ⬜ Build feed export endpoint
4. ⬜ Update UI for spec compliance

### Later:

1. ⬜ Add CSV/XML feed formats
2. ⬜ Build compliance dashboard
3. ⬜ Add auto-fix for simple issues
4. ⬜ Integrate with OpenAI feed submission

---

## Files Created for You

I've created these reference files in the repo:

1. **`prisma/schema-v2-openai-compliant.prisma`**
   - Complete updated schema with all 70+ fields
   - Copy this to replace `prisma/schema.prisma`

2. **`docs/openai-audit-rules.md`**
   - Complete list of all audit rules
   - Organized by requirement level
   - Includes validation rules and ranking factors

3. **`src/lib/llm/openai-spec-prompt.ts`**
   - Updated LLM system prompt
   - Spec-compliant examples
   - Drop-in replacement for current prompt

4. **`docs/MIGRATION-TO-OPENAI-SPEC.md`**
   - Step-by-step migration guide
   - Code samples for all changes
   - Implementation checklist
   - Estimated effort breakdown

5. **`docs/OPENAI-SPEC-ANALYSIS.md`** (this file)
   - Executive summary
   - Gap analysis
   - Recommendations

---

## Bottom Line

**Q: Is the current starter kit usable?**
A: ✅ Yes for learning/prototyping, ❌ No for production ChatGPT Shopping

**Q: How much work to make it compliant?**
A: 🕐 5-7 days (34-51 hours) for full compliance

**Q: What's the most critical change?**
A: 🚨 Add the 12 REQUIRED fields or products won't show at all

**Q: Can I deploy the current MVP and update later?**
A: ⚠️ Not recommended - better to be compliant from launch

**Q: What if I just want to test?**
A: ✅ Manually add required fields to a few products via Shopify Admin

---

## Questions?

This is a comprehensive analysis. The spec is much larger than anticipated, but the changes are straightforward. Priority should be getting those REQUIRED fields in place.

Let me know if you want me to:
1. Start implementing the migration
2. Create a phased roadmap
3. Build a compliance checker tool
4. Something else?
