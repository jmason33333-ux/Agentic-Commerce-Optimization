# Migration Guide: OpenAI Commerce Feed Specification Compliance

This guide explains the changes needed to make the Agent Commerce SEO starter kit **fully compliant** with the [OpenAI Commerce Feed Specification](https://developers.openai.com/commerce/specs/feed).

## Executive Summary

**Current State:** The MVP has ~15 product fields
**Required State:** OpenAI spec defines **70+ fields** across 13 categories

**Critical Missing Fields:** 25+ REQUIRED fields are missing
**Impact:** Products will NOT appear in ChatGPT Shopping without these fields

---

## 1. Database Schema Changes

### Critical Changes (REQUIRED for any product to show)

#### Add to `Product` Model:

```prisma
// OpenAI Flags (REQUIRED)
enableSearch           Boolean  @default(true)    // Replace: instantCheckoutEnabled
enableCheckout         Boolean  @default(false)   // New name for instantCheckout

// Basic Product Data (REQUIRED)
link                   String?                    // Product page URL - REQUIRED
gtin                   String?                    // GTIN/UPC - Required if no MPN
mpn                    String?                    // MPN - Required if no GTIN
brand                  String?                    // REQUIRED - currently using 'vendor'

// Item Information (REQUIRED)
condition              String   @default("new")   // new|refurbished|used
productCategory        String?                    // REQUIRED - category path
material               String?                    // REQUIRED
weight                 Decimal? @db.Decimal(10,2) // REQUIRED
weightUnit             String?                    // REQUIRED with weight

// Media (REQUIRED)
imageLink              String?                    // Primary image - REQUIRED
additionalImageLinks   Json?                      // Array of extra images

// Availability (REQUIRED)
availability           String   @default("in_stock") // REQUIRED enum
availabilityDate       DateTime?                  // Required if preorder
```

#### Add to `Workspace` Model:

```prisma
// Merchant Info (REQUIRED for checkout)
sellerName             String?                    // REQUIRED
sellerUrl              String?                    // REQUIRED
sellerPrivacyPolicy    String?                    // REQUIRED if checkout enabled
sellerTos              String?                    // REQUIRED if checkout enabled

// Returns (REQUIRED)
returnPolicy           String?                    // REQUIRED
returnWindow           Int?                       // REQUIRED (days)
```

### Recommended Additions (Improve Ranking)

```prisma
// Variants
itemGroupId            String?   // Required if variants exist
itemGroupTitle         String?
color                  String?
size                   String?
sizeSystem             String?   // ISO country code
gender                 String?   // male|female|unisex
offerId                String?

// Price & Promotions
salePrice              Decimal?  @db.Decimal(10,2)
salePriceStart         DateTime?
salePriceEnd           DateTime?
pricingTrend           String?

// Additional Media
videoLink              String?
model3dLink            String?

// Reviews & Performance
productReviewCount     Int?
productReviewRating    Decimal?  @db.Decimal(3,2)
popularityScore        Decimal?  @db.Decimal(3,2)
returnRate             Decimal?  @db.Decimal(5,2)

// Related Products
relatedProductIds      Json?
relationshipType       String?

// Fulfillment
shipping               Json?
deliveryEstimate       DateTime?

// Compliance
warning                String?
ageRestriction         Int?
```

---

## 2. Shopify Product Sync Changes

### Update `src/lib/shopify.ts`:

Map Shopify fields to OpenAI spec:

```typescript
export function mapShopifyToOpenAI(shopifyProduct: ShopifyProduct, workspace: Workspace) {
  const variant = shopifyProduct.variants[0];

  return {
    // OpenAI Flags
    enableSearch: true,
    enableCheckout: false, // Set based on merchant readiness

    // Basic Data
    id: shopifyProduct.id.toString(),
    title: shopifyProduct.title,
    description: shopifyProduct.body_html,
    link: `https://${workspace.shopDomain}/products/${shopifyProduct.handle}`,
    brand: shopifyProduct.vendor,

    // Try to extract GTIN from SKU or barcode
    gtin: variant?.barcode || null,
    mpn: variant?.sku || null,

    // Item Info
    condition: "new", // Default
    productCategory: shopifyProduct.product_type,
    material: extractMaterial(shopifyProduct.tags),
    weight: variant?.weight,
    weightUnit: variant?.weight_unit,

    // Media
    imageLink: shopifyProduct.images[0]?.src,
    additionalImageLinks: shopifyProduct.images.slice(1).map(img => img.src),

    // Price
    price: parseFloat(variant?.price),
    currency: workspace.currency || "USD",

    // Availability
    availability: variant?.inventory_quantity > 0 ? "in_stock" : "out_of_stock",
    inventoryQuantity: variant?.inventory_quantity || 0,

    // Variants
    itemGroupId: shopifyProduct.variants.length > 1 ? shopifyProduct.id.toString() : null,
    color: extractColor(shopifyProduct.options),
    size: extractSize(shopifyProduct.options),

    // Merchant info (from workspace)
    sellerName: workspace.sellerName,
    sellerUrl: workspace.sellerUrl,
    // etc.
  };
}
```

---

## 3. Audit Rules Changes

### Update `src/lib/jobs/processor.ts`:

Replace `runRuleChecks()` with OpenAI-spec rules:

```typescript
function runRuleChecks(product: Product, workspace: Workspace): any[] {
  const issues: any[] = [];

  // REQUIRED: OpenAI Flags
  if (!product.enableSearch) {
    issues.push({
      issue_type: "search_disabled",
      severity: "critical",
      message: "Product will not appear in ChatGPT search",
      spec_ref: "OpenAI Flags - enable_search Required",
    });
  }

  if (!product.enableCheckout) {
    issues.push({
      issue_type: "checkout_disabled",
      severity: "high",
      message: "Instant checkout disabled - lower ranking",
      spec_ref: "OpenAI Flags - enable_checkout Recommended",
    });
  }

  // REQUIRED: Basic Product Data
  if (!product.link) {
    issues.push({
      issue_type: "missing_link",
      severity: "critical",
      message: "Product page URL required",
      spec_ref: "Basic Product Data - link Required",
    });
  }

  if (!product.gtin && !product.mpn) {
    issues.push({
      issue_type: "missing_identifiers",
      severity: "critical",
      message: "Either GTIN or MPN required",
      spec_ref: "Basic Product Data - gtin/mpn Required",
    });
  }

  if (!product.brand) {
    issues.push({
      issue_type: "missing_brand",
      severity: "critical",
      message: "Brand required (except movies/books/music)",
      spec_ref: "Item Information - brand Required",
    });
  }

  // REQUIRED: Item Information
  if (!product.weight || !product.weightUnit) {
    issues.push({
      issue_type: "missing_weight",
      severity: "critical",
      message: "Weight with unit required",
      spec_ref: "Item Information - weight Required",
    });
  }

  if (!product.material) {
    issues.push({
      issue_type: "missing_material",
      severity: "critical",
      message: "Material required",
      spec_ref: "Item Information - material Required",
    });
  }

  if (!product.productCategory) {
    issues.push({
      issue_type: "missing_category",
      severity: "critical",
      message: "Product category required",
      spec_ref: "Item Information - product_category Required",
    });
  }

  // REQUIRED: Media
  if (!product.imageLink) {
    issues.push({
      issue_type: "missing_image",
      severity: "critical",
      message: "Primary image required",
      spec_ref: "Media - image_link Required",
    });
  }

  // REQUIRED: Price
  if (!product.price) {
    issues.push({
      issue_type: "missing_price",
      severity: "critical",
      message: "Price with currency required",
      spec_ref: "Price - price Required",
    });
  }

  // REQUIRED: Availability
  if (!product.availability) {
    issues.push({
      issue_type: "missing_availability",
      severity: "critical",
      message: "Availability status required",
      spec_ref: "Availability - availability Required",
    });
  }

  if (product.availability === "preorder" && !product.availabilityDate) {
    issues.push({
      issue_type: "missing_availability_date",
      severity: "critical",
      message: "Availability date required for preorders",
      spec_ref: "Availability - availability_date Required if preorder",
    });
  }

  // REQUIRED: Merchant Info (workspace-level)
  if (!workspace.sellerName) {
    issues.push({
      issue_type: "missing_seller_name",
      severity: "critical",
      message: "Seller name required at workspace level",
      spec_ref: "Merchant Info - seller_name Required",
    });
  }

  if (!workspace.sellerUrl) {
    issues.push({
      issue_type: "missing_seller_url",
      severity: "critical",
      message: "Seller URL required at workspace level",
      spec_ref: "Merchant Info - seller_url Required",
    });
  }

  if (product.enableCheckout && !workspace.sellerPrivacyPolicy) {
    issues.push({
      issue_type: "missing_privacy_policy",
      severity: "critical",
      message: "Privacy policy required when checkout enabled",
      spec_ref: "Merchant Info - seller_privacy_policy Required if checkout enabled",
    });
  }

  if (product.enableCheckout && !workspace.sellerTos) {
    issues.push({
      issue_type: "missing_tos",
      severity: "critical",
      message: "Terms of service required when checkout enabled",
      spec_ref: "Merchant Info - seller_tos Required if checkout enabled",
    });
  }

  // REQUIRED: Returns
  if (!workspace.returnPolicy) {
    issues.push({
      issue_type: "missing_return_policy",
      severity: "critical",
      message: "Return policy required at workspace level",
      spec_ref: "Returns - return_policy Required",
    });
  }

  if (!workspace.returnWindow) {
    issues.push({
      issue_type: "missing_return_window",
      severity: "critical",
      message: "Return window (days) required at workspace level",
      spec_ref: "Returns - return_window Required",
    });
  }

  // RECOMMENDED: Variants
  const hasVariants = /* check if product has color/size options */;
  if (hasVariants && !product.itemGroupId) {
    issues.push({
      issue_type: "missing_variant_group",
      severity: "high",
      message: "item_group_id required for products with variants",
      spec_ref: "Variants - item_group_id Required if variants exist",
    });
  }

  if (isApparelCategory(product.productCategory)) {
    if (!product.color) {
      issues.push({
        issue_type: "missing_color",
        severity: "medium",
        message: "Color recommended for apparel",
        spec_ref: "Variants - color Recommended for apparel",
      });
    }
    if (!product.size) {
      issues.push({
        issue_type: "missing_size",
        severity: "medium",
        message: "Size recommended for apparel",
        spec_ref: "Variants - size Recommended for apparel",
      });
    }
  }

  // RECOMMENDED: Additional Media
  if (!product.additionalImageLinks || (product.additionalImageLinks as any[]).length === 0) {
    issues.push({
      issue_type: "missing_additional_images",
      severity: "medium",
      message: "Multiple images improve trust and conversion",
      spec_ref: "Media - additional_image_link Recommended",
    });
  }

  // RECOMMENDED: Reviews
  if (!product.productReviewCount || product.productReviewCount === 0) {
    issues.push({
      issue_type: "missing_reviews",
      severity: "low",
      message: "Product reviews improve ranking",
      spec_ref: "Reviews - product_review_count Recommended",
    });
  }

  // RECOMMENDED: Rich Description
  if (!product.description || product.description.length < 200) {
    issues.push({
      issue_type: "thin_description",
      severity: "medium",
      message: "Rich descriptions (200+ chars) with audience/use cases improve ranking",
      spec_ref: "Basic Product Data - description best practices",
    });
  }

  return issues;
}
```

---

## 4. Feed Export Endpoint

Create `src/app/api/feed/openai/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const workspaceId = req.nextUrl.searchParams.get("workspace");
  const format = req.nextUrl.searchParams.get("format") || "json"; // json|csv|xml

  if (!workspaceId) {
    return NextResponse.json({ error: "workspace required" }, { status: 400 });
  }

  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
  });

  const products = await db.product.findMany({
    where: {
      workspaceId,
      enableSearch: true, // Only export searchable products
    },
  });

  // Convert to OpenAI Commerce Feed format
  const feed = products.map((p) => ({
    // OpenAI Flags
    enable_search: p.enableSearch,
    enable_checkout: p.enableCheckout,

    // Basic Product Data
    id: p.sourceId,
    gtin: p.gtin,
    mpn: p.mpn,
    title: p.title,
    description: p.description,
    link: p.link,

    // Item Information
    condition: p.condition,
    product_category: p.productCategory,
    brand: p.brand,
    material: p.material,
    dimensions: p.dimensions,
    weight: p.weight ? `${p.weight} ${p.weightUnit}` : null,
    age_group: p.ageGroup,

    // Media
    image_link: p.imageLink,
    additional_image_link: p.additionalImageLinks,
    video_link: p.videoLink,
    model_3d_link: p.model3dLink,

    // Price & Promotions
    price: `${p.price} ${p.currency}`,
    sale_price: p.salePrice ? `${p.salePrice} ${p.currency}` : null,
    sale_price_effective_date: p.salePriceStart && p.salePriceEnd
      ? `${p.salePriceStart.toISOString()} / ${p.salePriceEnd.toISOString()}`
      : null,
    pricing_trend: p.pricingTrend,

    // Availability & Inventory
    availability: p.availability,
    availability_date: p.availabilityDate?.toISOString(),
    inventory_quantity: p.inventoryQuantity,
    expiration_date: p.expirationDate?.toISOString(),
    pickup_method: p.pickupMethod,
    pickup_sla: p.pickupSla,

    // Variants
    item_group_id: p.itemGroupId,
    item_group_title: p.itemGroupTitle,
    color: p.color,
    size: p.size,
    size_system: p.sizeSystem,
    gender: p.gender,
    offer_id: p.offerId,

    // Fulfillment
    shipping: p.shipping,
    delivery_estimate: p.deliveryEstimate?.toISOString(),

    // Merchant Info (from workspace)
    seller_name: workspace.sellerName,
    seller_url: workspace.sellerUrl,
    seller_privacy_policy: workspace.sellerPrivacyPolicy,
    seller_tos: workspace.sellerTos,

    // Returns (from workspace)
    return_policy: workspace.returnPolicy,
    return_window: workspace.returnWindow,

    // Performance Signals
    popularity_score: p.popularityScore,
    return_rate: p.returnRate,

    // Compliance
    warning: p.warning,
    warning_url: p.warningUrl,
    age_restriction: p.ageRestriction,

    // Reviews & Q&A
    product_review_count: p.productReviewCount,
    product_review_rating: p.productReviewRating,
    q_and_a: p.qAndA,

    // Related Products
    related_product_id: p.relatedProductIds,
    relationship_type: p.relationshipType,

    // Geo Tagging
    geo_price: p.geoPrice,
    geo_availability: p.geoAvailability,
  }));

  if (format === "json") {
    return NextResponse.json(feed);
  }

  // TODO: Add CSV/XML formatting

  return NextResponse.json(feed);
}
```

---

## 5. Implementation Checklist

### Phase 1: Critical Required Fields (Do This First!)

- [ ] Update Prisma schema with all REQUIRED fields
- [ ] Run `npx prisma migrate dev --name add-openai-spec-fields`
- [ ] Update Shopify sync to map new fields
- [ ] Add workspace-level merchant info (seller_name, seller_url, etc.)
- [ ] Add workspace-level return policy fields
- [ ] Update audit rules to check all REQUIRED fields
- [ ] Update LLM prompt to use OpenAI spec (replace old prompt)
- [ ] Test: Run audit and verify all REQUIRED issues are caught

### Phase 2: Recommended Fields (Improves Ranking)

- [ ] Add variant management (item_group_id, color, size, gender)
- [ ] Add additional media fields (video, 3D model)
- [ ] Add review fields (count, rating)
- [ ] Add performance signals (popularity_score, return_rate)
- [ ] Add related products
- [ ] Update audit rules for recommended fields
- [ ] Test: Verify recommendations improve SEO scores

### Phase 3: Feed Export

- [ ] Create `/api/feed/openai` endpoint
- [ ] Support JSON format
- [ ] Support CSV format
- [ ] Support XML format
- [ ] Add feed validation
- [ ] Test: Export feed and validate against OpenAI spec

### Phase 4: UI Updates

- [ ] Update Workspace settings to collect merchant info
- [ ] Update Workspace settings to collect return policy
- [ ] Show spec compliance % on dashboard
- [ ] Show field coverage heatmap per product
- [ ] Add "Missing Required Fields" alert
- [ ] Update suggestion cards to show spec reference

---

## 6. Breaking Changes

### Field Renames:

- `instantCheckoutEnabled` → `enableCheckout`
- `vendor` → `brand` (keep vendor for backward compat)
- `inventory` → `inventoryQuantity`
- `images` → `imageLink` + `additionalImageLinks`

### New Required Workspace Fields:

Workspaces without these fields will fail audit:
- `sellerName`
- `sellerUrl`
- `returnPolicy`
- `returnWindow`

### Products Without Required Fields:

Will be marked as `enableSearch=false` by default until fixed:
- Missing `gtin` AND `mpn`
- Missing `brand`
- Missing `weight`
- Missing `material`
- Missing `imageLink`
- Missing `link`

---

## 7. Estimated Effort

- **Schema Migration**: 2-4 hours
- **Shopify Sync Updates**: 4-6 hours
- **Audit Rules Rewrite**: 6-8 hours
- **LLM Prompt Update**: 2-3 hours
- **Feed Export Endpoint**: 4-6 hours
- **UI Updates**: 8-12 hours
- **Testing & Validation**: 8-12 hours

**Total**: 34-51 hours (~5-7 days)

---

## 8. Resources

- [OpenAI Commerce Feed Spec](https://developers.openai.com/commerce/specs/feed)
- [OpenAI Key Concepts](https://developers.openai.com/commerce/guides/key-concepts/)
- [Agentic Commerce in Production](https://developers.openai.com/commerce/guides/production/)
- Updated schema: `prisma/schema-v2-openai-compliant.prisma`
- Audit rules: `docs/openai-audit-rules.md`
- Updated prompt: `src/lib/llm/openai-spec-prompt.ts`

---

## Questions?

This is a significant expansion from the MVP. Prioritize Phase 1 (required fields) to get products showing in ChatGPT, then optimize with Phases 2-4.
