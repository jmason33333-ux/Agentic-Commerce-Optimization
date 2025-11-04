import crypto from 'crypto';

export interface ShopifyOAuthConfig {
  clientId: string;
  clientSecret: string;
  scopes: string[];
  redirectUri: string;
}

export class ShopifyOAuth {
  private config: ShopifyOAuthConfig;

  constructor(config: ShopifyOAuthConfig) {
    this.config = config;
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthUrl(shop: string): { url: string; state: string } {
    const state = crypto.randomBytes(16).toString('hex');
    const scopes = this.config.scopes.join(',');

    const url =
      `https://${shop}/admin/oauth/authorize?` +
      `client_id=${this.config.clientId}&` +
      `scope=${scopes}&` +
      `redirect_uri=${this.config.redirectUri}&` +
      `state=${state}`;

    return { url, state };
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(shop: string, code: string): Promise<string> {
    const response = await fetch(
      `https://${shop}/admin/oauth/access_token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  /**
   * Verify Shopify webhook signature
   */
  verifyWebhook(data: string, hmacHeader: string): boolean {
    const hash = crypto
      .createHmac('sha256', this.config.clientSecret)
      .update(data, 'utf8')
      .digest('base64');

    return hash === hmacHeader;
  }
}

// Required Shopify scopes
export const SHOPIFY_SCOPES = [
  'read_products',
  'write_products',
  'read_product_listings',
  'read_inventory',
  'read_locations',
  'read_shop_metadata',
];
