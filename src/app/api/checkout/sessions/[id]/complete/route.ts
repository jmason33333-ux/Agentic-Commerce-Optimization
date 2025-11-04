import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { decryptApiKey } from '@/lib/security/apiKeyManager';
import { logApiKeyUsage } from '@/lib/security/monitoring';
import { z } from 'zod';

const CompleteSessionSchema = z.object({
  buyer: z.object({
    first_name: z.string(),
    last_name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  payment_data: z.object({
    token: z.string(), // Stripe payment method ID
    provider: z.literal('stripe'),
    billing_address: z
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
  }),
});

/**
 * POST /api/checkout/sessions/:id/complete
 * Complete checkout session with payment
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const validated = CompleteSessionSchema.parse(body);

    // Get checkout session
    const session = await db.checkoutSession.findUnique({
      where: { id: params.id },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.status === 'completed') {
      return NextResponse.json(
        { error: 'Session already completed' },
        { status: 400 }
      );
    }

    if (session.status === 'canceled') {
      return NextResponse.json(
        { error: 'Session canceled' },
        { status: 400 }
      );
    }

    // Get checkout config for Stripe
    const config = await db.checkoutConfig.findUnique({
      where: { workspaceId: session.workspaceId },
    });

    if (!config) {
      return NextResponse.json(
        { error: 'Checkout not configured' },
        { status: 500 }
      );
    }

    // Process payment with Stripe
    const stripeSecretKey = decryptApiKey(config.stripeSecretKey);
    const totals = session.totals as any;
    const amount = Math.round(parseFloat(totals.total) * 100); // Convert to cents

    // Log API key usage for security audit
    await logApiKeyUsage(session.workspaceId, 'stripe', 'payment_processing');

    try {
      // Create Stripe payment intent
      const paymentIntent = await fetch('https://api.stripe.com/v1/payment_intents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          amount: amount.toString(),
          currency: session.currency.toLowerCase(),
          payment_method: validated.payment_data.token,
          confirm: 'true',
          'metadata[session_id]': session.id,
          'metadata[workspace_id]': session.workspaceId,
        }),
      });

      if (!paymentIntent.ok) {
        const error = await paymentIntent.json();
        throw new Error(`Payment failed: ${error.error?.message || 'Unknown error'}`);
      }

      const paymentResult = await paymentIntent.json();

      // Create order ID
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}`;

      // Update session
      await db.checkoutSession.update({
        where: { id: params.id },
        data: {
          status: 'completed',
          buyer: validated.buyer,
          paymentToken: validated.payment_data.token,
          billingAddress: validated.payment_data.billing_address || null,
          orderId,
          orderPermalinkUrl: orderUrl,
          completedAt: new Date(),
        },
      });

      // Create order event
      await db.orderEvent.create({
        data: {
          workspaceId: session.workspaceId,
          orderId,
          amount: parseFloat(totals.total),
          currency: session.currency,
          sourceChannel: 'CHATGPT_AGENTIC',
          rawPayload: {
            sessionId: session.id,
            buyer: validated.buyer,
            items: session.items,
            paymentIntentId: paymentResult.id,
          },
        },
      });

      // Return order response
      return NextResponse.json({
        order: {
          id: orderId,
          checkout_session_id: session.id,
          permalink_url: orderUrl,
        },
      });
    } catch (error) {
      console.error('Payment processing error:', error);

      // Update session with error
      await db.checkoutSession.update({
        where: { id: params.id },
        data: {
          messages: [
            {
              type: 'error',
              text: error instanceof Error ? error.message : 'Payment processing failed',
            },
          ],
        },
      });

      return NextResponse.json(
        {
          error: 'Payment processing failed',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Complete session error:', error);

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
