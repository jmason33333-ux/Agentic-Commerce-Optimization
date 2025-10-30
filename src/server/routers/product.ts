import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { JobType, JobStatus } from "@prisma/client";
import { processProductSync } from "@/lib/jobs/processor";

export const productRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const workspace = await ctx.db.workspace.findUnique({
        where: { id: input.workspaceId },
      });

      if (!workspace || workspace.ownerId !== ctx.session.user.id) {
        throw new Error("Workspace not found");
      }

      const products = await ctx.db.product.findMany({
        where: { workspaceId: input.workspaceId },
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

      return products;
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
