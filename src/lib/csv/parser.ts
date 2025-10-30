/**
 * CSV Parser for Product Import
 * Supports both Shopify export format and custom OpenAI spec format
 */

export interface CSVProduct {
  // Required fields
  id: string;
  title: string;
  description?: string;
  link?: string;
  price?: number;
  currency?: string;

  // OpenAI spec fields
  gtin?: string;
  mpn?: string;
  brand?: string;
  condition?: string;
  productCategory?: string;
  material?: string;
  weight?: number;
  weightUnit?: string;

  // Media
  imageLink?: string;
  additionalImageLinks?: string[]; // comma-separated URLs
  videoLink?: string;

  // Availability
  availability?: string;
  inventoryQuantity?: number;

  // Variants
  itemGroupId?: string;
  color?: string;
  size?: string;
  gender?: string;

  // Other
  vendor?: string;
  productType?: string;
  tags?: string[]; // comma-separated
}

export type CSVFormat = 'shopify' | 'openai';

/**
 * Parse CSV text into product objects
 */
export function parseCSV(csvText: string, format: CSVFormat = 'shopify'): CSVProduct[] {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  const headers = parseCSVLine(lines[0]);
  const products: CSVProduct[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || values.every(v => !v)) {
      continue; // Skip empty lines
    }

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header.toLowerCase().trim()] = values[index]?.trim() || '';
    });

    if (format === 'shopify') {
      products.push(mapShopifyCSVToProduct(row));
    } else {
      products.push(mapOpenAICSVToProduct(row));
    }
  }

  return products;
}

/**
 * Parse a single CSV line, handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

/**
 * Map Shopify CSV export format to our product structure
 * Based on standard Shopify product export
 */
function mapShopifyCSVToProduct(row: Record<string, string>): CSVProduct {
  // Shopify CSV columns: Handle, Title, Body (HTML), Vendor, Type, Tags,
  // Published, Option1 Name, Option1 Value, Option2 Name, Option2 Value,
  // Variant SKU, Variant Grams, Variant Inventory Tracker, Variant Inventory Qty,
  // Variant Inventory Policy, Variant Fulfillment Service, Variant Price,
  // Variant Compare At Price, Variant Requires Shipping, Variant Taxable,
  // Variant Barcode, Image Src, Image Position, Image Alt Text, Gift Card,
  // SEO Title, SEO Description, Google Shopping / Google Product Category,
  // Google Shopping / Gender, Google Shopping / Age Group, Google Shopping / MPN,
  // Google Shopping / AdWords Grouping, Google Shopping / AdWords Labels,
  // Google Shopping / Condition, Google Shopping / Custom Product,
  // Google Shopping / Custom Label 0-4, Variant Image, Variant Weight Unit,
  // Variant Tax Code, Cost per item, Status

  const price = parseFloat(row['variant price']) || undefined;
  const weight = parseFloat(row['variant grams']) || undefined;
  const inventory = parseInt(row['variant inventory qty']) || 0;

  // Extract color/size from options
  let color: string | undefined;
  let size: string | undefined;

  const option1Name = row['option1 name']?.toLowerCase();
  const option1Value = row['option1 value'];
  const option2Name = row['option2 name']?.toLowerCase();
  const option2Value = row['option2 value'];

  if (option1Name?.includes('color') || option1Name?.includes('colour')) {
    color = option1Value;
  } else if (option1Name?.includes('size')) {
    size = option1Value;
  }

  if (option2Name?.includes('color') || option2Name?.includes('colour')) {
    color = option2Value;
  } else if (option2Name?.includes('size')) {
    size = option2Value;
  }

  return {
    id: row['handle'] || row['variant sku'] || `product-${Date.now()}`,
    title: row['title'] || 'Untitled Product',
    description: row['body (html)'] || row['seo description'],
    link: row['handle'] ? undefined : undefined, // Will be constructed from workspace domain
    price,
    currency: 'USD', // Default, can be configured

    // OpenAI spec fields
    gtin: row['variant barcode'] || row['google shopping / gtin'],
    mpn: row['variant sku'] || row['google shopping / mpn'],
    brand: row['vendor'],
    condition: row['google shopping / condition'] || 'new',
    productCategory: row['type'] || row['google shopping / google product category'],
    material: undefined, // Not in standard Shopify export
    weight: weight ? weight / 1000 : undefined, // Convert grams to kg
    weightUnit: weight ? 'kg' : undefined,

    // Media
    imageLink: row['image src'],
    additionalImageLinks: row['variant image'] ? [row['variant image']] : undefined,

    // Availability
    availability: inventory > 0 ? 'in_stock' : 'out_of_stock',
    inventoryQuantity: inventory,

    // Variants
    color,
    size,
    gender: row['google shopping / gender'],

    // Legacy
    vendor: row['vendor'],
    productType: row['type'],
    tags: row['tags'] ? row['tags'].split(',').map(t => t.trim()) : undefined,
  };
}

/**
 * Map custom OpenAI spec CSV format to our product structure
 */
function mapOpenAICSVToProduct(row: Record<string, string>): CSVProduct {
  const parseNumber = (val: string | undefined) => {
    const num = parseFloat(val || '');
    return isNaN(num) ? undefined : num;
  };

  const parseArray = (val: string | undefined) => {
    if (!val) return undefined;
    return val.split(',').map(s => s.trim()).filter(Boolean);
  };

  return {
    id: row['id'] || `product-${Date.now()}`,
    title: row['title'] || 'Untitled Product',
    description: row['description'],
    link: row['link'],
    price: parseNumber(row['price']),
    currency: row['currency'] || 'USD',

    gtin: row['gtin'],
    mpn: row['mpn'],
    brand: row['brand'],
    condition: row['condition'] || 'new',
    productCategory: row['product_category'] || row['category'],
    material: row['material'],
    weight: parseNumber(row['weight']),
    weightUnit: row['weight_unit'],

    imageLink: row['image_link'] || row['image'],
    additionalImageLinks: parseArray(row['additional_image_links']),
    videoLink: row['video_link'],

    availability: row['availability'] || 'in_stock',
    inventoryQuantity: parseInt(row['inventory_quantity'] || row['inventory'] || '0'),

    itemGroupId: row['item_group_id'],
    color: row['color'],
    size: row['size'],
    gender: row['gender'],

    vendor: row['vendor'],
    productType: row['product_type'] || row['type'],
    tags: parseArray(row['tags']),
  };
}

/**
 * Generate CSV template for OpenAI spec format
 */
export function generateOpenAITemplate(): string {
  const headers = [
    // Required
    'id',
    'title',
    'description',
    'link',
    'price',
    'currency',
    'gtin',
    'mpn',
    'brand',
    'condition',
    'product_category',
    'material',
    'weight',
    'weight_unit',
    'image_link',
    'availability',
    'inventory_quantity',

    // Recommended
    'additional_image_links',
    'video_link',
    'item_group_id',
    'color',
    'size',
    'gender',
    'tags',
  ];

  const exampleRow = [
    'SKU12345',
    'Men\'s Trail Running Shoes',
    'Waterproof trail shoe with cushioned sole. Ideal for runners and hikers.',
    'https://example.com/products/trail-shoes',
    '79.99',
    'USD',
    '123456789012',
    'TRAIL-BLK-10',
    'Nike',
    'new',
    'Apparel & Accessories > Shoes > Athletic Shoes',
    'Synthetic mesh, rubber sole',
    '1.2',
    'lb',
    'https://example.com/images/shoe1.jpg',
    'in_stock',
    '25',
    'https://example.com/images/shoe2.jpg,https://example.com/images/shoe3.jpg',
    'https://example.com/videos/shoe-demo.mp4',
    'TRAIL-SHOES',
    'Black',
    '10',
    'unisex',
    'running,trail,outdoor,athletic',
  ];

  return [headers.join(','), exampleRow.join(',')].join('\n');
}

/**
 * Validate CSV products for required fields
 */
export function validateCSVProducts(products: CSVProduct[]): {
  valid: CSVProduct[];
  errors: Array<{ row: number; product: CSVProduct; errors: string[] }>;
} {
  const valid: CSVProduct[] = [];
  const errors: Array<{ row: number; product: CSVProduct; errors: string[] }> = [];

  products.forEach((product, index) => {
    const productErrors: string[] = [];

    // Required fields
    if (!product.id) productErrors.push('Missing id');
    if (!product.title) productErrors.push('Missing title');
    if (!product.price || product.price <= 0) productErrors.push('Invalid price');

    // OpenAI spec recommended
    if (!product.gtin && !product.mpn) {
      productErrors.push('Missing both GTIN and MPN (at least one required)');
    }
    if (!product.brand) productErrors.push('Missing brand');
    if (!product.imageLink) productErrors.push('Missing image_link');

    if (productErrors.length > 0) {
      errors.push({ row: index + 2, product, errors: productErrors }); // +2 for header + 0-index
    } else {
      valid.push(product);
    }
  });

  return { valid, errors };
}
