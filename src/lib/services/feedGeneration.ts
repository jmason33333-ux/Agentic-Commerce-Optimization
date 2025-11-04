import { PrismaClient } from '@prisma/client';

interface OpenAIFeedItem {
  // OpenAI Flags
  enable_search: boolean;
  enable_checkout: boolean;

  // Basic Product Data
  id: string;
  title: string;
  description: string;
  link: string;
  gtin?: string;
  mpn?: string;

  // Item Information
  condition: string;
  product_category?: string;
  brand?: string;
  material?: string;
  weight?: string;

  // Media
  image_link: string;
  additional_image_link?: string;

  // Price
  price: string;
  sale_price?: string;
  sale_price_effective_date?: string;

  // Availability
  availability: string;
  inventory_quantity: number;

  // Variants
  item_group_id?: string;
  color?: string;
  size?: string;
  gender?: string;

  // Merchant Info
  seller_name: string;
  seller_url: string;
  seller_privacy_policy?: string;
  seller_tos?: string;

  // Returns
  return_policy?: string;
  return_window?: number;

  // Performance Signals
  product_review_count?: number;
  product_review_rating?: number;

  [key: string]: string | number | boolean | undefined;
}

/**
 * Generate product feed in TSV format
 */
export async function generateProductFeed(
  db: PrismaClient,
  workspaceId: string,
  format: 'TSV' | 'CSV' | 'JSON' = 'TSV'
): Promise<string> {
  // Get workspace info
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) {
    throw new Error('Workspace not found');
  }

  // Get enabled products
  const products = await db.product.findMany({
    where: {
      workspaceId,
      enableSearch: true,
      optimizationScore: { gte: 70 }, // Only include compliant products
    },
  });

  // Transform to OpenAI feed format
  const feedItems: OpenAIFeedItem[] = products.map((product) => ({
    // Flags
    enable_search: product.enableSearch,
    enable_checkout: product.enableCheckout,

    // Basic
    id: product.id,
    title: product.title,
    description: product.description || '',
    link: product.link || '',
    gtin: product.gtin || undefined,
    mpn: product.mpn || undefined,

    // Item Info
    condition: product.condition,
    product_category: product.productCategory || undefined,
    brand: product.brand || undefined,
    material: product.material || undefined,
    weight: product.weight && product.weightUnit
      ? `${product.weight} ${product.weightUnit}`
      : undefined,

    // Media
    image_link: product.imageLink || '',
    additional_image_link: Array.isArray(product.additionalImageLinks)
      ? (product.additionalImageLinks as string[]).join(',')
      : undefined,

    // Price
    price: product.price ? `${product.price} ${product.currency}` : '0.00 USD',
    sale_price: product.salePrice
      ? `${product.salePrice} ${product.currency}`
      : undefined,
    sale_price_effective_date:
      product.salePriceStart && product.salePriceEnd
        ? `${product.salePriceStart.toISOString()}/${product.salePriceEnd.toISOString()}`
        : undefined,

    // Availability
    availability: product.availability,
    inventory_quantity: product.inventoryQuantity,

    // Variants
    item_group_id: product.itemGroupId || undefined,
    color: product.color || undefined,
    size: product.size || undefined,
    gender: product.gender || undefined,

    // Merchant Info (from workspace)
    seller_name: workspace.sellerName || '',
    seller_url: workspace.sellerUrl || '',
    seller_privacy_policy: workspace.sellerPrivacyPolicy || undefined,
    seller_tos: workspace.sellerTos || undefined,

    // Returns
    return_policy: workspace.returnPolicy || undefined,
    return_window: workspace.returnWindow || undefined,

    // Performance
    product_review_count: product.productReviewCount || undefined,
    product_review_rating: product.productReviewRating
      ? Number(product.productReviewRating)
      : undefined,
  }));

  // Convert to requested format
  switch (format) {
    case 'TSV':
      return convertToTSV(feedItems);
    case 'CSV':
      return convertToCSV(feedItems);
    case 'JSON':
      return JSON.stringify(feedItems, null, 2);
    default:
      return convertToTSV(feedItems);
  }
}

/**
 * Convert feed items to TSV format
 */
function convertToTSV(items: OpenAIFeedItem[]): string {
  if (items.length === 0) return '';

  // Get all unique keys
  const keys = Array.from(
    new Set(items.flatMap((item) => Object.keys(item)))
  );

  // Header row
  const header = keys.join('\t');

  // Data rows
  const rows = items.map((item) =>
    keys.map((key) => {
      const value = item[key];
      if (value === undefined || value === null) return '';
      return String(value);
    }).join('\t')
  );

  return [header, ...rows].join('\n');
}

/**
 * Convert feed items to CSV format
 */
function convertToCSV(items: OpenAIFeedItem[]): string {
  if (items.length === 0) return '';

  // Get all unique keys
  const keys = Array.from(
    new Set(items.flatMap((item) => Object.keys(item)))
  );

  // Header row
  const header = keys.map(escapeCSV).join(',');

  // Data rows
  const rows = items.map((item) =>
    keys
      .map((key) => {
        const value = item[key];
        if (value === undefined || value === null) return '';
        return escapeCSV(String(value));
      })
      .join(',')
  );

  return [header, ...rows].join('\n');
}

/**
 * Escape CSV value
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Submit feed to OpenAI
 */
export async function submitFeedToOpenAI(
  feed: string,
  merchantId: string,
  apiKey: string,
  format: 'TSV' | 'CSV' | 'JSON' = 'TSV'
): Promise<{
  id: string;
  status: string;
  message?: string;
}> {
  const contentType =
    format === 'TSV'
      ? 'text/tab-separated-values'
      : format === 'CSV'
      ? 'text/csv'
      : 'application/json';

  const response = await fetch('https://api.openai.com/v1/commerce/feeds', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'X-Merchant-ID': merchantId,
      'Content-Type': contentType,
    },
    body: feed,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Feed submission failed: ${response.statusText} - ${error}`);
  }

  return response.json();
}
