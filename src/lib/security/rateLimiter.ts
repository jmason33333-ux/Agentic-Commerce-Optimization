/**
 * Rate Limiter - Protect API endpoints from abuse
 *
 * MVP Security Mitigation Strategy
 *
 * Limits:
 * - Feed submissions: 10/hour per workspace
 * - Product toggles: 1000/hour per workspace
 * - Auth attempts: 5/15min per IP
 * - Checkout: 20/hour per workspace
 */

import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Initialize Redis (Upstash for serverless compatibility)
let redis: Redis | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = Redis.fromEnv();
} else {
  console.warn('⚠️  Rate limiting disabled - UPSTASH_REDIS_REST_URL not configured');
}

/**
 * Feed submission rate limiter
 * Limit: 10 submissions per hour per workspace
 *
 * Prevents: Excessive API calls to OpenAI
 */
export const feedRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 h'),
      analytics: true,
      prefix: 'feed',
    })
  : null;

/**
 * Product toggle rate limiter
 * Limit: 1000 toggles per hour per workspace
 *
 * Prevents: Database abuse from automated scripts
 */
export const toggleRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(1000, '1 h'),
      analytics: true,
      prefix: 'toggle',
    })
  : null;

/**
 * Auth rate limiter (per IP)
 * Limit: 5 attempts per 15 minutes
 *
 * Prevents: Brute force attacks on API keys
 */
export const authRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '15 m'),
      analytics: true,
      prefix: 'auth',
    })
  : null;

/**
 * Checkout rate limiter
 * Limit: 20 checkouts per hour per workspace
 *
 * Prevents: Checkout spam / fraud attempts
 */
export const checkoutRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 h'),
      analytics: true,
      prefix: 'checkout',
    })
  : null;

/**
 * Helper: Check rate limit and throw if exceeded
 *
 * @param limiter - The rate limiter to use
 * @param identifier - Unique ID (workspaceId or IP)
 * @throws Error if rate limit exceeded
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<void> {
  if (!limiter) {
    // Rate limiting disabled (development mode)
    return;
  }

  const { success, limit, reset, remaining } = await limiter.limit(identifier);

  if (!success) {
    const resetDate = new Date(reset);
    const minutesUntilReset = Math.ceil((reset - Date.now()) / 60000);

    throw new Error(
      `Rate limit exceeded. ${remaining}/${limit} remaining. Try again in ${minutesUntilReset} minutes.`
    );
  }
}

/**
 * Get rate limit status without incrementing
 * Use this to show users their remaining quota
 */
export async function getRateLimitStatus(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{
  remaining: number;
  limit: number;
  reset: Date;
} | null> {
  if (!limiter || !redis) {
    return null;
  }

  // Get current count without incrementing
  const key = `${limiter.prefix}:${identifier}`;
  const count = await redis.get<number>(key);

  // This is approximate - actual implementation depends on Upstash Ratelimit internals
  // For MVP, we'll return null and rely on checkRateLimit for enforcement
  return null;
}

/**
 * Reset rate limit for a specific identifier
 * Use this for support/debugging purposes
 */
export async function resetRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<void> {
  if (!limiter || !redis) {
    return;
  }

  const key = `${limiter.prefix}:${identifier}`;
  await redis.del(key);
  console.log(`✅ Rate limit reset for ${key}`);
}
