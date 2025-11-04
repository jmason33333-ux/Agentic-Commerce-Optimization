import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { z } from 'zod';

const UpdateSessionSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string(),
        quantity: z.number().int().positive(),
      })
    )
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
  fulfillment_option_id: z.string().optional(),
});

/**
 * GET /api/checkout/sessions/:id
 * Retrieve checkout session
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await db.checkoutSession.findUnique({
      where: { id: params.id },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get workspace for policy links
    const workspace = await db.workspace.findUnique({
      where: { id: session.workspaceId },
    });

    const response = {
      id: session.id,
      status: session.status,
      currency: session.currency,
      line_items: session.lineItems,
      totals: session.totals,
      fulfillment_options: [], // TODO: Generate from configuration
      fulfillment_option_id: session.fulfillmentOptionId,
      buyer: session.buyer || undefined,
      fulfillment_address: session.fulfillmentAddress || undefined,
      payment_provider: session.paymentProvider,
      messages: session.messages || [],
      links: {
        terms_of_service: workspace?.sellerTos || undefined,
        privacy_policy: workspace?.sellerPrivacyPolicy || undefined,
        seller_policies: {
          return_policy: workspace?.returnPolicy || undefined,
          return_window_days: workspace?.returnWindow || undefined,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/checkout/sessions/:id
 * Update checkout session
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const validated = UpdateSessionSchema.parse(body);

    const session = await db.checkoutSession.findUnique({
      where: { id: params.id },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.status === 'completed' || session.status === 'canceled') {
      return NextResponse.json(
        { error: 'Cannot update completed or canceled session' },
        { status: 400 }
      );
    }

    // Update session
    const updated = await db.checkoutSession.update({
      where: { id: params.id },
      data: {
        items: validated.items || session.items,
        fulfillmentAddress: validated.fulfillment_address || session.fulfillmentAddress,
        fulfillmentOptionId: validated.fulfillment_option_id || session.fulfillmentOptionId,
        // Recalculate if items changed
        // TODO: Implement recalculation logic
      },
    });

    // Get workspace for policy links
    const workspace = await db.workspace.findUnique({
      where: { id: session.workspaceId },
    });

    const response = {
      id: updated.id,
      status: updated.status,
      currency: updated.currency,
      line_items: updated.lineItems,
      totals: updated.totals,
      fulfillment_options: [], // TODO: Generate from configuration
      fulfillment_option_id: updated.fulfillmentOptionId,
      buyer: updated.buyer || undefined,
      fulfillment_address: updated.fulfillmentAddress || undefined,
      payment_provider: updated.paymentProvider,
      messages: updated.messages || [],
      links: {
        terms_of_service: workspace?.sellerTos || undefined,
        privacy_policy: workspace?.sellerPrivacyPolicy || undefined,
        seller_policies: {
          return_policy: workspace?.returnPolicy || undefined,
          return_window_days: workspace?.returnWindow || undefined,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Update session error:', error);

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
