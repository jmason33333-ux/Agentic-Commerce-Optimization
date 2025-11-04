import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import crypto from 'crypto';

/**
 * Verify webhook signature from OpenAI
 */
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');

  return hash === signature;
}

/**
 * POST /api/webhooks/openai
 * Handle webhook events from OpenAI
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();
    const signature = req.headers.get('x-openai-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    // TODO: Get webhook secret from config
    // const isValid = verifyWebhookSignature(payload, signature, webhookSecret);
    // if (!isValid) {
    //   return NextResponse.json(
    //     { error: 'Invalid signature' },
    //     { status: 401 }
    //   );
    // }

    const event = JSON.parse(payload);

    console.log('Received OpenAI webhook:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'order.created':
        await handleOrderCreated(event.data);
        break;

      case 'order.updated':
        await handleOrderUpdated(event.data);
        break;

      case 'payment.succeeded':
        await handlePaymentSucceeded(event.data);
        break;

      case 'payment.failed':
        await handlePaymentFailed(event.data);
        break;

      case 'refund.created':
        await handleRefundCreated(event.data);
        break;

      case 'feed.validation_complete':
        await handleFeedValidationComplete(event.data);
        break;

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle order.created event
 */
async function handleOrderCreated(data: any) {
  console.log('Order created:', data.order_id);

  // Update checkout session if exists
  if (data.checkout_session_id) {
    await db.checkoutSession.update({
      where: { id: data.checkout_session_id },
      data: {
        orderId: data.order_id,
        orderPermalinkUrl: data.order_url,
      },
    });
  }

  // Create order event
  await db.orderEvent.create({
    data: {
      workspaceId: data.workspace_id || 'unknown',
      orderId: data.order_id,
      amount: data.amount || 0,
      currency: data.currency || 'USD',
      sourceChannel: 'CHATGPT_AGENTIC',
      rawPayload: data,
    },
  });
}

/**
 * Handle order.updated event
 */
async function handleOrderUpdated(data: any) {
  console.log('Order updated:', data.order_id);

  // Update order event
  await db.orderEvent.updateMany({
    where: {
      orderId: data.order_id,
    },
    data: {
      rawPayload: data,
    },
  });
}

/**
 * Handle payment.succeeded event
 */
async function handlePaymentSucceeded(data: any) {
  console.log('Payment succeeded:', data.payment_id);

  // Update checkout session
  if (data.checkout_session_id) {
    await db.checkoutSession.update({
      where: { id: data.checkout_session_id },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });
  }
}

/**
 * Handle payment.failed event
 */
async function handlePaymentFailed(data: any) {
  console.error('Payment failed:', data.payment_id, data.error);

  // Update checkout session with error
  if (data.checkout_session_id) {
    await db.checkoutSession.update({
      where: { id: data.checkout_session_id },
      data: {
        messages: [
          {
            type: 'error',
            text: data.error || 'Payment failed',
          },
        ],
      },
    });
  }
}

/**
 * Handle refund.created event
 */
async function handleRefundCreated(data: any) {
  console.log('Refund created:', data.refund_id);

  // Create refund event
  await db.orderEvent.create({
    data: {
      workspaceId: data.workspace_id || 'unknown',
      orderId: data.order_id,
      amount: -Math.abs(data.amount || 0), // Negative for refund
      currency: data.currency || 'USD',
      sourceChannel: 'CHATGPT_AGENTIC',
      rawPayload: {
        ...data,
        event_type: 'refund',
      },
    },
  });
}

/**
 * Handle feed.validation_complete event
 */
async function handleFeedValidationComplete(data: any) {
  console.log('Feed validation complete:', data.feed_id);

  // Update workspace feed status
  await db.workspace.updateMany({
    where: {
      feedSubmissionId: data.feed_id,
    },
    data: {
      feedStatus: data.status,
    },
  });
}
