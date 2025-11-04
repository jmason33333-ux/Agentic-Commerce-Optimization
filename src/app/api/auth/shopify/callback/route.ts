import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../[...nextauth]/route';

/**
 * GET /api/auth/shopify/callback
 * Shopify OAuth callback handler
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const shop = searchParams.get('shop');
  const state = searchParams.get('state');

  if (!code || !shop || !state) {
    return NextResponse.redirect(
      new URL('/wizard?error=invalid_oauth', req.url)
    );
  }

  try {
    // Get user session
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.redirect(
        new URL('/login?callbackUrl=/wizard', req.url)
      );
    }

    // TODO: Verify state matches stored state for CSRF protection

    // Redirect back to wizard with success
    // The wizard frontend will call completeShopifyOAuth tRPC endpoint
    const redirectUrl = new URL('/wizard', req.url);
    redirectUrl.searchParams.set('step', '1');
    redirectUrl.searchParams.set('oauth', 'success');
    redirectUrl.searchParams.set('shop', shop);
    redirectUrl.searchParams.set('code', code);
    redirectUrl.searchParams.set('state', state);

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Shopify OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/wizard?error=oauth_failed', req.url)
    );
  }
}
