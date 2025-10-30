export interface ProductInput {
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  inventory: number;
  tags?: string[];
  images?: string[];
  vendor?: string;
  productType?: string;
  instantCheckoutEnabled: boolean;
}

export interface LLMSuggestion {
  issue_type: string;
  explanation: string;
  proposed_change: Record<string, any>;
  risk_level: "low" | "medium" | "high";
}

export interface LLMProvider {
  generateSuggestions(product: ProductInput): Promise<LLMSuggestion[]>;
}
