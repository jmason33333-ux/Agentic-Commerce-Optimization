import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import {
  validateStripeCredentials,
  getCheckoutSession,
} from '../../lib/checkout/stripe-service';
import {
  createCheckoutClient,
  CheckoutConfigRegistration,
} from '../../lib/checkout/openai-checkout-client';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

function encryptKey(key: string): string {
  return CryptoJS.AES.encrypt(key, ENCRYPTION_KEY).toString();
}

function decryptKey(encrypted: string): string {
  const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export const checkoutRouter = router({
  /**
   * Get checkout configuration
   */
  getConfig: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify workspace ownership
      const workspace = await ctx.db.workspace.findUnique({
        where: { id: input.workspaceId },
        include: { checkoutConfig: true },
      });

      if (!workspace || workspace.ownerId !== ctx.session.user.id) {
        throw new Error('Workspace not found');
      }

      if (!workspace.checkoutConfig) {
        return null;
      }

      // Mask sensitive keys
      return {
        ...workspace.checkoutConfig,
        stripeSecretKey: workspace.checkoutConfig.stripeSecretKey ? '***masked***' : null,
        stripeWebhookSecret: workspace.checkoutConfig.stripeWebhookSecret ? '***masked***' : null,
      };
    }),

  /**
   * Configure Stripe integration
   */
  configureStripe: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        publishableKey: z.string(),
        secretKey: z.string(),
        webhookSecret: z.string().optional(),
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

      // Validate Stripe credentials
      const validation = await validateStripeCredentials(
        input.publishableKey,
        input.secretKey
      );

      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid Stripe credentials');
      }

      // Encrypt keys before storing
      const encryptedSecretKey = encryptKey(input.secretKey);
      const encryptedWebhookSecret = input.webhookSecret
        ? encryptKey(input.webhookSecret)
        : null;

      // Create or update checkout config
      const checkoutConfig = await ctx.db.checkoutConfig.upsert({
        where: { workspaceId: input.workspaceId },
        create: {
          workspaceId: input.workspaceId,
          provider: 'stripe',
          stripePublishableKey: input.publishableKey,
          stripeSecretKey: encryptedSecretKey,
          stripeWebhookSecret: encryptedWebhookSecret,
          isConfigured: false, // Not fully configured until OpenAI registration
        },
        update: {
          stripePublishableKey: input.publishableKey,
          stripeSecretKey: encryptedSecretKey,
          stripeWebhookSecret: encryptedWebhookSecret,
        },
      });

      return { success: true, configId: checkoutConfig.id };
    }),

  /**
   * Configure checkout URLs
   */
  configureUrls: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        checkoutUrl: z.string().url(),
        webhookUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify workspace ownership
      const workspace = await ctx.db.workspace.findUnique({
        where: { id: input.workspaceId },
        include: { checkoutConfig: true },
      });

      if (!workspace || workspace.ownerId !== ctx.session.user.id) {
        throw new Error('Workspace not found');
      }

      if (!workspace.checkoutConfig) {
        throw new Error('Stripe not configured. Please configure Stripe first.');
      }

      // Update checkout config
      await ctx.db.checkoutConfig.update({
        where: { workspaceId: input.workspaceId },
        data: {
          checkoutUrl: input.checkoutUrl,
          webhookUrl: input.webhookUrl,
        },
      });

      return { success: true };
    }),

  /**
   * Register checkout with OpenAI
   */
  registerWithOpenAI: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        supportedCountries: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify workspace ownership
      const workspace = await ctx.db.workspace.findUnique({
        where: { id: input.workspaceId },
        include: { checkoutConfig: true },
      });

      if (!workspace || workspace.ownerId !== ctx.session.user.id) {
        throw new Error('Workspace not found');
      }

      if (!workspace.checkoutConfig) {
        throw new Error('Checkout not configured');
      }

      if (!workspace.openaiApiKey || !workspace.openaiMerchantId) {
        throw new Error('OpenAI credentials not configured');
      }

      if (!workspace.checkoutConfig.checkoutUrl) {
        throw new Error('Checkout URL not configured');
      }

      // Create OpenAI client
      const openaiClient = createCheckoutClient(workspace.openaiApiKey);

      // Register checkout configuration
      const registrationConfig: CheckoutConfigRegistration = {
        merchantId: workspace.openaiMerchantId,
        checkoutUrl: workspace.checkoutConfig.checkoutUrl,
        webhookUrl: workspace.checkoutConfig.webhookUrl || workspace.checkoutConfig.checkoutUrl,
        supportedPaymentMethods: ['card'], // Stripe supports cards
        supportedCountries: input.supportedCountries || ['US', 'CA', 'GB', 'AU'],
        returnPolicy: workspace.returnPolicy || undefined,
        shippingPolicy: undefined, // TODO: Add to workspace model
      };

      const response = await openaiClient.registerCheckout(registrationConfig);

      // Update checkout config with OpenAI checkout ID
      await ctx.db.checkoutConfig.update({
        where: { workspaceId: input.workspaceId },
        data: {
          openaiCheckoutId: response.checkoutId,
          isConfigured: true,
          lastVerifiedAt: new Date(),
        },
      });

      return {
        success: true,
        checkoutId: response.checkoutId,
        status: response.status,
        verificationRequired: response.verificationRequired,
        verificationUrl: response.verificationUrl,
      };
    }),

  /**
   * Test checkout configuration
   */
  testCheckout: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify workspace ownership
      const workspace = await ctx.db.workspace.findUnique({
        where: { id: input.workspaceId },
        include: { checkoutConfig: true },
      });

      if (!workspace || workspace.ownerId !== ctx.session.user.id) {
        throw new Error('Workspace not found');
      }

      if (!workspace.checkoutConfig?.openaiCheckoutId) {
        throw new Error('Checkout not registered with OpenAI');
      }

      if (!workspace.openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      // Test checkout endpoint
      const openaiClient = createCheckoutClient(workspace.openaiApiKey);
      const testResult = await openaiClient.testCheckout(
        workspace.checkoutConfig.openaiCheckoutId
      );

      return testResult;
    }),

  /**
   * Get checkout status from OpenAI
   */
  getStatus: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify workspace ownership
      const workspace = await ctx.db.workspace.findUnique({
        where: { id: input.workspaceId },
        include: { checkoutConfig: true },
      });

      if (!workspace || workspace.ownerId !== ctx.session.user.id) {
        throw new Error('Workspace not found');
      }

      if (!workspace.checkoutConfig?.openaiCheckoutId) {
        return { registered: false };
      }

      if (!workspace.openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      // Get status from OpenAI
      const openaiClient = createCheckoutClient(workspace.openaiApiKey);
      const status = await openaiClient.getCheckoutStatus(
        workspace.checkoutConfig.openaiCheckoutId
      );

      return {
        registered: true,
        ...status,
      };
    }),

  /**
   * Get checkout sessions (orders)
   */
  getSessions: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        limit: z.number().default(50),
        offset: z.number().default(0),
        status: z.enum(['PENDING', 'COMPLETED', 'EXPIRED', 'CANCELLED']).optional(),
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

      const where: any = { workspaceId: input.workspaceId };
      if (input.status) {
        where.status = input.status;
      }

      const [sessions, totalCount] = await Promise.all([
        ctx.db.checkoutSession.findMany({
          where,
          take: input.limit,
          skip: input.offset,
          orderBy: { createdAt: 'desc' },
          include: { order: true },
        }),
        ctx.db.checkoutSession.count({ where }),
      ]);

      return { sessions, totalCount };
    }),

  /**
   * Get orders
   */
  getOrders: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        limit: z.number().default(50),
        offset: z.number().default(0),
        status: z
          .enum([
            'PENDING_FULFILLMENT',
            'PAID',
            'PROCESSING',
            'SHIPPED',
            'DELIVERED',
            'CANCELLED',
            'REFUNDED',
            'PAYMENT_FAILED',
          ])
          .optional(),
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

      const where: any = { workspaceId: input.workspaceId };
      if (input.status) {
        where.status = input.status;
      }

      const [orders, totalCount] = await Promise.all([
        ctx.db.order.findMany({
          where,
          take: input.limit,
          skip: input.offset,
          orderBy: { createdAt: 'desc' },
          include: { checkoutSession: true },
        }),
        ctx.db.order.count({ where }),
      ]);

      return { orders, totalCount };
    }),

  /**
   * Update order status
   */
  updateOrder: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        status: z.enum([
          'PENDING_FULFILLMENT',
          'PAID',
          'PROCESSING',
          'SHIPPED',
          'DELIVERED',
          'CANCELLED',
          'REFUNDED',
        ]),
        trackingNumber: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get order and verify workspace ownership
      const order = await ctx.db.order.findUnique({
        where: { id: input.orderId },
        include: { workspace: true },
      });

      if (!order || order.workspace.ownerId !== ctx.session.user.id) {
        throw new Error('Order not found');
      }

      // Update order
      const updatedOrder = await ctx.db.order.update({
        where: { id: input.orderId },
        data: {
          status: input.status,
          trackingNumber: input.trackingNumber,
          notes: input.notes,
          shippedAt: input.status === 'SHIPPED' ? new Date() : order.shippedAt,
          deliveredAt: input.status === 'DELIVERED' ? new Date() : order.deliveredAt,
        },
      });

      // TODO: Send order update to OpenAI
      // TODO: Send notification email to customer

      return updatedOrder;
    }),
});
