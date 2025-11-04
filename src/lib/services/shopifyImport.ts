import { PrismaClient, type Product } from '@prisma/client';
import type { ShopifyProduct, ShopifyVariant } from '../shopify/client';

/**
 * Import Shopify products into database
 */
export async function importShopifyProducts(
  db: PrismaClient,
  workspaceId: string,
  shopifyProducts: ShopifyProduct[]
): Promise<number> {
  let importedCount = 0;

  for (const shopifyProduct of shopifyProducts) {
    try {
      // Map Shopify product to our schema
      const productData = mapShopifyProduct(shopifyProduct);

      // Check if product already exists
      const existing = await db.product.findFirst({
        where: {
          workspaceId,
          sourceId: shopifyProduct.id,
        },
      });

      if (existing) {
        // Update existing
        await db.product.update({
          where: { id: existing.id },
          data: {
            ...productData,
            updatedAt: new Date(),
          },
        });
      } else {
        // Create new
        await db.product.create({
          data: {
            ...productData,
            workspaceId,
            sourceId: shopifyProduct.id,
          },
        });
      }

      importedCount++;
    } catch (error) {
      console.error(`Failed to import product ${shopifyProduct.id}:`, error);
    }
  }

  // After import, run compliance check on all products
  await updateProductCompliance(db, workspaceId);

  return importedCount;
}

/**
 * Map Shopify product to our Product schema
 */
function mapShopifyProduct(shopifyProduct: ShopifyProduct): Partial<Product> {
  const mainVariant = shopifyProduct.variants[0];
  const hasMultipleVariants = shopifyProduct.variants.length > 1;

  return {
    // Basic fields
    title: shopifyProduct.title,
    description: shopifyProduct.body_html,
    link: `https://example.myshopify.com/products/${shopifyProduct.handle}`, // Will be updated with actual domain

    // OpenAI required fields
    gtin: mainVariant?.barcode || null,
    mpn: mainVariant?.sku || null,
    brand: shopifyProduct.vendor || null,
    condition: 'new',
    imageLink: shopifyProduct.images[0]?.src || null,
    additionalImageLinks: shopifyProduct.images.slice(1).map((img) => img.src),
    productCategory: shopifyProduct.product_type || null,

    // Pricing
    price: mainVariant?.price ? parseFloat(mainVariant.price) : null,
    currency: 'USD',

    // Inventory
    availability: mapAvailability(mainVariant?.inventory_quantity || 0),
    inventoryQuantity: mainVariant?.inventory_quantity || 0,

    // Physical attributes
    weight: mainVariant?.weight || null,
    weightUnit: mainVariant?.weight_unit || null,

    // Variants
    itemGroupId: hasMultipleVariants ? shopifyProduct.handle : null,
    color: mainVariant?.option1 || null,
    size: mainVariant?.option2 || null,

    // Tags
    tags: shopifyProduct.tags ? shopifyProduct.tags.split(',').map(t => t.trim()) : null,

    // Legacy/compatibility
    vendor: shopifyProduct.vendor,
    productType: shopifyProduct.product_type,
  };
}

/**
 * Map inventory quantity to OpenAI availability enum
 */
function mapAvailability(quantity: number): string {
  if (quantity > 0) return 'in_stock';
  if (quantity === 0) return 'out_of_stock';
  return 'in_stock'; // Default for untracked inventory
}

/**
 * Update compliance status for all products in workspace
 */
async function updateProductCompliance(
  db: PrismaClient,
  workspaceId: string
): Promise<void> {
  const products = await db.product.findMany({
    where: { workspaceId },
  });

  for (const product of products) {
    const compliance = checkProductCompliance(product);

    await db.product.update({
      where: { id: product.id },
      data: {
        optimizationScore: compliance.complianceScore,
        optimizationLevel: calculateLevel(compliance.complianceScore),
        status: compliance.isCompliant ? 'ready' : 'missing',
      },
    });
  }
}

/**
 * OpenAI required fields
 */
const REQUIRED_FIELDS = [
  'title',
  'description',
  'link',
  'imageLink',
  'availability',
  'price',
  'brand',
  'weight',
  'productCategory',
] as const;

/**
 * Check if product meets OpenAI compliance requirements
 */
export function checkProductCompliance(product: Partial<Product>): {
  isCompliant: boolean;
  missingFields: string[];
  complianceScore: number;
} {
  const missingFields: string[] = [];

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!product[field] || product[field] === '') {
      missingFields.push(field);
    }
  }

  // Check "one of" requirements (GTIN or MPN)
  if (!product.gtin && !product.mpn) {
    missingFields.push('gtin OR mpn');
  }

  // Calculate compliance score
  const totalRequiredFields = REQUIRED_FIELDS.length + 1; // +1 for gtin/mpn
  const missingCount = missingFields.length;
  const complianceScore = Math.round(
    ((totalRequiredFields - missingCount) / totalRequiredFields) * 100
  );

  return {
    isCompliant: missingFields.length === 0,
    missingFields,
    complianceScore,
  };
}

/**
 * Calculate optimization level from score
 */
function calculateLevel(score: number): number {
  if (score >= 90) return 10;
  if (score >= 80) return 9;
  if (score >= 70) return 8;
  if (score >= 60) return 7;
  if (score >= 50) return 6;
  if (score >= 40) return 5;
  if (score >= 30) return 4;
  if (score >= 20) return 3;
  if (score >= 10) return 2;
  return 1;
}
