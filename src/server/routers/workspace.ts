import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { Platform } from "@prisma/client";

export const workspaceRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.workspace.findMany({
      where: { ownerId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const workspace = await ctx.db.workspace.findUnique({
        where: { id: input.id },
      });

      if (!workspace || workspace.ownerId !== ctx.session.user.id) {
        throw new Error("Workspace not found");
      }

      return workspace;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        platform: z.nativeEnum(Platform),
        shopDomain: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.workspace.create({
        data: {
          name: input.name,
          platform: input.platform,
          shopDomain: input.shopDomain,
          ownerId: ctx.session.user.id,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        autoApplyLowRisk: z.boolean().optional(),
        allowTitleOverwrite: z.boolean().optional(),
        allowDescOverwrite: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const workspace = await ctx.db.workspace.findUnique({
        where: { id: input.id },
      });

      if (!workspace || workspace.ownerId !== ctx.session.user.id) {
        throw new Error("Workspace not found");
      }

      const { id, ...data } = input;
      return ctx.db.workspace.update({
        where: { id },
        data,
      });
    }),

  connectShopify: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        shopDomain: z.string(),
        accessToken: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const workspace = await ctx.db.workspace.findUnique({
        where: { id: input.workspaceId },
      });

      if (!workspace || workspace.ownerId !== ctx.session.user.id) {
        throw new Error("Workspace not found");
      }

      return ctx.db.workspace.update({
        where: { id: input.workspaceId },
        data: {
          shopDomain: input.shopDomain,
          shopAccessToken: input.accessToken,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const workspace = await ctx.db.workspace.findUnique({
        where: { id: input.id },
      });

      if (!workspace || workspace.ownerId !== ctx.session.user.id) {
        throw new Error("Workspace not found");
      }

      return ctx.db.workspace.delete({
        where: { id: input.id },
      });
    }),

  getStats: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const workspace = await ctx.db.workspace.findUnique({
        where: { id: input.workspaceId },
      });

      if (!workspace || workspace.ownerId !== ctx.session.user.id) {
        throw new Error("Workspace not found");
      }

      // Define which issue types are considered change-driving for dashboard focus
      const changeDrivingIssueTypes = [
        "missing_gtin",
        "checkout_disabled",
        "no_image",
        "missing_price",
        "availability_zero",
        "missing_brand",
        "missing_material",
      ];

      const [
        totalProducts,
        checkoutEnabled,
        checkoutDisabled,
        pendingAllCount,
        pendingChangeDrivingCount,
        pendingProductsDistinct,
        pendingChangeDrivingProductsDistinct,
        lastSyncJob,
        agenticOrdersAgg,
        compliantCount,
      ] = await Promise.all([
        ctx.db.product.count({ where: { workspaceId: input.workspaceId } }),
        ctx.db.product.count({
          where: { workspaceId: input.workspaceId, enableCheckout: true },
        }),
        ctx.db.product.count({
          where: { workspaceId: input.workspaceId, enableCheckout: false },
        }),
        ctx.db.suggestion.count({
          where: { workspaceId: input.workspaceId, status: "PENDING" },
        }),
        ctx.db.suggestion.count({
          where: {
            workspaceId: input.workspaceId,
            status: "PENDING",
            riskLevel: { in: ["MEDIUM", "HIGH"] },
            issueType: { in: changeDrivingIssueTypes },
          },
        }),
        ctx.db.suggestion.findMany({
          where: { workspaceId: input.workspaceId, status: "PENDING" },
          distinct: ["productId"],
          select: { productId: true },
        }),
        ctx.db.suggestion.findMany({
          where: {
            workspaceId: input.workspaceId,
            status: "PENDING",
            riskLevel: { in: ["MEDIUM", "HIGH"] },
            issueType: { in: changeDrivingIssueTypes },
          },
          distinct: ["productId"],
          select: { productId: true },
        }),
        ctx.db.job.findFirst({
          where: {
            workspaceId: input.workspaceId,
            type: "PRODUCT_SYNC",
            status: "COMPLETED",
          },
          orderBy: { completedAt: "desc" },
          select: { completedAt: true },
        }),
        ctx.db.orderEvent.aggregate({
          where: {
            workspaceId: input.workspaceId,
            sourceChannel: "CHATGPT_AGENTIC",
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
          _count: true,
          _sum: { amount: true },
        }),
        ctx.db.product.count({
          where: {
            workspaceId: input.workspaceId,
            imageLink: { not: null },
            price: { not: null },
            brand: { not: null },
            material: { not: null },
            weight: { not: null },
            weightUnit: { not: null },
            OR: [{ gtin: { not: null } }, { mpn: { not: null } }],
          },
        }),
      ]);

      // Average latest SEO score across products using a raw SQL that selects latest per product
      const avgSeoRows = await ctx.db.$queryRaw<[{ avg: number | null }]>`
        SELECT AVG(ar."seoScore") AS avg
        FROM "AuditResult" ar
        JOIN (
          SELECT "productId", MAX("createdAt") AS max_created
          FROM "AuditResult"
          GROUP BY "productId"
        ) latest ON latest."productId" = ar."productId" AND latest.max_created = ar."createdAt"
        WHERE ar."productId" IN (
          SELECT id FROM "Product" WHERE "workspaceId" = ${input.workspaceId}
        )
      `;

      const avgSeoScore = avgSeoRows?.[0]?.avg ?? null;

      const agenticOrders30d = {
        count: agenticOrdersAgg._count as number,
        revenue: agenticOrdersAgg._sum.amount ?? null,
      };

      const compliancePercent = totalProducts
        ? Math.round((compliantCount / totalProducts) * 100)
        : 0;

      return {
        totalProducts,
        checkoutEnabled,
        checkoutDisabled,
        pending: {
          total: pendingAllCount,
          changeDriving: pendingChangeDrivingCount,
          productsWithPending: pendingProductsDistinct.length,
          productsWithChangeDrivingPending:
            pendingChangeDrivingProductsDistinct.length,
        },
        lastSyncAt: lastSyncJob?.completedAt ?? null,
        avgSeoScore,
        compliancePercent,
        agenticOrders30d,
      };
    }),
});
