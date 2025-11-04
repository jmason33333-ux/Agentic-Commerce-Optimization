import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { JobType, JobStatus } from "@prisma/client";
import { processProductSync } from "@/lib/jobs/processor";
import { calculateOptimizationScore, getProductStatus } from "@/lib/optimization";

export const productRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        limit: z.number().optional(),
        offset: z.number().optional(),
        status: z.enum(["ready", "pending", "missing"]).optional(),
        minLevel: z.number().min(1).max(10).optional(),
        maxLevel: z.number().min(1).max(10).optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const workspace = await ctx.db.workspace.findUnique({
        where: { id: input.workspaceId },
      });

      if (!workspace || workspace.ownerId !== ctx.session.user.id) {
        throw new Error("Workspace not found");
      }

      // Build where clause with filters
      const where: any = { workspaceId: input.workspaceId };

      if (input.status) {
        where.status = input.status;
      }

      if (input.minLevel || input.maxLevel) {
        where.optimizationLevel = {};
        if (input.minLevel) where.optimizationLevel.gte = input.minLevel;
        if (input.maxLevel) where.optimizationLevel.lte = input.maxLevel;
      }

      if (input.search) {
        where.OR = [
          { title: { contains: input.search, mode: "insensitive" } },
          { sourceId: { contains: input.search, mode: "insensitive" } },
        ];
      }

      const products = await ctx.db.product.findMany({
        where,
        take: input.limit || 50,
        skip: input.offset || 0,
        orderBy: { updatedAt: "desc" },
        include: {
          auditResults: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          _count: {
            select: {
              suggestions: {
                where: { status: "PENDING" },
              },
            },
          },
        },
      });

      // Get total count for pagination
      const total = await ctx.db.product.count({ where });

      return {
        products,
        total,
        hasMore: (input.offset || 0) + products.length < total,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.product.findUnique({
        where: { id: input.id },
        include: {
          workspace: true,
          auditResults: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          suggestions: {
            orderBy: { createdAt: "desc" },
          },
          changeLogs: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      });

      if (!product || product.workspace.ownerId !== ctx.session.user.id) {
        throw new Error("Product not found");
      }

      return product;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          title: z.string().optional(),
          description: z.string().optional(),
          price: z.number().optional(),
          currency: z.string().optional(),
          gtin: z.string().optional(),
          mpn: z.string().optional(),
          brand: z.string().optional(),
          productCategory: z.string().optional(),
          useCases: z.string().optional(),
          targetAudience: z.string().optional(),
          comparableProducts: z.string().optional(),
          imageLink: z.string().optional(),
          link: z.string().optional(),
          availability: z.string().optional(),
          weight: z.number().optional(),
          weightUnit: z.string().optional(),
          // Add other editable fields as needed
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Fetch product and verify ownership
      const product = await ctx.db.product.findUnique({
        where: { id: input.id },
        include: { workspace: true },
      });

      if (!product || product.workspace.ownerId !== ctx.session.user.id) {
        throw new Error("Product not found");
      }

      // Update product with new data
      const updatedProduct = await ctx.db.product.update({
        where: { id: input.id },
        data: input.data,
      });

      // Log the change
      await ctx.db.changeLog.create({
        data: {
          workspaceId: product.workspaceId,
          productId: input.id,
          changeType: "manual_edit",
          oldValue: product as any,
          newValue: input.data as any,
          actorType: "USER",
          actorId: ctx.session.user.id,
        },
      });

      return updatedProduct;
    }),

  recalculateScore: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Fetch product and verify ownership
      const product = await ctx.db.product.findUnique({
        where: { id: input.id },
        include: { workspace: true },
      });

      if (!product || product.workspace.ownerId !== ctx.session.user.id) {
        throw new Error("Product not found");
      }

      // Calculate optimization score
      const scoreBreakdown = calculateOptimizationScore(product);
      const hasPendingSuggestions = await ctx.db.suggestion.count({
        where: {
          productId: input.id,
          status: { in: ["PENDING", "APPROVED"] },
        },
      }) > 0;

      const status = getProductStatus(
        product,
        scoreBreakdown.level,
        hasPendingSuggestions
      );

      // Update product with new score
      const updatedProduct = await ctx.db.product.update({
        where: { id: input.id },
        data: {
          optimizationScore: scoreBreakdown.total,
          optimizationLevel: scoreBreakdown.level,
          scoreBreakdown: scoreBreakdown as any,
          status,
          lastScoreCalculation: new Date(),
        },
      });

      return updatedProduct;
    }),

  sync: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const workspace = await ctx.db.workspace.findUnique({
        where: { id: input.workspaceId },
      });

      if (!workspace || workspace.ownerId !== ctx.session.user.id) {
        throw new Error("Workspace not found");
      }

      // Create a job
      const job = await ctx.db.job.create({
        data: {
          workspaceId: input.workspaceId,
          type: JobType.PRODUCT_SYNC,
          status: JobStatus.PENDING,
        },
      });

      // Process async (fire and forget)
      processProductSync(job.id).catch((err) => {
        console.error("Product sync failed:", err);
      });

      return { jobId: job.id };
    }),
});
