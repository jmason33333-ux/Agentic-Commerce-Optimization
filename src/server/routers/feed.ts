import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { encryptString, decryptString } from '@/lib/encryption';
import {
  generateProductFeed,
  submitFeedToOpenAI,
} from '@/lib/services/feedGeneration';

export const feedRouter = router({
  /**
   * Configure OpenAI credentials
   */
  configureOpenAI: protectedProcedure
    .input(
      z.object({
        merchantId: z.string(),
        apiKey: z.string(),
        autoRefreshInterval: z.enum(['manual', 'daily', '15min']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Save to workspace
      return await ctx.db.workspace.update({
        where: { id: ctx.session.user.workspaceId },
        data: {
          openaiMerchantId: input.merchantId,
          openaiApiKey: encryptString(input.apiKey),
          feedRefreshInterval: input.autoRefreshInterval,
        },
      });
    }),

  /**
   * Generate feed from products
   */
  generateFeed: protectedProcedure
    .input(
      z.object({
        format: z.enum(['TSV', 'CSV', 'JSON']).optional().default('TSV'),
      })
    )
    .query(async ({ ctx, input }) => {
      const feed = await generateProductFeed(
        ctx.db,
        ctx.session.user.workspaceId,
        input.format
      );

      return { feed };
    }),

  /**
   * Preview feed (first 10 products)
   */
  previewFeed: protectedProcedure
    .input(
      z.object({
        format: z.enum(['TSV', 'CSV', 'JSON']).optional().default('TSV'),
      })
    )
    .query(async ({ ctx, input }) => {
      const feed = await generateProductFeed(
        ctx.db,
        ctx.session.user.workspaceId,
        input.format
      );

      // Return first 10 lines for preview
      const lines = feed.split('\n');
      const preview = lines.slice(0, 11).join('\n'); // Header + 10 products

      return {
        preview,
        totalProducts: lines.length - 1, // -1 for header
      };
    }),

  /**
   * Submit feed to OpenAI
   */
  submitFeed: protectedProcedure
    .input(
      z.object({
        format: z.enum(['TSV', 'CSV', 'JSON']).optional().default('TSV'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const workspace = await ctx.db.workspace.findUnique({
        where: { id: ctx.session.user.workspaceId },
      });

      if (!workspace?.openaiMerchantId || !workspace?.openaiApiKey) {
        throw new Error('OpenAI credentials not configured');
      }

      // Generate feed
      const feed = await generateProductFeed(
        ctx.db,
        ctx.session.user.workspaceId,
        input.format
      );

      // Submit to OpenAI
      const result = await submitFeedToOpenAI(
        feed,
        workspace.openaiMerchantId,
        decryptString(workspace.openaiApiKey),
        input.format
      );

      // Save submission status
      await ctx.db.workspace.update({
        where: { id: ctx.session.user.workspaceId },
        data: {
          lastFeedSubmission: new Date(),
          feedSubmissionId: result.id,
          feedStatus: result.status,
        },
      });

      return result;
    }),

  /**
   * Get feed submission status
   */
  getSubmissionStatus: protectedProcedure.query(async ({ ctx }) => {
    const workspace = await ctx.db.workspace.findUnique({
      where: { id: ctx.session.user.workspaceId },
      select: {
        lastFeedSubmission: true,
        feedSubmissionId: true,
        feedStatus: true,
        feedRefreshInterval: true,
      },
    });

    return workspace;
  }),

  /**
   * Get feed configuration
   */
  getConfiguration: protectedProcedure.query(async ({ ctx }) => {
    const workspace = await ctx.db.workspace.findUnique({
      where: { id: ctx.session.user.workspaceId },
      select: {
        openaiMerchantId: true,
        openaiApiKey: true,
        feedRefreshInterval: true,
        lastFeedSubmission: true,
        feedSubmissionId: true,
        feedStatus: true,
      },
    });

    return {
      ...workspace,
      hasCredentials: !!(workspace?.openaiMerchantId && workspace?.openaiApiKey),
      // Don't expose actual API key
      openaiApiKey: workspace?.openaiApiKey ? '••••••••' : null,
    };
  }),
});
