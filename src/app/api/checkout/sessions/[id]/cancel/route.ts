import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';

/**
 * POST /api/checkout/sessions/:id/cancel
 * Cancel checkout session
 */
export async function POST(
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

    if (session.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot cancel completed session' },
        { status: 400 }
      );
    }

    if (session.status === 'canceled') {
      return NextResponse.json(
        { error: 'Session already canceled' },
        { status: 400 }
      );
    }

    // Update session to canceled
    await db.checkoutSession.update({
      where: { id: params.id },
      data: {
        status: 'canceled',
        canceledAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Session canceled successfully',
      session_id: params.id,
    });
  } catch (error) {
    console.error('Cancel session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
