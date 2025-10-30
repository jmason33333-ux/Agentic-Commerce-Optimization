import { db } from "@/lib/db";
import { JobType, JobStatus } from "@prisma/client";
import { fetchShopifyProducts } from "@/lib/shopify";
import { generateContentHash, calculateSeoScore } from "@/lib/utils";
import { getLLMProvider, ProductInput } from "@/lib/llm";

const MAX_PRODUCTS_PER_RUN = Number(process.env.MAX_PRODUCTS_PER_RUN) || 500;
const BATCH_SIZE = Number(process.env.BATCH_SIZE) || 50;
const BATCH_CONCURRENCY = Number(process.env.BATCH_CONCURRENCY) || 3;

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
      const variant = shopifyProduct.variants[0];
      const contentHash = generateContentHash({
        title: shopifyProduct.title,
        description: shopifyProduct.body_html,
        tags: shopifyProduct.tags,
        price: variant?.price,
        inventory: variant?.inventory_quantity || 0,
      });

      await db.product.upsert({
        where: {
          workspaceId_sourceId: {
            workspaceId: workspace.id,
            sourceId: shopifyProduct.id.toString(),
          },
        },
        create: {
          workspaceId: workspace.id,
          sourceId: shopifyProduct.id.toString(),
          title: shopifyProduct.title,
          description: shopifyProduct.body_html,
          price: variant?.price ? parseFloat(variant.price) : null,
          inventory: variant?.inventory_quantity || 0,
          tags: shopifyProduct.tags
            ? shopifyProduct.tags.split(",").map((t) => t.trim())
            : [],
          vendor: shopifyProduct.vendor,
          productType: shopifyProduct.product_type,
          images: shopifyProduct.images.map((img) => img.src),
          contentHash,
          rawSource: shopifyProduct,
        },
        update: {
          title: shopifyProduct.title,
          description: shopifyProduct.body_html,
          price: variant?.price ? parseFloat(variant.price) : null,
          inventory: variant?.inventory_quantity || 0,
          tags: shopifyProduct.tags
            ? shopifyProduct.tags.split(",").map((t) => t.trim())
            : [],
          vendor: shopifyProduct.vendor,
          productType: shopifyProduct.product_type,
          images: shopifyProduct.images.map((img) => img.src),
          contentHash,
          rawSource: shopifyProduct,
          updatedAt: new Date(),
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
          // Run rule-based checks
          const issues = runRuleChecks(product);

          // Try LLM suggestions if content changed
          let llmSuggestions: any[] = [];
          try {
            const productInput: ProductInput = {
              title: product.title,
              description: product.description || undefined,
              price: product.price ? Number(product.price) : undefined,
              currency: product.currency,
              inventory: product.inventory,
              tags: product.tags as string[] | undefined,
              images: product.images as string[] | undefined,
              vendor: product.vendor || undefined,
              productType: product.productType || undefined,
              instantCheckoutEnabled: product.instantCheckoutEnabled,
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

function runRuleChecks(product: any): any[] {
  const issues: any[] = [];

  if (!product.images || (product.images as any[]).length === 0) {
    issues.push({
      issue_type: "no_image",
      severity: "high",
      message: "Product has no images",
    });
  }

  if (product.inventory <= 0) {
    issues.push({
      issue_type: "availability_zero",
      severity: "high",
      message: "Product is out of stock",
    });
  }

  if (!product.instantCheckoutEnabled) {
    issues.push({
      issue_type: "instant_checkout_off",
      severity: "medium",
      message: "Instant Checkout is not enabled",
    });
  }

  if (!product.description || product.description.length < 50) {
    issues.push({
      issue_type: "missing_audience",
      severity: "medium",
      message: "Description is too short or missing audience information",
    });
  }

  if (!product.price) {
    issues.push({
      issue_type: "missing_price",
      severity: "high",
      message: "Product has no price",
    });
  }

  if (!product.tags || (product.tags as any[]).length === 0) {
    issues.push({
      issue_type: "missing_tags",
      severity: "low",
      message: "Product has no tags",
    });
  }

  return issues;
}
