import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { encryptApiKey, decryptApiKey } from '@/lib/security/apiKeyManager';
import { logApiKeyUsage } from '@/lib/security/monitoring';

export const checkoutRouter = router({
  /**
   * Configure Stripe
   */
  configureStripe: protectedProcedure
    .input(
      z.object({
        publishableKey: z.string(),
        secretKey: z.string(),
        webhookSecret: z.string(),
        testMode: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

      // Encrypt sensitive keys before storing
      const encryptedSecretKey = encryptApiKey(input.secretKey);
      const encryptedWebhookSecret = encryptApiKey(input.webhookSecret);

      // Create or update CheckoutConfig
      const config = await ctx.db.checkoutConfig.upsert({
        where: { workspaceId: ctx.session.user.workspaceId },
        create: {
          workspaceId: ctx.session.user.workspaceId,
          stripePublishableKey: input.publishableKey,
          stripeSecretKey: encryptedSecretKey,
          stripeWebhookSecret: encryptedWebhookSecret,
          testMode: input.testMode,
          checkoutUrl: `${baseUrl}/api/checkout/sessions`,
          webhookUrl: `${baseUrl}/api/webhooks/openai`,
          supportedCountries: ['US'], // Default to US
        },
        update: {
          stripePublishableKey: input.publishableKey,
          stripeSecretKey: encryptedSecretKey,
          stripeWebhookSecret: encryptedWebhookSecret,
          testMode: input.testMode,
        },
      });

      // Log API key usage for security audit
      await logApiKeyUsage(ctx.session.user.workspaceId, 'stripe', 'configured');

      return config;
    }),

  /**
   * Get Stripe configuration
   */
  getStripeConfig: protectedProcedure.query(async ({ ctx }) => {
    const config = await ctx.db.checkoutConfig.findUnique({
      where: { workspaceId: ctx.session.user.workspaceId },
    });

    if (!config) {
      return null;
    }

    return {
      ...config,
      // Don't expose secret keys
      stripeSecretKey: '••••••••',
      stripeWebhookSecret: '••••••••',
      hasSecretKey: !!config.stripeSecretKey,
      hasWebhookSecret: !!config.stripeWebhookSecret,
    };
  }),

  /**
   * Test Stripe connection
   */
  testStripeConnection: protectedProcedure.mutation(async ({ ctx }) => {
    const config = await ctx.db.checkoutConfig.findUnique({
      where: { workspaceId: ctx.session.user.workspaceId },
    });

    if (!config) {
      throw new Error('Stripe not configured');
    }

    try {
      // Decrypt Stripe API key
      const secretKey = decryptApiKey(config.stripeSecretKey);

      const response = await fetch('https://api.stripe.com/v1/balance', {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Invalid Stripe credentials');
      }

      // Log API key usage for security audit
      await logApiKeyUsage(ctx.session.user.workspaceId, 'stripe', 'test_connection');

      return { success: true, message: 'Stripe connection successful' };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }),

  /**
   * Update supported countries
   */
  updateSupportedCountries: protectedProcedure
    .input(
      z.object({
        countries: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.checkoutConfig.update({
        where: { workspaceId: ctx.session.user.workspaceId },
        data: {
          supportedCountries: input.countries,
        },
      });
    }),

  /**
   * Register checkout with OpenAI
   */
  registerCheckout: protectedProcedure.mutation(async ({ ctx }) => {
    const workspace = await ctx.db.workspace.findUnique({
      where: { id: ctx.session.user.workspaceId },
    });

    const config = await ctx.db.checkoutConfig.findUnique({
      where: { workspaceId: ctx.session.user.workspaceId },
    });

    if (!workspace?.openaiMerchantId || !workspace?.openaiApiKey) {
      throw new Error('OpenAI credentials not configured');
    }

    if (!config) {
      throw new Error('Checkout configuration not found');
    }

    // Decrypt OpenAI API key
    const apiKey = decryptApiKey(workspace.openaiApiKey);

    // Register checkout endpoints with OpenAI
    const response = await fetch(
      'https://api.openai.com/v1/commerce/checkout/register',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchant_id: workspace.openaiMerchantId,
          checkout_url: config.checkoutUrl,
          webhook_url: config.webhookUrl,
          supported_countries: config.supportedCountries,
          payment_provider: 'stripe',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Registration failed: ${error}`);
    }

    const result = await response.json();

    // Log API key usage for security audit
    await logApiKeyUsage(ctx.session.user.workspaceId, 'openai', 'checkout_registration');

    // Save registration
    await ctx.db.checkoutConfig.update({
      where: { workspaceId: ctx.session.user.workspaceId },
      data: {
        openaiCheckoutId: result.checkout_id,
        registeredAt: new Date(),
      },
    });

    return result;
  }),

  /**
   * Get checkout configuration
   */
  getCheckoutConfig: protectedProcedure.query(async ({ ctx }) => {
    const config = await ctx.db.checkoutConfig.findUnique({
      where: { workspaceId: ctx.session.user.workspaceId },
    });

    return config;
  }),
});
