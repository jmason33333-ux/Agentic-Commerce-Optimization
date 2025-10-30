# OpenAI Product Feed Specification - Complete Breakdown

## Executive Summary

The OpenAI Product Feed Specification is your gateway to making products discoverable and purchasable inside ChatGPT. Think of it as a structured catalog that tells ChatGPT everything it needs to know about your products - from basic details like title and price to advanced signals like review scores and popularity metrics.

**Key Takeaway:** OpenAI requires a minimum viable product feed with ~15 required fields, but recommends ~70 fields total for optimal ranking and visibility in ChatGPT Shopping.

---

## The Big Picture: How It Works

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Your Product   │────▶│  OpenAI      │────▶│  ChatGPT        │
│  Feed (TSV/CSV) │     │  Ingestion   │     │  Search/Shop    │
└─────────────────┘     └──────────────┘     └─────────────────┘
     Update every             Validates             Surfaces
     15 minutes              & Indexes              Products
```

1. **You prepare:** Format your catalog following the spec
2. **You deliver:** Push to OpenAI endpoint via HTTPS (15-minute refresh)
3. **OpenAI ingests:** Validates records and indexes metadata
4. **Users discover:** Products appear in ChatGPT search and shopping

---

## Integration Logistics

### Before You Start
- **Sign up:** Register at [chatgpt.com/merchants](https://chatgpt.com/merchants)
- **Get approved:** Instant Checkout requires partner approval
- **Choose format:** TSV, CSV, XML, or JSON (pick what works for your system)

### Technical Requirements
| Aspect | Details |
|--------|---------|
| **Delivery** | Push feeds to OpenAI endpoint (HTTPS required) |
| **Update Frequency** | Every 15 minutes (keep prices/inventory fresh) |
| **Security** | Encrypted HTTPS to allow-listed endpoint |
| **Initial Setup** | Send sample feed for validation before going live |

---

## The 10-Level Ranking System (Implied)

While not explicitly documented, OpenAI likely uses a 10-level ranking algorithm based on field completeness:

**Level 10 (Best):** All required + all recommended fields filled
**Level 7-9:** Required + most recommended fields
**Level 4-6:** Required fields only
**Level 1-3:** Missing critical required fields

**Your Goal:** Aim for Level 8+ to maximize ChatGPT Shopping placement.

---

## Field Categories: The Complete Guide

### 1. OpenAI Flags (2 fields) - CONTROL PANEL

These are your on/off switches for ChatGPT integration.

| Field | Type | Required | What It Does | Example |
|-------|------|----------|--------------|---------|
| `enable_search` | boolean | ✅ Required | Shows product in ChatGPT search results | `true` |
| `enable_checkout` | boolean | ✅ Required | Enables direct purchase in ChatGPT | `false` (until verified) |

**Best Practice:**
- Set `enable_search: true` for all products you want discoverable
- Only set `enable_checkout: true` after thorough testing (requires `enable_search: true`)
- Use `enable_checkout: false` to disable purchasing but keep products searchable

**Common Pattern:**
```typescript
// New product launch
{ enable_search: true, enable_checkout: false }  // Visibility only

// After testing
{ enable_search: true, enable_checkout: true }   // Full commerce enabled

// Discontinuing product
{ enable_search: false, enable_checkout: false } // Hidden from ChatGPT
```

---

### 2. Basic Product Data (6 fields) - THE FOUNDATION

The core identifiers ChatGPT needs to uniquely reference your products.

| Field | Type | Required | Max Length | What It Does | Example |
|-------|------|----------|------------|--------------|---------|
| `id` | string | ✅ Required | 100 chars | Your unique product SKU | `SKU12345` |
| `gtin` | string | ⭐ Recommended | 8-14 digits | Universal product ID (UPC/EAN) | `123456789543` |
| `mpn` | string | ✅ Required if no GTIN | 70 chars | Manufacturer Part Number | `GPT5` |
| `title` | string | ✅ Required | 150 chars | Product name | `Men's Trail Running Shoes Black` |
| `description` | string | ✅ Required | 5,000 chars | Full product description | `Waterproof trail shoe...` |
| `link` | URL | ✅ Required | — | Product detail page URL | `https://example.com/product/SKU12345` |

**Key Validation Rules:**
- **ID:** Must remain stable over time (don't change SKUs between updates)
- **GTIN:** 8-14 digits, no dashes/spaces (validates against GS1 database)
- **MPN:** Required if GTIN missing (you need at least one)
- **Title:** Avoid ALL CAPS, keep descriptive and keyword-rich
- **Description:** Plain text only (no HTML), front-load key features
- **Link:** Must return HTTP 200, HTTPS preferred

**Best Practice:**
```
❌ Bad Title: "SHOES"
✅ Good Title: "Nike Air Max Trail Running Shoes - Waterproof Black/Gray"

❌ Bad Description: "<p>Great shoes!</p>"
✅ Good Description: "Waterproof trail running shoes featuring cushioned sole, breathable mesh upper, and durable rubber outsole. Ideal for hiking and outdoor activities."
```

---

### 3. Item Information (9 fields) - PRODUCT CHARACTERISTICS

Physical attributes and classification that help ChatGPT categorize and filter.

| Field | Type | Required | What It Does | Example |
|-------|------|----------|--------------|---------|
| `condition` | enum | ✅ If not "new" | Product condition | `new`, `refurbished`, `used` |
| `product_category` | string | ✅ Required | Category taxonomy | `Apparel & Accessories > Shoes` |
| `brand` | string | ✅ Required* | Product brand | `Nike` |
| `material` | string | ✅ Required | Primary material(s) | `Leather, Synthetic Mesh` |
| `dimensions` | string | Optional | LxWxH with units | `12x8x5 in` |
| `length` | number+unit | Optional | Individual dimension | `12 in` |
| `width` | number+unit | Optional | Individual dimension | `8 in` |
| `height` | number+unit | Optional | Individual dimension | `5 in` |
| `weight` | number+unit | ✅ Required | Product weight | `1.5 lb` |
| `age_group` | enum | Optional | Target demographic | `adult`, `kids`, `infant` |

*Brand is required for all products **except** movies, books, and musical recordings.

**Key Validation Rules:**
- Use `>` separator for category hierarchy
- Provide either `dimensions` OR individual `length/width/height` (not both)
- Weight and dimensions must include units (`lb`, `kg`, `in`, `cm`)
- Material is required (if unknown, use generic like "Mixed Materials")

**Best Practice:**
```typescript
// Apparel
{
  product_category: "Apparel & Accessories > Shoes > Athletic Shoes",
  brand: "Nike",
  material: "Synthetic Leather, Rubber Sole",
  weight: "1.2 lb",
  age_group: "adult"
}

// Electronics
{
  product_category: "Electronics > Computers > Laptops",
  brand: "Apple",
  material: "Aluminum, Glass",
  dimensions: "12.8x8.9x0.6 in",
  weight: "3.5 lb"
}
```

---

### 4. Media (4 fields) - VISUAL ASSETS

High-quality visuals that build trust and engagement.

| Field | Type | Required | What It Does | Example |
|-------|------|----------|--------------|---------|
| `image_link` | URL | ✅ Required | Main product image | `https://example.com/image1.jpg` |
| `additional_image_link` | URL array | ⭐ Recommended | Extra images (2-10) | `https://example.com/image2.jpg,...` |
| `video_link` | URL | Optional | Product video | `https://youtu.be/12345` |
| `model_3d_link` | URL | Optional | 3D model (GLB/GLTF) | `https://example.com/model.glb` |

**Key Validation Rules:**
- **Image format:** JPEG or PNG only
- **Image size:** Minimum 800x800px recommended
- **HTTPS required** for all media URLs
- **Additional images:** Comma-separated or array format
- **Video:** Must be publicly accessible (YouTube, Vimeo, or direct link)

**Best Practice:**
```typescript
// Minimum viable
{
  image_link: "https://cdn.example.com/products/shoe-main.jpg"
}

// Optimal for ranking
{
  image_link: "https://cdn.example.com/products/shoe-main.jpg",
  additional_image_link: [
    "https://cdn.example.com/products/shoe-side.jpg",
    "https://cdn.example.com/products/shoe-back.jpg",
    "https://cdn.example.com/products/shoe-sole.jpg",
    "https://cdn.example.com/products/shoe-detail.jpg"
  ],
  video_link: "https://youtu.be/product-demo"
}
```

**Image Quality Tips:**
- ✅ White or transparent background
- ✅ Show product from multiple angles
- ✅ Include lifestyle/in-use shots
- ✅ High resolution (at least 1200x1200px)
- ❌ Avoid watermarks or promotional text
- ❌ Don't use placeholder images

---

### 5. Price & Promotions (5 fields) - PRICING SIGNALS

Define standard and sale pricing to power accurate price display.

| Field | Type | Required | What It Does | Example |
|-------|------|----------|--------------|---------|
| `price` | number+currency | ✅ Required | Regular price | `79.99 USD` |
| `sale_price` | number+currency | ⭐ Recommended | Discounted price | `59.99 USD` |
| `sale_price_effective_date` | date range | Required if sale | Sale window (ISO 8601) | `2025-07-01/2025-07-15` |
| `unit_pricing_measure` | number+unit | Optional | Unit price (e.g., per oz) | `16 oz` |
| `unit_pricing_base_measure` | number+unit | Optional | Base measure for unit price | `1 oz` |
| `pricing_trend` | string | Optional | Lowest price signal | `Lowest price in 6 months` |

**Key Validation Rules:**
- **Currency:** Must use ISO 4217 codes (USD, EUR, GBP, etc.)
- **Sale price:** Must be ≤ regular price
- **Sale dates:** Start must precede end, both must be future dates
- **Unit pricing:** Both `measure` and `base_measure` required together
- **Pricing trend:** Max 80 characters

**Best Practice:**
```typescript
// Regular pricing
{
  price: "79.99 USD"
}

// Active sale
{
  price: "79.99 USD",
  sale_price: "59.99 USD",
  sale_price_effective_date: "2025-06-01T00:00:00Z/2025-06-30T23:59:59Z",
  pricing_trend: "Lowest price in 6 months"
}

// Unit pricing (grocery/bulk items)
{
  price: "12.99 USD",
  unit_pricing_measure: "32 oz",
  unit_pricing_base_measure: "1 oz"
  // Displays as "$0.40/oz"
}
```

**Pricing Strategy:**
- ✅ Update prices every 15 minutes if dynamic
- ✅ Use sale pricing for promotions (increases conversion)
- ✅ Add pricing trend to stand out (social proof)
- ❌ Don't set sale_price without effective dates
- ❌ Don't use prices of $0.00 (breaks validation)

---

### 6. Availability & Inventory (6 fields) - STOCK SIGNALS

Accurate inventory ensures users only see purchasable items.

| Field | Type | Required | What It Does | Example |
|-------|------|----------|--------------|---------|
| `availability` | enum | ✅ Required | Stock status | `in_stock`, `out_of_stock`, `preorder`, `backorder` |
| `availability_date` | date | Required if preorder | When item becomes available | `2025-12-01` |
| `inventory_quantity` | integer | ✅ Required | Stock count | `25` |
| `expiration_date` | date | Optional | Remove product after date | `2025-12-01` |
| `pickup_method` | enum | Optional | Pickup options | `in_store`, `reserve`, `not_supported` |
| `pickup_sla` | number+duration | Optional | Pickup timeframe | `1 day` |

**Key Validation Rules:**
- **Availability:** Must be lowercase string
- **Inventory:** Non-negative integer (0 = out of stock)
- **Dates:** ISO 8601 format, must be future dates
- **Pickup SLA:** Requires `pickup_method` to be set

**Best Practice:**
```typescript
// In stock with pickup
{
  availability: "in_stock",
  inventory_quantity: 47,
  pickup_method: "in_store",
  pickup_sla: "2 hours"
}

// Out of stock
{
  availability: "out_of_stock",
  inventory_quantity: 0
}

// Preorder
{
  availability: "preorder",
  availability_date: "2025-12-15",
  inventory_quantity: 0
}

// Limited time offer
{
  availability: "in_stock",
  inventory_quantity: 100,
  expiration_date: "2025-08-31"
}
```

**Inventory Management:**
- ✅ Update inventory every 15 minutes (prevent overselling)
- ✅ Set `availability: out_of_stock` when quantity hits 0
- ✅ Use `backorder` if accepting orders but delayed
- ❌ Don't leave stale inventory (causes poor UX)
- ❌ Don't use negative inventory quantities

---

### 7. Variants (13 fields) - PRODUCT GROUPING

Group related products (color/size variations) for better UX.

| Field | Type | Required | What It Does | Example |
|-------|------|----------|--------------|---------|
| `item_group_id` | string | ✅ If variants exist | Groups variants together | `SHOE123GROUP` |
| `item_group_title` | string | Optional | Parent product name | `Men's Trail Running Shoes` |
| `color` | string | ⭐ Recommended (apparel) | Variant color | `Blue`, `Navy Blue` |
| `size` | string | ⭐ Recommended (apparel) | Variant size | `10`, `Medium`, `32x34` |
| `size_system` | country code | ⭐ Recommended (apparel) | Size standard | `US`, `UK`, `EU` |
| `gender` | enum | ⭐ Recommended (apparel) | Gender target | `male`, `female`, `unisex` |
| `offer_id` | string | ⭐ Recommended | Unique offer identifier | `SKU12345-Blue-79.99` |
| `custom_variant1_category` | string | Optional | Custom dimension 1 name | `Wood_Type` |
| `custom_variant1_option` | string | Optional | Custom dimension 1 value | `Oak`, `Mahogany` |
| `custom_variant2_category` | string | Optional | Custom dimension 2 name | `Cap_Style` |
| `custom_variant2_option` | string | Optional | Custom dimension 2 value | `Snapback`, `Fitted` |
| `custom_variant3_category` | string | Optional | Custom dimension 3 name | `Engraving` |
| `custom_variant3_option` | string | Optional | Custom dimension 3 value | `Yes`, `No` |

**Key Validation Rules:**
- **Item group ID:** Max 70 chars, must be same for all variants
- **Offer ID:** Should be unique within entire feed
- **Color/Size:** Max 40/20 chars respectively
- **Gender:** Must be lowercase (`male`, not `Male`)
- **Custom variants:** Category and option must be provided together

**Critical Understanding:** The `item_group_id` should represent how the product appears on your website. If you show a single product page with color/size dropdowns, all those variants share the same `item_group_id`.

**Best Practice:**
```typescript
// Shoe with size variants
// Product 1
{
  id: "SHOE123-10",
  item_group_id: "SHOE123GROUP",
  item_group_title: "Men's Trail Running Shoes",
  title: "Men's Trail Running Shoes Black - Size 10",
  color: "Black",
  size: "10",
  size_system: "US",
  gender: "male",
  offer_id: "SHOE123-Black-10-79.99"
}

// Product 2 (same group, different size)
{
  id: "SHOE123-11",
  item_group_id: "SHOE123GROUP",
  item_group_title: "Men's Trail Running Shoes",
  title: "Men's Trail Running Shoes Black - Size 11",
  color: "Black",
  size: "11",
  size_system: "US",
  gender: "male",
  offer_id: "SHOE123-Black-11-79.99"
}

// Custom variant example (furniture)
{
  id: "DESK789-Oak-White",
  item_group_id: "DESK789GROUP",
  custom_variant1_category: "Wood_Type",
  custom_variant1_option: "Oak",
  custom_variant2_category: "Finish_Color",
  custom_variant2_option: "White"
}
```

**When to Use Variants:**
- ✅ Apparel with size/color options
- ✅ Furniture with material/finish options
- ✅ Electronics with storage/color options
- ❌ Completely different products (even same category)
- ❌ Bundles or kits (use `related_product_id` instead)

---

### 8. Fulfillment (2 fields) - SHIPPING DETAILS

Outline shipping costs and delivery estimates upfront.

| Field | Type | Required | What It Does | Example |
|-------|------|----------|--------------|---------|
| `shipping` | string | ✅ Required where applicable | Shipping method/cost/region | `US:CA:Overnight:16.00 USD` |
| `delivery_estimate` | date | Optional | Estimated arrival date | `2025-08-12` |

**Shipping Field Format:**
```
country:region:service_class:price
```

**Key Validation Rules:**
- **Multiple entries allowed:** Separate with commas or newlines
- **Country/region codes:** Use ISO 3166 (2-letter country codes)
- **Service class:** `Standard`, `Express`, `Overnight`, etc.
- **Price:** Must include currency code
- **Delivery estimate:** Must be future date (ISO 8601)

**Best Practice:**
```typescript
// Single shipping option
{
  shipping: "US:CA:Standard:5.99 USD"
}

// Multiple shipping options
{
  shipping: "US:CA:Standard:5.99 USD,US:CA:Express:12.99 USD,US:CA:Overnight:19.99 USD"
}

// Free shipping example
{
  shipping: "US::Standard:0.00 USD",
  delivery_estimate: "2025-07-15"
}

// International shipping
{
  shipping: "US::Standard:5.99 USD,CA::Standard:12.99 USD,GB::Standard:19.99 USD"
}
```

**Shipping Strategy:**
- ✅ Provide multiple shipping tiers (Standard/Express/Overnight)
- ✅ Include free shipping if applicable (competitive advantage)
- ✅ Use delivery estimates for clarity
- ❌ Don't omit regional restrictions
- ❌ Don't use placeholder costs (validates against real rates)

---

### 9. Merchant Info (4 fields) - SELLER IDENTIFICATION

Identify your business and link to policies (critical for checkout).

| Field | Type | Required | What It Does | Example |
|-------|------|----------|--------------|---------|
| `seller_name` | string | ✅ Required / Display | Seller name | `Example Store` |
| `seller_url` | URL | ✅ Required | Seller storefront page | `https://example.com/store` |
| `seller_privacy_policy` | URL | ✅ Required if checkout enabled | Privacy policy URL | `https://example.com/privacy` |
| `seller_tos` | URL | ✅ Required if checkout enabled | Terms of service URL | `https://example.com/terms` |

**Key Validation Rules:**
- **Seller name:** Max 70 chars, displays in ChatGPT
- **All URLs:** HTTPS preferred, must return HTTP 200
- **Privacy/TOS:** Required if `enable_checkout: true`

**Best Practice:**
```typescript
// Minimum for search only
{
  seller_name: "Example Store",
  seller_url: "https://example.com/store"
}

// Required for checkout
{
  seller_name: "Example Store",
  seller_url: "https://example.com/store",
  seller_privacy_policy: "https://example.com/legal/privacy",
  seller_tos: "https://example.com/legal/terms"
}
```

**Legal Compliance:**
- ✅ Ensure privacy policy covers data collection/usage
- ✅ Include terms that cover purchase conditions
- ✅ Keep policies updated and accessible
- ❌ Don't enable checkout without proper legal pages
- ❌ Don't use generic/placeholder policy URLs

---

### 10. Returns (2 fields) - RETURN POLICIES

Set clear return expectations to build buyer confidence.

| Field | Type | Required | What It Does | Example |
|-------|------|----------|--------------|---------|
| `return_policy` | URL | ✅ Required | Return policy URL | `https://example.com/returns` |
| `return_window` | integer | ✅ Required | Days allowed for returns | `30` |

**Key Validation Rules:**
- **Return policy URL:** HTTPS preferred, must resolve
- **Return window:** Positive integer (days)

**Best Practice:**
```typescript
// Standard 30-day returns
{
  return_policy: "https://example.com/returns",
  return_window: 30
}

// Extended holiday returns
{
  return_policy: "https://example.com/returns",
  return_window: 60
}

// Final sale (no returns)
{
  return_policy: "https://example.com/returns",
  return_window: 0
}
```

**Return Strategy:**
- ✅ 30+ days is competitive benchmark
- ✅ Clear, accessible return policy page
- ✅ Consider free return shipping (reduces friction)
- ❌ Don't omit or use placeholder URLs
- ❌ Don't mislead with unrealistic windows

---

### 11. Performance Signals (2 fields) - RANKING BOOSTERS

Share popularity and quality metrics to enhance ranking.

| Field | Type | Required | What It Does | Example |
|-------|------|----------|--------------|---------|
| `popularity_score` | number | ⭐ Recommended | Popularity indicator (0-5 scale) | `4.7` |
| `return_rate` | number | ⭐ Recommended | Return rate percentage | `2%` |

**Key Validation Rules:**
- **Popularity score:** 0-5 scale or merchant-defined
- **Return rate:** 0-100% (lower is better)

**Best Practice:**
```typescript
// High-performing product
{
  popularity_score: 4.8,
  return_rate: 1.5
}

// New product (no data yet)
{
  // Omit these fields rather than use 0
}
```

**How to Calculate:**
```typescript
// Popularity score example
popularity_score = (
  (views * 0.3) +
  (add_to_cart * 0.3) +
  (purchases * 0.4)
) / normalizing_factor

// Return rate
return_rate = (returns / total_sales) * 100
```

---

### 12. Compliance (2 fields) - REGULATORY WARNINGS

Include disclaimers and age restrictions for regulated products.

| Field | Type | Required | What It Does | Example |
|-------|------|----------|--------------|---------|
| `warning` / `warning_url` | string / URL | ⭐ Recommended for checkout | Product disclaimers | `Contains lithium battery` |
| `age_restriction` | number | ⭐ Recommended | Minimum purchase age | `21` |

**Best Practice:**
```typescript
// Electronics with battery
{
  warning: "Contains lithium-ion battery. Follow disposal guidelines."
}

// California Prop 65
{
  warning_url: "https://example.com/warnings/prop65"
}

// Age-restricted product (alcohol)
{
  age_restriction: 21,
  warning: "Must be 21+ to purchase. ID required at delivery."
}

// Choking hazard
{
  warning: "Small parts - Choking hazard. Not for children under 3 years.",
  age_restriction: 3
}
```

**When to Use:**
- ✅ Age-restricted: Alcohol, tobacco, adult products
- ✅ Safety warnings: Batteries, chemicals, sharp objects
- ✅ Regional compliance: CA Prop 65, EU warnings
- ❌ Marketing fluff (use description instead)

---

### 13. Reviews and Q&A (6 fields) - USER-GENERATED CONTENT

Social proof that builds trust and aids purchase decisions.

| Field | Type | Required | What It Does | Example |
|-------|------|----------|--------------|---------|
| `product_review_count` | integer | ⭐ Recommended | Number of product reviews | `254` |
| `product_review_rating` | number | ⭐ Recommended | Average review score (0-5) | `4.6` |
| `store_review_count` | integer | Optional | Number of store reviews | `2000` |
| `store_review_rating` | number | Optional | Average store rating (0-5) | `4.8` |
| `q_and_a` | string | ⭐ Recommended | FAQ content (plain text) | `Q: Is this waterproof? A: Yes` |
| `raw_review_data` | string | ⭐ Recommended | Raw review payload (JSON) | `{...}` |

**Best Practice:**
```typescript
// Well-reviewed product
{
  product_review_count: 254,
  product_review_rating: 4.6,
  store_review_count: 2000,
  store_review_rating: 4.8,
  q_and_a: "Q: Is this waterproof? A: Yes, rated IP67.\nQ: What's the warranty? A: 2-year limited warranty.",
  raw_review_data: JSON.stringify([
    {
      rating: 5,
      author: "John D.",
      date: "2025-06-01",
      text: "Great product! Exactly as described."
    }
  ])
}

// New product (no reviews yet)
{
  product_review_count: 0,
  // Omit rating if no reviews yet
  store_review_count: 2000,
  store_review_rating: 4.8
}
```

**Why This Matters:**
- 🎯 Products with 50+ reviews rank higher
- 🎯 4.5+ rating increases click-through by ~30%
- 🎯 Q&A reduces customer service inquiries
- 🎯 Raw review data enables sentiment analysis

---

### 14. Related Products (2 fields) - CROSS-SELL OPPORTUNITIES

Enable recommendations and basket-building.

| Field | Type | Required | What It Does | Example |
|-------|------|----------|--------------|---------|
| `related_product_id` | string | ⭐ Recommended | Associated product IDs | `SKU67890,SKU67891` |
| `relationship_type` | enum | ⭐ Recommended | Relationship type | `often_bought_with`, `substitute`, `accessory` |

**Relationship Types:**
- `part_of_set` - Items that are part of a collection
- `required_part` - Necessary accessories (e.g., charger for device)
- `often_bought_with` - Frequently purchased together
- `substitute` - Alternative products (same function)
- `different_brand` - Similar product from another brand
- `accessory` - Optional add-ons

**Best Practice:**
```typescript
// Camera with accessories
{
  id: "CAMERA123",
  related_product_id: "LENS456,CASE789,MEMORY890",
  relationship_type: "accessory"
}

// Out of stock item with substitute
{
  id: "SHOE123",
  availability: "out_of_stock",
  related_product_id: "SHOE456",
  relationship_type: "substitute"
}

// Bundle/kit
{
  id: "KIT999",
  related_product_id: "ITEM001,ITEM002,ITEM003",
  relationship_type: "part_of_set"
}
```

**Cross-Sell Strategy:**
- ✅ Link 3-5 related products (more = dilution)
- ✅ Use `often_bought_with` for highest conversion
- ✅ Provide substitutes for out-of-stock items
- ❌ Don't link unrelated products
- ❌ Don't create circular relationships

---

### 15. Geo Tagging (2 fields) - REGION-SPECIFIC DATA

Override pricing or availability by location.

| Field | Type | Required | What It Does | Example |
|-------|------|----------|--------------|---------|
| `geo_price` | number+currency | ⭐ Recommended | Region-specific price | `79.99 USD (California)` |
| `geo_availability` | string | ⭐ Recommended | Region-specific stock | `in_stock (Texas), out_of_stock (NY)` |

**Best Practice:**
```typescript
// Regional pricing
{
  price: "79.99 USD", // Default
  geo_price: "89.99 USD (California), 84.99 USD (New York)" // Tax inclusive
}

// Regional availability
{
  availability: "in_stock", // Default
  geo_availability: "in_stock (US-CA,US-TX), out_of_stock (US-NY,US-FL)"
}
```

**Use Cases:**
- ✅ Tax-inclusive pricing by state/country
- ✅ Regional stock availability (warehouses)
- ✅ International pricing (EUR vs USD)
- ❌ Don't use for dynamic pricing (too complex)
- ❌ Don't omit default `price` field

---

## Summary: The 3-Tier Field Strategy

### **Tier 1: Minimum Viable Feed (15 fields)**
Get products live in ChatGPT search (no checkout).

```
✅ enable_search, enable_checkout
✅ id, title, description, link
✅ gtin OR mpn
✅ brand, material, weight
✅ product_category
✅ image_link
✅ price
✅ availability, inventory_quantity
✅ seller_name, seller_url
```

**Result:** Products appear in ChatGPT search results (Level 4-6 ranking)

---

### **Tier 2: Optimized Feed (40 fields)**
Improve ranking and enable checkout.

**Add to Tier 1:**
```
✅ additional_image_link (3-5 images)
✅ sale_price, sale_price_effective_date
✅ product_review_count, product_review_rating
✅ popularity_score
✅ item_group_id (if variants exist)
✅ color, size, gender (for apparel)
✅ shipping, delivery_estimate
✅ return_policy, return_window
✅ seller_privacy_policy, seller_tos (required for checkout)
✅ q_and_a
```

**Result:** Higher ranking (Level 7-8), checkout enabled, better conversion

---

### **Tier 3: Maximum Visibility Feed (70+ fields)**
Achieve top rankings and maximum feature support.

**Add to Tier 2:**
```
✅ video_link, model_3d_link
✅ pricing_trend
✅ pickup_method, pickup_sla
✅ related_product_id, relationship_type
✅ store_review_count, store_review_rating
✅ raw_review_data
✅ geo_price, geo_availability
✅ warning/warning_url, age_restriction
✅ Custom variants (if needed)
```

**Result:** Top placement (Level 9-10), all features enabled, premium UX

---

## Prohibited Products

**Never submit these to OpenAI:**
- ❌ Adult/sexual content
- ❌ Alcohol, tobacco, nicotine (unless approved)
- ❌ Gambling products
- ❌ Weapons, ammunition, explosives
- ❌ Prescription medications
- ❌ Unlicensed financial products
- ❌ Counterfeit/pirated goods
- ❌ Illegal substances or paraphernalia
- ❌ Deceptive/scam products

**Violations result in:** Product removal or seller ban from ChatGPT.

---

## Feed Refresh Best Practices

### Update Frequency
```
Every 15 minutes: Price, inventory, availability (critical)
Daily: Product content (title, description, images)
Weekly: Reviews, popularity scores
Monthly: Catalog additions/removals
```

### Error Handling
```typescript
// OpenAI will notify you of validation errors
// Fix errors quickly to avoid deindexing

Common errors:
1. Missing required fields → Add missing data
2. Invalid GTIN format → Validate against GS1 database
3. Broken image URLs → Check CDN accessibility
4. Invalid date formats → Use ISO 8601
5. Price mismatches → Ensure sale_price ≤ price
```

---

## Quick Reference: Field Priority

### MUST HAVE (Required)
1. `enable_search`, `enable_checkout`
2. `id`, `title`, `description`, `link`
3. `gtin` OR `mpn`
4. `brand`, `material`, `weight`, `product_category`
5. `image_link`
6. `price`, `availability`, `inventory_quantity`
7. `seller_name`, `seller_url`
8. `return_policy`, `return_window`

### SHOULD HAVE (Recommended for ranking)
9. `additional_image_link` (3-5 images)
10. `sale_price` (if applicable)
11. `product_review_count`, `product_review_rating`
12. `popularity_score`
13. `item_group_id` (if variants)
14. `color`, `size` (apparel)
15. `shipping`, `delivery_estimate`
16. `q_and_a`

### NICE TO HAVE (Competitive advantage)
17. `video_link`, `model_3d_link`
18. `pricing_trend`
19. `related_product_id`, `relationship_type`
20. `store_review_count`, `store_review_rating`
21. `raw_review_data`
22. `geo_price`, `geo_availability`

---

## Final Checklist

Before submitting your feed:

- [ ] All required fields present and validated
- [ ] GTINs validated against GS1 database
- [ ] All URLs return HTTP 200 (no 404s)
- [ ] Images are high-quality (1200x1200px min)
- [ ] Prices include currency codes (ISO 4217)
- [ ] Inventory quantities accurate (updated every 15 min)
- [ ] Variant products share same `item_group_id`
- [ ] Shipping costs accurate per region
- [ ] Privacy policy + TOS accessible (if checkout enabled)
- [ ] Return policy clearly stated
- [ ] No prohibited products included
- [ ] Feed validates with sample test

**You're ready to launch! 🚀**
