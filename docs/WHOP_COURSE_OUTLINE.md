# ChatGPT Shopping Mastery: Complete Course

## Course Overview

**Target Audience:** E-commerce merchants, marketing managers, and technical teams looking to optimize product catalogs for ChatGPT Shopping (Instant Checkout)

**Duration:** 6 weeks (self-paced)

**Prerequisites:**
- Basic understanding of e-commerce
- Access to product catalog (Shopify, WooCommerce, etc.)
- Merchant account registered at chatgpt.com/merchants

**Course Outcomes:**
By completing this course, you will:
- ✅ Understand the OpenAI Product Feed Specification (70+ fields)
- ✅ Create and optimize a complete product feed
- ✅ Achieve Level 8+ ranking in ChatGPT Shopping
- ✅ Enable and manage Instant Checkout
- ✅ Track and optimize performance metrics
- ✅ Implement advanced strategies for maximum visibility

---

## Course Structure

### Module 1: Foundations (Week 1)
- Lesson 1.1: Introduction to AI Commerce
- Lesson 1.2: How ChatGPT Shopping Works
- Lesson 1.3: The Product Feed Specification Overview
- Lesson 1.4: Setting Up Your Merchant Account
- **Assignment:** Create your merchant account and export your first product catalog

### Module 2: Core Product Data (Week 2)
- Lesson 2.1: Required Fields Deep Dive
- Lesson 2.2: Product Identifiers (GTIN, MPN, SKU)
- Lesson 2.3: Titles & Descriptions for AI Discovery
- Lesson 2.4: Category Taxonomy Best Practices
- **Assignment:** Create a minimum viable feed (Tier 1 - 15 fields)

### Module 3: Media & Visual Content (Week 2)
- Lesson 3.1: Image Optimization Principles
- Lesson 3.2: Multi-Image Strategy (The 5-Image Rule)
- Lesson 3.3: Video Content for Products
- Lesson 3.4: 3D Models & Advanced Media
- **Assignment:** Upgrade images for your top 20 products

### Module 4: Pricing, Inventory & Fulfillment (Week 3)
- Lesson 4.1: Pricing Strategy for AI Commerce
- Lesson 4.2: Sale Pricing & Promotions
- Lesson 4.3: Inventory Management & Sync
- Lesson 4.4: Shipping & Delivery Options
- **Assignment:** Implement real-time inventory sync (15-minute refresh)

### Module 5: Variants & Product Relationships (Week 4)
- Lesson 5.1: Understanding Product Variants
- Lesson 5.2: Apparel Variants (Color, Size, Gender)
- Lesson 5.3: Custom Variants (Furniture, Electronics)
- Lesson 5.4: Related Products & Cross-Sell
- **Assignment:** Group all variants and set up related products

### Module 6: Social Proof & Trust Signals (Week 4)
- Lesson 6.1: Review Acquisition Strategies
- Lesson 6.2: Implementing Q&A Content
- Lesson 6.3: Store vs Product Reviews
- Lesson 6.4: Raw Review Data & Sentiment Analysis
- **Assignment:** Collect and add reviews for 50 products

### Module 7: Compliance & Checkout (Week 5)
- Lesson 7.1: Merchant Policies (Privacy, TOS, Returns)
- Lesson 7.2: Age Restrictions & Warnings
- Lesson 7.3: Prohibited Products Policy
- Lesson 7.4: Enabling Instant Checkout
- **Assignment:** Enable checkout for your top 20% of products

### Module 8: Advanced Optimization (Week 5-6)
- Lesson 8.1: The 10-Level Ranking System
- Lesson 8.2: Popularity Scores & Performance Signals
- Lesson 8.3: Geo-Targeting & Regional Pricing
- Lesson 8.4: Pickup Methods & Local Commerce
- **Assignment:** Achieve Tier 3 (70+ fields) for your catalog

### Module 9: Analytics & Performance (Week 6)
- Lesson 9.1: Setting Up Attribution Tracking
- Lesson 9.2: Key Metrics Dashboard
- Lesson 9.3: A/B Testing Strategies
- Lesson 9.4: Continuous Optimization Loop
- **Assignment:** Build your analytics dashboard

### Module 10: Case Studies & Scale (Week 6)
- Lesson 10.1: Real-World Success Stories
- Lesson 10.2: Common Pitfalls & How to Avoid Them
- Lesson 10.3: Scaling to 1000+ Products
- Lesson 10.4: Agency & Multi-Brand Strategies
- **Final Project:** Present your complete optimized catalog

---

## Detailed Lesson Plans

---

## MODULE 1: FOUNDATIONS

### Lesson 1.1: Introduction to AI Commerce
**Duration:** 30 minutes

**Learning Objectives:**
- Understand the shift from keyword search to AI-powered discovery
- Identify the business opportunity in ChatGPT Shopping
- Learn the fundamentals of the Agentic Commerce Protocol

**Content:**

**1.1.1 The Evolution of E-Commerce Discovery**

Traditional Commerce:
```
Customer → Google Search → Ads/SEO → Product Page → Checkout
         └─ High competition, keyword-based, pay-to-play
```

AI Commerce:
```
Customer → ChatGPT Conversation → AI Recommendation → Instant Checkout
         └─ Context-aware, intent-based, organic discovery
```

**Key Differences:**

| Traditional | AI Commerce |
|-------------|-------------|
| Keyword matching | Intent understanding |
| Sponsored listings | Organic relevance |
| Search → Click → Browse | Ask → Recommend → Buy |
| 10 blue links | Conversational product discovery |

**1.1.2 Market Opportunity**

**Statistics:**
- 60% of shoppers now start product research with AI assistants
- ChatGPT has 200M+ weekly active users
- Early adopters see 3-5x higher visibility vs competitors
- Average AOV 15-20% higher (higher intent shoppers)

**1.1.3 The Agentic Commerce Protocol**

**Definition:** A standardized way for AI assistants to discover, recommend, and facilitate purchases directly within conversational interfaces.

**Key Components:**
1. **Product Feed Spec** - Structured catalog data (our focus)
2. **Instant Checkout** - Seamless in-chat purchasing
3. **Order Fulfillment** - Standard e-commerce flow post-purchase
4. **Attribution** - Tracking AI-driven sales

**Quick Check Quiz:**
1. What percentage of shoppers start with AI assistants? (60%)
2. What's the main difference between keyword and AI search? (Intent vs keywords)
3. Name one component of the Agentic Commerce Protocol (Product Feed Spec)

---

### Lesson 1.2: How ChatGPT Shopping Works
**Duration:** 45 minutes

**Learning Objectives:**
- Understand the end-to-end shopping flow in ChatGPT
- Learn how product feeds power discovery and ranking
- Identify the technical requirements for integration

**Content:**

**1.2.1 The User Journey**

**Step 1: Discovery (User Query)**
```
User: "I need waterproof running shoes for trail running under $100"
```

**Step 2: ChatGPT Analysis**
ChatGPT extracts:
- Product type: Running shoes
- Key features: Waterproof, trail running
- Price constraint: Under $100
- Intent: Purchase (high commercial intent)

**Step 3: Product Feed Search**
ChatGPT searches merchant product feeds for matches:
```sql
SELECT * FROM merchant_products
WHERE product_category LIKE '%Running Shoes%'
  AND (description LIKE '%waterproof%' OR material LIKE '%waterproof%')
  AND price <= 100
  AND enable_search = true
ORDER BY relevance_score DESC, popularity_score DESC
LIMIT 5
```

**Step 4: Ranking & Recommendation**
ChatGPT ranks products by:
1. **Relevance** (how well it matches the query)
2. **Completeness** (how many fields are filled - our 10-level system)
3. **Quality** (reviews, popularity, return rate)
4. **Availability** (in stock > preorder > backorder)
5. **Price** (competitive within category)

**Step 5: Presentation**
```
ChatGPT: "Here are three great options for waterproof trail running shoes under $100:

1. **Nike Pegasus Trail 5 - Waterproof** ($89.99)
   ⭐️ 4.6/5 (254 reviews)
   Waterproof Gore-Tex upper, cushioned sole, durable Vibram outsole
   [View Product] [Buy Now]

2. **Salomon Speedcross 5 GTX** ($94.99)
   ⭐️ 4.8/5 (189 reviews)
   Aggressive grip, waterproof, perfect for muddy trails
   [View Product] [Buy Now]

3. **Brooks Cascadia 17** ($79.99 - on sale!)
   ⭐️ 4.5/5 (312 reviews)
   Great cushioning, waterproof membrane, best value option
   [View Product] [Buy Now]

All three are in stock and ship within 2-3 days. Would you like more details on any of these?"
```

**Step 6: Purchase (If Instant Checkout Enabled)**
```
User: "I'll take the Nike ones in size 10"

ChatGPT: "Great choice! Let me help you complete your purchase.

📦 Nike Pegasus Trail 5 - Size 10 - $89.99
🚚 Standard shipping (2-3 days): $5.99
💳 Total: $95.98

[Proceed to Checkout]
```

**1.2.2 Behind the Scenes: Technical Flow**

```
┌─────────────────────────────────────────────────────────────┐
│                    MERCHANT SIDE                             │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ Product Feed (TSV/CSV)
                             │ Updated every 15 minutes
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  OPENAI INGESTION                            │
│  • Validates feed format                                     │
│  • Indexes products in search database                       │
│  • Calculates relevance scores                               │
│  • Updates inventory in real-time                            │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ Indexed Products
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                     CHATGPT SEARCH                           │
│  • User asks a question                                      │
│  • ChatGPT analyzes intent                                   │
│  • Searches merchant feeds                                   │
│  • Ranks by relevance + quality                              │
│  • Presents top 3-5 recommendations                          │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ User selects product
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   INSTANT CHECKOUT                           │
│  • User confirms purchase                                    │
│  • OpenAI processes payment                                  │
│  • Order sent to merchant                                    │
│  • Merchant fulfills & ships                                 │
└─────────────────────────────────────────────────────────────┘
```

**1.2.3 Feed Refresh Cycle**

**Critical Understanding:** Your feed is a living document, not a one-time upload.

```
Every 15 minutes:
  ├─ Merchant pushes updated feed to OpenAI
  ├─ OpenAI validates changes
  ├─ Updates product availability, pricing, inventory
  └─ Re-indexes for search

Daily:
  ├─ Content updates (titles, descriptions)
  ├─ New products added
  ├─ Discontinued products removed
  └─ Review counts/ratings updated

Weekly:
  └─ Popularity scores recalculated
```

**1.2.4 The Ranking Algorithm (Simplified)**

While OpenAI doesn't publish the exact algorithm, we can infer the key factors:

```python
relevance_score = (
    query_match * 0.40 +        # How well product matches query
    field_completeness * 0.25 +  # Our 10-level system
    social_proof * 0.15 +        # Reviews, ratings, popularity
    availability * 0.10 +        # In stock > out of stock
    price_competitiveness * 0.10 # Relative to category average
)
```

**Example Calculation:**

Product A (Your Product):
- Query match: 0.95 (perfect match for "waterproof running shoes")
- Field completeness: 0.80 (Level 8 - 60/70 fields filled)
- Social proof: 0.75 (4.6/5 rating, 254 reviews, popularity 4.7/5)
- Availability: 1.00 (in stock, 25 units)
- Price: 0.90 ($89.99 vs $95 category average)

**Score: 0.89 (Highly likely to rank #1)**

Product B (Competitor):
- Query match: 0.90 (good match but missing "waterproof" in title)
- Field completeness: 0.50 (Level 5 - only required fields)
- Social proof: 0.65 (4.3/5 rating, 89 reviews, no popularity score)
- Availability: 1.00 (in stock)
- Price: 0.85 ($94.99 vs $95 average)

**Score: 0.78 (Likely to rank #2-3)**

**Key Takeaway:** Even a 10-15% improvement in field completeness and social proof can dramatically improve ranking.

**Practice Exercise:**
Calculate the estimated relevance score for one of your products using the formula above. What areas can you improve?

---

### Lesson 1.3: The Product Feed Specification Overview
**Duration:** 60 minutes

**Learning Objectives:**
- Understand the complete field taxonomy (70+ fields)
- Learn the 3-tier field strategy
- Identify which fields apply to your product catalog

**Content:**

**1.3.1 Field Categories (15 Total)**

The OpenAI Product Feed Spec has 70+ fields organized into 15 categories:

1. **OpenAI Flags** (2 fields) - `enable_search`, `enable_checkout`
2. **Basic Product Data** (6 fields) - id, title, description, link, gtin, mpn
3. **Item Information** (9 fields) - condition, category, brand, material, dimensions, weight
4. **Media** (4 fields) - images, video, 3D models
5. **Price & Promotions** (5 fields) - price, sale pricing, unit pricing
6. **Availability & Inventory** (6 fields) - stock status, quantity, pickup
7. **Variants** (13 fields) - grouping, color, size, gender, custom variants
8. **Fulfillment** (2 fields) - shipping, delivery estimates
9. **Merchant Info** (4 fields) - seller name, URL, policies
10. **Returns** (2 fields) - policy, window
11. **Performance Signals** (2 fields) - popularity, return rate
12. **Compliance** (2 fields) - warnings, age restrictions
13. **Reviews & Q&A** (6 fields) - product/store reviews, FAQs
14. **Related Products** (2 fields) - cross-sell, upsell
15. **Geo Tagging** (2 fields) - regional pricing, availability

**Total: 67 fields** (some categories have subcategories)

**1.3.2 The 3-Tier Field Strategy**

**Tier 1: Minimum Viable Feed (15 fields) - Week 1**

Goal: Get products indexed in ChatGPT search

```csv
enable_search,enable_checkout,id,title,description,link,gtin,brand,product_category,material,weight,image_link,price,availability,inventory_quantity,seller_name,seller_url

true,false,SKU12345,"Nike Pegasus Trail 5 Waterproof","Waterproof running shoe...",https://example.com/SKU12345,123456789543,Nike,"Apparel & Accessories > Shoes > Athletic Shoes","Synthetic Mesh, Rubber Sole","1.2 lb",https://cdn.example.com/image1.jpg,"89.99 USD",in_stock,25,"Example Sports Store",https://example.com
```

**Result:**
- ✅ Products appear in ChatGPT search
- ⚠️ Ranking: Level 4-6 (mid-tier)
- ❌ No checkout enabled yet
- 📊 Expected visibility: 10-20% of relevant queries

---

**Tier 2: Optimized Feed (40 fields) - Week 2-3**

Goal: Improve ranking, enable checkout, boost conversion

**Add to Tier 1:**
- 3-5 additional images
- Sale pricing (if applicable)
- Product reviews (count + rating)
- Popularity score
- Variants (if applicable)
- Shipping & returns
- Seller policies (required for checkout)
- Q&A content

```csv
...(Tier 1 fields)...,additional_image_link,sale_price,sale_price_effective_date,product_review_count,product_review_rating,popularity_score,item_group_id,color,size,gender,shipping,return_policy,return_window,seller_privacy_policy,seller_tos,q_and_a

...(Tier 1 values)...,"img2.jpg,img3.jpg,img4.jpg,img5.jpg","79.99 USD","2025-06-01/2025-06-30",254,4.6,4.7,NIKE-PEG-5,Black,10,male,"US::Standard:5.99 USD",https://example.com/returns,30,https://example.com/privacy,https://example.com/terms,"Q: Is this waterproof? A: Yes, Gore-Tex membrane."
```

**Result:**
- ✅ Higher ranking (Level 7-8)
- ✅ Checkout enabled
- ✅ Better conversion rates
- 📊 Expected visibility: 40-60% of relevant queries

---

**Tier 3: Maximum Visibility Feed (70+ fields) - Week 4+**

Goal: Achieve top rankings, all features, maximum ROI

**Add to Tier 2:**
- Video links
- 3D models (optional)
- Pricing trends
- Pickup methods
- Related products (cross-sell)
- Store reviews
- Raw review data
- Geo-targeting
- Compliance fields

**Result:**
- ✅ Top placement (Level 9-10)
- ✅ All premium features enabled
- ✅ Maximum conversion rates
- 📊 Expected visibility: 70-90% of relevant queries

---

**1.3.3 Field Requirement Levels**

**Required (Must Have):**
Products won't index without these fields.

| Field | Why Required |
|-------|--------------|
| `enable_search` | Controls discoverability |
| `enable_checkout` | Controls purchasability |
| `id` | Unique identifier |
| `title` | Product name |
| `description` | Product details |
| `link` | Product page URL |
| `gtin` OR `mpn` | Universal identifier (at least one) |
| `brand` | Brand attribution |
| `product_category` | Categorization |
| `material` | Physical composition |
| `weight` | Shipping calculations |
| `image_link` | Visual representation |
| `price` | Pricing information |
| `availability` | Stock status |
| `inventory_quantity` | Stock count |
| `seller_name` | Merchant identification |
| `seller_url` | Merchant storefront |

**Total Required: 17 fields**

---

**Recommended (Should Have):**
Significantly improves ranking and conversion.

| Field | Impact | Priority |
|-------|--------|----------|
| `additional_image_link` | +15-20% CTR | 🔴 High |
| `product_review_count` | +25% conversion | 🔴 High |
| `product_review_rating` | +25% conversion | 🔴 High |
| `popularity_score` | +10-15% ranking | 🟡 Medium |
| `sale_price` | +30% CTR (if on sale) | 🔴 High |
| `item_group_id` | Better UX for variants | 🔴 High (if variants) |
| `color`, `size` | Required for apparel | 🔴 High (apparel) |
| `shipping` | Transparent pricing | 🟡 Medium |
| `return_policy` | Trust signal | 🟡 Medium |
| `q_and_a` | Reduces friction | 🟡 Medium |

---

**Optional (Nice to Have):**
Provides competitive advantage but not critical.

| Field | Impact | Use Case |
|-------|--------|----------|
| `video_link` | +10% engagement | High-value products |
| `model_3d_link` | +15% engagement | Furniture, decor |
| `pricing_trend` | Social proof | Sale items |
| `pickup_method` | Local commerce | Retailers with stores |
| `related_product_id` | +5-10% AOV | Cross-sell opportunities |
| `store_review_count` | Trust signal | Multi-product merchants |
| `raw_review_data` | Rich insights | Advanced merchants |
| `geo_price` | Regional optimization | International merchants |

---

**1.3.4 Field Applicability by Product Category**

**Apparel & Accessories:**
Must-have variants:
- `item_group_id` (group sizes/colors)
- `color`, `size`, `size_system`, `gender`

**Electronics:**
Focus on:
- `gtin` (critical for matching known products)
- `video_link` (demos)
- `related_product_id` (accessories)

**Home & Garden:**
Focus on:
- `dimensions` (fit verification)
- `material` (durability)
- `additional_image_link` (show all angles)
- `model_3d_link` (if furniture)

**Food & Beverage:**
Focus on:
- `unit_pricing_measure` (per oz, per lb)
- `expiration_date` (if perishable)
- `material` (ingredients)

**Beauty & Personal Care:**
Focus on:
- `size` (volume: 8oz, 16oz, etc.)
- `q_and_a` (usage instructions, allergens)
- `warning` (ingredient warnings)

---

**Knowledge Check:**
1. How many total field categories exist? (15)
2. What's the minimum number of fields to get indexed? (15-17)
3. What level ranking does Tier 2 achieve? (Level 7-8)
4. Name three required fields (any 3 from the list above)

---

### Lesson 1.4: Setting Up Your Merchant Account
**Duration:** 30 minutes

**Learning Objectives:**
- Register merchant account with OpenAI
- Understand approval process and requirements
- Configure feed delivery settings

**Content:**

**1.4.1 Registration Process**

**Step 1: Sign Up**
Visit [chatgpt.com/merchants](https://chatgpt.com/merchants)

Required information:
- Business name
- Business email
- Website URL
- Estimated product count
- Primary product categories
- Monthly revenue range

**Step 2: Business Verification**
OpenAI may request:
- Business license or registration
- Tax ID (EIN for US businesses)
- Proof of website ownership
- Sample product catalog (10-20 products)

**Timeline:** 3-7 business days for approval

---

**Step 3: Feed Configuration**

Once approved, configure:

**Feed Endpoint:**
```
https://your-domain.com/feeds/openai-product-feed.csv
```

**Format:** TSV, CSV, XML, or JSON (choose based on your system)

**Refresh Frequency:** Every 15 minutes (recommended)

**Authentication:**
- Option 1: API key in header
- Option 2: OAuth 2.0
- Option 3: IP allowlisting

---

**Step 4: Test Feed Submission**

Submit a sample feed with 10-20 products:

```bash
curl -X POST https://api.openai.com/v1/merchant/feed \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: text/csv" \
  --data-binary @sample-feed.csv
```

**Validation Response:**
```json
{
  "status": "success",
  "products_processed": 20,
  "products_indexed": 18,
  "errors": [
    {
      "product_id": "SKU999",
      "error": "Missing required field: gtin or mpn"
    },
    {
      "product_id": "SKU888",
      "error": "Invalid image URL: 404 not found"
    }
  ]
}
```

Fix errors and resubmit.

---

**Step 5: Enable Search (Search-Only Mode)**

Initial phase (1-2 weeks):
- All products: `enable_search: true`
- All products: `enable_checkout: false`

Purpose:
- Test discoverability
- Validate product matches
- Check data quality
- Build confidence

---

**Step 6: Apply for Instant Checkout**

After search-only validation, apply for Instant Checkout:

Requirements:
- Minimum 100 products indexed
- <5% validation error rate
- Privacy policy + Terms of Service published
- Return policy published
- Average product rating ≥4.0 (if reviews exist)
- No prohibited products

**Timeline:** 5-10 business days for approval

---

**1.4.2 Feed Delivery Methods**

**Method 1: Push Feed (Recommended)**
You actively send the feed to OpenAI every 15 minutes.

Advantages:
- Real-time control
- Immediate updates
- Fail-safe error handling

**Method 2: Pull Feed**
OpenAI fetches feed from your URL every 15 minutes.

Advantages:
- Simpler setup
- No active cron job needed
- OpenAI handles retry logic

**Method 3: Hybrid**
Push critical updates (price, inventory), pull for full refreshes (daily).

---

**Assignment 1.4:**
1. Register for a merchant account at chatgpt.com/merchants
2. Export your current product catalog (CSV format)
3. Identify which feed delivery method works best for your setup
4. Submit a sample feed with 10 products for validation

**Deliverable:** Screenshot of successful feed validation response

---

## MODULE 2: CORE PRODUCT DATA

### Lesson 2.1: Required Fields Deep Dive
**Duration:** 90 minutes

**Learning Objectives:**
- Master all 17 required fields
- Understand validation rules and common errors
- Learn how to source data from your existing catalog

**Content:**

**2.1.1 Product ID (`id`)**

**Purpose:** Unique identifier for the product in your catalog

**Format:** Alphanumeric string, max 100 characters

**Rules:**
- Must be unique across your entire catalog
- Must remain stable (don't change IDs between updates)
- Should be your internal SKU or product ID

**Common Patterns:**
```
SKU-based:     "SKU12345"
Hierarchical:  "CAT-SUBCAT-12345"
With variant:  "PRODUCT123-BLK-10"
```

**Best Practice:**
Use the same ID structure across all systems (ERP, website, marketplace listings).

**Example:**
```typescript
{
  id: "SHOE-NIKE-AIR-MAX-90-BLK-10"
}
```

---

**2.1.2 Product Title (`title`)**

**Purpose:** Primary product name displayed in search results

**Format:** String, max 150 characters

**Rules:**
- No ALL CAPS (use proper case)
- No excessive punctuation (!!!, ???)
- Include brand (unless you ARE the brand)
- Include key attributes and variant details

**The Title Formula:**
```
[Brand] [Product Type] [Key Attribute 1] [Key Attribute 2] - [Variant]
```

**Examples by Category:**

Apparel:
```
❌ "men's shoe"
✅ "Nike Air Max 90 Running Shoes - Black/White - Size 10"
```

Electronics:
```
❌ "laptop"
✅ "Apple MacBook Pro 16-inch M3 Chip 32GB RAM 1TB SSD - Space Black"
```

Home Goods:
```
❌ "coffee maker"
✅ "Breville Barista Express Espresso Machine - Stainless Steel"
```

Food:
```
❌ "protein powder"
✅ "Optimum Nutrition Gold Standard 100% Whey Protein Powder - Double Chocolate - 5 lbs"
```

**AI Optimization Tips:**
- Front-load important keywords (first 50 chars matter most)
- Use natural language (how customers speak)
- Be specific (avoid generic terms like "Widget" or "Item")
- Include variant details at the end (color, size, capacity)

**Common Errors:**
```
❌ "AMAZING SHOES!!!!" (all caps, excessive punctuation)
❌ "Item #12345" (not descriptive)
❌ "Shoe" (too generic)
❌ "Nike | Air Max | Running | Black | 10" (too many separators)
```

**Exercise:**
Rewrite these bad titles:
1. "LAPTOP COMPUTER"
2. "Widget123"
3. "shoes for men"

---

**2.1.3 Product Description (`description`)**

**Purpose:** Detailed product information for matching and ranking

**Format:** Plain text (no HTML), max 5,000 characters

**Rules:**
- Focus on features, benefits, use cases
- Use natural language (not keyword-stuffed)
- Include specifications (dimensions, materials, compatibility)
- Front-load key benefits (first 100 characters matter most)

**The Description Formula:**

**Paragraph 1: What + Primary Benefit (50-100 words)**
```
Waterproof trail running shoes designed for all-terrain performance. Features Gore-Tex membrane to keep feet dry during rain and stream crossings, while the Vibram rubber outsole provides superior grip on wet rocks and muddy trails.
```

**Paragraph 2: Key Features (100-150 words - bullet points work)**
```
• Waterproof Gore-Tex breathable membrane
• Vibram MegaGrip rubber outsole for traction
• Cushioned EVA midsole reduces impact
• Reinforced toe cap protects against trail debris
• Quick-dry breathable mesh upper
• Gusseted tongue keeps debris out
```

**Paragraph 3: Use Cases & Target Audience (50-100 words)**
```
Ideal for trail runners and hikers who need reliable footwear for challenging terrain. Perfect for distances from 5K to ultra marathons. Designed for runners who log 20+ miles per week on technical trails.
```

**Paragraph 4: Specifications (50-100 words)**
```
• Weight: 10.5 oz per shoe (size 9)
• Drop: 8mm heel-to-toe
• Stack height: 28mm heel / 20mm forefoot
• Materials: Gore-Tex, EVA foam, Vibram rubber
• Available in men's sizes 7-14 (half sizes available)
• Available colors: Black, Gray, Navy
```

**Paragraph 5: Care & Warranty (Optional, 25-50 words)**
```
Machine washable (cold water, air dry). Backed by our 60-day comfort guarantee and 1-year manufacturer warranty against defects.
```

**Total: 300-500 words (ideal length)**

**AI Optimization Tips:**
- Answer questions before they're asked
- Use semantic keywords (synonyms, related terms)
- Describe who this is for (target audience)
- Mention compatible/related items
- Include care instructions (reduces returns)

**Common Errors:**
```
❌ "Great product! Buy now!" (too vague, salesy)
❌ "<p>HTML formatted text</p>" (no HTML allowed)
❌ "running shoes running trail running waterproof running" (keyword stuffing)
❌ One sentence description (too short)
```

**Exercise:**
Write a complete product description using the formula above for a product in your catalog.

---

*[Continue with remaining 14 required fields following the same detailed pattern...]*

---

**Assignment 2.1:**
1. Audit your top 50 products
2. Identify missing required fields
3. Complete all 17 required fields for these products
4. Validate using our field checklist

**Deliverable:** CSV export of 50 products with all required fields populated

---

### Lesson 2.2: Product Identifiers (GTIN, MPN, SKU)
**Duration:** 45 minutes

*[Detailed lesson content on GTINs, MPNs, and SKUs]*

---

### Lesson 2.3: Titles & Descriptions for AI Discovery
**Duration:** 60 minutes

*[Detailed lesson on AI-first content creation]*

---

### Lesson 2.4: Category Taxonomy Best Practices
**Duration:** 45 minutes

*[Detailed lesson on product categorization]*

---

**Module 2 Assignment:**
Create a Tier 1 feed (15 required fields) for your entire catalog

---

## MODULE 3-10: [Additional Modules]

*[Each module would follow the same detailed structure with:*
*- Learning objectives*
*- Detailed content*
*- Examples*
*- Exercises*
*- Assignments]*

---

## Final Project

**Objective:** Present a complete, optimized product feed achieving Tier 3 (70+ fields)

**Requirements:**
1. Minimum 100 products
2. All required + recommended fields populated
3. Level 8+ ranking achieved
4. Instant Checkout enabled for top 20% of products
5. Analytics dashboard configured
6. 30-day performance report

**Deliverables:**
1. Complete product feed (CSV export)
2. Feed validation report (0 errors)
3. Performance metrics dashboard
4. 5-minute video walkthrough
5. Written case study (1-2 pages)

**Grading Rubric:**
- Field completeness (40%)
- Content quality (20%)
- Feed validation (20%)
- Performance results (10%)
- Presentation (10%)

---

## Bonus Resources

### Templates & Tools
- Product feed CSV template (Shopify format)
- Product feed CSV template (OpenAI spec format)
- Title optimization checklist
- Description template library
- Image specification guide
- Feed validation script

### Community & Support
- Private Discord community
- Weekly office hours (live Q&A)
- Expert AMA sessions
- Success story spotlight

### Certification
Upon completion, receive:
- **ChatGPT Shopping Optimization Certificate**
- LinkedIn badge
- Profile listing in our expert directory

---

**Enroll Now:** [Course Link]
**Duration:** 6 weeks, self-paced
**Price:** $497 (or 3 payments of $179)
**Money-back guarantee:** Full refund within 14 days if not satisfied
