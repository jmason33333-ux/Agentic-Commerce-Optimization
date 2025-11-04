# Unified Wizard Backend Implementation Plan

**Goal:** Complete self-service merchant onboarding for ChatGPT Shopping (Feed + Checkout)

**Duration:** 3-4 days backend development

---

## 🎯 Overview

This backend implementation supports an 8-step wizard that takes merchants from Shopify connection to fully configured ChatGPT Shopping in 5-10 minutes.

**Architecture:**
- **Database:** PostgreSQL with Prisma ORM
- **API:** tRPC endpoints
- **External APIs:** Shopify Admin API, OpenAI Commerce API, Stripe API
- **Authentication:** Shopify OAuth 2.0

---

## 📋 Table of Contents

1. [Database Schema Updates](#database-schema-updates)
2. [Shopify Integration](#shopify-integration)
3. [API Endpoints (tRPC Router)](#api-endpoints-trpc-router)
4. [Service Layer](#service-layer)
5. [Data Extraction & Mapping](#data-extraction--mapping)
6. [Validation Engine](#validation-engine)
7. [Implementation Checklist](#implementation-checklist)

---

## 1. Database Schema Updates

### 1.1 Workspace Model Additions

```prisma
model Workspace {
  // ... existing fields ...

  // Shopify Connection
  shopifyDomain       String?    @unique
  shopifyAccessToken  String?    // Encrypted
  shopifyConnectedAt  DateTime?
  shopifyLastSyncAt   DateTime?

  // Merchant Information (OpenAI Required)
  sellerName          String?
  sellerUrl           String?
  sellerPrivacyPolicy String?
  sellerTos           String?
  returnPolicy        String?    @db.Text
  returnWindow        Int?       // Days (e.g., 30)

  // OpenAI Merchant Application Status
  merchantApplicationStatus  String?  @default("not_started") // not_started, pending, approved, rejected
  merchantApplicationDate    DateTime?
  openaiApprovalDate         DateTime?

  // Wizard Progress
  wizardStep          Int?       @default(0)
  wizardCompleted     Boolean    @default(false)
  wizardCompletedAt   DateTime?

  // ... existing relations ...
}
```

### 1.2 Product Model Additions

```prisma
model Product {
  // ... existing fields ...

  // OpenAI Required Fields
  gtin                String?
  mpn                 String?
  brand               String?
  condition           String?    @default("new") // new, used, refurbished
  material            String?
  link                String?    // Product URL
  imageLink           String?
  additionalImageLinks Json?     // Array of image URLs
  availability        String?    // in_stock, out_of_stock, preorder, discontinued
  availabilityDate    DateTime?
  productCategory     String?

  // Physical Attributes
  weight              Decimal?   @db.Decimal(10, 2)
  weightUnit          String?    // lb, kg, oz, g
  dimensions          Json?      // {length, width, height, unit}

  // Variant Grouping
  itemGroupId         String?    // For variant grouping
  color               String?
  size                String?
  sizeSystem          String?    // US, UK, EU, etc.
  gender              String?    // male, female, unisex

  // Pricing
  salePrice           Decimal?   @db.Decimal(10, 2)
  salePriceEffectiveDate String?

  // Social Proof
  productReviewCount  Int?       @default(0)
  productReviewRating Decimal?   @db.Decimal(3, 2) // e.g., 4.5

  // Compliance Status
  isCompliant         Boolean    @default(false)
  missingFields       Json?      // Array of missing required fields
  complianceScore     Int?       @default(0) // 0-100

  // Shopify Sync
  shopifyProductId    String?    @unique
  shopifyVariantId    String?
  shopifyHandle       String?
  lastSyncedAt        DateTime?

  // ... existing fields ...
}
```

### 1.3 New Model: WizardProgress

```prisma
model WizardProgress {
  id          String   @id @default(cuid())
  workspaceId String   @unique
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  // Step Completion Status
  step0_merchantApplication Boolean @default(false)
  step1_shopifyConnection   Boolean @default(false)
  step2_storeInformation    Boolean @default(false)
  step3_productReview       Boolean @default(false)
  step4_feedSetup           Boolean @default(false)
  step5_stripeConnection    Boolean @default(false)
  step6_checkoutConfig      Boolean @default(false)
  step7_testing             Boolean @default(false)

  // Step Data (JSON storage for flexibility)
  step0_data Json?
  step1_data Json?
  step2_data Json?
  step3_data Json?
  step4_data Json?
  step5_data Json?
  step6_data Json?
  step7_data Json?

  currentStep Int      @default(0)
  completedAt DateTime?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("wizard_progress")
}
```

---

## 2. Shopify Integration

### 2.1 OAuth Flow

**File:** `src/lib/shopify/oauth.ts`

```typescript
import crypto from 'crypto';

interface ShopifyOAuthConfig {
  clientId: string;
  clientSecret: string;
  scopes: string[];
  redirectUri: string;
}

export class ShopifyOAuth {
  private config: ShopifyOAuthConfig;

  constructor(config: ShopifyOAuthConfig) {
    this.config = config;
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthUrl(shop: string): { url: string; state: string } {
    const state = crypto.randomBytes(16).toString('hex');
    const scopes = this.config.scopes.join(',');

    const url = `https://${shop}/admin/oauth/authorize?` +
      `client_id=${this.config.clientId}&` +
      `scope=${scopes}&` +
      `redirect_uri=${this.config.redirectUri}&` +
      `state=${state}`;

    return { url, state };
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(shop: string, code: string): Promise<string> {
    const response = await fetch(
      `https://${shop}/admin/oauth/access_token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code,
        }),
      }
    );

    const data = await response.json();
    return data.access_token;
  }

  /**
   * Verify Shopify webhook signature
   */
  verifyWebhook(data: string, hmacHeader: string): boolean {
    const hash = crypto
      .createHmac('sha256', this.config.clientSecret)
      .update(data, 'utf8')
      .digest('base64');

    return hash === hmacHeader;
  }
}

// Required Shopify scopes
export const SHOPIFY_SCOPES = [
  'read_products',
  'write_products',
  'read_product_listings',
  'read_inventory',
  'read_locations',
  'read_shop_metadata',
];
```

### 2.2 Shopify API Client

**File:** `src/lib/shopify/client.ts`

```typescript
interface ShopifyProduct {
  id: string;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  handle: string;
  published_at: string;
  variants: ShopifyVariant[];
  images: ShopifyImage[];
  tags: string;
}

interface ShopifyVariant {
  id: string;
  product_id: string;
  title: string;
  price: string;
  sku: string;
  barcode: string;
  weight: number;
  weight_unit: string;
  inventory_quantity: number;
  option1: string;
  option2: string;
  option3: string;
}

interface ShopifyImage {
  id: string;
  product_id: string;
  src: string;
  alt: string;
}

interface ShopifyShop {
  id: string;
  name: string;
  domain: string;
  email: string;
  phone: string;
  address1: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  currency: string;
  money_format: string;
  policy: {
    privacy_policy: { url: string };
    terms_of_service: { url: string };
    refund_policy: { body: string };
  };
}

export class ShopifyClient {
  private shop: string;
  private accessToken: string;
  private apiVersion = '2024-01';

  constructor(shop: string, accessToken: string) {
    this.shop = shop;
    this.accessToken = accessToken;
  }

  /**
   * Make authenticated request to Shopify Admin API
   */
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `https://${this.shop}/admin/api/${this.apiVersion}/${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get shop information
   */
  async getShop(): Promise<ShopifyShop> {
    const data = await this.request<{ shop: ShopifyShop }>('shop.json');
    return data.shop;
  }

  /**
   * Get all products (paginated)
   */
  async getAllProducts(): Promise<ShopifyProduct[]> {
    let products: ShopifyProduct[] = [];
    let hasNextPage = true;
    let pageInfo: string | null = null;

    while (hasNextPage) {
      const endpoint = pageInfo
        ? `products.json?limit=250&page_info=${pageInfo}`
        : 'products.json?limit=250';

      const response = await fetch(
        `https://${this.shop}/admin/api/${this.apiVersion}/${endpoint}`,
        {
          headers: {
            'X-Shopify-Access-Token': this.accessToken,
          },
        }
      );

      const data = await response.json();
      products = products.concat(data.products);

      // Check for pagination
      const linkHeader = response.headers.get('Link');
      if (linkHeader && linkHeader.includes('rel="next"')) {
        const match = linkHeader.match(/<[^>]*page_info=([^>&]*)>; rel="next"/);
        pageInfo = match ? match[1] : null;
        hasNextPage = !!pageInfo;
      } else {
        hasNextPage = false;
      }
    }

    return products;
  }

  /**
   * Get product by ID
   */
  async getProduct(productId: string): Promise<ShopifyProduct> {
    const data = await this.request<{ product: ShopifyProduct }>(
      `products/${productId}.json`
    );
    return data.product;
  }

  /**
   * Update product
   */
  async updateProduct(productId: string, updates: Partial<ShopifyProduct>): Promise<ShopifyProduct> {
    const data = await this.request<{ product: ShopifyProduct }>(
      `products/${productId}.json`,
      {
        method: 'PUT',
        body: JSON.stringify({ product: updates }),
      }
    );
    return data.product;
  }
}
```

---

## 3. API Endpoints (tRPC Router)

### 3.1 Wizard Router

**File:** `src/server/api/routers/wizard.ts`

```typescript
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const wizardRouter = createTRPCRouter({
  /**
   * Get wizard progress for current workspace
   */
  getProgress: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = ctx.session.user.workspaceId;

    const progress = await ctx.db.wizardProgress.findUnique({
      where: { workspaceId },
      include: {
        workspace: {
          select: {
            shopifyDomain: true,
            sellerName: true,
            merchantApplicationStatus: true,
            wizardCompleted: true,
          },
        },
      },
    });

    if (!progress) {
      // Create initial progress record
      return await ctx.db.wizardProgress.create({
        data: {
          workspaceId,
          currentStep: 0,
        },
      });
    }

    return progress;
  }),

  /**
   * Update wizard step progress
   */
  updateStep: protectedProcedure
    .input(
      z.object({
        step: z.number().min(0).max(7),
        completed: z.boolean(),
        data: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const workspaceId = ctx.session.user.workspaceId;

      const fieldName = `step${input.step}_completed` as any;
      const dataFieldName = `step${input.step}_data` as any;

      return await ctx.db.wizardProgress.update({
        where: { workspaceId },
        data: {
          [fieldName]: input.completed,
          [dataFieldName]: input.data,
          currentStep: input.step,
          ...(input.step === 7 && input.completed
            ? {
                completedAt: new Date(),
                workspace: {
                  update: {
                    wizardCompleted: true,
                    wizardCompletedAt: new Date(),
                  },
                },
              }
            : {}),
        },
      });
    }),

  /**
   * STEP 0: Check merchant application status
   */
  checkMerchantApplication: protectedProcedure.query(async ({ ctx }) => {
    const workspace = await ctx.db.workspace.findUnique({
      where: { id: ctx.session.user.workspaceId },
      select: {
        merchantApplicationStatus: true,
        merchantApplicationDate: true,
        openaiApprovalDate: true,
      },
    });

    return workspace;
  }),

  /**
   * STEP 0: Update merchant application status
   */
  updateMerchantApplication: protectedProcedure
    .input(
      z.object({
        status: z.enum(['not_started', 'pending', 'approved', 'rejected']),
        applicationDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.workspace.update({
        where: { id: ctx.session.user.workspaceId },
        data: {
          merchantApplicationStatus: input.status,
          merchantApplicationDate: input.applicationDate,
        },
      });
    }),

  /**
   * STEP 1: Initiate Shopify OAuth
   */
  initiateShopifyOAuth: protectedProcedure
    .input(z.object({ shop: z.string() }))
    .mutation(async ({ input }) => {
      const oauth = new ShopifyOAuth({
        clientId: process.env.SHOPIFY_CLIENT_ID!,
        clientSecret: process.env.SHOPIFY_CLIENT_SECRET!,
        scopes: SHOPIFY_SCOPES,
        redirectUri: process.env.SHOPIFY_REDIRECT_URI!,
      });

      const { url, state } = oauth.getAuthUrl(input.shop);

      // Store state in session/database for verification
      // Implementation depends on your session management

      return { authUrl: url, state };
    }),

  /**
   * STEP 1: Complete Shopify OAuth & import data
   */
  completeShopifyOAuth: protectedProcedure
    .input(
      z.object({
        shop: z.string(),
        code: z.string(),
        state: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Exchange code for access token
      const oauth = new ShopifyOAuth({
        clientId: process.env.SHOPIFY_CLIENT_ID!,
        clientSecret: process.env.SHOPIFY_CLIENT_SECRET!,
        scopes: SHOPIFY_SCOPES,
        redirectUri: process.env.SHOPIFY_REDIRECT_URI!,
      });

      const accessToken = await oauth.getAccessToken(input.shop, input.code);

      // Encrypt access token before storing
      const encryptedToken = encryptString(accessToken);

      // Save to workspace
      await ctx.db.workspace.update({
        where: { id: ctx.session.user.workspaceId },
        data: {
          shopifyDomain: input.shop,
          shopifyAccessToken: encryptedToken,
          shopifyConnectedAt: new Date(),
        },
      });

      // Fetch shop info and products
      const client = new ShopifyClient(input.shop, accessToken);
      const shopInfo = await client.getShop();
      const products = await client.getAllProducts();

      // Import shop information
      await ctx.db.workspace.update({
        where: { id: ctx.session.user.workspaceId },
        data: {
          sellerName: shopInfo.name,
          sellerUrl: `https://${shopInfo.domain}`,
          sellerPrivacyPolicy: shopInfo.policy?.privacy_policy?.url,
          sellerTos: shopInfo.policy?.terms_of_service?.url,
          returnPolicy: shopInfo.policy?.refund_policy?.body,
        },
      });

      // Import products (run in background)
      await importShopifyProducts(ctx.db, ctx.session.user.workspaceId, products);

      return {
        success: true,
        productsImported: products.length,
        shopInfo: {
          name: shopInfo.name,
          domain: shopInfo.domain,
        },
      };
    }),

  /**
   * STEP 2: Update store information
   */
  updateStoreInfo: protectedProcedure
    .input(
      z.object({
        sellerName: z.string(),
        sellerUrl: z.string().url(),
        sellerPrivacyPolicy: z.string().url(),
        sellerTos: z.string().url(),
        returnPolicy: z.string(),
        returnWindow: z.number().int().min(0).max(365),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.workspace.update({
        where: { id: ctx.session.user.workspaceId },
        data: input,
      });
    }),

  /**
   * STEP 3: Get product readiness summary
   */
  getProductReadiness: protectedProcedure.query(async ({ ctx }) => {
    const products = await ctx.db.product.findMany({
      where: {
        workspaceId: ctx.session.user.workspaceId,
        status: 'ready',
      },
      select: {
        id: true,
        title: true,
        price: true,
        isCompliant: true,
        missingFields: true,
        complianceScore: true,
        enableSearch: true,
        enableCheckout: true,
        imageUrl: true,
      },
    });

    const ready = products.filter((p) => p.isCompliant);
    const incomplete = products.filter((p) => !p.isCompliant);

    return {
      total: products.length,
      ready: ready.length,
      incomplete: incomplete.length,
      products: products.map((p) => ({
        ...p,
        canEnable: p.isCompliant,
      })),
    };
  }),

  /**
   * STEP 3: Toggle product for search/checkout
   */
  toggleProduct: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        enableSearch: z.boolean().optional(),
        enableCheckout: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.db.product.findUnique({
        where: { id: input.productId },
      });

      if (!product?.isCompliant) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot enable incomplete product',
        });
      }

      return await ctx.db.product.update({
        where: { id: input.productId },
        data: {
          enableSearch: input.enableSearch ?? product.enableSearch,
          enableCheckout: input.enableCheckout ?? product.enableCheckout,
        },
      });
    }),

  /**
   * STEP 4: Configure OpenAI feed (covered by existing feed router)
   * See: src/server/api/routers/feed.ts
   */

  /**
   * STEP 5: Configure Stripe (covered by existing checkout router)
   * See: src/server/api/routers/checkout.ts
   */

  /**
   * STEP 6: Configure checkout (covered by existing checkout router)
   * See: src/server/api/routers/checkout.ts
   */

  /**
   * STEP 7: Run setup tests
   */
  runSetupTests: protectedProcedure.mutation(async ({ ctx }) => {
    const workspace = await ctx.db.workspace.findUnique({
      where: { id: ctx.session.user.workspaceId },
      include: {
        checkoutConfig: true,
      },
    });

    const results = {
      shopifyConnection: false,
      storeInfo: false,
      productsReady: false,
      feedConfiguration: false,
      stripeConnection: false,
      checkoutEndpoints: false,
      openaiRegistration: false,
    };

    // Test 1: Shopify connection
    if (workspace?.shopifyAccessToken && workspace?.shopifyDomain) {
      try {
        const client = new ShopifyClient(
          workspace.shopifyDomain,
          decryptString(workspace.shopifyAccessToken)
        );
        await client.getShop();
        results.shopifyConnection = true;
      } catch (error) {
        console.error('Shopify connection test failed:', error);
      }
    }

    // Test 2: Store information complete
    results.storeInfo = !!(
      workspace?.sellerName &&
      workspace?.sellerUrl &&
      workspace?.sellerPrivacyPolicy &&
      workspace?.sellerTos &&
      workspace?.returnWindow
    );

    // Test 3: Products ready
    const readyProducts = await ctx.db.product.count({
      where: {
        workspaceId: ctx.session.user.workspaceId,
        isCompliant: true,
        OR: [{ enableSearch: true }, { enableCheckout: true }],
      },
    });
    results.productsReady = readyProducts > 0;

    // Test 4: Feed configuration
    results.feedConfiguration = !!(
      workspace?.openaiMerchantId && workspace?.openaiApiKey
    );

    // Test 5: Stripe connection
    if (workspace?.checkoutConfig) {
      results.stripeConnection = !!(
        workspace.checkoutConfig.stripePublishableKey &&
        workspace.checkoutConfig.stripeSecretKey
      );
    }

    // Test 6: Checkout endpoints
    results.checkoutEndpoints = !!workspace?.checkoutConfig?.checkoutUrl;

    // Test 7: OpenAI registration
    results.openaiRegistration =
      !!workspace?.checkoutConfig?.openaiCheckoutId;

    return results;
  }),
});
```

---

## 4. Service Layer

### 4.1 Product Import Service

**File:** `src/lib/services/shopifyImport.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { ShopifyProduct, ShopifyVariant } from '../shopify/client';

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
          shopifyProductId: shopifyProduct.id,
        },
      });

      if (existing) {
        // Update existing
        await db.product.update({
          where: { id: existing.id },
          data: {
            ...productData,
            lastSyncedAt: new Date(),
          },
        });
      } else {
        // Create new
        await db.product.create({
          data: {
            ...productData,
            workspaceId,
            shopifyProductId: shopifyProduct.id,
            lastSyncedAt: new Date(),
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
function mapShopifyProduct(shopifyProduct: ShopifyProduct): any {
  const mainVariant = shopifyProduct.variants[0];
  const hasMultipleVariants = shopifyProduct.variants.length > 1;

  return {
    // Basic fields
    title: shopifyProduct.title,
    description: shopifyProduct.body_html,
    shopifyHandle: shopifyProduct.handle,
    status: shopifyProduct.published_at ? 'ready' : 'draft',

    // OpenAI required fields
    gtin: mainVariant?.barcode || null,
    mpn: mainVariant?.sku || null,
    brand: shopifyProduct.vendor || null,
    condition: 'new',
    link: `https://${shopifyProduct.handle}`, // Will be updated with actual domain
    imageLink: shopifyProduct.images[0]?.src || null,
    additionalImageLinks: shopifyProduct.images.slice(1).map((img) => img.src),
    productCategory: shopifyProduct.product_type || null,

    // Pricing
    price: mainVariant?.price || '0',
    currency: 'USD', // Should be fetched from shop info

    // Inventory
    availability: mapAvailability(mainVariant?.inventory_quantity || 0),
    inventoryQuantity: mainVariant?.inventory_quantity || 0,

    // Physical attributes
    weight: mainVariant?.weight || null,
    weightUnit: mainVariant?.weight_unit || null,

    // Variants
    itemGroupId: hasMultipleVariants ? shopifyProduct.handle : null,
    variants: shopifyProduct.variants,

    // Images
    imageUrl: shopifyProduct.images[0]?.src || null,

    // Tags
    tags: shopifyProduct.tags,

    // Variant options (from first variant)
    color: mainVariant?.option1 || null,
    size: mainVariant?.option2 || null,
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
```

### 4.2 Product Compliance Service

**File:** `src/lib/services/productCompliance.ts`

```typescript
import { PrismaClient, Product } from '@prisma/client';

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
] as const;

/**
 * OpenAI requires EITHER gtin OR mpn
 */
const REQUIRED_ONE_OF = [['gtin', 'mpn']] as const;

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
  for (const fieldGroup of REQUIRED_ONE_OF) {
    const hasAny = fieldGroup.some((field) => product[field as keyof Product]);
    if (!hasAny) {
      missingFields.push(fieldGroup.join(' OR '));
    }
  }

  // Calculate compliance score
  const totalRequiredFields = REQUIRED_FIELDS.length + REQUIRED_ONE_OF.length;
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
 * Update compliance status for all products in workspace
 */
export async function updateProductCompliance(
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
        isCompliant: compliance.isCompliant,
        missingFields: compliance.missingFields,
        complianceScore: compliance.complianceScore,
      },
    });
  }
}
```

---

## 5. Data Extraction & Mapping

### 5.1 Shopify to OpenAI Field Mapping

| Shopify Field | OpenAI Field | Extraction Logic |
|--------------|--------------|------------------|
| `title` | `title` | Direct mapping |
| `body_html` | `description` | Direct mapping (strip HTML if needed) |
| `vendor` | `brand` | Direct mapping |
| `product_type` | `product_category` | Direct mapping |
| `variants[0].barcode` | `gtin` | Use first variant's barcode |
| `variants[0].sku` | `mpn` | Fallback if no GTIN |
| `images[0].src` | `imageLink` | First image |
| `images[1+].src` | `additionalImageLinks` | Additional images as array |
| `variants[0].price` | `price` | First variant price |
| `variants[0].weight` | `weight` | First variant weight |
| `variants[0].weight_unit` | `weightUnit` | First variant weight unit |
| `variants[0].inventory_quantity` | `availability` | Map to enum: in_stock/out_of_stock |
| `handle` | Part of `link` | Construct product URL |
| `variants` (if > 1) | `itemGroupId` | Use `handle` as group ID |
| `variants[].option1` | `color` | First option (if color-related) |
| `variants[].option2` | `size` | Second option (if size-related) |

### 5.2 Missing Field Inference

For fields not available in Shopify:

```typescript
/**
 * Infer missing fields from available data
 */
export function inferMissingFields(product: Partial<Product>): Partial<Product> {
  const updates: Partial<Product> = {};

  // Infer condition (default to "new" for most Shopify stores)
  if (!product.condition) {
    updates.condition = 'new';
  }

  // Infer material from title/description
  if (!product.material && product.description) {
    const materials = ['leather', 'cotton', 'polyester', 'silk', 'wool', 'metal', 'plastic'];
    const found = materials.find((m) =>
      product.description?.toLowerCase().includes(m)
    );
    if (found) {
      updates.material = found.charAt(0).toUpperCase() + found.slice(1);
    }
  }

  // Infer gender from title/tags
  if (!product.gender && (product.title || product.tags)) {
    const text = `${product.title} ${product.tags}`.toLowerCase();
    if (text.includes('men') && !text.includes('women')) {
      updates.gender = 'male';
    } else if (text.includes('women') && !text.includes('men')) {
      updates.gender = 'female';
    } else {
      updates.gender = 'unisex';
    }
  }

  return updates;
}
```

---

## 6. Validation Engine

### 6.1 Wizard Step Validators

```typescript
/**
 * Validate each wizard step before allowing progression
 */

export const wizardStepValidators = {
  step0: (data: any) => {
    // Merchant application - optional but recommended
    return {
      valid: true,
      warnings: data.status !== 'approved'
        ? ['Merchant application not yet approved. You can configure now and submit later.']
        : [],
    };
  },

  step1: async (workspaceId: string, db: PrismaClient) => {
    // Shopify connection
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      select: { shopifyDomain: true, shopifyAccessToken: true },
    });

    return {
      valid: !!(workspace?.shopifyDomain && workspace?.shopifyAccessToken),
      errors: !workspace?.shopifyDomain
        ? ['Shopify store not connected']
        : [],
    };
  },

  step2: async (workspaceId: string, db: PrismaClient) => {
    // Store information
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        sellerName: true,
        sellerUrl: true,
        sellerPrivacyPolicy: true,
        sellerTos: true,
        returnWindow: true,
      },
    });

    const errors = [];
    if (!workspace?.sellerName) errors.push('Store name required');
    if (!workspace?.sellerUrl) errors.push('Store URL required');
    if (!workspace?.sellerPrivacyPolicy) errors.push('Privacy policy URL required');
    if (!workspace?.sellerTos) errors.push('Terms of service URL required');
    if (!workspace?.returnWindow) errors.push('Return window required');

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  step3: async (workspaceId: string, db: PrismaClient) => {
    // Product review
    const enabledCount = await db.product.count({
      where: {
        workspaceId,
        isCompliant: true,
        OR: [{ enableSearch: true }, { enableCheckout: true }],
      },
    });

    return {
      valid: enabledCount > 0,
      errors: enabledCount === 0
        ? ['At least one compliant product must be enabled']
        : [],
      warnings: enabledCount < 5
        ? ['Consider enabling more products for better visibility']
        : [],
    };
  },

  step4: async (workspaceId: string, db: PrismaClient) => {
    // OpenAI feed setup
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      select: { openaiMerchantId: true, openaiApiKey: true },
    });

    return {
      valid: true, // Optional - can submit later
      warnings: !(workspace?.openaiMerchantId && workspace?.openaiApiKey)
        ? ['OpenAI credentials not configured - you can submit feed later']
        : [],
    };
  },

  step5: async (workspaceId: string, db: PrismaClient) => {
    // Stripe connection
    const config = await db.checkoutConfig.findUnique({
      where: { workspaceId },
      select: {
        stripePublishableKey: true,
        stripeSecretKey: true,
        stripeWebhookSecret: true,
      },
    });

    return {
      valid: !!(
        config?.stripePublishableKey &&
        config?.stripeSecretKey &&
        config?.stripeWebhookSecret
      ),
      errors: !config
        ? ['Stripe not configured']
        : [],
    };
  },

  step6: async (workspaceId: string, db: PrismaClient) => {
    // Checkout configuration
    const config = await db.checkoutConfig.findUnique({
      where: { workspaceId },
      select: { checkoutUrl: true, webhookUrl: true },
    });

    return {
      valid: !!(config?.checkoutUrl && config?.webhookUrl),
      errors: !config?.checkoutUrl
        ? ['Checkout endpoints not configured']
        : [],
    };
  },

  step7: async (workspaceId: string, db: PrismaClient) => {
    // Final validation - all previous steps
    const results = await Promise.all([
      wizardStepValidators.step1(workspaceId, db),
      wizardStepValidators.step2(workspaceId, db),
      wizardStepValidators.step3(workspaceId, db),
      wizardStepValidators.step5(workspaceId, db),
      wizardStepValidators.step6(workspaceId, db),
    ]);

    const allErrors = results.flatMap((r) => r.errors || []);
    const allWarnings = results.flatMap((r) => r.warnings || []);

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
    };
  },
};
```

---

## 7. Implementation Checklist

### Phase 1: Database & Core Infrastructure (Day 1)

- [ ] Update Prisma schema with new fields
- [ ] Run migrations: `npx prisma migrate dev`
- [ ] Create `WizardProgress` model
- [ ] Update `Workspace` model with Shopify + merchant fields
- [ ] Update `Product` model with OpenAI compliance fields
- [ ] Set up encryption utilities for Shopify access token

### Phase 2: Shopify Integration (Day 1-2)

- [ ] Create Shopify OAuth client (`src/lib/shopify/oauth.ts`)
- [ ] Create Shopify API client (`src/lib/shopify/client.ts`)
- [ ] Implement OAuth flow endpoints
- [ ] Test Shopify connection with dev store
- [ ] Implement product import service
- [ ] Add Shopify webhook handlers (products/update, products/delete)

### Phase 3: Wizard API Endpoints (Day 2-3)

- [ ] Create `wizardRouter` with all endpoints
- [ ] Implement `getProgress` query
- [ ] Implement `updateStep` mutation
- [ ] Implement Shopify connection endpoints
- [ ] Implement store info update endpoint
- [ ] Implement product readiness endpoint
- [ ] Implement product toggle endpoint
- [ ] Implement setup tests endpoint

### Phase 4: Compliance & Validation (Day 3)

- [ ] Create product compliance service
- [ ] Implement `checkProductCompliance` function
- [ ] Implement `updateProductCompliance` function
- [ ] Create field inference utilities
- [ ] Implement wizard step validators
- [ ] Add compliance scoring algorithm

### Phase 5: Integration & Testing (Day 4)

- [ ] Test full wizard flow end-to-end
- [ ] Test Shopify OAuth with test store
- [ ] Verify product import and mapping
- [ ] Test compliance checking
- [ ] Test product toggle restrictions
- [ ] Verify all validation rules
- [ ] Load test with 1000+ products

### Phase 6: Documentation (Day 4)

- [ ] Document all API endpoints
- [ ] Create integration guide for Cursor
- [ ] Document Shopify webhook setup
- [ ] Create troubleshooting guide

---

## 🔐 Security Considerations

### Environment Variables Required

```env
# Shopify OAuth
SHOPIFY_CLIENT_ID=your_client_id
SHOPIFY_CLIENT_SECRET=your_client_secret
SHOPIFY_REDIRECT_URI=https://yourdomain.com/api/auth/shopify/callback

# Shopify API
SHOPIFY_API_VERSION=2024-01

# Encryption (for storing Shopify access tokens)
ENCRYPTION_KEY=your_32_character_encryption_key
```

### Token Encryption

```typescript
import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;
const IV_LENGTH = 16;

export function encryptString(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decryptString(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift()!, 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
```

---

## 📊 Performance Considerations

### Product Import Optimization

```typescript
/**
 * Import products in batches to avoid memory issues
 */
async function importProductsInBatches(
  db: PrismaClient,
  workspaceId: string,
  products: ShopifyProduct[],
  batchSize = 50
) {
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    await Promise.all(
      batch.map((product) =>
        importSingleProduct(db, workspaceId, product)
      )
    );
  }
}
```

### Database Indexing

```prisma
model Product {
  // ... fields ...

  @@index([workspaceId, isCompliant])
  @@index([workspaceId, enableSearch])
  @@index([workspaceId, enableCheckout])
  @@index([shopifyProductId])
  @@index([complianceScore])
}

model Workspace {
  // ... fields ...

  @@index([shopifyDomain])
}
```

---

## ✅ Success Criteria

Backend is ready for frontend integration when:

- [ ] All 8 wizard steps have functional API endpoints
- [ ] Shopify OAuth flow works end-to-end
- [ ] Products import correctly from Shopify
- [ ] Compliance checking works accurately
- [ ] All validation rules enforce correctly
- [ ] Tests pass with 1000+ products
- [ ] Response times < 200ms for most endpoints
- [ ] Documentation complete for Cursor integration

---

**Next Steps:** Once backend is complete, proceed to v0 prompt creation for frontend wizard components.
