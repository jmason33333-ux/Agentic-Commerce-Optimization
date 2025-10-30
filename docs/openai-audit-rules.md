# OpenAI Commerce Feed Audit Rules

Based on the official OpenAI Commerce Feed Specification.

## Critical (REQUIRED) Fields

### OpenAI Flags
- [ ] `enable_search` must be boolean (true/false)
- [ ] `enable_checkout` must be boolean (true/false)
- [ ] `enable_checkout=true` requires `enable_search=true`

### Basic Product Data
- [ ] `id` - Max 100 chars, must be stable
- [ ] `title` - Max 150 chars, avoid all-caps
- [ ] `description` - Max 5,000 chars, plain text only
- [ ] `link` - Must resolve HTTP 200, HTTPS preferred
- [ ] `gtin` OR `mpn` - At least one required (GTIN: 8-14 digits, MPN: max 70 chars)

### Item Information
- [ ] `condition` - Required if not "new" (new|refurbished|used)
- [ ] `product_category` - Required, use ">" separator
- [ ] `brand` - Required (max 70 chars) except movies/books/music
- [ ] `material` - Required (max 100 chars)
- [ ] `weight` - Required, positive number with unit

### Media
- [ ] `image_link` - Required, JPEG/PNG, HTTPS preferred, min 1000x1000px recommended

### Price
- [ ] `price` - Required, must include ISO 4217 currency code
- [ ] `sale_price` - If provided, must be ≤ price
- [ ] `sale_price_effective_date` - Required if sale_price provided

### Availability
- [ ] `availability` - Required (in_stock|out_of_stock|preorder)
- [ ] `availability_date` - Required if availability=preorder
- [ ] `inventory_quantity` - Required, non-negative integer

### Merchant Info
- [ ] `seller_name` - Required (max 70 chars)
- [ ] `seller_url` - Required, HTTPS preferred
- [ ] `seller_privacy_policy` - Required if enable_checkout=true
- [ ] `seller_tos` - Required if enable_checkout=true

### Returns
- [ ] `return_policy` - Required, HTTPS preferred
- [ ] `return_window` - Required, positive integer (days)

## Recommended Fields (Improve Ranking)

### Variants (Required if variants exist)
- [ ] `item_group_id` - Max 70 chars, same for all variants
- [ ] `color` - Max 40 chars (apparel)
- [ ] `size` - Max 20 chars (apparel)
- [ ] `size_system` - ISO 3166 country code (apparel)
- [ ] `gender` - male|female|unisex (apparel)

### Additional Media
- [ ] `additional_image_link` - Multiple images improve trust
- [ ] `video_link` - Product video
- [ ] `model_3d_link` - GLB/GLTF preferred

### Fulfillment
- [ ] `shipping` - country:region:service:price format
- [ ] `delivery_estimate` - Future date

### Performance
- [ ] `popularity_score` - 0-5 scale
- [ ] `product_review_count` - Non-negative
- [ ] `product_review_rating` - 0-5 scale
- [ ] `q_and_a` - FAQ content

### Related Products
- [ ] `related_product_id` - Comma-separated IDs
- [ ] `relationship_type` - part_of_set, often_bought_with, substitute, etc.

## Validation Rules

### Text Fields
- Title: Max 150 chars, no all-caps
- Description: Max 5,000 chars, plain text
- Brand: Max 70 chars
- Material: Max 100 chars

### Numeric Fields
- Price: Must include currency (ISO 4217)
- Weight: Must include unit
- Inventory: Non-negative integer
- Review rating: 0-5 scale
- Return window: Positive integer (days)

### URLs
- All URLs must resolve HTTP 200
- HTTPS strongly preferred
- Image dimensions: 1000x1000px minimum recommended

### Enums
- condition: new | refurbished | used
- availability: in_stock | out_of_stock | preorder
- age_group: newborn | infant | toddler | kids | adult
- gender: male | female | unisex
- pickup_method: in_store | reserve | not_supported

## Ranking Factors (Priority Order)

1. **Complete Required Fields** - Missing required fields = product not shown
2. **enable_checkout=true** - Instant checkout products rank higher
3. **Rich Media** - Multiple high-quality images + video
4. **Product Identifiers** - GTIN + MPN improve matching
5. **Complete Attributes** - Color, size, material, dimensions, weight
6. **Reviews & Ratings** - High review count + rating
7. **Description Quality** - 200+ chars with audience, use cases, occasions
8. **Variant Relationships** - Proper item_group_id linkage
9. **Performance Signals** - High popularity_score, low return_rate
10. **Related Products** - Cross-sell recommendations

## Common Issues

### Critical Blockers
- ❌ Missing enable_search or enable_checkout
- ❌ Missing price or currency
- ❌ Missing availability
- ❌ Missing image_link
- ❌ Missing brand (except exempted categories)
- ❌ Missing gtin AND mpn
- ❌ enable_checkout=true but enable_search=false

### High Priority
- ⚠️ Description < 50 chars
- ⚠️ No additional images
- ⚠️ Missing weight
- ⚠️ Missing product_category
- ⚠️ Missing return_policy or return_window
- ⚠️ Missing seller_privacy_policy when checkout enabled

### Medium Priority
- ⚠️ No sale_price when product is on sale
- ⚠️ Missing color/size for apparel
- ⚠️ No video for high-value items
- ⚠️ No reviews or Q&A
- ⚠️ Missing related_product_id

### Low Priority (Optimize)
- 💡 No 3D model
- 💡 No geo_price/geo_availability
- 💡 No popularity_score
- 💡 Description could be richer (add audience, occasions, use cases)
- 💡 Missing custom variant dimensions
