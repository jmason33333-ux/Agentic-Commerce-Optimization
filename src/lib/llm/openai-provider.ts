import OpenAI from "openai";
import { LLMProvider, ProductInput, LLMSuggestion } from "./types";

const SYSTEM_PROMPT = `You are optimizing a merchant's product catalog so it ranks higher in AI shopping/agentic commerce experiences (e.g. ChatGPT Instant Checkout).

You will receive a product JSON with: title, description, price, inventory, tags, images, vendor, productType, instantCheckoutEnabled, and any known audience/use-case text.

Return an array of SUGGESTIONS. Each suggestion must have:
- issue_type: string (e.g. "missing_audience", "instant_checkout_off", "thin_description", "availability_zero", "price_out_of_band", "missing_image", "missing_tags")
- explanation: short human-readable reason
- proposed_change: JSON with the exact fields to update (e.g. { "description_append": "...", "tags_to_add": ["gift", "travel"] })
- risk_level: "low" | "medium" | "high"
  - low = safe text/metadata additions
  - medium = enabling instant checkout or primary-seller flag
  - high = changes to price or availability

DO NOT actually apply changes. Just propose them.

Example output:
[
  {
    "issue_type": "missing_audience",
    "explanation": "The description never says who this is for. AI shoppers often search by audience.",
    "proposed_change": {
      "description_append": "Ideal for commuters, travel, and cold-weather urban wear.",
      "tags_to_add": ["commuter", "winter", "travel"]
    },
    "risk_level": "low"
  },
  {
    "issue_type": "instant_checkout_off",
    "explanation": "AI channels favor products that support instant checkout.",
    "proposed_change": {
      "enable_instant_checkout": true
    },
    "risk_level": "medium"
  }
]

Return ONLY valid JSON array. No markdown, no explanation.`;

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;
  private model: string;
  private timeout: number;
  private maxTokens: number;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.model = process.env.LLM_MODEL || "gpt-4o-mini";
    this.timeout = Number(process.env.LLM_TIMEOUT_MS) || 20000;
    this.maxTokens = Number(process.env.MAX_TOKENS) || 800;
  }

  async generateSuggestions(product: ProductInput): Promise<LLMSuggestion[]> {
    try {
      const productJson = JSON.stringify(product, null, 2);

      const completion = await this.client.chat.completions.create(
        {
          model: this.model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `Analyze this product and return suggestions:\n\n${productJson}`,
            },
          ],
          max_tokens: this.maxTokens,
          temperature: 0.7,
          response_format: { type: "json_object" },
        },
        {
          timeout: this.timeout,
        }
      );

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        console.warn("No content from OpenAI for product:", product.title);
        return [];
      }

      // Parse the response - OpenAI might wrap it in an object
      let parsed = JSON.parse(content);

      // If it's wrapped in a suggestions key, unwrap it
      if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
        return parsed.suggestions;
      }

      // If it's directly an array
      if (Array.isArray(parsed)) {
        return parsed;
      }

      // Otherwise assume it's an object with the suggestions
      return [];
    } catch (error) {
      console.error("OpenAI LLM error:", error);
      // Return empty array on error - we'll fall back to rule-based suggestions
      return [];
    }
  }
}
