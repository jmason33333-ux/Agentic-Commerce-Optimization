/**
 * OpenAI Commerce Feed Specification-compliant LLM prompt
 * Based on: https://developers.openai.com/commerce/specs/feed
 */

export const OPENAI_COMMERCE_PROMPT = `You are optimizing a merchant's product catalog for the OpenAI Commerce Feed Specification, which powers ChatGPT Shopping and Instant Checkout.

# OpenAI Commerce Feed Requirements

## REQUIRED FIELDS (Critical - product won't show without these):

**OpenAI Flags:**
- enable_search: true (must be true for product to appear)
- enable_checkout: true (enables instant purchase; requires enable_search=true)

**Basic Product Data:**
- id: Unique, stable product identifier (max 100 chars)
- title: Product name (max 150 chars, avoid all-caps)
- description: Full description (max 5,000 chars, plain text)
- link: Product page URL (must resolve HTTP 200, HTTPS preferred)
- gtin OR mpn: At least one required (GTIN: 8-14 digits, MPN: max 70 chars)

**Item Information:**
- condition: "new", "refurbished", or "used" (required if not new)
- product_category: Category path with ">" separator
- brand: Brand name (max 70 chars) - required except movies/books/music
- material: Primary material (max 100 chars)
- weight: With unit (e.g., "1.5 lb")

**Media:**
- image_link: Primary image URL (JPEG/PNG, HTTPS, 1000x1000px+ recommended)

**Price:**
- price: With ISO 4217 currency (e.g., "79.99 USD")

**Availability:**
- availability: "in_stock", "out_of_stock", or "preorder"
- inventory_quantity: Non-negative integer

**Merchant Info:**
- seller_name: Seller name (max 70 chars)
- seller_url: Seller page (HTTPS)
- seller_privacy_policy: Privacy policy URL (required if checkout enabled)
- seller_tos: Terms of service URL (required if checkout enabled)

**Returns:**
- return_policy: Return policy URL (HTTPS)
- return_window: Days allowed for return (positive integer)

## RECOMMENDED FIELDS (Improve ranking and discoverability):

**Variants (required if product has variants):**
- item_group_id: Same for all color/size variants
- color: Variant color (max 40 chars)
- size: Variant size (max 20 chars)
- size_system: Country code (e.g., "US")
- gender: "male", "female", or "unisex"

**Additional Media:**
- additional_image_link: Array of extra images
- video_link: Product video URL
- model_3d_link: 3D model (GLB/GLTF)

**Performance Signals:**
- popularity_score: 0-5 scale
- product_review_count: Number of reviews
- product_review_rating: Average rating (0-5)
- return_rate: Percentage (0-100%)

**Related Products:**
- related_product_id: IDs of related products
- relationship_type: "part_of_set", "often_bought_with", "substitute", etc.

**Q&A:**
- q_and_a: FAQ content

## RANKING FACTORS (in priority order):

1. **All required fields present** (missing = product hidden)
2. **enable_checkout=true** (instant checkout products rank higher)
3. **Rich media** (multiple images, video, 3D model)
4. **Product identifiers** (both GTIN and MPN)
5. **Complete attributes** (color, size, material, weight, dimensions)
6. **Reviews** (high count + rating)
7. **Rich descriptions** (200+ chars with audience, use cases, occasions)
8. **Variant groups** (proper item_group_id)
9. **Performance signals** (high popularity, low return rate)
10. **Related products** (cross-sell data)

# YOUR TASK:

You will receive a product JSON. Analyze it against the OpenAI Commerce Feed Specification above.

Return an array of SUGGESTIONS to make the product fully compliant and highly ranked. Each suggestion must have:

{
  "issue_type": string,  // e.g., "missing_brand", "missing_gtin", "checkout_disabled", "thin_description"
  "explanation": string, // Why this matters for ChatGPT Shopping (reference spec requirements)
  "proposed_change": {   // Exact fields to update with values
    "field_name": "new_value",
    // or for metadata:
    "description_append": "...",
    "tags_to_add": ["tag1", "tag2"],
    "audience": "...",
    "use_cases": ["case1", "case2"],
    "occasions": ["occasion1"]
  },
  "risk_level": "low" | "medium" | "high"
}

**Risk Levels:**
- "low": Safe metadata/text additions (descriptions, tags, attributes like color/material)
- "medium": Enabling flags (enable_checkout, enable_search) or setting categorical data
- "high": Price, inventory, or availability changes

**Common Issue Types:**
- missing_enable_search, missing_enable_checkout
- missing_gtin, missing_mpn, missing_both_gtin_mpn
- missing_brand, missing_weight, missing_material, missing_category
- missing_image, low_quality_image, missing_additional_images
- missing_seller_info, missing_privacy_policy, missing_tos
- missing_return_policy, missing_return_window
- thin_description, missing_audience, missing_use_cases
- missing_color, missing_size (for apparel)
- missing_reviews, missing_video
- checkout_disabled, search_disabled
- missing_variant_group (for products with variants)
- missing_related_products

DO NOT propose changes to price, availability, or inventory unless there's an obvious error.
ALWAYS explain how the change improves ChatGPT Shopping visibility or compliance.

Return ONLY a valid JSON array of suggestions. No markdown, no explanations outside the JSON.`;

export const EXAMPLE_PRODUCT_INPUT = {
  id: "SKU12345",
  title: "Men's Running Shoes",
  description: "Comfortable running shoes",
  price: 79.99,
  currency: "USD",
  inventory: 15,
  images: ["https://example.com/img1.jpg"],
  vendor: "Nike",
  tags: ["shoes", "running"],
  enableSearch: true,
  enableCheckout: false,
};

export const EXAMPLE_LLM_OUTPUT = [
  {
    issue_type: "missing_gtin_mpn",
    explanation:
      "OpenAI requires either GTIN or MPN for product identification. Missing both prevents proper product matching.",
    proposed_change: {
      gtin_recommendation:
        "Add UPC/EAN from manufacturer, or set MPN if GTIN unavailable",
    },
    risk_level: "low",
  },
  {
    issue_type: "missing_weight",
    explanation:
      "Weight is a required field in the OpenAI Commerce spec. Shipping calculations and compliance depend on it.",
    proposed_change: {
      weight: 1.2,
      weight_unit: "lb",
    },
    risk_level: "low",
  },
  {
    issue_type: "thin_description",
    explanation:
      "Description is too short. Rich descriptions (200+ chars) with audience and use cases improve ranking.",
    proposed_change: {
      description_append:
        "Ideal for daily runners and fitness enthusiasts. Features breathable mesh upper and cushioned sole for all-day comfort. Perfect for marathons, gym workouts, and casual wear.",
      audience: "Runners, fitness enthusiasts, athletes",
      use_cases: ["marathon training", "gym workouts", "casual wear"],
      occasions: ["daily exercise", "sports events"],
    },
    risk_level: "low",
  },
  {
    issue_type: "missing_brand",
    explanation:
      "Brand is required except for movies/books/music. Currently using vendor field instead of dedicated brand field.",
    proposed_change: {
      brand: "Nike",
    },
    risk_level: "low",
  },
  {
    issue_type: "checkout_disabled",
    explanation:
      "enable_checkout is false. Products with instant checkout enabled rank higher in ChatGPT Shopping.",
    proposed_change: {
      enable_checkout: true,
    },
    risk_level: "medium",
  },
  {
    issue_type: "missing_additional_images",
    explanation:
      "Multiple product images improve user trust and conversion. Recommended to have 3-5 images showing different angles.",
    proposed_change: {
      additional_image_link_recommendation:
        "Add images showing: side view, bottom sole, back view, product in use",
    },
    risk_level: "low",
  },
  {
    issue_type: "missing_color",
    explanation:
      "Color is recommended for apparel products. Helps with variant management and filtering.",
    proposed_change: {
      color: "Black",
    },
    risk_level: "low",
  },
  {
    issue_type: "missing_size",
    explanation:
      "Size is recommended for apparel. Required for proper variant grouping.",
    proposed_change: {
      size: "10",
      size_system: "US",
    },
    risk_level: "low",
  },
];
