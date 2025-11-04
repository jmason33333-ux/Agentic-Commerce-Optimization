import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { encryptApiKey, decryptApiKey } from '@/lib/security/apiKeyManager';
import { checkRateLimit, feedRateLimiter } from '@/lib/security/rateLimiter';
import { logApiKeyUsage } from '@/lib/security/monitoring';
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
      // Encrypt API key before storing
      const encryptedApiKey = encryptApiKey(input.apiKey);

      // Save to workspace
      const result = await ctx.db.workspace.update({
        where: { id: ctx.session.user.workspaceId },
        data: {
          openaiMerchantId: input.merchantId,
          openaiApiKey: encryptedApiKey,
          feedRefreshInterval: input.autoRefreshInterval,
        },
      });

      // Log API key usage for security audit
      await logApiKeyUsage(ctx.session.user.workspaceId, 'openai', 'configured');

      return result;
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
      // Rate limit: 10 submissions per hour per workspace
      await checkRateLimit(feedRateLimiter, ctx.session.user.workspaceId);

      const workspace = await ctx.db.workspace.findUnique({
        where: { id: ctx.session.user.workspaceId },
      });

      if (!workspace?.openaiMerchantId || !workspace?.openaiApiKey) {
        throw new Error('OpenAI credentials not configured');
      }

      // Decrypt API key for use
      const apiKey = decryptApiKey(workspace.openaiApiKey);

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
        apiKey,
        input.format
      );

      // Log API key usage for security audit
      await logApiKeyUsage(ctx.session.user.workspaceId, 'openai', 'feed_submission');

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
