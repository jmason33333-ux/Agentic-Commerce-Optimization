import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { SuggestionStatus, RiskLevel } from "@prisma/client";
import {
  writeAgentSeoMetafields,
  updateShopifyProduct,
} from "@/lib/shopify";

export const suggestionRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        status: z.nativeEnum(SuggestionStatus).optional(),
        riskLevel: z.nativeEnum(RiskLevel).optional(),
        productId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const workspace = await ctx.db.workspace.findUnique({
        where: { id: input.workspaceId },
      });

      if (!workspace || workspace.ownerId !== ctx.session.user.id) {
        throw new Error("Workspace not found");
      }

      const where: any = {
        workspaceId: input.workspaceId,
      };

      if (input.status) where.status = input.status;
      if (input.riskLevel) where.riskLevel = input.riskLevel;
      if (input.productId) where.productId = input.productId;

      return ctx.db.suggestion.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              title: true,
              images: true,
              sourceId: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  approve: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const suggestion = await ctx.db.suggestion.findUnique({
        where: { id: input.id },
        include: { workspace: true },
      });

      if (!suggestion || suggestion.workspace.ownerId !== ctx.session.user.id) {
        throw new Error("Suggestion not found");
      }

      return ctx.db.suggestion.update({
        where: { id: input.id },
        data: {
          status: SuggestionStatus.APPROVED,
          reviewerId: ctx.session.user.id,
          updatedAt: new Date(),
        },
      });
    }),

  reject: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const suggestion = await ctx.db.suggestion.findUnique({
        where: { id: input.id },
        include: { workspace: true },
      });

      if (!suggestion || suggestion.workspace.ownerId !== ctx.session.user.id) {
        throw new Error("Suggestion not found");
      }

      return ctx.db.suggestion.update({
        where: { id: input.id },
        data: {
          status: SuggestionStatus.REJECTED,
          reviewerId: ctx.session.user.id,
          updatedAt: new Date(),
        },
      });
    }),

  bulkApprove: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        riskLevel: z.nativeEnum(RiskLevel).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const workspace = await ctx.db.workspace.findUnique({
        where: { id: input.workspaceId },
      });

      if (!workspace || workspace.ownerId !== ctx.session.user.id) {
        throw new Error("Workspace not found");
      }

      const where: any = {
        workspaceId: input.workspaceId,
        status: SuggestionStatus.PENDING,
      };

      if (input.riskLevel) where.riskLevel = input.riskLevel;

      return ctx.db.suggestion.updateMany({
        where,
        data: {
          status: SuggestionStatus.APPROVED,
          reviewerId: ctx.session.user.id,
          updatedAt: new Date(),
        },
      });
    }),

  apply: protectedProcedure
    .input(z.object({ suggestionIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const results: any[] = [];

      for (const suggestionId of input.suggestionIds) {
        try {
          const suggestion = await ctx.db.suggestion.findUnique({
            where: { id: suggestionId },
            include: {
              workspace: true,
              product: true,
            },
          });

          if (
            !suggestion ||
            suggestion.workspace.ownerId !== ctx.session.user.id
          ) {
            results.push({
              suggestionId,
              success: false,
              error: "Suggestion not found",
            });
            continue;
          }

          if (suggestion.status !== SuggestionStatus.APPROVED) {
            results.push({
              suggestionId,
              success: false,
              error: "Suggestion not approved",
            });
            continue;
          }

          const { workspace, product } = suggestion;

          if (!workspace.shopDomain || !workspace.shopAccessToken) {
            results.push({
              suggestionId,
              success: false,
              error: "Workspace not connected",
            });
            continue;
          }

          const payload = suggestion.aiPayload as any;
          const oldValue: any = {};
          const newValue: any = {};

          // Apply based on issue type
          if (suggestion.issueType === "missing_audience") {
            // Write to metafields
            if (payload.audience) {
              await writeAgentSeoMetafields({
                shopDomain: workspace.shopDomain,
                accessToken: workspace.shopAccessToken,
                productId: product.sourceId,
                audience: payload.audience,
                useCases: payload.use_cases,
                occasions: payload.occasions,
              });
              oldValue.metafields = {};
              newValue.metafields = {
                audience: payload.audience,
                use_cases: payload.use_cases,
                occasions: payload.occasions,
              };
            }

            // Optionally append to description
            if (payload.description_append) {
              oldValue.description = product.description;
              await updateShopifyProduct({
                shopDomain: workspace.shopDomain,
                accessToken: workspace.shopAccessToken,
                productId: product.sourceId,
                bodyHtmlAppend: payload.description_append,
                tagsToAdd: payload.tags_to_add,
              });
              newValue.description =
                (product.description || "") + "\n\n" + payload.description_append;
              newValue.tags = payload.tags_to_add;
            }
          } else if (suggestion.issueType === "instant_checkout_off") {
            // This is just a flag in our DB
            oldValue.instantCheckoutEnabled = product.instantCheckoutEnabled;
            await ctx.db.product.update({
              where: { id: product.id },
              data: { instantCheckoutEnabled: true },
            });
            newValue.instantCheckoutEnabled = true;
          } else if (payload.description_append || payload.tags_to_add) {
            // Generic text/metadata update
            await updateShopifyProduct({
              shopDomain: workspace.shopDomain,
              accessToken: workspace.shopAccessToken,
              productId: product.sourceId,
              bodyHtmlAppend: payload.description_append,
              tagsToAdd: payload.tags_to_add,
            });
            oldValue.description = product.description;
            oldValue.tags = product.tags;
            newValue.description = payload.description_append
              ? (product.description || "") + "\n\n" + payload.description_append
              : product.description;
            newValue.tags = payload.tags_to_add;
          }

          // Create change log
          await ctx.db.changeLog.create({
            data: {
              workspaceId: workspace.id,
              productId: product.id,
              suggestionId: suggestion.id,
              changeType: suggestion.issueType,
              oldValue,
              newValue,
              actorType: "USER",
              actorId: ctx.session.user.id,
            },
          });

          // Mark as applied
          await ctx.db.suggestion.update({
            where: { id: suggestionId },
            data: {
              status: SuggestionStatus.APPLIED,
              appliedAt: new Date(),
            },
          });

          results.push({ suggestionId, success: true });
        } catch (error: any) {
          console.error("Apply suggestion error:", error);
          // Update suggestion with error
          await ctx.db.suggestion.update({
            where: { id: suggestionId },
            data: { errorMsg: error.message },
          });

          results.push({
            suggestionId,
            success: false,
            error: error.message,
          });
        }
      }

      return results;
    }),
});
