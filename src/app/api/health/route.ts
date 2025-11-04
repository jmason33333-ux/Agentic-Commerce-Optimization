/**
 * Health Check Endpoint
 *
 * MVP Security Mitigation Strategy
 *
 * Use this for:
 * - Uptime monitoring (UptimeRobot, Pingdom)
 * - Load balancer health checks
 * - Status page integration
 * - Debugging deployment issues
 *
 * GET /api/health
 */

import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export const runtime = 'nodejs'; // Use Node.js runtime for database access
export const dynamic = 'force-dynamic'; // Always run dynamically (no caching)

export async function GET(request: Request) {
  const startTime = Date.now();

  try {
    // Check 1: Database connectivity
    await db.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - startTime;

    // Check 2: Redis (if configured)
    let redisStatus = 'not_configured';
    try {
      if (process.env.UPSTASH_REDIS_REST_URL) {
        const { Redis } = await import('@upstash/redis');
        const redis = Redis.fromEnv();
        await redis.ping();
        redisStatus = 'ok';
      }
    } catch (error) {
      redisStatus = 'error';
      console.error('Redis health check failed:', error);
    }

    // Check 3: Environment variables
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'ENCRYPTION_KEY',
    ];

    const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

    // Build response
    const response = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'unknown',
      checks: {
        database: {
          status: 'ok',
          latency_ms: dbLatency,
        },
        redis: {
          status: redisStatus,
        },
        env_vars: {
          status: missingEnvVars.length === 0 ? 'ok' : 'warning',
          missing: missingEnvVars,
        },
      },
      uptime: process.uptime(), // Seconds since process started
    };

    // Return 200 if all critical checks pass
    if (missingEnvVars.length > 0) {
      return NextResponse.json(response, { status: 503 });
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    // Health check failed
    const response = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      version: process.env.APP_VERSION || '1.0.0',
    };

    return NextResponse.json(response, { status: 503 });
  }
}
