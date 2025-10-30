# SEO vs ACP: The Complete Guide for E-Commerce Merchants

## Executive Summary

**The Question Every Merchant Is Asking:**
*"If I optimize for ChatGPT Shopping (ACP), will it hurt my Google rankings (SEO)?"*

**The Short Answer:**
No - if done correctly. ACP optimization and SEO optimization touch the same product data, but they serve different channels. When managed deliberately, optimizing for both creates a stronger, more consistent product catalog that performs better everywhere.

**The Risk:**
Sloppy ACP changes (like AI-rewriting titles without review) can confuse your SEO. But clean ACP implementation actually improves SEO by forcing feed hygiene and data accuracy.

---

## Part 1: Definitions

### What is ACP (Agentic Commerce Protocol)?

**Definition:**
ACP is an open-source standard (Apache 2.0 license) co-developed by OpenAI and Stripe that lets AI agents discover products, check availability, and complete purchases on behalf of users.

**Launch Date:** September 29, 2025

**Current Status:**
- ✅ Live: Etsy (1M+ products available in ChatGPT)
- ⏳ Coming Soon: Shopify (1M+ merchants including Glossier, SKIMS, Spanx, Vuori)
- 🔮 Future: Any merchant can implement (open protocol)

**Partners:**
- OpenAI (protocol design)
- Stripe (payments infrastructure)
- PayPal, Salesforce, Shopify (adoption partners)

**What It Powers:**
"Instant Checkout" in ChatGPT - the ability to buy products directly in a conversation without leaving the chat.

**Example Flow:**
```
User: "I need waterproof trail running shoes under $100"

ChatGPT: [Searches merchant ACP feeds]
"Here are three great options:
1. Nike Pegasus Trail 5 - $89.99 ⭐️ 4.6/5
2. Salomon Speedcross 5 - $94.99 ⭐️ 4.8/5
3. Brooks Cascadia 17 - $79.99 ⭐️ 4.5/5"

User: "I'll take the Nike ones in size 10"

ChatGPT: [Completes purchase via ACP]
"Order confirmed! Ships in 2-3 days."
```

**Market Impact:**
- Etsy stock surged 16% on announcement day
- Direct competition with Google Shopping and Amazon
- Estimated 200M+ weekly ChatGPT users with buying intent

---

### What is SEO (in E-Commerce Context)?

**Definition:**
Search Engine Optimization for e-commerce is the practice of making product pages and merchant feeds discoverable, crawlable, and rankable in search engines (primarily Google, Bing).

**Key Components:**
1. **On-Page SEO** - Product page titles, descriptions, images, schema markup
2. **Feed SEO** - Google Merchant Center, Meta Catalog, Pinterest feeds
3. **Technical SEO** - Site speed, mobile-friendliness, structured data
4. **Off-Page SEO** - Reviews, backlinks, brand signals

**Goal:**
Appear in search results when users search for products (e.g., "best trail running shoes")

**Destination:**
- Google Search & Shopping
- Bing Shopping
- Pinterest, Meta, etc.

---

## Part 2: Similarities

Both ACP and SEO want the **same foundational data**:

| Data Point | ACP Needs It | SEO Needs It | Why |
|------------|--------------|--------------|-----|
| **Product Title** | ✅ | ✅ | Primary identifier for matching queries |
| **Description** | ✅ | ✅ | Context for relevance and ranking |
| **Price** | ✅ | ✅ | Display pricing, competitive analysis |
| **Availability** | ✅ | ✅ | In-stock signals prevent dead clicks |
| **Images** | ✅ | ✅ | Visual confirmation, CTR driver |
| **GTIN/SKU** | ✅ | ✅ | Universal product identification |
| **Brand** | ✅ | ✅ | Trust signal, filtering |
| **Reviews** | ✅ | ✅ | Social proof, conversion driver |
| **Category** | ✅ | ✅ | Taxonomy for matching and filtering |
| **Variants** | ✅ | ✅ | Size/color grouping |

**Key Insight:**
If your product data is already clean for Google Merchant Center, you're 70% of the way to ACP readiness.

---

### Both Penalize Stale Data

**Google Merchant Center:**
- Price mismatch → suspension
- Out-of-stock items → lower quality score
- Broken image URLs → disapproval

**ACP (OpenAI):**
- Price mismatch → customer complaints, account review
- Out-of-stock → overselling, fulfillment issues
- Stale inventory → poor user experience

**Lesson:** Both channels force feed hygiene discipline.

---

### Both Reward Completeness

**Google Shopping:**
- More fields filled → higher quality score
- Rich product data → better match quality
- Reviews/ratings → higher visibility

**ACP (ChatGPT):**
- More fields filled → higher ranking (our 10-level system)
- Rich product data → better AI matching
- Reviews/ratings → trust signal, conversion boost

**Lesson:** "Feed optimization" skills transfer directly between channels.

---

## Part 3: Key Differences

### 1. Destination

**SEO:**
- Google Search → SERP (10 blue links)
- Google Shopping → grid of products
- User browses, compares, clicks through

**ACP:**
- ChatGPT conversation → AI recommendations (3-5 products)
- User asks intent-based questions
- AI curates, user confirms, purchase happens in-chat

**Implication:** ACP is about **intent matching** in dialogue, not **keyword matching** in SERP.

---

### 2. Control Flags (The Big Difference)

**SEO:**
- Google discovers your products via crawl or feed submission
- You can't say "enable_google=true" per product
- Opt-out is via robots.txt or noindex (site-wide or page-level)

**ACP:**
- You explicitly control per-product visibility with flags:
  - `enable_search: true/false` - Show in ChatGPT search?
  - `enable_checkout: true/false` - Allow in-chat purchase?

**Example:**
```csv
id,title,price,enable_search,enable_checkout,notes
SKU123,"Nike Shoes","89.99 USD",true,false,"Search yes, checkout not ready"
SKU456,"Adidas Shirt","39.99 USD",true,true,"Full commerce enabled"
SKU789,"Custom Item","199.99 USD",false,false,"B2B only, hide from AI"
```

**Why This Matters:**
- You can test products in ACP search before enabling checkout
- You can hide low-margin or support-heavy SKUs from AI
- You can phase in checkout for best-sellers first

**This is NEW:** You've never had this level of per-product control in a discovery channel before.

---

### 3. Intermediary Approval

**SEO:**
- Google crawls your site automatically
- Merchant Center approval is account-level (not per-product)
- Once approved, all products in feed are eligible

**ACP:**
- Merchant must apply at chatgpt.com/merchants
- Approval for "search" vs "checkout" is separate
- OpenAI can gate specific products or categories

**Implication:** ACP is more **curated** than SEO. OpenAI sits in the middle and decides what's safe/complete.

---

### 4. Speed & Freshness Requirements

**SEO:**
- Google Merchant Center: Refresh daily (acceptable)
- Product page updates: Crawled within hours/days
- Acceptable lag: 12-24 hours for price/inventory

**ACP:**
- Near real-time expectations (users buying right now)
- Recommended refresh: Every 15 minutes
- Price/inventory must be accurate at time of purchase

**Implication:** ACP forces **stricter data discipline** than SEO currently requires.

---

### 5. Ranking Algorithm

**SEO (Google Shopping):**
```python
ranking_score = (
    bid_amount * 0.30 +              # Ad Rank for Shopping Ads
    product_quality_score * 0.25 +   # Feed completeness, CTR history
    price_competitiveness * 0.20 +   # Price vs category average
    merchant_trust * 0.15 +          # Account history, reviews
    relevance_to_query * 0.10        # Keyword match
)
```

**ACP (ChatGPT Shopping):**
```python
ranking_score = (
    intent_match * 0.40 +            # How well product matches user need
    field_completeness * 0.25 +      # Our 10-level system (70+ fields)
    social_proof * 0.15 +            # Reviews, ratings, popularity
    availability * 0.10 +            # In stock > preorder > backorder
    price_competitiveness * 0.10     # Price vs alternatives
)
```

**Key Difference:** ACP weighs **intent understanding** much higher than **keyword matching**.

---

## Part 4: Risks - Can ACP Optimization Hurt SEO?

### ❌ Risk #1: Overwriting Product Titles

**Scenario:**
You use AI to rewrite product titles for ACP readability, and accidentally publish them to your Shopify PDP (which Google crawls).

**Example:**
```
Before (SEO-optimized):
"Nike Air Max 90 Running Shoes Men's Trail Waterproof Black Gray Size 10"

After (AI-simplified for ACP):
"Nike Running Shoes - Black"
```

**Impact:**
- ❌ Lost long-tail keywords: "waterproof," "trail," "men's"
- ❌ Lost size-specific traffic: "size 10"
- ❌ Reduced organic rankings for specific queries

**How to Avoid:**
- ✅ Store ACP titles in Shopify metafields (e.g., `metafields.acp.title`)
- ✅ Keep original SEO title in `product.title`
- ✅ Let feed mapper decide which to use for ACP vs web

---

### ❌ Risk #2: Creating Duplicate Content

**Scenario:**
You create ACP-specific product variants with stripped-down names, and accidentally publish them as separate pages.

**Example:**
```
SEO Product Page:
/products/nike-air-max-90-waterproof-trail-shoes

ACP Variant Page (accidentally created):
/products/nike-running-shoes-acp
```

**Impact:**
- ❌ Google sees duplicate/thin content
- ❌ Canonical confusion (which is the real page?)
- ❌ Link equity dilution

**How to Avoid:**
- ✅ Don't create separate products for ACP
- ✅ Use same product, just different field mappings in feed
- ✅ If you must create variants, use `rel="canonical"` or noindex

---

### ❌ Risk #3: Inconsistent Pricing

**Scenario:**
Your ACP feed shows one price, your website shows another (due to lag or A/B testing).

**Example:**
```
ChatGPT (ACP): "Nike Shoes - $89.99"
Website (PDP): "Nike Shoes - $99.99"
```

**Impact:**
- ❌ Customer confusion and complaints
- ❌ Google Merchant Center flags price mismatch
- ❌ Potential account suspension on both channels

**How to Avoid:**
- ✅ Single source of truth: Shopify price field
- ✅ Both feeds pull from same source
- ✅ Real-time price sync (15-minute refresh)

---

### ❌ Risk #4: Low-Quality AI Content

**Scenario:**
You auto-generate product descriptions with AI and publish them without review.

**Example:**
```
AI-Generated (repetitive):
"This product is a great product. It has great features. Great for everyday use. Great value."
```

**Impact:**
- ❌ Google treats as low-quality/thin content
- ❌ Potential Helpful Content Update penalty
- ❌ Reduced organic rankings

**How to Avoid:**
- ✅ Human-in-the-loop approval (our core value prop)
- ✅ Never auto-publish AI content directly to PDPs
- ✅ Use AI for suggestions, humans for approval

---

### ❌ Risk #5: Inventory Overselling

**Scenario:**
Your ACP feed shows "in stock," but you actually have 0 units (due to stale sync).

**Example:**
```
ACP Feed: availability="in_stock", inventory_quantity=25
Reality: 0 units in warehouse (sold out 2 hours ago)
```

**Impact:**
- ❌ Overselling → cancellations → bad reviews
- ❌ ACP account suspension risk
- ❌ Also impacts Google Merchant Center (out-of-stock mismatches)

**How to Avoid:**
- ✅ 15-minute inventory sync (minimum)
- ✅ Safety buffer: Only enable checkout if inventory ≥ 5
- ✅ Automatic `enable_checkout: false` when stock < threshold

---

## Part 5: Strategies for Optimizing Both

### Strategy #1: Harmonize Source Data

**Principle:** One source of truth, multiple consumers.

```
┌─────────────────────────────────────────────────────┐
│          SHOPIFY (Source of Truth)                  │
│  • product.title                                    │
│  • product.description                              │
│  • product.price                                    │
│  • product.inventory_quantity                       │
│  • product.images                                   │
└─────────────────────────────────────────────────────┘
                    │
                    │ Feed Mappers
          ┌─────────┴─────────┐
          ▼                   ▼
┌──────────────────┐  ┌──────────────────┐
│  Google Merchant │  │   ACP Feed       │
│  Center Feed     │  │   (OpenAI)       │
└──────────────────┘  └──────────────────┘
          │                   │
          ▼                   ▼
┌──────────────────┐  ┌──────────────────┐
│  Google Shopping │  │ ChatGPT Shopping │
└──────────────────┘  └──────────────────┘
```

**Implementation:**
- All feeds pull from Shopify product data
- No manual CSV exports (too much drift)
- Changes in Shopify propagate to all channels within 15 minutes

**Tools:**
- DataFeedWatch (multi-channel feed management)
- Shopify Flow (automation)
- Agent Commerce SEO (our product)

---

### Strategy #2: Separate Public vs Agent Fields

**Problem:** Some ACP-optimized content doesn't belong on public PDPs.

**Solution:** Use Shopify metafields to store ACP-specific data.

**Field Separation:**

**Public SEO Fields (Google sees these):**
- `product.title` - "Nike Air Max 90 Running Shoes Men's Trail Waterproof Black"
- `product.description` - Long-form, keyword-rich
- `product.seo_title` - Meta title for SERP
- `product.seo_description` - Meta description for SERP

**Agent Fields (Hidden from Google):**
- `metafields.acp.agent_title` - "Waterproof trail running shoes"
- `metafields.acp.use_cases` - "Trail running, hiking, outdoor activities"
- `metafields.acp.target_audience` - "Trail runners who log 20+ miles/week"
- `metafields.acp.compatibility` - "All terrain, wet conditions, rocky trails"

**Feed Mapping:**
```typescript
// Google Merchant Center Feed
{
  title: product.title, // SEO-optimized
  description: product.description,
  link: product.url
}

// ACP Feed (OpenAI)
{
  title: product.metafields.acp.agent_title || product.title, // Prefer agent-optimized
  description: buildAgentDescription(product), // Combines multiple fields
  link: product.url,
  use_cases: product.metafields.acp.use_cases,
  target_audience: product.metafields.acp.target_audience
}
```

**Result:**
- Google sees clean, keyword-optimized content
- ChatGPT gets conversational, intent-focused content
- No cross-contamination

---

### Strategy #3: Phased ACP Rollout

**Don't enable checkout for everything on day one.**

**Phase 1 (Week 1-2): Search-Only, All Products**
```csv
enable_search,enable_checkout,strategy
true,false,"Test discoverability, validate matches"
```

**Metrics to Watch:**
- How many products get impressions?
- Which queries are triggering your products?
- Any mismatches (wrong product for query)?

---

**Phase 2 (Week 3-4): Checkout for Top 20% (Best Sellers)**
```csv
id,title,enable_search,enable_checkout,notes
SKU001,"Best Seller #1",true,true,"High volume, proven product"
SKU002,"Best Seller #2",true,true,"High reviews, low returns"
...
SKU100,"Long Tail",true,false,"Low volume, testing search"
```

**Criteria for Checkout:**
- ✅ Inventory ≥ 10 units
- ✅ Rating ≥ 4.0 stars
- ✅ Return rate ≤ 5%
- ✅ Not tagged "custom" or "made-to-order"
- ✅ Price ≥ $20 (to cover fees)

**Metrics to Watch:**
- Conversion rate vs website
- AOV (Average Order Value)
- Customer satisfaction
- Return/cancellation rate

---

**Phase 3 (Month 2+): Checkout for 50-80% (Proven Strategy)**
```csv
enable_search,enable_checkout,notes
true,true,"Scaled to most catalog"
true,false,"Edge cases: custom, preorder, B2B"
```

**Ongoing Rules:**
- Auto-disable checkout when inventory < 5
- Auto-disable checkout when rating drops below 4.0
- Manual approval for new products before checkout

---

### Strategy #4: Unify Structured Data

**Principle:** Whatever you tell ACP, also reflect in schema.org markup.

**Example:**

**ACP Feed:**
```json
{
  "id": "SKU123",
  "title": "Nike Air Max 90",
  "price": "89.99 USD",
  "availability": "in_stock",
  "inventory_quantity": 25,
  "product_review_count": 254,
  "product_review_rating": 4.6
}
```

**Schema.org Product Markup (on PDP):**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Nike Air Max 90 Running Shoes",
  "sku": "SKU123",
  "offers": {
    "@type": "Offer",
    "price": "89.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "inventoryLevel": {
      "@type": "QuantitativeValue",
      "value": 25
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.6",
    "reviewCount": "254"
  }
}
</script>
```

**Why This Matters:**
- Google uses schema.org for rich snippets
- Consistency between ACP feed and schema = stronger signal
- Improves eligibility for Google Shopping Graph

---

### Strategy #5: Monitor Deltas

**Set up automated tracking:**

```typescript
// Weekly Report: Products Changed for ACP
const acpChanges = await db.productChange.findMany({
  where: {
    createdAt: { gte: sevenDaysAgo },
    changeType: 'ACP_OPTIMIZATION'
  }
});

// Cross-reference with organic performance
const organicPerformance = await getGoogleAnalyticsData({
  dimension: 'productSku',
  metrics: ['sessions', 'conversions', 'revenue'],
  dateRange: 'last_30_days'
});

// Flag: "Did organic drop after ACP change?"
acpChanges.forEach(change => {
  const before = organicPerformance.before[change.productId];
  const after = organicPerformance.after[change.productId];

  if (after.sessions < before.sessions * 0.80) {
    console.warn(`⚠️ Product ${change.productId} organic sessions dropped 20%+ after ACP change`);
    // Auto-revert or flag for human review
  }
});
```

**Action Plan:**
- If PDP traffic drops >20% after ACP change → Roll back
- If PDP conversion drops >20% → Roll back
- If no negative impact after 30 days → Keep change

---

## Part 6: Advice for Store Owners & Agencies

### For Store Owners:

**1. Treat ACP as "One More Feed Consumer"**

You already manage feeds for:
- Google Merchant Center
- Meta Catalog (Facebook/Instagram Shopping)
- Pinterest Shopping
- Amazon Seller Central

**ACP is just another consumer of the same product data.**

Don't treat it as special/scary. Apply the same feed hygiene discipline you use for Google.

---

**2. Start with What You Have**

If your Google Merchant Center feed is clean and approved, you're 70% ready for ACP.

**Quick Audit:**
- [ ] All products have GTINs or MPNs
- [ ] Prices match website
- [ ] Inventory is synced (daily minimum)
- [ ] Images are high-quality and accessible
- [ ] No disapproved items in last 30 days

**If yes to all:** You can launch ACP in 1-2 weeks.

---

**3. Use the Phased Rollout Strategy**

**Week 1-2:** Search-only, all products
- Goal: Test discoverability, validate matches
- Risk: Low (just visibility, no transactions)

**Week 3-4:** Checkout for top 20 SKUs
- Goal: Test transaction flow, gather feedback
- Risk: Medium (can oversell or disappoint)

**Month 2+:** Scale to 50-80% of catalog
- Goal: Maximize ACP revenue
- Risk: Managed (proven products only)

**Never:** Enable checkout for 100% on day one
- Risk: High (edge cases will bite you)

---

**4. Don't Rewrite PDPs for ACP**

**❌ Wrong Approach:**
Use AI to rewrite product titles/descriptions, publish directly to Shopify PDPs.

**✅ Right Approach:**
Use AI to generate ACP-specific content, store in metafields, keep PDPs unchanged.

**Why:** PDPs are already optimized for SEO and conversion. Don't break what works.

---

**5. Add a Kill Switch**

Build the ability to:
- Pause ACP feed entirely (emergency off switch)
- Disable checkout per product (via Shopify tag: `acp-pause`)
- Revert to previous feed version (rollback)

**Use Cases:**
- Product recall or safety issue
- Pricing error in feed
- Fulfillment capacity issues
- Platform bugs or integration issues

---

### For Agencies:

**1. Sell It as "New Channel Readiness," Not "AI Magic"**

**❌ Wrong Pitch:**
"We'll use AI to rewrite all your products and you'll rank #1 in ChatGPT!"

**✅ Right Pitch:**
"ChatGPT Shopping is a new $X billion channel. We'll prepare your catalog to compete there while protecting your SEO."

**Value Proposition:**
- Audit product data readiness (ACP + SEO)
- Map Shopify fields to ACP spec (70+ fields)
- Set up phased rollout (search → checkout)
- Monitor performance (attribution tracking)
- Protect existing SEO rankings

---

**2. Bundle SEO and ACP Audits**

**One crawl → Two reports:**

**SEO Audit:**
- On-page optimization (titles, descriptions, schema)
- Technical SEO (site speed, mobile, crawlability)
- Google Merchant Center health
- Organic traffic opportunities

**ACP Audit:**
- Field completeness score (our 10-level system)
- Missing required/recommended fields
- Inventory sync health
- Checkout readiness score

**Deliverable:**
"Your catalog is 85% ready for Google, 60% ready for ACP. Here's the roadmap to reach 90%+ on both."

**Pricing:**
- Combined audit: $2,500
- Implementation: $5,000-$15,000 (depending on catalog size)
- Monthly optimization: $1,500-$3,000/month

---

**3. Keep Changes Additive, Not Destructive**

**❌ Destructive Changes:**
- Overwriting product titles
- Replacing descriptions
- Changing URLs
- Modifying schema.org markup

**✅ Additive Changes:**
- Adding metafields for ACP-specific data
- Creating new feed mappings
- Enhancing existing descriptions (append, don't replace)
- Adding structured data (don't remove)

**Rollback Strategy:**
If client isn't happy or performance drops:
- Remove metafields
- Revert feed mapping
- No damage to existing PDPs or SEO

---

**4. Give Merchants Control**

**Dashboard Features Merchants Need:**

**Product-Level Controls:**
- [ ] Toggle `enable_search` per product
- [ ] Toggle `enable_checkout` per product
- [ ] Override ACP title/description
- [ ] Set custom shipping rules
- [ ] Pause ACP for product

**Workspace-Level Controls:**
- [ ] Global enable/disable ACP
- [ ] Set default checkout rules
- [ ] Configure inventory thresholds
- [ ] Set pricing strategies

**Reporting:**
- [ ] ACP impressions per product
- [ ] ACP conversion rate
- [ ] Revenue from ACP channel
- [ ] Compare to Google Shopping

---

**5. Document What's Manual**

**Be honest about limitations:**

**You CAN automate:**
- Feed generation (Shopify → ACP spec)
- Field mapping (70+ fields)
- Inventory/pricing sync (every 15 min)
- Content optimization suggestions (AI)
- Performance reporting

**You CANNOT automate:**
- Merchant signup at chatgpt.com/merchants (they must do this)
- Instant Checkout approval (OpenAI reviews each merchant)
- Legal pages (privacy policy, TOS, returns - must be human-written)
- Brand strategy decisions (which products to enable checkout)

**Set Expectations:**
"We'll handle 90% of the technical work, but you'll need to complete OpenAI onboarding and approval steps."

---

**6. Position for the Future**

**What's Coming:**
- Shopify native ACP channel (Q1 2026 likely)
- Google launching competing AI shopping (rumored)
- Amazon Alexa shopping integration (rumored)
- More AI assistants adopting ACP (open protocol)

**Your Value Prop (Future-Proof):**
"Even when Shopify adds a native ChatGPT channel, you'll still need:
- Content optimization (AI-suggested, human-approved)
- Performance analytics (which products/queries perform best)
- Multi-channel strategy (ACP + SEO + Amazon + Meta)
- Compliance management (what goes where)

We're not just a 'ChatGPT connector' - we're your AI commerce optimization layer."

---

## Part 7: Bottom Line

### Will ACP Optimization Hurt SEO?

**No - if you follow these principles:**

✅ **Keep source data clean** (Shopify as single source of truth)
✅ **Separate public from agent fields** (use metafields)
✅ **Don't overwrite PDPs** (additive changes only)
✅ **Monitor performance** (watch for organic drops)
✅ **Human approval required** (never auto-publish)

---

### Will ACP Optimization Help SEO?

**Yes - indirectly:**

✅ **Forces feed hygiene** (clean data helps both channels)
✅ **Improves accuracy** (real-time inventory = fewer mismatches)
✅ **Better structured data** (completeness helps Google too)
✅ **Review acquisition** (same reviews boost both channels)

---

### The Real Opportunity

ACP is not a replacement for SEO. It's a **complementary channel** powered by the same product data.

**Multi-Channel Strategy:**
```
         Product Catalog (Shopify)
                  ↓
    ┌─────────────┼─────────────┐
    ↓             ↓             ↓
Google SEO    ACP (ChatGPT)  Amazon
    ↓             ↓             ↓
  Traffic       Sales         Sales
```

**The Winner:**
Merchants who optimize for ALL channels simultaneously - treating product data as a strategic asset, not just a catalog.

That's exactly the gap Agent Commerce SEO fills.

---

## Resources

**Official Documentation:**
- [OpenAI Agentic Commerce Protocol](https://developers.openai.com/commerce)
- [Shopify ChatGPT Integration](https://shopify.com/chatgpt)
- [Google Merchant Center](https://merchants.google.com)

**Tools:**
- Agent Commerce SEO (our platform)
- DataFeedWatch (multi-channel feeds)
- Schema.org validator

**Further Reading:**
- "Buy it in ChatGPT" (OpenAI announcement)
- "Instant Checkout Technical Guide" (OpenAI Developers)
- "Feed Optimization Best Practices" (Google)

---

**Last Updated:** 2025-10-30
**Version:** 1.0
