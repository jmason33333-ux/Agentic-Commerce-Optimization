import { db } from "@/lib/db";
import { JobType, JobStatus } from "@prisma/client";
import { fetchShopifyProducts } from "@/lib/shopify";
import { generateContentHash, calculateSeoScore } from "@/lib/utils";
import { getLLMProvider, ProductInput } from "@/lib/llm";
import { calculateOptimizationScore, getProductStatus } from "@/lib/optimization";

const MAX_PRODUCTS_PER_RUN = Number(process.env.MAX_PRODUCTS_PER_RUN) || 500;
const BATCH_SIZE = Number(process.env.BATCH_SIZE) || 50;
const BATCH_CONCURRENCY = Number(process.env.BATCH_CONCURRENCY) || 3;

/**
 * Maps Shopify product to OpenAI Commerce Feed spec fields
 */
function mapShopifyToOpenAI(shopifyProduct: any, workspace: any) {
  const variant = shopifyProduct.variants[0];
  const hasMultipleVariants = shopifyProduct.variants.length > 1;

  // Extract color/size from options
  let color: string | undefined;
  let size: string | undefined;
  if (shopifyProduct.options) {
    for (const opt of shopifyProduct.options) {
      if (opt.name.toLowerCase().includes("color") || opt.name.toLowerCase().includes("colour")) {
        color = opt.values?.[0];
      }
      if (opt.name.toLowerCase().includes("size")) {
        size = opt.values?.[0];
      }
    }
  }

  // Build product URL
  const handle = shopifyProduct.handle || shopifyProduct.id.toString();
  const link = workspace.shopDomain
    ? `https://${workspace.shopDomain}/products/${handle}`
    : null;

  // Determine availability
  const inventoryQty = variant?.inventory_quantity || 0;
  const availability =
    inventoryQty > 0
      ? "in_stock"
      : inventoryQty === 0
      ? "out_of_stock"
      : "in_stock";

  // Extract images
  const imageLink = shopifyProduct.images?.[0]?.src;
  const additionalImageLinks = shopifyProduct.images
    ?.slice(1)
    .map((img: any) => img.src);

  return {
    // OpenAI Flags
    enableSearch: true,
    enableCheckout: false, // Set to true once merchant configures ACP

    // Basic Product Data
    title: shopifyProduct.title,
    description: shopifyProduct.body_html,
    link,
    gtin: variant?.barcode || null, // Shopify barcode often contains GTIN
    mpn: variant?.sku || null, // SKU often serves as MPN

    // Item Information
    condition: "new", // Default
    productCategory: shopifyProduct.product_type,
    brand: shopifyProduct.vendor,
    material: null, // TODO: Extract from tags or metafields
    weight: variant?.weight ? parseFloat(variant.weight) : null,
    weightUnit: variant?.weight_unit || null,

    // Media
    imageLink,
    additionalImageLinks: additionalImageLinks?.length
      ? additionalImageLinks
      : null,

    // Price
    price: variant?.price ? parseFloat(variant.price) : null,
    currency: workspace.currency || "USD",
    salePrice: variant?.compare_at_price
      ? parseFloat(variant?.compare_at_price) < parseFloat(variant?.price)
        ? null
        : parseFloat(variant?.compare_at_price)
      : null,

    // Availability
    availability,
    inventoryQuantity: inventoryQty,

    // Variants
    itemGroupId: hasMultipleVariants
      ? shopifyProduct.id.toString()
      : null,
    color,
    size,
    sizeSystem: "US", // Default, could be detected from shop location

    // Legacy fields (keep for compatibility)
    vendor: shopifyProduct.vendor,
    productType: shopifyProduct.product_type,
    tags: shopifyProduct.tags
      ? shopifyProduct.tags.split(",").map((t: string) => t.trim())
      : [],
    images: shopifyProduct.images?.map((img: any) => img.src),
  };
}

export async function processProductSync(jobId: string) {
  const job = await db.job.findUnique({
    where: { id: jobId },
    include: { workspace: true },
  });

  if (!job) throw new Error("Job not found");

  try {
    await db.job.update({
      where: { id: jobId },
      data: { status: JobStatus.RUNNING, startedAt: new Date() },
    });

    const { workspace } = job;
    if (!workspace.shopDomain || !workspace.shopAccessToken) {
      throw new Error("Workspace not connected to Shopify");
    }

    const products = await fetchShopifyProducts({
      shopDomain: workspace.shopDomain,
      accessToken: workspace.shopAccessToken,
    });

    await db.job.update({
      where: { id: jobId },
      data: { totalItems: products.length },
    });

    let processed = 0;
    for (const shopifyProduct of products) {
      const mappedProduct = mapShopifyToOpenAI(shopifyProduct, workspace);

      const contentHash = generateContentHash({
        title: mappedProduct.title,
        description: mappedProduct.description,
        tags: mappedProduct.tags,
        price: mappedProduct.price,
        inventory: mappedProduct.inventoryQuantity,
      });

      const product = await db.product.upsert({
        where: {
          workspaceId_sourceId: {
            workspaceId: workspace.id,
            sourceId: shopifyProduct.id.toString(),
          },
        },
        create: {
          workspaceId: workspace.id,
          sourceId: shopifyProduct.id.toString(),
          ...mappedProduct,
          contentHash,
          rawSource: shopifyProduct,
        },
        update: {
          ...mappedProduct,
          contentHash,
          rawSource: shopifyProduct,
          updatedAt: new Date(),
        },
      });

      // Recalculate optimization score (Critical Decision #2 - sync trigger)
      const scoreBreakdown = calculateOptimizationScore(product);
      const hasPendingSuggestions = await db.suggestion.count({
        where: {
          productId: product.id,
          status: { in: ["PENDING", "APPROVED"] },
        },
      }) > 0;

      const status = getProductStatus(
        product,
        scoreBreakdown.level,
        hasPendingSuggestions
      );

      // Update product with optimization score
      await db.product.update({
        where: { id: product.id },
        data: {
          optimizationScore: scoreBreakdown.total,
          optimizationLevel: scoreBreakdown.level,
          scoreBreakdown: scoreBreakdown as any,
          status,
          lastScoreCalculation: new Date(),
        },
      });

      processed++;
      if (processed % 10 === 0) {
        await db.job.update({
          where: { id: jobId },
          data: {
            processedItems: processed,
            progress: Math.floor((processed / products.length) * 100),
          },
        });
      }
    }

    await db.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.COMPLETED,
        processedItems: processed,
        progress: 100,
        completedAt: new Date(),
        result: { productsSync: processed },
      },
    });
  } catch (error: any) {
    console.error("Product sync error:", error);
    await db.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.FAILED,
        error: error.message,
        completedAt: new Date(),
      },
    });
    throw error;
  }
}

export async function processAuditRun(jobId: string) {
  const job = await db.job.findUnique({
    where: { id: jobId },
    include: { workspace: true },
  });

  if (!job) throw new Error("Job not found");

  try {
    await db.job.update({
      where: { id: jobId },
      data: { status: JobStatus.RUNNING, startedAt: new Date() },
    });

    const products = await db.product.findMany({
      where: { workspaceId: job.workspaceId },
      take: MAX_PRODUCTS_PER_RUN,
      orderBy: { updatedAt: "desc" },
    });

    await db.job.update({
      where: { id: jobId },
      data: { totalItems: products.length },
    });

    const llmProvider = getLLMProvider();
    let processed = 0;

    // Process in batches
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (product) => {
          // Run OpenAI spec-compliant rule checks
          const issues = runOpenAISpecChecks(product, job.workspace);

          // Try LLM suggestions
          let llmSuggestions: any[] = [];
          try {
            const productInput: ProductInput = {
              title: product.title,
              description: product.description || undefined,
              price: product.price ? Number(product.price) : undefined,
              currency: product.currency,
              inventory: product.inventoryQuantity || 0,
              tags: product.tags as string[] | undefined,
              images: product.images as string[] | undefined,
              vendor: product.vendor || undefined,
              productType: product.productType || undefined,
              instantCheckoutEnabled: product.enableCheckout,
            };

            llmSuggestions = await llmProvider.generateSuggestions(productInput);
          } catch (err) {
            console.warn("LLM failed for product", product.id, err);
          }

          // Create suggestions from LLM
          for (const suggestion of llmSuggestions) {
            await db.suggestion.create({
              data: {
                workspaceId: job.workspaceId,
                productId: product.id,
                issueType: suggestion.issue_type,
                aiPayload: suggestion.proposed_change,
                riskLevel: suggestion.risk_level.toUpperCase() as any,
              },
            });
          }

          // Calculate SEO score
          const seoScore = calculateSeoScore(issues);

          // Create audit result
          await db.auditResult.create({
            data: {
              productId: product.id,
              seoScore,
              issues,
            },
          });

          processed++;
        })
      );

      await db.job.update({
        where: { id: jobId },
        data: {
          processedItems: processed,
          progress: Math.floor((processed / products.length) * 100),
        },
      });
    }

    await db.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.COMPLETED,
        processedItems: processed,
        progress: 100,
        completedAt: new Date(),
        result: { productsAudited: processed },
      },
    });
  } catch (error: any) {
    console.error("Audit run error:", error);
    await db.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.FAILED,
        error: error.message,
        completedAt: new Date(),
      },
    });
    throw error;
  }
}

/**
 * OpenAI Commerce Feed Specification compliant audit rules
 * Based on: https://developers.openai.com/commerce/specs/feed
 */
function runOpenAISpecChecks(product: any, workspace: any): any[] {
  const issues: any[] = [];

  // ===== CRITICAL - OpenAI Flags (REQUIRED) =====
  if (!product.enableSearch) {
    issues.push({
      issue_type: "search_disabled",
      severity: "critical",
      message: "Product will not appear in ChatGPT search",
      spec_ref: "OpenAI Flags - enable_search Required",
    });
  }

  if (!product.enableCheckout) {
    issues.push({
      issue_type: "checkout_disabled",
      severity: "high",
      message: "Instant checkout disabled - products rank lower",
      spec_ref: "OpenAI Flags - enable_checkout Recommended",
    });
  }

  // ===== CRITICAL - Basic Product Data (REQUIRED) =====
  if (!product.link) {
    issues.push({
      issue_type: "missing_link",
      severity: "critical",
      message: "Product page URL required",
      spec_ref: "Basic Product Data - link Required",
    });
  }

  if (!product.gtin && !product.mpn) {
    issues.push({
      issue_type: "missing_identifiers",
      severity: "critical",
      message: "Either GTIN or MPN required",
      spec_ref: "Basic Product Data - gtin/mpn Required",
    });
  }

  if (!product.title || product.title.length < 10) {
    issues.push({
      issue_type: "title_too_short",
      severity: "critical",
      message: "Title must be at least 10 characters",
      spec_ref: "Basic Product Data - title Required (max 150 chars)",
    });
  }

  if (!product.description || product.description.length < 50) {
    issues.push({
      issue_type: "thin_description",
      severity: "high",
      message: "Description should be 200+ chars with audience/use cases",
      spec_ref: "Basic Product Data - description Required (max 5000 chars)",
    });
  }

  // ===== CRITICAL - Item Information (REQUIRED) =====
  if (!product.brand) {
    issues.push({
      issue_type: "missing_brand",
      severity: "critical",
      message: "Brand required (except movies/books/music)",
      spec_ref: "Item Information - brand Required",
    });
  }

  if (!product.weight || !product.weightUnit) {
    issues.push({
      issue_type: "missing_weight",
      severity: "critical",
      message: "Weight with unit required",
      spec_ref: "Item Information - weight Required",
    });
  }

  if (!product.material) {
    issues.push({
      issue_type: "missing_material",
      severity: "high",
      message: "Material required for most products",
      spec_ref: "Item Information - material Required",
    });
  }

  if (!product.productCategory) {
    issues.push({
      issue_type: "missing_category",
      severity: "critical",
      message: "Product category required",
      spec_ref: "Item Information - product_category Required",
    });
  }

  // ===== CRITICAL - Media (REQUIRED) =====
  if (!product.imageLink) {
    issues.push({
      issue_type: "missing_image",
      severity: "critical",
      message: "Primary image required",
      spec_ref: "Media - image_link Required",
    });
  }

  // ===== CRITICAL - Price (REQUIRED) =====
  if (!product.price || product.price <= 0) {
    issues.push({
      issue_type: "missing_price",
      severity: "critical",
      message: "Valid price with currency required",
      spec_ref: "Price - price Required",
    });
  }

  // ===== CRITICAL - Availability (REQUIRED) =====
  if (!product.availability) {
    issues.push({
      issue_type: "missing_availability",
      severity: "critical",
      message: "Availability status required",
      spec_ref: "Availability - availability Required",
    });
  }

  if (product.availability === "preorder" && !product.availabilityDate) {
    issues.push({
      issue_type: "missing_availability_date",
      severity: "critical",
      message: "Availability date required for preorders",
      spec_ref: "Availability - availability_date Required if preorder",
    });
  }

  // ===== CRITICAL - Merchant Info (workspace-level, REQUIRED) =====
  if (!workspace.sellerName) {
    issues.push({
      issue_type: "missing_seller_name",
      severity: "critical",
      message: "Seller name required at workspace level",
      spec_ref: "Merchant Info - seller_name Required",
    });
  }

  if (!workspace.sellerUrl) {
    issues.push({
      issue_type: "missing_seller_url",
      severity: "critical",
      message: "Seller URL required at workspace level",
      spec_ref: "Merchant Info - seller_url Required",
    });
  }

  if (product.enableCheckout && !workspace.sellerPrivacyPolicy) {
    issues.push({
      issue_type: "missing_privacy_policy",
      severity: "critical",
      message: "Privacy policy required when checkout enabled",
      spec_ref: "Merchant Info - seller_privacy_policy Required if checkout",
    });
  }

  if (product.enableCheckout && !workspace.sellerTos) {
    issues.push({
      issue_type: "missing_tos",
      severity: "critical",
      message: "Terms of service required when checkout enabled",
      spec_ref: "Merchant Info - seller_tos Required if checkout",
    });
  }

  // ===== CRITICAL - Returns (REQUIRED) =====
  if (!workspace.returnPolicy) {
    issues.push({
      issue_type: "missing_return_policy",
      severity: "critical",
      message: "Return policy required at workspace level",
      spec_ref: "Returns - return_policy Required",
    });
  }

  if (!workspace.returnWindow) {
    issues.push({
      issue_type: "missing_return_window",
      severity: "critical",
      message: "Return window (days) required at workspace level",
      spec_ref: "Returns - return_window Required",
    });
  }

  // ===== HIGH PRIORITY - Variants (REQUIRED if variants exist) =====
  if (product.itemGroupId && !product.color && isApparelCategory(product.productCategory)) {
    issues.push({
      issue_type: "missing_color",
      severity: "high",
      message: "Color recommended for apparel variants",
      spec_ref: "Variants - color Recommended for apparel",
    });
  }

  if (product.itemGroupId && !product.size && isApparelCategory(product.productCategory)) {
    issues.push({
      issue_type: "missing_size",
      severity: "high",
      message: "Size recommended for apparel variants",
      spec_ref: "Variants - size Recommended for apparel",
    });
  }

  // ===== MEDIUM PRIORITY - Additional Media (RECOMMENDED) =====
  if (!product.additionalImageLinks || (product.additionalImageLinks as any[])?.length === 0) {
    issues.push({
      issue_type: "missing_additional_images",
      severity: "medium",
      message: "Multiple images improve trust and conversion",
      spec_ref: "Media - additional_image_link Recommended",
    });
  }

  // ===== MEDIUM PRIORITY - Reviews (RECOMMENDED) =====
  if (!product.productReviewCount || product.productReviewCount === 0) {
    issues.push({
      issue_type: "missing_reviews",
      severity: "low",
      message: "Product reviews improve ranking",
      spec_ref: "Reviews - product_review_count Recommended",
    });
  }

  return issues;
}

/**
 * Helper to check if product category is apparel
 */
function isApparelCategory(category: string | null): boolean {
  if (!category) return false;
  const categoryLower = category.toLowerCase();
  return (
    categoryLower.includes("apparel") ||
    categoryLower.includes("clothing") ||
    categoryLower.includes("shoes") ||
    categoryLower.includes("accessories")
  );
}
