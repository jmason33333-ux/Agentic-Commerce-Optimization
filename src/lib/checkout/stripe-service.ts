/**
 * Stripe Checkout Service
 *
 * Handles Stripe integration for ChatGPT Checkout
 *
 * OpenAI Checkout Spec: https://developers.openai.com/commerce/specs/checkout
 */

import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateCheckoutSessionRequest {
  workspaceId: string;
  cartItems: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
  }>;
  customerInfo: {
    email: string;
    shippingAddress?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  metadata?: Record<string, string>;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  checkoutUrl: string;
  expiresAt: Date;
  totalAmount: number;
  currency: string;
}

/**
 * Create Stripe checkout session for OpenAI checkout
 */
export async function createStripeCheckoutSession(
  request: CreateCheckoutSessionRequest
): Promise<CheckoutSessionResponse> {
  // Get workspace and checkout config
  const workspace = await prisma.workspace.findUnique({
    where: { id: request.workspaceId },
    include: { checkoutConfig: true },
  });

  if (!workspace) {
    throw new Error('Workspace not found');
  }

  if (!workspace.checkoutConfig || !workspace.checkoutConfig.isConfigured) {
    throw new Error('Checkout not configured. Please configure Stripe integration.');
  }

  // Initialize Stripe client
  const stripe = new Stripe(workspace.checkoutConfig.stripeSecretKey!, {
    apiVersion: '2024-11-20.acacia',
  });

  // Fetch products and calculate line items
  const lineItems = await Promise.all(
    request.cartItems.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (!product.enableCheckout) {
        throw new Error(`Product ${product.title} is not enabled for checkout`);
      }

      // Calculate price in cents
      const unitAmount = Math.round(Number(product.price) * 100);

      return {
        price_data: {
          currency: product.currency.toLowerCase(),
          unit_amount: unitAmount,
          product_data: {
            name: product.title,
            description: product.description?.substring(0, 500),
            images: product.imageLink ? [product.imageLink] : [],
            metadata: {
              productId: product.id,
              sourceId: product.sourceId,
              variantId: item.variantId || '',
            },
          },
        },
        quantity: item.quantity,
      };
    })
  );

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    customer_email: request.customerInfo.email,

    // Success/Cancel URLs
    success_url: `${workspace.checkoutConfig.checkoutUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${workspace.checkoutConfig.checkoutUrl}/cancel`,

    // Shipping
    shipping_address_collection: {
      allowed_countries: ['US', 'CA', 'GB', 'AU'], // TODO: Make configurable
    },

    // Metadata for tracking
    metadata: {
      workspaceId: workspace.id,
      source: 'chatgpt_agentic',
      ...request.metadata,
    },

    // Payment methods
    payment_method_types: ['card'],

    // Expiration (24 hours)
    expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
  });

  // Store checkout session in database
  await prisma.checkoutSession.create({
    data: {
      id: session.id,
      workspaceId: workspace.id,
      stripeSessionId: session.id,
      status: 'pending',
      customerEmail: request.customerInfo.email,
      totalAmount: session.amount_total! / 100,
      currency: session.currency!,
      expiresAt: new Date(session.expires_at * 1000),
      cartData: request.cartItems as any,
      metadata: request.metadata as any,
    },
  });

  return {
    sessionId: session.id,
    checkoutUrl: session.url!,
    expiresAt: new Date(session.expires_at * 1000),
    totalAmount: session.amount_total! / 100,
    currency: session.currency!,
  };
}

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(
  payload: string,
  signature: string,
  workspaceId: string
): Promise<void> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { checkoutConfig: true },
  });

  if (!workspace?.checkoutConfig?.stripeWebhookSecret) {
    throw new Error('Stripe webhook secret not configured');
  }

  const stripe = new Stripe(workspace.checkoutConfig.stripeSecretKey!, {
    apiVersion: '2024-11-20.acacia',
  });

  // Verify webhook signature
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      workspace.checkoutConfig.stripeWebhookSecret
    );
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err}`);
  }

  // Handle event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      break;

    case 'checkout.session.expired':
      await handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session);
      break;

    case 'payment_intent.succeeded':
      await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;

    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

/**
 * Handle successful checkout
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  // Update checkout session status
  await prisma.checkoutSession.update({
    where: { stripeSessionId: session.id },
    data: {
      status: 'completed',
      completedAt: new Date(),
      paymentIntentId: session.payment_intent as string,
    },
  });

  // Create order record
  const checkoutSession = await prisma.checkoutSession.findUnique({
    where: { stripeSessionId: session.id },
  });

  if (checkoutSession) {
    await prisma.order.create({
      data: {
        workspaceId: checkoutSession.workspaceId,
        checkoutSessionId: checkoutSession.id,
        customerEmail: session.customer_email!,
        totalAmount: session.amount_total! / 100,
        currency: session.currency!,
        status: 'pending_fulfillment',
        source: 'chatgpt_agentic',
        shippingAddress: session.shipping_details as any,
        metadata: checkoutSession.metadata as any,
      },
    });

    // TODO: Notify OpenAI of successful order
    // TODO: Send confirmation email to customer
    // TODO: Create fulfillment in Shopify
  }
}

/**
 * Handle expired checkout session
 */
async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  await prisma.checkoutSession.update({
    where: { stripeSessionId: session.id },
    data: {
      status: 'expired',
      completedAt: new Date(),
    },
  });
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  // Find order by payment intent
  const order = await prisma.order.findFirst({
    where: {
      checkoutSession: {
        paymentIntentId: paymentIntent.id,
      },
    },
  });

  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'paid' },
    });
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const order = await prisma.order.findFirst({
    where: {
      checkoutSession: {
        paymentIntentId: paymentIntent.id,
      },
    },
  });

  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'payment_failed',
        metadata: {
          ...order.metadata as any,
          failureReason: paymentIntent.last_payment_error?.message,
        },
      },
    });
  }
}

/**
 * Get checkout session details
 */
export async function getCheckoutSession(sessionId: string) {
  return await prisma.checkoutSession.findUnique({
    where: { id: sessionId },
    include: {
      workspace: true,
      order: true,
    },
  });
}

/**
 * Validate Stripe credentials
 */
export async function validateStripeCredentials(
  publishableKey: string,
  secretKey: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const stripe = new Stripe(secretKey, {
      apiVersion: '2024-11-20.acacia',
    });

    // Test API call
    await stripe.balance.retrieve();

    // Verify publishable key matches secret key
    if (!publishableKey.startsWith('pk_')) {
      return { valid: false, error: 'Invalid publishable key format' };
    }

    if (!secretKey.startsWith('sk_')) {
      return { valid: false, error: 'Invalid secret key format' };
    }

    // Check if keys are from same account (test vs live)
    const pkMode = publishableKey.includes('_test_') ? 'test' : 'live';
    const skMode = secretKey.includes('_test_') ? 'test' : 'live';

    if (pkMode !== skMode) {
      return {
        valid: false,
        error: 'Publishable and secret keys must both be test or both be live',
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid API key',
    };
  }
}
