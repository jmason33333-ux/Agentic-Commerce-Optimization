import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { z } from 'zod';

// Validation schemas
const CreateSessionSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
  buyer: z
    .object({
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
    })
    .optional(),
  fulfillment_address: z
    .object({
      name: z.string().optional(),
      line_one: z.string(),
      line_two: z.string().optional(),
      city: z.string(),
      state: z.string(),
      country: z.string(),
      postal_code: z.string(),
    })
    .optional(),
});

/**
 * POST /api/checkout/sessions
 * Create a new checkout session
 */
export async function POST(req: NextRequest) {
  try {
    // Get workspace ID from auth header or session
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    // TODO: Validate token and get workspace ID
    // For now, we'll extract from token or use a different auth method
    const workspaceId = 'workspace_id_placeholder';

    // Parse request body
    const body = await req.json();
    const validated = CreateSessionSchema.parse(body);

    // Get workspace and products
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    // Get products and calculate line items
    const productIds = validated.items.map((item) => item.id);
    const products = await db.product.findMany({
      where: {
        id: { in: productIds },
        workspaceId,
        enableCheckout: true,
      },
    });

    // Calculate line items
    const lineItems = validated.items.map((item) => {
      const product = products.find((p) => p.id === item.id);
      if (!product) {
        throw new Error(`Product ${item.id} not found or not available`);
      }

      const baseAmount = Number(product.price) * item.quantity;
      const tax = baseAmount * 0.0875; // Example: 8.75% tax
      const total = baseAmount + tax;

      return {
        id: product.id,
        title: product.title,
        quantity: item.quantity,
        base_amount: {
          value: baseAmount.toFixed(2),
          currency: product.currency,
        },
        tax: {
          value: tax.toFixed(2),
          currency: product.currency,
        },
        total: {
          value: total.toFixed(2),
          currency: product.currency,
        },
      };
    });

    // Calculate totals
    const subtotal = lineItems.reduce(
      (sum, item) => sum + Number(item.base_amount.value),
      0
    );
    const totalTax = lineItems.reduce(
      (sum, item) => sum + Number(item.tax.value),
      0
    );
    const shipping = 10.0; // Example flat shipping
    const total = subtotal + totalTax + shipping;

    // Create fulfillment options
    const fulfillmentOptions = [
      {
        id: 'standard',
        type: 'shipping',
        label: 'Standard Shipping',
        description: '5-7 business days',
        amount: {
          value: '10.00',
          currency: 'USD',
        },
        delivery_estimate: {
          minimum_days: 5,
          maximum_days: 7,
        },
      },
      {
        id: 'express',
        type: 'shipping',
        label: 'Express Shipping',
        description: '2-3 business days',
        amount: {
          value: '25.00',
          currency: 'USD',
        },
        delivery_estimate: {
          minimum_days: 2,
          maximum_days: 3,
        },
      },
    ];

    // Create checkout session
    const session = await db.checkoutSession.create({
      data: {
        workspaceId,
        status: validated.buyer && validated.fulfillment_address
          ? 'ready_for_payment'
          : 'not_ready_for_payment',
        currency: 'USD',
        items: validated.items,
        lineItems,
        totals: {
          subtotal: subtotal.toFixed(2),
          tax: totalTax.toFixed(2),
          shipping: shipping.toFixed(2),
          total: total.toFixed(2),
        },
        buyer: validated.buyer || null,
        fulfillmentAddress: validated.fulfillment_address || null,
        fulfillmentOptionId: 'standard',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Build response
    const response = {
      id: session.id,
      status: session.status,
      currency: session.currency,
      line_items: lineItems,
      totals: {
        subtotal: { value: subtotal.toFixed(2), currency: 'USD' },
        tax: { value: totalTax.toFixed(2), currency: 'USD' },
        shipping: { value: shipping.toFixed(2), currency: 'USD' },
        total: { value: total.toFixed(2), currency: 'USD' },
      },
      fulfillment_options: fulfillmentOptions,
      fulfillment_option_id: session.fulfillmentOptionId,
      buyer: session.buyer || undefined,
      fulfillment_address: session.fulfillmentAddress || undefined,
      payment_provider: 'stripe',
      messages: [],
      links: {
        terms_of_service: workspace.sellerTos || undefined,
        privacy_policy: workspace.sellerPrivacyPolicy || undefined,
        seller_policies: {
          return_policy: workspace.returnPolicy || undefined,
          return_window_days: workspace.returnWindow || undefined,
        },
      },
    };

    return NextResponse.json(response, {
      status: 201,
      headers: {
        'Idempotency-Key': req.headers.get('Idempotency-Key') || '',
        'Request-Id': req.headers.get('Request-Id') || '',
      },
    });
  } catch (error) {
    console.error('Create session error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
