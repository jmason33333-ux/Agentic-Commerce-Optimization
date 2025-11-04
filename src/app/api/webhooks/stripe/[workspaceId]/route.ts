/**
 * Stripe Webhook Handler
 *
 * POST /api/webhooks/stripe/[workspaceId]
 *
 * Handles Stripe webhook events for checkout sessions and payments
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleStripeWebhook } from '@/lib/checkout/stripe-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    // Get raw body as string (required for signature verification)
    const payload = await request.text();

    // Get Stripe signature header
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Handle webhook
    await handleStripeWebhook(payload, signature, params.workspaceId);

    // Return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);

    // Return 400 for signature verification failures
    // Return 500 for other errors
    const statusCode =
      error instanceof Error && error.message.includes('signature')
        ? 400
        : 500;

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Webhook processing failed',
      },
      { status: statusCode }
    );
  }
}

// Disable body parsing for webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};
