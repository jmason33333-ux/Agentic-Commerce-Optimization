import { LLMProvider } from "./types";
import { OpenAIProvider } from "./openai-provider";

export * from "./types";

export function getLLMProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER || "openai";

  switch (provider.toLowerCase()) {
    case "openai":
      return new OpenAIProvider();
    // case "anthropic":
    //   return new AnthropicProvider(); // TODO: implement later
    default:
      console.warn(`Unknown LLM provider: ${provider}, defaulting to OpenAI`);
      return new OpenAIProvider();
  }
}
