import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { SuggestionStatus, RiskLevel } from "@prisma/client";
import {
  writeAgentSeoMetafields,
  updateShopifyProduct,
} from "@/lib/shopify";
import { calculateOptimizationScore, getProductStatus } from "@/lib/optimization";

export const suggestionRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        status: z.nativeEnum(SuggestionStatus).optional(),
        riskLevel: z.nativeEnum(RiskLevel).optional(),
        productId: z.string().optional(),
        issueTypes: z.array(z.string()).optional(),
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
      if (input.issueTypes && input.issueTypes.length > 0)
        where.issueType = { in: input.issueTypes };

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

  getSummary: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        status: z.nativeEnum(SuggestionStatus).optional().default(SuggestionStatus.PENDING),
        issueTypes: z.array(z.string()).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const workspace = await ctx.db.workspace.findUnique({
        where: { id: input.workspaceId },
      });

      if (!workspace || workspace.ownerId !== ctx.session.user.id) {
        throw new Error("Workspace not found");
      }

      const baseWhere: any = {
        workspaceId: input.workspaceId,
        status: input.status,
      };
      if (input.issueTypes && input.issueTypes.length > 0) {
        baseWhere.issueType = { in: input.issueTypes };
      }

      const [byRisk, byIssue] = await Promise.all([
        ctx.db.suggestion.groupBy({
          by: ["riskLevel"],
          where: baseWhere,
          _count: { _all: true },
        }),
        ctx.db.suggestion.groupBy({
          by: ["issueType"],
          where: baseWhere,
          _count: { _all: true },
        }),
      ]);

      return {
        countsByRisk: byRisk.map((r) => ({ riskLevel: r.riskLevel, count: r._count._all })),
        countsByIssueType: byIssue.map((i) => ({ issueType: i.issueType, count: i._count._all })),
      };
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

  bulkApproveByFilter: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        status: z.nativeEnum(SuggestionStatus).optional().default(SuggestionStatus.PENDING),
        riskLevels: z.array(z.nativeEnum(RiskLevel)).optional(),
        issueTypes: z.array(z.string()).optional(),
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
        status: input.status,
      };
      if (input.riskLevels && input.riskLevels.length > 0) {
        where.riskLevel = { in: input.riskLevels };
      }
      if (input.issueTypes && input.issueTypes.length > 0) {
        where.issueType = { in: input.issueTypes };
      }

      const res = await ctx.db.suggestion.updateMany({
        where,
        data: {
          status: SuggestionStatus.APPROVED,
          reviewerId: ctx.session.user.id,
          updatedAt: new Date(),
        },
      });

      return { updated: res.count };
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

          // Recalculate optimization score (Critical Decision #2 - suggestion approval trigger)
          const updatedProduct = await ctx.db.product.findUnique({
            where: { id: product.id },
          });

          if (updatedProduct) {
            const scoreBreakdown = calculateOptimizationScore(updatedProduct);
            const hasPendingSuggestions = await ctx.db.suggestion.count({
              where: {
                productId: product.id,
                status: { in: ["PENDING", "APPROVED"] },
              },
            }) > 0;

            const status = getProductStatus(
              updatedProduct,
              scoreBreakdown.level,
              hasPendingSuggestions
            );

            await ctx.db.product.update({
              where: { id: product.id },
              data: {
                optimizationScore: scoreBreakdown.total,
                optimizationLevel: scoreBreakdown.level,
                scoreBreakdown: scoreBreakdown as any,
                status,
                lastScoreCalculation: new Date(),
              },
            });
          }

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
