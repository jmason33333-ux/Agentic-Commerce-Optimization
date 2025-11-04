export interface ShopifyProduct {
  id: string;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  handle: string;
  published_at: string;
  variants: ShopifyVariant[];
  images: ShopifyImage[];
  tags: string;
}

export interface ShopifyVariant {
  id: string;
  product_id: string;
  title: string;
  price: string;
  sku: string;
  barcode: string;
  weight: number;
  weight_unit: string;
  inventory_quantity: number;
  option1: string;
  option2: string;
  option3: string;
}

export interface ShopifyImage {
  id: string;
  product_id: string;
  src: string;
  alt: string;
}

export interface ShopifyShop {
  id: string;
  name: string;
  domain: string;
  email: string;
  phone: string;
  address1: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  currency: string;
  money_format: string;
  policy: {
    privacy_policy: { url: string };
    terms_of_service: { url: string };
    refund_policy: { body: string };
  };
}

export class ShopifyClient {
  private shop: string;
  private accessToken: string;
  private apiVersion = '2024-01';

  constructor(shop: string, accessToken: string) {
    this.shop = shop;
    this.accessToken = accessToken;
  }

  /**
   * Make authenticated request to Shopify Admin API
   */
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `https://${this.shop}/admin/api/${this.apiVersion}/${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get shop information
   */
  async getShop(): Promise<ShopifyShop> {
    const data = await this.request<{ shop: ShopifyShop }>('shop.json');
    return data.shop;
  }

  /**
   * Get all products (paginated)
   */
  async getAllProducts(): Promise<ShopifyProduct[]> {
    let products: ShopifyProduct[] = [];
    let hasNextPage = true;
    let pageInfo: string | null = null;

    while (hasNextPage) {
      const endpoint = pageInfo
        ? `products.json?limit=250&page_info=${pageInfo}`
        : 'products.json?limit=250';

      const response = await fetch(
        `https://${this.shop}/admin/api/${this.apiVersion}/${endpoint}`,
        {
          headers: {
            'X-Shopify-Access-Token': this.accessToken,
          },
        }
      );

      const data = await response.json();
      products = products.concat(data.products);

      // Check for pagination
      const linkHeader = response.headers.get('Link');
      if (linkHeader && linkHeader.includes('rel="next"')) {
        const match = linkHeader.match(/<[^>]*page_info=([^>&]*)>; rel="next"/);
        pageInfo = match ? match[1] : null;
        hasNextPage = !!pageInfo;
      } else {
        hasNextPage = false;
      }
    }

    return products;
  }

  /**
   * Get product by ID
   */
  async getProduct(productId: string): Promise<ShopifyProduct> {
    const data = await this.request<{ product: ShopifyProduct }>(
      `products/${productId}.json`
    );
    return data.product;
  }

  /**
   * Update product
   */
  async updateProduct(
    productId: string,
    updates: Partial<ShopifyProduct>
  ): Promise<ShopifyProduct> {
    const data = await this.request<{ product: ShopifyProduct }>(
      `products/${productId}.json`,
      {
        method: 'PUT',
        body: JSON.stringify({ product: updates }),
      }
    );
    return data.product;
  }
}
