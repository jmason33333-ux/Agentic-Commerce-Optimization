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

      // Get products by status
      const readyProducts = await ctx.db.product.count({
        where: {
          workspaceId: input.workspaceId,
          status: "ready",
        },
      });

      const pendingProducts = await ctx.db.product.count({
        where: {
          workspaceId: input.workspaceId,
          status: "pending",
        },
      });

      const missingProducts = await ctx.db.product.count({
        where: {
          workspaceId: input.workspaceId,
          status: "missing",
        },
      });

      // Get products with checkout enabled
      const checkoutEnabledCount = await ctx.db.product.count({
        where: {
          workspaceId: input.workspaceId,
          enableCheckout: true,
        },
      });

      // Get products with search enabled
      const searchEnabledCount = await ctx.db.product.count({
        where: {
          workspaceId: input.workspaceId,
          enableSearch: true,
        },
      });

      // Get pending suggestions
      const pendingSuggestions = await ctx.db.suggestion.count({
        where: {
          workspaceId: input.workspaceId,
          status: SuggestionStatus.PENDING,
        },
      });

      // Get average optimization score and level
      const products = await ctx.db.product.findMany({
        where: {
          workspaceId: input.workspaceId,
          optimizationScore: { not: null },
        },
        select: {
          optimizationScore: true,
          optimizationLevel: true,
        },
      });

      const avgOptimizationScore =
        products.length > 0
          ? products.reduce((sum, p) => sum + (p.optimizationScore || 0), 0) /
            products.length
          : 0;

      const avgOptimizationLevel =
        products.length > 0
          ? products.reduce((sum, p) => sum + (p.optimizationLevel || 0), 0) /
            products.length
          : 0;

      return {
        last_30d_orders: agenticOrders.length,
        last_30d_gmv: agenticGMV,
        total_products: totalProducts,
        ready_products: readyProducts,
        pending_products: pendingProducts,
        missing_products: missingProducts,
        ready_products_pct:
          totalProducts > 0 ? readyProducts / totalProducts : 0,
        checkout_enabled_count: checkoutEnabledCount,
        checkout_enabled_pct:
          totalProducts > 0 ? checkoutEnabledCount / totalProducts : 0,
        search_enabled_count: searchEnabledCount,
        pending_suggestions: pendingSuggestions,
        avg_optimization_score: Math.round(avgOptimizationScore),
        avg_optimization_level: Math.round(avgOptimizationLevel * 10) / 10,
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
