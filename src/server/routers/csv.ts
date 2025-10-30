import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { parseCSV, validateCSVProducts, CSVFormat } from "@/lib/csv/parser";
import { generateContentHash } from "@/lib/utils";

export const csvRouter = router({
  /**
   * Import products from CSV text
   */
  importProducts: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        csvText: z.string(),
        format: z.enum(["shopify", "openai"]).default("shopify"),
        dryRun: z.boolean().default(false), // Preview without importing
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify workspace ownership
      const workspace = await ctx.db.workspace.findUnique({
        where: { id: input.workspaceId },
      });

      if (!workspace || workspace.ownerId !== ctx.session.user.id) {
        throw new Error("Workspace not found");
      }

      // Parse CSV
      let products;
      try {
        products = parseCSV(input.csvText, input.format as CSVFormat);
      } catch (error: any) {
        throw new Error(`CSV parsing failed: ${error.message}`);
      }

      if (products.length === 0) {
        throw new Error("No products found in CSV");
      }

      // Validate products
      const { valid, errors } = validateCSVProducts(products);

      if (input.dryRun) {
        // Return preview without importing
        return {
          success: true,
          dryRun: true,
          totalRows: products.length,
          validProducts: valid.length,
          invalidProducts: errors.length,
          errors: errors.map(e => ({
            row: e.row,
            errors: e.errors,
            product: {
              id: e.product.id,
              title: e.product.title,
            },
          })),
          preview: valid.slice(0, 5).map(p => ({
            id: p.id,
            title: p.title,
            price: p.price,
            brand: p.brand,
            gtin: p.gtin,
            mpn: p.mpn,
          })),
        };
      }

      // Import valid products
      const imported = [];
      const failed = [];

      for (const product of valid) {
        try {
          const contentHash = generateContentHash({
            title: product.title,
            description: product.description,
            tags: product.tags,
            price: product.price,
            inventory: product.inventoryQuantity || 0,
          });

          // Build product link if not provided
          const link =
            product.link ||
            (workspace.shopDomain
              ? `https://${workspace.shopDomain}/products/${product.id}`
              : undefined);

          const created = await ctx.db.product.upsert({
            where: {
              workspaceId_sourceId: {
                workspaceId: input.workspaceId,
                sourceId: product.id,
              },
            },
            create: {
              workspaceId: input.workspaceId,
              sourceId: product.id,

              // OpenAI Flags
              enableSearch: true,
              enableCheckout: false,

              // Basic Product Data
              title: product.title,
              description: product.description,
              link,
              gtin: product.gtin,
              mpn: product.mpn,

              // Item Information
              condition: product.condition || "new",
              productCategory: product.productCategory,
              brand: product.brand,
              material: product.material,
              weight: product.weight,
              weightUnit: product.weightUnit,

              // Media
              imageLink: product.imageLink,
              additionalImageLinks: product.additionalImageLinks || [],
              videoLink: product.videoLink,

              // Price
              price: product.price,
              currency: product.currency || "USD",

              // Availability
              availability: product.availability || "in_stock",
              inventoryQuantity: product.inventoryQuantity || 0,

              // Variants
              itemGroupId: product.itemGroupId,
              color: product.color,
              size: product.size,
              gender: product.gender,

              // Legacy
              vendor: product.vendor,
              productType: product.productType,
              tags: product.tags || [],
              images: product.imageLink
                ? [product.imageLink, ...(product.additionalImageLinks || [])]
                : [],

              // Internal
              contentHash,
            },
            update: {
              title: product.title,
              description: product.description,
              link,
              gtin: product.gtin,
              mpn: product.mpn,
              condition: product.condition || "new",
              productCategory: product.productCategory,
              brand: product.brand,
              material: product.material,
              weight: product.weight,
              weightUnit: product.weightUnit,
              imageLink: product.imageLink,
              additionalImageLinks: product.additionalImageLinks || [],
              videoLink: product.videoLink,
              price: product.price,
              currency: product.currency || "USD",
              availability: product.availability || "in_stock",
              inventoryQuantity: product.inventoryQuantity || 0,
              itemGroupId: product.itemGroupId,
              color: product.color,
              size: product.size,
              gender: product.gender,
              vendor: product.vendor,
              productType: product.productType,
              tags: product.tags || [],
              images: product.imageLink
                ? [product.imageLink, ...(product.additionalImageLinks || [])]
                : [],
              contentHash,
              updatedAt: new Date(),
            },
          });

          imported.push({
            id: created.id,
            sourceId: created.sourceId,
            title: created.title,
          });
        } catch (error: any) {
          console.error(`Failed to import product ${product.id}:`, error);
          failed.push({
            id: product.id,
            title: product.title,
            error: error.message,
          });
        }
      }

      return {
        success: true,
        dryRun: false,
        totalRows: products.length,
        validProducts: valid.length,
        invalidProducts: errors.length,
        imported: imported.length,
        failed: failed.length,
        errors: errors.map(e => ({
          row: e.row,
          errors: e.errors,
          product: {
            id: e.product.id,
            title: e.product.title,
          },
        })),
        importedProducts: imported,
        failedProducts: failed,
      };
    }),

  /**
   * Parse and preview CSV without importing
   */
  previewCSV: protectedProcedure
    .input(
      z.object({
        csvText: z.string(),
        format: z.enum(["shopify", "openai"]).default("shopify"),
      })
    )
    .mutation(async ({ input }) => {
      // Parse CSV
      let products;
      try {
        products = parseCSV(input.csvText, input.format as CSVFormat);
      } catch (error: any) {
        throw new Error(`CSV parsing failed: ${error.message}`);
      }

      // Validate products
      const { valid, errors } = validateCSVProducts(products);

      return {
        totalRows: products.length,
        validProducts: valid.length,
        invalidProducts: errors.length,
        errors: errors.map(e => ({
          row: e.row,
          errors: e.errors,
          product: {
            id: e.product.id,
            title: e.product.title,
            price: e.product.price,
            brand: e.product.brand,
          },
        })),
        preview: valid.slice(0, 10).map(p => ({
          id: p.id,
          title: p.title,
          description: p.description?.substring(0, 100),
          price: p.price,
          currency: p.currency,
          brand: p.brand,
          gtin: p.gtin,
          mpn: p.mpn,
          imageLink: p.imageLink,
          availability: p.availability,
          inventoryQuantity: p.inventoryQuantity,
        })),
      };
    }),
});
