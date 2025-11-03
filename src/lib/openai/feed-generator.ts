/**
 * OpenAI Agentic Commerce Protocol (ACP) Feed Generator
 *
 * Converts Shopify products to ACP-compliant XML/JSON feed format
 *
 * Spec: https://developers.openai.com/commerce/specs/product-feed
 */

import { Product } from '@prisma/client';

export interface FeedGenerationOptions {
  includeUnoptimized?: boolean; // Include products with low optimization scores?
  maxProducts?: number; // Limit feed size
  format?: 'xml' | 'json'; // Feed format
  merchantInfo?: {
    name: string;
    url: string;
    privacyPolicy?: string;
    termsOfService?: string;
  };
}

export interface FeedGenerationResult {
  feedContent: string;
  format: 'xml' | 'json';
  productCount: number;
  validationErrors: FeedValidationError[];
  warnings: string[];
}

export interface FeedValidationError {
  productId: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Generate OpenAI product feed from workspace products
 */
export async function generateProductFeed(
  products: Product[],
  options: FeedGenerationOptions = {}
): Promise<FeedGenerationResult> {
  const {
    includeUnoptimized = false,
    maxProducts,
    format = 'xml',
    merchantInfo
  } = options;

  // Filter products
  let eligibleProducts = products.filter(product => {
    // Only include products with enableSearch = true
    if (!product.enableSearch) return false;

    // Check optimization level if specified
    if (!includeUnoptimized && (product.optimizationLevel || 0) < 7) {
      return false;
    }

    // Must have basic required fields
    if (!product.title) return false;
    if (!product.price) return false;
    if (!product.imageLink) return false;

    return true;
  });

  // Limit products if specified
  if (maxProducts) {
    eligibleProducts = eligibleProducts.slice(0, maxProducts);
  }

  // Validate products and collect errors
  const validationErrors: FeedValidationError[] = [];
  const warnings: string[] = [];

  eligibleProducts.forEach(product => {
    const errors = validateProductForFeed(product);
    validationErrors.push(...errors);
  });

  // Generate feed content
  const feedContent = format === 'xml'
    ? generateXMLFeed(eligibleProducts, merchantInfo, warnings)
    : generateJSONFeed(eligibleProducts, merchantInfo, warnings);

  return {
    feedContent,
    format,
    productCount: eligibleProducts.length,
    validationErrors,
    warnings
  };
}

/**
 * Validate product meets OpenAI ACP requirements
 */
function validateProductForFeed(product: Product): FeedValidationError[] {
  const errors: FeedValidationError[] = [];
  const productId = product.id;

  // Required: Title
  if (!product.title || product.title.length < 1) {
    errors.push({
      productId,
      field: 'title',
      message: 'Title is required',
      severity: 'error'
    });
  }

  // Required: Description
  if (!product.description || product.description.length < 10) {
    errors.push({
      productId,
      field: 'description',
      message: 'Description must be at least 10 characters',
      severity: 'warning'
    });
  }

  // Required: Price
  if (!product.price || Number(product.price) <= 0) {
    errors.push({
      productId,
      field: 'price',
      message: 'Valid price is required',
      severity: 'error'
    });
  }

  // Required: Image
  if (!product.imageLink) {
    errors.push({
      productId,
      field: 'image_link',
      message: 'At least one product image is required',
      severity: 'error'
    });
  }

  // Required: GTIN OR MPN
  if (!product.gtin && !product.mpn) {
    errors.push({
      productId,
      field: 'gtin/mpn',
      message: 'Either GTIN or MPN is required for OpenAI indexing',
      severity: 'error'
    });
  }

  // Recommended: Brand (except for books/movies)
  if (!product.brand) {
    errors.push({
      productId,
      field: 'brand',
      message: 'Brand is highly recommended for better AI matching',
      severity: 'warning'
    });
  }

  // Agent-specific fields (improve AI recommendations)
  if (!product.useCases) {
    errors.push({
      productId,
      field: 'use_cases',
      message: 'Use cases help AI recommend products correctly',
      severity: 'warning'
    });
  }

  if (!product.targetAudience) {
    errors.push({
      productId,
      field: 'target_audience',
      message: 'Target audience helps AI filter relevant products',
      severity: 'warning'
    });
  }

  return errors;
}

/**
 * Generate XML feed (RSS 2.0 with Google Shopping extensions)
 */
function generateXMLFeed(
  products: Product[],
  merchantInfo: FeedGenerationOptions['merchantInfo'],
  warnings: string[]
): string {
  const items = products.map(product => generateXMLItem(product)).join('\n');

  const channelTitle = merchantInfo?.name || 'Product Feed';
  const channelLink = merchantInfo?.url || 'https://example.com';

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:g="http://base.google.com/ns/1.0"
     xmlns:c="http://base.google.com/cns/1.0">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${escapeXml(channelLink)}</link>
    <description>Agentic Commerce Protocol Product Feed</description>
${items}
  </channel>
</rss>`;
}

/**
 * Generate single XML item for a product
 */
function generateXMLItem(product: Product): string {
  // Build product URL
  const productUrl = product.link || `https://example.com/products/${product.sourceId}`;

  // Parse additional images
  const additionalImages = product.additionalImageLinks
    ? (Array.isArray(product.additionalImageLinks)
        ? product.additionalImageLinks
        : (product.additionalImageLinks as any).images || [])
    : [];

  return `    <item>
      <g:id>${escapeXml(product.sourceId)}</g:id>
      <g:title>${escapeXml(product.title)}</g:title>
      <g:description>${escapeXml(product.description || '')}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(product.imageLink || '')}</g:image_link>
${additionalImages.slice(0, 10).map((url: string) =>
        `      <g:additional_image_link>${escapeXml(url)}</g:additional_image_link>`
      ).join('\n')}
      <g:price>${Number(product.price).toFixed(2)} ${product.currency}</g:price>
${product.salePrice ? `      <g:sale_price>${Number(product.salePrice).toFixed(2)} ${product.currency}</g:sale_price>` : ''}
      <g:availability>${product.availability}</g:availability>
${product.gtin ? `      <g:gtin>${escapeXml(product.gtin)}</g:gtin>` : ''}
${product.mpn ? `      <g:mpn>${escapeXml(product.mpn)}</g:mpn>` : ''}
${product.brand ? `      <g:brand>${escapeXml(product.brand)}</g:brand>` : ''}
      <g:condition>${product.condition}</g:condition>
${product.productCategory ? `      <g:product_type>${escapeXml(product.productCategory)}</g:product_type>` : ''}

      <!-- Agent-Specific Fields (ACP Extensions) -->
${product.useCases ? `      <c:use_cases>${escapeXml(product.useCases)}</c:use_cases>` : ''}
${product.targetAudience ? `      <c:target_audience>${escapeXml(product.targetAudience)}</c:target_audience>` : ''}
${product.comparableProducts ? `      <c:comparable_products>${escapeXml(product.comparableProducts)}</c:comparable_products>` : ''}

      <!-- Inventory & Shipping -->
      <g:inventory>${product.inventoryQuantity}</g:inventory>
${product.weight ? `      <g:shipping_weight>${Number(product.weight)} ${product.weightUnit || 'lb'}</g:shipping_weight>` : ''}

      <!-- Reviews -->
${product.productReviewCount ? `      <c:review_count>${product.productReviewCount}</c:review_count>` : ''}
${product.productReviewRating ? `      <c:review_rating>${Number(product.productReviewRating).toFixed(2)}</c:review_rating>` : ''}
    </item>`;
}

/**
 * Generate JSON feed (alternative format)
 */
function generateJSONFeed(
  products: Product[],
  merchantInfo: FeedGenerationOptions['merchantInfo'],
  warnings: string[]
): string {
  const items = products.map(product => ({
    id: product.sourceId,
    title: product.title,
    description: product.description,
    link: product.link || `https://example.com/products/${product.sourceId}`,
    image_link: product.imageLink,
    additional_image_link: product.additionalImageLinks || [],
    price: `${Number(product.price).toFixed(2)} ${product.currency}`,
    sale_price: product.salePrice ? `${Number(product.salePrice).toFixed(2)} ${product.currency}` : undefined,
    availability: product.availability,
    gtin: product.gtin,
    mpn: product.mpn,
    brand: product.brand,
    condition: product.condition,
    product_type: product.productCategory,

    // Agent-specific fields
    use_cases: product.useCases,
    target_audience: product.targetAudience,
    comparable_products: product.comparableProducts,

    // Inventory
    inventory: product.inventoryQuantity,

    // Shipping
    shipping_weight: product.weight ? `${Number(product.weight)} ${product.weightUnit || 'lb'}` : undefined,

    // Reviews
    review_count: product.productReviewCount,
    review_rating: product.productReviewRating ? Number(product.productReviewRating) : undefined,
  }));

  return JSON.stringify({
    version: '1.0',
    feed_type: 'agentic_commerce_protocol',
    generated_at: new Date().toISOString(),
    merchant: merchantInfo,
    product_count: items.length,
    warnings: warnings,
    products: items
  }, null, 2);
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Calculate feed size estimate
 */
export function estimateFeedSize(productCount: number): {
  sizeBytes: number;
  sizeKB: number;
  sizeMB: number;
} {
  // Average product XML: ~2KB
  const sizeBytes = productCount * 2048;
  return {
    sizeBytes,
    sizeKB: Math.round(sizeBytes / 1024),
    sizeMB: Math.round((sizeBytes / 1024 / 1024) * 100) / 100
  };
}

/**
 * Get feed statistics
 */
export function getFeedStatistics(products: Product[]): {
  total: number;
  eligible: number;
  missingGtinMpn: number;
  lowOptimization: number;
  searchEnabled: number;
  checkoutEnabled: number;
} {
  return {
    total: products.length,
    eligible: products.filter(p => p.enableSearch && p.title && p.price && p.imageLink).length,
    missingGtinMpn: products.filter(p => !p.gtin && !p.mpn).length,
    lowOptimization: products.filter(p => (p.optimizationLevel || 0) < 7).length,
    searchEnabled: products.filter(p => p.enableSearch).length,
    checkoutEnabled: products.filter(p => p.enableCheckout).length,
  };
}
