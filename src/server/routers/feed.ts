import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import {
  submitProductFeed,
  checkFeedStatus,
  getFeedSubmissionHistory,
  getWorkspaceFeedStats,
  scheduleNextFeedSync,
} from '../../lib/openai/feed-submission-service';

export const feedRouter = router({
  /**
   * Submit product feed to OpenAI
   */
  submit: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        includeUnoptimized: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify workspace ownership
      const workspace = await ctx.db.workspace.findUnique({
        where: { id: input.workspaceId },
      });

      if (!workspace || workspace.ownerId !== ctx.session.user.id) {
        throw new Error('Workspace not found');
      }

      return await submitProductFeed({
        workspaceId: input.workspaceId,
        triggeredBy: 'MANUAL',
        includeUnoptimized: input.includeUnoptimized,
      });
    }),

  /**
   * Check feed indexing status
   */
  checkStatus: protectedProcedure
    .input(
      z.object({
        submissionId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await checkFeedStatus(input.submissionId);
    }),

  /**
   * Get feed submission history
   */
  history: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify workspace ownership
      const workspace = await ctx.db.workspace.findUnique({
        where: { id: input.workspaceId },
      });

      if (!workspace || workspace.ownerId !== ctx.session.user.id) {
        throw new Error('Workspace not found');
      }

      return await getFeedSubmissionHistory(input.workspaceId);
    }),

  /**
   * Get feed statistics for workspace
   */
  stats: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify workspace ownership
      const workspace = await ctx.db.workspace.findUnique({
        where: { id: input.workspaceId },
      });

      if (!workspace || workspace.ownerId !== ctx.session.user.id) {
        throw new Error('Workspace not found');
      }

      return await getWorkspaceFeedStats(input.workspaceId);
    }),

  /**
   * Configure feed auto-sync
   */
  configureSyn: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        enabled: z.boolean(),
        frequency: z.enum([
          'MANUAL',
          'EVERY_15_MIN',
          'HOURLY',
          'EVERY_6_HOURS',
          'DAILY',
          'WEEKLY',
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify workspace ownership
      const workspace = await ctx.db.workspace.findUnique({
        where: { id: input.workspaceId },
      });

      if (!workspace || workspace.ownerId !== ctx.session.user.id) {
        throw new Error('Workspace not found');
      }

      // Update workspace settings
      await ctx.db.workspace.update({
        where: { id: input.workspaceId },
        data: {
          feedSyncEnabled: input.enabled,
          feedSyncFrequency: input.frequency,
        },
      });

      // Schedule next sync if enabled
      if (input.enabled && input.frequency !== 'MANUAL') {
        await scheduleNextFeedSync(input.workspaceId);
      }

      return { success: true };
    }),

  /**
   * Configure OpenAI credentials
   */
  configureOpenAI: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        merchantId: z.string(),
        apiKey: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify workspace ownership
      const workspace = await ctx.db.workspace.findUnique({
        where: { id: input.workspaceId },
      });

      if (!workspace || workspace.ownerId !== ctx.session.user.id) {
        throw new Error('Workspace not found');
      }

      // TODO: Encrypt API key before storing
      // For now, storing plaintext (NOT PRODUCTION READY)
      await ctx.db.workspace.update({
        where: { id: input.workspaceId },
        data: {
          openaiMerchantId: input.merchantId,
          openaiApiKey: input.apiKey,
        },
      });

      return { success: true };
    }),

  /**
   * Get workspace feed configuration
   */
  getConfig: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify workspace ownership
      const workspace = await ctx.db.workspace.findUnique({
        where: { id: input.workspaceId },
        select: {
          feedSyncEnabled: true,
          feedSyncFrequency: true,
          lastFeedSyncAt: true,
          nextFeedSyncAt: true,
          openaiMerchantId: true,
          openaiApiKey: true, // Should mask in response
        },
      });

      if (!workspace || workspace.ownerId !== ctx.session.user.id) {
        throw new Error('Workspace not found');
      }

      return {
        ...workspace,
        openaiApiKey: workspace.openaiApiKey ? '***************' : null, // Mask API key
      };
    }),
});
