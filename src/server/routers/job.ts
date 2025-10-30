import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const jobRouter = router({
  getStatus: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ ctx, input }) => {
      const job = await ctx.db.job.findUnique({
        where: { id: input.jobId },
        include: { workspace: true },
      });

      if (!job || job.workspace.ownerId !== ctx.session.user.id) {
        throw new Error("Job not found");
      }

      return job;
    }),

  list: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const workspace = await ctx.db.workspace.findUnique({
        where: { id: input.workspaceId },
      });

      if (!workspace || workspace.ownerId !== ctx.session.user.id) {
        throw new Error("Workspace not found");
      }

      return ctx.db.job.findMany({
        where: { workspaceId: input.workspaceId },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
    }),
});
