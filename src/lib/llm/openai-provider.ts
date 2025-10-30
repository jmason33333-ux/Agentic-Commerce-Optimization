import OpenAI from "openai";
import { LLMProvider, ProductInput, LLMSuggestion } from "./types";
import { OPENAI_COMMERCE_PROMPT } from "./openai-spec-prompt";

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
            { role: "system", content: OPENAI_COMMERCE_PROMPT },
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
