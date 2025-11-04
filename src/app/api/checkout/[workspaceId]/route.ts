/**
 * OpenAI Checkout Endpoint
 *
 * This endpoint is called by OpenAI when a user initiates checkout in ChatGPT
 *
 * POST /api/checkout/[workspaceId]
 *
 * Spec: https://developers.openai.com/commerce/specs/checkout
 */

import { NextRequest, NextResponse } from 'next/server';
import { createStripeCheckoutSession } from '@/lib/checkout/stripe-service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    // Parse request body from OpenAI
    const body = await request.json();

    // OpenAI sends cart data in this format:
    // {
    //   "items": [
    //     {
    //       "product_id": "prod_123",
    //       "variant_id": "var_456",
    //       "quantity": 2
    //     }
    //   ],
    //   "customer": {
    //     "email": "customer@example.com",
    //     "shipping_address": {
    //       "line1": "123 Main St",
    //       "city": "San Francisco",
    //       "state": "CA",
    //       "postal_code": "94103",
    //       "country": "US"
    //     }
    //   },
    //   "metadata": {
    //     "source": "chatgpt",
    //     "session_id": "..."
    //   }
    // }

    // Validate workspace
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.workspaceId },
      include: { checkoutConfig: true },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    if (!workspace.checkoutConfig || !workspace.checkoutConfig.isConfigured) {
      return NextResponse.json(
        { error: 'Checkout not configured for this workspace' },
        { status: 400 }
      );
    }

    // Validate cart items
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Cart items are required' },
        { status: 400 }
      );
    }

    // Validate customer info
    if (!body.customer || !body.customer.email) {
      return NextResponse.json(
        { error: 'Customer email is required' },
        { status: 400 }
      );
    }

    // Map OpenAI cart format to internal format
    const cartItems = body.items.map((item: any) => ({
      productId: item.product_id,
      variantId: item.variant_id,
      quantity: item.quantity,
    }));

    const customerInfo = {
      email: body.customer.email,
      shippingAddress: body.customer.shipping_address
        ? {
            line1: body.customer.shipping_address.line1,
            line2: body.customer.shipping_address.line2,
            city: body.customer.shipping_address.city,
            state: body.customer.shipping_address.state,
            postalCode: body.customer.shipping_address.postal_code,
            country: body.customer.shipping_address.country,
          }
        : undefined,
    };

    // Create Stripe checkout session
    const checkoutSession = await createStripeCheckoutSession({
      workspaceId: params.workspaceId,
      cartItems,
      customerInfo,
      metadata: {
        ...body.metadata,
        source: 'chatgpt_agentic',
      },
    });

    // Return checkout URL to OpenAI
    // OpenAI will redirect the user to this URL
    return NextResponse.json({
      checkout_url: checkoutSession.checkoutUrl,
      session_id: checkoutSession.sessionId,
      expires_at: checkoutSession.expiresAt.toISOString(),
      total_amount: checkoutSession.totalAmount,
      currency: checkoutSession.currency,
    });
  } catch (error) {
    console.error('Checkout error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Checkout failed',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/checkout/[workspaceId]?session_id=xxx
 *
 * Get checkout session status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }

    // Get checkout session
    const session = await prisma.checkoutSession.findUnique({
      where: { id: sessionId },
      include: { order: true },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Checkout session not found' },
        { status: 404 }
      );
    }

    // Verify workspace matches
    if (session.workspaceId !== params.workspaceId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Return session status
    return NextResponse.json({
      session_id: session.id,
      status: session.status,
      total_amount: Number(session.totalAmount),
      currency: session.currency,
      created_at: session.createdAt.toISOString(),
      expires_at: session.expiresAt.toISOString(),
      order: session.order
        ? {
            order_id: session.order.id,
            order_number: session.order.orderNumber,
            status: session.order.status,
            tracking_number: session.order.trackingNumber,
          }
        : null,
    });
  } catch (error) {
    console.error('Get checkout session error:', error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get checkout session',
      },
      { status: 500 }
    );
  }
}
