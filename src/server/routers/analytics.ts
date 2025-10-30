import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { SourceChannel, SuggestionStatus } from "@prisma/client";

export const analyticsRouter = router({
  dashboard: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const workspace = await ctx.db.workspace.findUnique({
        where: { id: input.workspaceId },
      });

      if (!workspace || workspace.ownerId !== ctx.session.user.id) {
        throw new Error("Workspace not found");
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get agentic orders from last 30 days
      const agenticOrders = await ctx.db.orderEvent.findMany({
        where: {
          workspaceId: input.workspaceId,
          sourceChannel: SourceChannel.CHATGPT_AGENTIC,
          createdAt: { gte: thirtyDaysAgo },
        },
      });

      const agenticGMV = agenticOrders.reduce(
        (sum, order) => sum + Number(order.amount),
        0
      );

      // Get total products
      const totalProducts = await ctx.db.product.count({
        where: { workspaceId: input.workspaceId },
      });

      // Get products with IC enabled
      const icEnabledCount = await ctx.db.product.count({
        where: {
          workspaceId: input.workspaceId,
          instantCheckoutEnabled: true,
        },
      });

      // Get products eligible (have images, in stock, have price)
      const eligibleProducts = await ctx.db.product.count({
        where: {
          workspaceId: input.workspaceId,
          inventory: { gt: 0 },
          price: { not: null },
          images: { not: null },
        },
      });

      // Get pending suggestions
      const pendingSuggestions = await ctx.db.suggestion.count({
        where: {
          workspaceId: input.workspaceId,
          status: SuggestionStatus.PENDING,
        },
      });

      // Get average SEO score
      const auditResults = await ctx.db.auditResult.findMany({
        where: {
          product: {
            workspaceId: input.workspaceId,
          },
        },
        orderBy: { createdAt: "desc" },
        distinct: ["productId"],
        select: { seoScore: true },
      });

      const avgScore =
        auditResults.length > 0
          ? auditResults.reduce((sum, r) => sum + r.seoScore, 0) /
            auditResults.length
          : 0;

      return {
        last_30d_orders: agenticOrders.length,
        last_30d_gmv: agenticGMV,
        eligible_products_pct:
          totalProducts > 0 ? eligibleProducts / totalProducts : 0,
        instant_checkout_pct:
          totalProducts > 0 ? icEnabledCount / totalProducts : 0,
        pending_suggestions: pendingSuggestions,
        avg_seo_score: Math.round(avgScore),
        total_products: totalProducts,
      };
    }),

  ordersOverTime: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        days: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const workspace = await ctx.db.workspace.findUnique({
        where: { id: input.workspaceId },
      });

      if (!workspace || workspace.ownerId !== ctx.session.user.id) {
        throw new Error("Workspace not found");
      }

      const days = input.days || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const orders = await ctx.db.orderEvent.findMany({
        where: {
          workspaceId: input.workspaceId,
          createdAt: { gte: startDate },
        },
        orderBy: { createdAt: "asc" },
      });

      return orders;
    }),
});
