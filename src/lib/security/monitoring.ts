/**
 * Security Monitoring - Error tracking and audit logging
 *
 * MVP Security Mitigation Strategy
 *
 * Features:
 * - Sentry integration for error tracking
 * - Security event logging
 * - API key usage audit trail
 * - Automatic PII scrubbing
 */

import * as Sentry from '@sentry/nextjs';
import { PrismaClient } from '@prisma/client';

let db: PrismaClient;

/**
 * Initialize Sentry for error tracking
 * Call this in app/layout.tsx or instrumentation.ts
 */
export function initMonitoring(prismaClient: PrismaClient) {
  db = prismaClient;

  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,

      // Sample 10% of transactions for performance monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

      // Scrub sensitive data before sending to Sentry
      beforeSend(event, hint) {
        // Remove API keys from error messages
        if (event.message) {
          event.message = scrubSensitiveData(event.message);
        }

        // Remove API keys from exception values
        if (event.exception?.values) {
          event.exception.values = event.exception.values.map((exception) => ({
            ...exception,
            value: exception.value ? scrubSensitiveData(exception.value) : exception.value,
          }));
        }

        // Remove sensitive headers
        if (event.request) {
          delete event.request.cookies;
          delete event.request.headers?.authorization;
          delete event.request.headers?.['x-api-key'];
        }

        // Remove sensitive query params
        if (event.request?.query_string) {
          event.request.query_string = scrubSensitiveData(event.request.query_string);
        }

        return event;
      },
    });

    console.log('✅ Sentry monitoring initialized');
  } else {
    console.warn('⚠️  Sentry disabled - SENTRY_DSN not configured');
  }
}

/**
 * Scrub sensitive data from strings
 * Removes API keys, tokens, passwords
 */
function scrubSensitiveData(text: string): string {
  return text
    .replace(/sk-[a-zA-Z0-9_-]+/g, 'sk-***') // OpenAI keys
    .replace(/pk-[a-zA-Z0-9_-]+/g, 'pk-***') // Public keys
    .replace(/shpat_[a-zA-Z0-9]+/g, 'shpat_***') // Shopify tokens
    .replace(/whsec_[a-zA-Z0-9]+/g, 'whsec_***') // Stripe webhook secrets
    .replace(/"password"\s*:\s*"[^"]+"/g, '"password":"***"')
    .replace(/"apiKey"\s*:\s*"[^"]+"/g, '"apiKey":"***"')
    .replace(/"token"\s*:\s*"[^"]+"/g, '"token":"***"');
}

/**
 * Track security events
 * Use this for suspicious activity, failed auth, rate limits, etc.
 */
export function trackSecurityEvent(
  event: string,
  details: Record<string, any>,
  severity: 'info' | 'warning' | 'error' = 'warning'
) {
  // Log to Sentry
  if (process.env.SENTRY_DSN) {
    Sentry.captureMessage(`Security: ${event}`, {
      level: severity,
      extra: details,
      tags: {
        security: true,
        event_type: event,
      },
    });
  }

  // Log to console (will appear in Vercel logs)
  const emoji = severity === 'error' ? '🚨' : severity === 'warning' ? '⚠️' : 'ℹ️';
  console.warn(`${emoji} Security Event: ${event}`, details);
}

/**
 * Track API key usage for audit trail
 * Logs every time an encrypted API key is used
 */
export async function logApiKeyUsage(
  workspaceId: string,
  service: 'openai' | 'shopify' | 'stripe',
  action: string,
  metadata?: Record<string, any>
) {
  try {
    // Log to database (create AuditLog table if needed)
    // For MVP, we'll just log to console
    const logEntry = {
      timestamp: new Date().toISOString(),
      workspaceId,
      service,
      action,
      ...metadata,
    };

    console.log('🔑 API Key Usage:', logEntry);

    // TODO v2: Store in database for compliance
    // await db.auditLog.create({
    //   data: {
    //     workspaceId,
    //     service,
    //     action,
    //     metadata: metadata || {},
    //   },
    // });
  } catch (error) {
    console.error('Failed to log API key usage:', error);
    // Don't throw - logging failures shouldn't break the app
  }
}

/**
 * Track failed authentication attempts
 * Use this to detect brute force attacks
 */
export async function logFailedAuth(
  identifier: string,
  reason: string,
  metadata?: Record<string, any>
) {
  trackSecurityEvent(
    'auth_failed',
    {
      identifier,
      reason,
      ...metadata,
    },
    'warning'
  );

  // TODO v2: Implement automatic IP blocking after N failures
  // const failureCount = await getFailureCount(identifier);
  // if (failureCount > 10) {
  //   await blockIP(identifier);
  // }
}

/**
 * Track successful high-privilege actions
 * Use this for actions that could cause damage if abused
 */
export async function logPrivilegedAction(
  userId: string,
  action: string,
  details: Record<string, any>
) {
  trackSecurityEvent(
    'privileged_action',
    {
      userId,
      action,
      ...details,
    },
    'info'
  );
}

/**
 * Capture exception with context
 * Use this instead of console.error for better debugging
 */
export function captureException(
  error: Error,
  context?: Record<string, any>
) {
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
    });
  }

  console.error('Exception captured:', error, context);
}

/**
 * Set user context for Sentry
 * Call this after user authentication
 */
export function setUserContext(userId: string, workspaceId?: string) {
  if (process.env.SENTRY_DSN) {
    Sentry.setUser({
      id: userId,
      workspace: workspaceId,
    });
  }
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext() {
  if (process.env.SENTRY_DSN) {
    Sentry.setUser(null);
  }
}
