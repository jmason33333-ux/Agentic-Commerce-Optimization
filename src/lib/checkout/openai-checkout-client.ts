/**
 * OpenAI Checkout Registration Client
 *
 * Handles registration of checkout configuration with OpenAI
 *
 * Spec: https://developers.openai.com/commerce/specs/checkout
 */

export interface CheckoutConfigRegistration {
  merchantId: string;
  checkoutUrl: string;
  webhookUrl: string;
  supportedPaymentMethods: string[];
  supportedCountries: string[];
  returnPolicy?: string;
  shippingPolicy?: string;
}

export interface CheckoutConfigResponse {
  checkoutId: string;
  status: 'active' | 'pending' | 'suspended';
  verificationRequired: boolean;
  verificationUrl?: string;
}

/**
 * OpenAI Checkout API Client
 */
export class OpenAICheckoutClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = 'https://api.openai.com/v1/commerce') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Register checkout configuration with OpenAI
   */
  async registerCheckout(
    config: CheckoutConfigRegistration
  ): Promise<CheckoutConfigResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/checkout/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          merchant_id: config.merchantId,
          checkout_url: config.checkoutUrl,
          webhook_url: config.webhookUrl,
          supported_payment_methods: config.supportedPaymentMethods,
          supported_countries: config.supportedCountries,
          return_policy: config.returnPolicy,
          shipping_policy: config.shippingPolicy,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message ||
            `Checkout registration failed: ${response.statusText}`
        );
      }

      const data = await response.json();

      return {
        checkoutId: data.checkout_id,
        status: data.status,
        verificationRequired: data.verification_required || false,
        verificationUrl: data.verification_url,
      };
    } catch (error) {
      console.error('Checkout registration error:', error);
      throw error;
    }
  }

  /**
   * Update existing checkout configuration
   */
  async updateCheckout(
    checkoutId: string,
    config: Partial<CheckoutConfigRegistration>
  ): Promise<CheckoutConfigResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/checkout/${checkoutId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            checkout_url: config.checkoutUrl,
            webhook_url: config.webhookUrl,
            supported_payment_methods: config.supportedPaymentMethods,
            supported_countries: config.supportedCountries,
            return_policy: config.returnPolicy,
            shipping_policy: config.shippingPolicy,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Checkout update failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        checkoutId: data.checkout_id,
        status: data.status,
        verificationRequired: data.verification_required || false,
        verificationUrl: data.verification_url,
      };
    } catch (error) {
      console.error('Checkout update error:', error);
      throw error;
    }
  }

  /**
   * Get checkout configuration status
   */
  async getCheckoutStatus(checkoutId: string): Promise<{
    status: 'active' | 'pending' | 'suspended';
    lastVerified: string;
    verificationRequired: boolean;
    issues?: string[];
  }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/checkout/${checkoutId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to get checkout status: ${response.statusText}`
        );
      }

      const data = await response.json();

      return {
        status: data.status,
        lastVerified: data.last_verified,
        verificationRequired: data.verification_required || false,
        issues: data.issues || [],
      };
    } catch (error) {
      console.error('Get checkout status error:', error);
      throw error;
    }
  }

  /**
   * Test checkout endpoint
   */
  async testCheckout(checkoutId: string): Promise<{
    success: boolean;
    errors?: string[];
    responseTime: number;
  }> {
    try {
      const startTime = Date.now();

      const response = await fetch(
        `${this.baseUrl}/checkout/${checkoutId}/test`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          errors: errorData.errors || ['Test failed'],
          responseTime,
        };
      }

      const data = await response.json();

      return {
        success: data.success,
        errors: data.errors || [],
        responseTime,
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Test failed'],
        responseTime: 0,
      };
    }
  }

  /**
   * Delete checkout configuration
   */
  async deleteCheckout(checkoutId: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/checkout/${checkoutId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to delete checkout: ${response.statusText}`
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Delete checkout error:', error);
      return { success: false };
    }
  }

  /**
   * Send order confirmation to OpenAI
   */
  async sendOrderConfirmation(
    checkoutId: string,
    orderData: {
      orderId: string;
      orderNumber: string;
      totalAmount: number;
      currency: string;
      status: string;
      trackingNumber?: string;
      trackingUrl?: string;
    }
  ): Promise<{ success: boolean }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/checkout/${checkoutId}/orders`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            order_id: orderData.orderId,
            order_number: orderData.orderNumber,
            total_amount: orderData.totalAmount,
            currency: orderData.currency,
            status: orderData.status,
            tracking_number: orderData.trackingNumber,
            tracking_url: orderData.trackingUrl,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to send order confirmation: ${response.statusText}`
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Send order confirmation error:', error);
      return { success: false };
    }
  }
}

/**
 * Create checkout client from workspace config
 */
export function createCheckoutClient(apiKey: string): OpenAICheckoutClient {
  return new OpenAICheckoutClient(apiKey);
}
