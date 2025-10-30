import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { JobType, JobStatus } from "@prisma/client";
import { processAuditRun } from "@/lib/jobs/processor";

export const auditRouter = router({
  run: protectedProcedure
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
          type: JobType.AUDIT_RUN,
          status: JobStatus.PENDING,
        },
      });

      // Process async (fire and forget)
      processAuditRun(job.id).catch((err) => {
        console.error("Audit run failed:", err);
      });

      return { jobId: job.id };
    }),

  getHistory: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const workspace = await ctx.db.workspace.findUnique({
        where: { id: input.workspaceId },
      });

      if (!workspace || workspace.ownerId !== ctx.session.user.id) {
        throw new Error("Workspace not found");
      }

      return ctx.db.job.findMany({
        where: {
          workspaceId: input.workspaceId,
          type: JobType.AUDIT_RUN,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
    }),
});
