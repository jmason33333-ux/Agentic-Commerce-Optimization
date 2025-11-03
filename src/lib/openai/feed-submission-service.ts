/**
 * Feed Submission Service
 *
 * Orchestrates feed generation, validation, and submission to OpenAI
 */

import { PrismaClient } from '@prisma/client';
import { generateProductFeed, getFeedStatistics } from './feed-generator';
import { createFeedClient, FeedSubmissionResponse } from './feed-client';

const prisma = new PrismaClient();

export interface SubmitFeedOptions {
  workspaceId: string;
  triggeredBy?: 'MANUAL' | 'SCHEDULED' | 'SYNC' | 'OPTIMIZATION';
  includeUnoptimized?: boolean;
}

export interface SubmitFeedResult {
  success: boolean;
  submissionId: string;
  feedId?: string;
  productCount: number;
  status: string;
  errors?: Array<{
    productId: string;
    field: string;
    message: string;
  }>;
  message?: string;
}

/**
 * Submit product feed to OpenAI
 */
export async function submitProductFeed(
  options: SubmitFeedOptions
): Promise<SubmitFeedResult> {
  const { workspaceId, triggeredBy = 'MANUAL', includeUnoptimized = false } = options;

  // Create feed submission record
  const submission = await prisma.feedSubmission.create({
    data: {
      workspaceId,
      status: 'PENDING',
      triggeredBy,
      productCount: 0,
    },
  });

  try {
    // Get workspace
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        openaiApiKey: true,
        openaiMerchantId: true,
        sellerName: true,
        sellerUrl: true,
        sellerPrivacyPolicy: true,
        sellerTos: true,
      },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    if (!workspace.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (!workspace.openaiMerchantId) {
      throw new Error('OpenAI Merchant ID not configured');
    }

    // Update status to VALIDATING
    await prisma.feedSubmission.update({
      where: { id: submission.id },
      data: { status: 'VALIDATING' },
    });

    // Get products
    const products = await prisma.product.findMany({
      where: {
        workspaceId,
        enableSearch: true, // Only include products enabled for search
      },
    });

    if (products.length === 0) {
      throw new Error('No products enabled for ChatGPT Search');
    }

    // Generate feed
    const feedResult = await generateProductFeed(products, {
      includeUnoptimized,
      format: 'xml',
      merchantInfo: {
        name: workspace.sellerName || 'Store',
        url: workspace.sellerUrl || '',
        privacyPolicy: workspace.sellerPrivacyPolicy || undefined,
        termsOfService: workspace.sellerTos || undefined,
      },
    });

    // Check for critical errors
    const criticalErrors = feedResult.validationErrors.filter(
      (e) => e.severity === 'error'
    );

    if (criticalErrors.length > 0) {
      // Still submit but log errors
      await prisma.feedSubmission.update({
        where: { id: submission.id },
        data: {
          status: 'FAILED',
          errorMessage: `${criticalErrors.length} products have critical errors`,
          errorDetails: criticalErrors,
          productCount: feedResult.productCount,
        },
      });

      return {
        success: false,
        submissionId: submission.id,
        productCount: feedResult.productCount,
        status: 'FAILED',
        errors: criticalErrors.map((e) => ({
          productId: e.productId,
          field: e.field,
          message: e.message,
        })),
        message: `${criticalErrors.length} products have critical validation errors`,
      };
    }

    // Update status to SUBMITTING
    await prisma.feedSubmission.update({
      where: { id: submission.id },
      data: {
        status: 'SUBMITTING',
        productCount: feedResult.productCount,
        feedContent: feedResult.feedContent,
      },
    });

    // Submit to OpenAI
    const feedClient = createFeedClient(workspace.openaiApiKey);
    const openaiResponse = await feedClient.submitFeed({
      merchantId: workspace.openaiMerchantId,
      feedContent: feedResult.feedContent,
      feedFormat: 'xml',
    });

    if (!openaiResponse.success) {
      throw new Error(openaiResponse.message || 'Feed submission failed');
    }

    // Update submission with success
    await prisma.feedSubmission.update({
      where: { id: submission.id },
      data: {
        status: 'SUBMITTED',
        feedId: openaiResponse.feedId,
        indexingStatus: openaiResponse.indexingStatus || 'pending',
        completedAt: new Date(),
      },
    });

    // Update workspace last sync time
    await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        lastFeedSyncAt: new Date(),
      },
    });

    return {
      success: true,
      submissionId: submission.id,
      feedId: openaiResponse.feedId,
      productCount: feedResult.productCount,
      status: 'SUBMITTED',
      message: `Feed submitted successfully with ${feedResult.productCount} products`,
    };
  } catch (error) {
    // Update submission with error
    await prisma.feedSubmission.update({
      where: { id: submission.id },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date(),
      },
    });

    return {
      success: false,
      submissionId: submission.id,
      productCount: 0,
      status: 'FAILED',
      message: error instanceof Error ? error.message : 'Feed submission failed',
    };
  }
}

/**
 * Check feed indexing status
 */
export async function checkFeedStatus(submissionId: string): Promise<{
  status: string;
  productsIndexed: number;
  productsTotal: number;
  lastUpdated: string;
}> {
  const submission = await prisma.feedSubmission.findUnique({
    where: { id: submissionId },
    include: {
      workspace: {
        select: {
          openaiApiKey: true,
        },
      },
    },
  });

  if (!submission) {
    throw new Error('Feed submission not found');
  }

  if (!submission.feedId) {
    return {
      status: submission.status,
      productsIndexed: 0,
      productsTotal: submission.productCount,
      lastUpdated: submission.updatedAt.toISOString(),
    };
  }

  if (!submission.workspace.openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Check status with OpenAI
  const feedClient = createFeedClient(submission.workspace.openaiApiKey);
  const statusResponse = await feedClient.getFeedStatus(submission.feedId);

  // Update local record
  await prisma.feedSubmission.update({
    where: { id: submissionId },
    data: {
      indexingStatus: statusResponse.status,
      status:
        statusResponse.status === 'indexed'
          ? 'INDEXED'
          : statusResponse.status === 'failed'
          ? 'FAILED'
          : 'SUBMITTED',
    },
  });

  return {
    status: statusResponse.status,
    productsIndexed: statusResponse.productsIndexed,
    productsTotal: statusResponse.productsTotal,
    lastUpdated: statusResponse.lastUpdated,
  };
}

/**
 * Get feed submission history
 */
export async function getFeedSubmissionHistory(workspaceId: string) {
  return await prisma.feedSubmission.findMany({
    where: { workspaceId },
    orderBy: { submittedAt: 'desc' },
    take: 20,
  });
}

/**
 * Get feed statistics for workspace
 */
export async function getWorkspaceFeedStats(workspaceId: string) {
  const products = await prisma.product.findMany({
    where: { workspaceId },
  });

  const stats = getFeedStatistics(products);

  const lastSubmission = await prisma.feedSubmission.findFirst({
    where: { workspaceId },
    orderBy: { submittedAt: 'desc' },
  });

  return {
    ...stats,
    lastSubmission: lastSubmission
      ? {
          id: lastSubmission.id,
          status: lastSubmission.status,
          productCount: lastSubmission.productCount,
          submittedAt: lastSubmission.submittedAt,
          triggeredBy: lastSubmission.triggeredBy,
        }
      : null,
  };
}

/**
 * Schedule next feed sync
 */
export async function scheduleNextFeedSync(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      feedSyncEnabled: true,
      feedSyncFrequency: true,
    },
  });

  if (!workspace || !workspace.feedSyncEnabled) {
    return null;
  }

  const now = new Date();
  let nextSync: Date;

  switch (workspace.feedSyncFrequency) {
    case 'EVERY_15_MIN':
      nextSync = new Date(now.getTime() + 15 * 60 * 1000);
      break;
    case 'HOURLY':
      nextSync = new Date(now.getTime() + 60 * 60 * 1000);
      break;
    case 'EVERY_6_HOURS':
      nextSync = new Date(now.getTime() + 6 * 60 * 60 * 1000);
      break;
    case 'DAILY':
      nextSync = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      break;
    case 'WEEKLY':
      nextSync = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      break;
    default:
      return null;
  }

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { nextFeedSyncAt: nextSync },
  });

  return nextSync;
}
