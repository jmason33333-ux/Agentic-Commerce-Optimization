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
});
