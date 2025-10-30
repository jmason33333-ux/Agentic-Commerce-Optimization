const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-01";

export interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  tags: string;
  variants: Array<{
    id: number;
    price: string;
    inventory_quantity: number;
  }>;
  images: Array<{
    id: number;
    src: string;
  }>;
}

export async function fetchShopifyProducts(params: {
  shopDomain: string;
  accessToken: string;
  limit?: number;
}): Promise<ShopifyProduct[]> {
  const { shopDomain, accessToken, limit = 250 } = params;
  const products: ShopifyProduct[] = [];
  let url = `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/products.json?limit=${limit}`;

  while (url) {
    const resp = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("fetchShopifyProducts error:", text);
      throw new Error(`Failed to fetch products: ${resp.status}`);
    }

    const data = await resp.json();
    products.push(...data.products);

    // Check for pagination
    const linkHeader = resp.headers.get("link");
    const nextLink = linkHeader
      ?.split(",")
      .find((s) => s.includes('rel="next"'));
    url = nextLink
      ? nextLink.match(/<(.+)>/)?.[1] || ""
      : "";
  }

  return products;
}

export async function writeAgentSeoMetafields(params: {
  shopDomain: string;
  accessToken: string;
  productId: string; // Shopify numeric ID as string, e.g. "1234567890"
  audience?: string;
  useCases?: string[]; // e.g. ["travel", "gift", "kids 8-12"]
  occasions?: string[]; // e.g. ["back to school", "holiday"]
  intentScore?: number; // 0-100 optional
}) {
  const {
    shopDomain,
    accessToken,
    productId,
    audience,
    useCases,
    occasions,
    intentScore,
  } = params;

  const metafields: any[] = [];

  if (audience) {
    metafields.push({
      namespace: "agent_seo",
      key: "audience",
      type: "single_line_text_field",
      value: audience,
      ownerId: `gid://shopify/Product/${productId}`,
    });
  }

  if (useCases && useCases.length > 0) {
    metafields.push({
      namespace: "agent_seo",
      key: "use_cases",
      type: "json",
      value: JSON.stringify(useCases),
      ownerId: `gid://shopify/Product/${productId}`,
    });
  }

  if (occasions && occasions.length > 0) {
    metafields.push({
      namespace: "agent_seo",
      key: "occasions",
      type: "json",
      value: JSON.stringify(occasions),
      ownerId: `gid://shopify/Product/${productId}`,
    });
  }

  if (typeof intentScore === "number") {
    metafields.push({
      namespace: "agent_seo",
      key: "intent_score",
      type: "number_integer",
      value: intentScore.toString(),
      ownerId: `gid://shopify/Product/${productId}`,
    });
  }

  if (metafields.length === 0) return;

  const resp = await fetch(
    `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
            metafieldsSet(metafields: $metafields) {
              metafields {
                id
                key
                namespace
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        variables: { metafields },
      }),
    }
  );

  if (!resp.ok) {
    const text = await resp.text();
    console.error("writeAgentSeoMetafields error:", text);
    throw new Error("Failed to write metafields");
  }

  const json = await resp.json();
  if (json?.data?.metafieldsSet?.userErrors?.length) {
    console.warn(
      "Shopify metafieldsSet userErrors:",
      json.data.metafieldsSet.userErrors
    );
  }

  return json;
}

export async function updateShopifyProduct(params: {
  shopDomain: string;
  accessToken: string;
  productId: string;
  title?: string;
  bodyHtmlAppend?: string; // we'll append to existing description
  tagsToAdd?: string[];
}) {
  const { shopDomain, accessToken, productId, title, bodyHtmlAppend, tagsToAdd } =
    params;

  // 1. get current product
  const getResp = await fetch(
    `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/products/${productId}.json`,
    {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    }
  );

  if (!getResp.ok) {
    const text = await getResp.text();
    console.error("get product failed:", text);
    throw new Error("Failed to get product");
  }

  const { product } = await getResp.json();

  const updated: any = {
    id: product.id,
  };

  if (title) {
    updated.title = title;
  }

  if (bodyHtmlAppend) {
    const existing = product.body_html || "";
    updated.body_html = existing + "\n\n" + bodyHtmlAppend;
  }

  if (tagsToAdd && tagsToAdd.length > 0) {
    const existingTags = (product.tags || "")
      .split(",")
      .map((t: string) => t.trim())
      .filter(Boolean);
    const merged = Array.from(new Set([...existingTags, ...tagsToAdd]));
    updated.tags = merged.join(", ");
  }

  const putResp = await fetch(
    `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/products/${productId}.json`,
    {
      method: "PUT",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product: updated }),
    }
  );

  if (!putResp.ok) {
    const text = await putResp.text();
    console.error("update product failed:", text);
    throw new Error("Failed to update product");
  }

  return putResp.json();
}
