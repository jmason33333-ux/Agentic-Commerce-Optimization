/**
 * OpenAI Feed Submission Client
 *
 * Handles feed submission to OpenAI Commerce API
 *
 * API Reference: https://developers.openai.com/commerce/api-reference
 */

export interface FeedSubmissionRequest {
  merchantId: string;
  feedContent: string;
  feedFormat: 'xml' | 'json';
  feedUrl?: string; // Optional: hosted feed URL
}

export interface FeedSubmissionResponse {
  success: boolean;
  feedId?: string;
  indexingStatus?: 'pending' | 'in_progress' | 'indexed' | 'failed';
  message?: string;
  errors?: Array<{
    product_id: string;
    error: string;
  }>;
}

export interface FeedStatusResponse {
  feedId: string;
  status: 'pending' | 'in_progress' | 'indexed' | 'failed' | 'rejected';
  productsIndexed: number;
  productsTotal: number;
  errors?: Array<{
    product_id: string;
    error: string;
  }>;
  lastUpdated: string;
}

/**
 * OpenAI Feed API Client
 */
export class OpenAIFeedClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = 'https://api.openai.com/v1/commerce') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Submit product feed to OpenAI
   */
  async submitFeed(request: FeedSubmissionRequest): Promise<FeedSubmissionResponse> {
    try {
      // If feedUrl is provided, OpenAI will fetch from URL
      // Otherwise, send feed content directly
      const payload = request.feedUrl
        ? {
            merchant_id: request.merchantId,
            feed_url: request.feedUrl,
            feed_format: request.feedFormat,
          }
        : {
            merchant_id: request.merchantId,
            feed_content: request.feedContent,
            feed_format: request.feedFormat,
          };

      const response = await fetch(`${this.baseUrl}/feeds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `Feed submission failed: ${response.statusText}`
        );
      }

      const data = await response.json();

      return {
        success: true,
        feedId: data.feed_id,
        indexingStatus: data.indexing_status || 'pending',
        message: data.message || 'Feed submitted successfully',
      };
    } catch (error) {
      console.error('Feed submission error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Check feed indexing status
   */
  async getFeedStatus(feedId: string): Promise<FeedStatusResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/feeds/${feedId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get feed status: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        feedId: data.feed_id,
        status: data.status,
        productsIndexed: data.products_indexed || 0,
        productsTotal: data.products_total || 0,
        errors: data.errors || [],
        lastUpdated: data.last_updated,
      };
    } catch (error) {
      console.error('Feed status check error:', error);
      throw error;
    }
  }

  /**
   * Update existing feed
   */
  async updateFeed(feedId: string, request: FeedSubmissionRequest): Promise<FeedSubmissionResponse> {
    try {
      const payload = request.feedUrl
        ? {
            feed_url: request.feedUrl,
            feed_format: request.feedFormat,
          }
        : {
            feed_content: request.feedContent,
            feed_format: request.feedFormat,
          };

      const response = await fetch(`${this.baseUrl}/feeds/${feedId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `Feed update failed: ${response.statusText}`
        );
      }

      const data = await response.json();

      return {
        success: true,
        feedId: data.feed_id,
        indexingStatus: data.indexing_status || 'pending',
        message: data.message || 'Feed updated successfully',
      };
    } catch (error) {
      console.error('Feed update error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Delete feed from OpenAI
   */
  async deleteFeed(feedId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/feeds/${feedId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Feed deletion failed: ${response.statusText}`);
      }

      return {
        success: true,
        message: 'Feed deleted successfully',
      };
    } catch (error) {
      console.error('Feed deletion error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * List all feeds for merchant
   */
  async listFeeds(merchantId: string): Promise<{
    feeds: Array<{
      feedId: string;
      status: string;
      productsTotal: number;
      lastUpdated: string;
    }>;
  }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/feeds?merchant_id=${merchantId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to list feeds: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        feeds: data.feeds || [],
      };
    } catch (error) {
      console.error('List feeds error:', error);
      return { feeds: [] };
    }
  }
}

/**
 * Helper: Create feed client from workspace settings
 */
export function createFeedClient(apiKey: string): OpenAIFeedClient {
  return new OpenAIFeedClient(apiKey);
}
