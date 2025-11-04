import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { ShopifyOAuth, SHOPIFY_SCOPES } from '@/lib/shopify/oauth';
import { ShopifyClient } from '@/lib/shopify/client';
import { encryptApiKey, decryptApiKey } from '@/lib/security/apiKeyManager';
import { checkRateLimit, toggleRateLimiter, authRateLimiter } from '@/lib/security/rateLimiter';
import { logApiKeyUsage } from '@/lib/security/monitoring';
import { importShopifyProducts } from '@/lib/services/shopifyImport';

export const wizardRouter = router({
  /**
   * Get wizard progress for current workspace
   */
  getProgress: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = ctx.session.user.workspaceId;

    const progress = await ctx.db.wizardProgress.findUnique({
      where: { workspaceId },
      include: {
        workspace: {
          select: {
            shopifyDomain: true,
            sellerName: true,
            merchantApplicationStatus: true,
            wizardCompleted: true,
          },
        },
      },
    });

    if (!progress) {
      // Create initial progress record
      return await ctx.db.wizardProgress.create({
        data: {
          workspaceId,
          currentStep: 0,
        },
        include: {
          workspace: {
            select: {
              shopifyDomain: true,
              sellerName: true,
              merchantApplicationStatus: true,
              wizardCompleted: true,
            },
          },
        },
      });
    }

    return progress;
  }),

  /**
   * Update wizard step progress
   */
  updateStep: protectedProcedure
    .input(
      z.object({
        step: z.number().min(0).max(7),
        completed: z.boolean(),
        data: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const workspaceId = ctx.session.user.workspaceId;

      const fieldName = `step${input.step}_completed` as any;
      const dataFieldName = `step${input.step}_data` as any;

      return await ctx.db.wizardProgress.update({
        where: { workspaceId },
        data: {
          [fieldName]: input.completed,
          [dataFieldName]: input.data,
          currentStep: input.step,
          ...(input.step === 7 && input.completed
            ? {
                completedAt: new Date(),
                workspace: {
                  update: {
                    wizardCompleted: true,
                    wizardCompletedAt: new Date(),
                  },
                },
              }
            : {}),
        },
      });
    }),

  /**
   * STEP 0: Check merchant application status
   */
  checkMerchantApplication: protectedProcedure.query(async ({ ctx }) => {
    const workspace = await ctx.db.workspace.findUnique({
      where: { id: ctx.session.user.workspaceId },
      select: {
        merchantApplicationStatus: true,
        merchantApplicationDate: true,
        openaiApprovalDate: true,
      },
    });

    return workspace;
  }),

  /**
   * STEP 0: Update merchant application status
   */
  updateMerchantApplication: protectedProcedure
    .input(
      z.object({
        status: z.enum(['not_started', 'pending', 'approved', 'rejected']),
        applicationDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.workspace.update({
        where: { id: ctx.session.user.workspaceId },
        data: {
          merchantApplicationStatus: input.status,
          merchantApplicationDate: input.applicationDate,
        },
      });
    }),

  /**
   * STEP 1: Initiate Shopify OAuth
   */
  initiateShopifyOAuth: protectedProcedure
    .input(z.object({ shop: z.string() }))
    .mutation(async ({ input }) => {
      const oauth = new ShopifyOAuth({
        clientId: process.env.SHOPIFY_CLIENT_ID!,
        clientSecret: process.env.SHOPIFY_CLIENT_SECRET!,
        scopes: SHOPIFY_SCOPES,
        redirectUri: process.env.SHOPIFY_REDIRECT_URI!,
      });

      const { url, state } = oauth.getAuthUrl(input.shop);

      // TODO: Store state in session/database for verification

      return { authUrl: url, state };
    }),

  /**
   * STEP 1: Complete Shopify OAuth & import data
   */
  completeShopifyOAuth: protectedProcedure
    .input(
      z.object({
        shop: z.string(),
        code: z.string(),
        state: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Exchange code for access token
      const oauth = new ShopifyOAuth({
        clientId: process.env.SHOPIFY_CLIENT_ID!,
        clientSecret: process.env.SHOPIFY_CLIENT_SECRET!,
        scopes: SHOPIFY_SCOPES,
        redirectUri: process.env.SHOPIFY_REDIRECT_URI!,
      });

      const accessToken = await oauth.getAccessToken(input.shop, input.code);

      // Encrypt access token before storing
      const encryptedToken = encryptApiKey(accessToken);

      // Save to workspace
      await ctx.db.workspace.update({
        where: { id: ctx.session.user.workspaceId },
        data: {
          shopifyDomain: input.shop,
          shopifyAccessToken: encryptedToken,
          shopifyConnectedAt: new Date(),
        },
      });

      // Log API key usage for security audit
      await logApiKeyUsage(ctx.session.user.workspaceId, 'shopify', 'connected');

      // Fetch shop info and products
      const client = new ShopifyClient(input.shop, accessToken);
      const shopInfo = await client.getShop();
      const products = await client.getAllProducts();

      // Import shop information
      await ctx.db.workspace.update({
        where: { id: ctx.session.user.workspaceId },
        data: {
          sellerName: shopInfo.name,
          sellerUrl: `https://${shopInfo.domain}`,
          sellerPrivacyPolicy: shopInfo.policy?.privacy_policy?.url,
          sellerTos: shopInfo.policy?.terms_of_service?.url,
          returnPolicy: shopInfo.policy?.refund_policy?.body,
        },
      });

      // Import products (run in background)
      const productsImported = await importShopifyProducts(
        ctx.db,
        ctx.session.user.workspaceId,
        products
      );

      return {
        success: true,
        productsImported,
        shopInfo: {
          name: shopInfo.name,
          domain: shopInfo.domain,
        },
      };
    }),

  /**
   * STEP 2: Update store information
   */
  updateStoreInfo: protectedProcedure
    .input(
      z.object({
        sellerName: z.string(),
        sellerUrl: z.string().url(),
        sellerPrivacyPolicy: z.string().url(),
        sellerTos: z.string().url(),
        returnPolicy: z.string(),
        returnWindow: z.number().int().min(0).max(365),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.workspace.update({
        where: { id: ctx.session.user.workspaceId },
        data: input,
      });
    }),

  /**
   * STEP 3: Get product readiness summary
   * MVP: Check for required fields only (no optimization scoring)
   */
  getProductReadiness: protectedProcedure.query(async ({ ctx }) => {
    const products = await ctx.db.product.findMany({
      where: {
        workspaceId: ctx.session.user.workspaceId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        currency: true,
        imageLink: true,
        link: true,
        availability: true,
        gtin: true,
        brand: true,
        status: true,
        enableSearch: true,
        enableCheckout: true,
      },
    });

    // Check required fields for OpenAI product feed
    const checkRequiredFields = (product: any) => {
      const missing: string[] = [];

      if (!product.title?.trim()) missing.push("Title");
      if (!product.description?.trim()) missing.push("Description");
      if (!product.price || product.price <= 0) missing.push("Price");
      if (!product.imageLink?.trim()) missing.push("Image");
      if (!product.link?.trim()) missing.push("Product URL");
      if (!product.availability?.trim()) missing.push("Availability");

      // GTIN or Brand required (at least one)
      if (!product.gtin?.trim() && !product.brand?.trim()) {
        missing.push("GTIN or Brand");
      }

      return missing;
    };

    const productsWithReadiness = products.map((p) => {
      const missingFields = checkRequiredFields(p);
      const isReady = missingFields.length === 0;

      return {
        id: p.id,
        title: p.title || "Untitled Product",
        price: p.price || 0,
        currency: p.currency || "USD",
        imageLink: p.imageLink,
        enableSearch: p.enableSearch,
        enableCheckout: p.enableCheckout,
        isReady,
        missingFields,
        canEnable: isReady,
      };
    });

    const ready = productsWithReadiness.filter((p) => p.isReady);
    const incomplete = productsWithReadiness.filter((p) => !p.isReady);

    return {
      total: products.length,
      ready: ready.length,
      incomplete: incomplete.length,
      products: productsWithReadiness,
    };
  }),

  /**
   * STEP 3: Toggle product for search/checkout
   * MVP: Check for required fields only
   */
  toggleProduct: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        enableSearch: z.boolean().optional(),
        enableCheckout: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Rate limit: 1000 toggles per hour per workspace
      await checkRateLimit(toggleRateLimiter, ctx.session.user.workspaceId);

      const product = await ctx.db.product.findUnique({
        where: { id: input.productId },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          imageLink: true,
          link: true,
          availability: true,
          gtin: true,
          brand: true,
          enableSearch: true,
          enableCheckout: true,
        },
      });

      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        });
      }

      // Check required fields
      const hasRequiredFields =
        product.title?.trim() &&
        product.description?.trim() &&
        product.price &&
        product.price > 0 &&
        product.imageLink?.trim() &&
        product.link?.trim() &&
        product.availability?.trim() &&
        (product.gtin?.trim() || product.brand?.trim());

      if (!hasRequiredFields) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot enable product with missing required fields',
        });
      }

      return await ctx.db.product.update({
        where: { id: input.productId },
        data: {
          enableSearch: input.enableSearch ?? product.enableSearch,
          enableCheckout: input.enableCheckout ?? product.enableCheckout,
        },
      });
    }),

  /**
   * STEP 7: Run setup tests
   */
  runSetupTests: protectedProcedure.mutation(async ({ ctx }) => {
    const workspace = await ctx.db.workspace.findUnique({
      where: { id: ctx.session.user.workspaceId },
      include: {
        checkoutConfig: true,
      },
    });

    const results = {
      shopifyConnection: false,
      storeInfo: false,
      productsReady: false,
      feedConfiguration: false,
      stripeConnection: false,
      checkoutEndpoints: false,
      openaiRegistration: false,
    };

    // Test 1: Shopify connection
    if (workspace?.shopifyAccessToken && workspace?.shopifyDomain) {
      try {
        const client = new ShopifyClient(
          workspace.shopifyDomain,
          decryptApiKey(workspace.shopifyAccessToken)
        );
        await client.getShop();
        results.shopifyConnection = true;

        // Log API key usage
        await logApiKeyUsage(ctx.session.user.workspaceId, 'shopify', 'test_connection');
      } catch (error) {
        console.error('Shopify connection test failed:', error);
      }
    }

    // Test 2: Store information complete
    results.storeInfo = !!(
      workspace?.sellerName &&
      workspace?.sellerUrl &&
      workspace?.sellerPrivacyPolicy &&
      workspace?.sellerTos &&
      workspace?.returnWindow
    );

    // Test 3: Products ready
    // MVP: Just check if any products are enabled (no optimization score check)
    const readyProducts = await ctx.db.product.count({
      where: {
        workspaceId: ctx.session.user.workspaceId,
        OR: [{ enableSearch: true }, { enableCheckout: true }],
      },
    });
    results.productsReady = readyProducts > 0;

    // Test 4: Feed configuration
    results.feedConfiguration = !!(
      workspace?.openaiMerchantId && workspace?.openaiApiKey
    );

    // Test 5: Stripe connection
    if (workspace?.checkoutConfig) {
      results.stripeConnection = !!(
        workspace.checkoutConfig.stripePublishableKey &&
        workspace.checkoutConfig.stripeSecretKey
      );
    }

    // Test 6: Checkout endpoints
    results.checkoutEndpoints = !!workspace?.checkoutConfig?.checkoutUrl;

    // Test 7: OpenAI registration
    results.openaiRegistration =
      !!workspace?.checkoutConfig?.openaiCheckoutId;

    return results;
  }),
});
