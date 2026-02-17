import dotenv from "dotenv";
import { AIService, AIProvider, AIServiceConfig } from "./AIService";

dotenv.config();

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  defaultModel?: string;
  baseUrl?: string;
}

const DEFAULT_PROVIDER = (process.env.AI_PROVIDER as AIProvider) || "minimax";
const DEFAULT_API_KEY = process.env.AI_API_KEY || "";
const DEFAULT_MODEL = process.env.AI_DEFAULT_MODEL;
const DEFAULT_BASE_URL = process.env.AI_BASE_URL;

export function getAIConfig(): AIConfig {
  return {
    provider: DEFAULT_PROVIDER,
    apiKey: DEFAULT_API_KEY,
    defaultModel: DEFAULT_MODEL,
    baseUrl: DEFAULT_BASE_URL,
  };
}

export function createAIFromEnv(): AIService | null {
  const config = getAIConfig();

  if (!config.apiKey) {
    console.warn(
      "⚠️  AI_API_KEY not configured. AI features will be disabled.",
    );
    return null;
  }

  const serviceConfig: AIServiceConfig = {
    provider: config.provider,
    apiKey: config.apiKey,
    defaultModel: config.defaultModel,
    baseUrl: config.baseUrl,
  };

  const service = new AIService(serviceConfig);

  console.log(
    `🤖 AI Service initialized: ${config.provider} (${config.defaultModel || "default model"})`,
  );

  return service;
}

export function isAIConfigured(): boolean {
  return !!process.env.AI_API_KEY;
}

export function getAvailableProviders(): AIProvider[] {
  return ["minimax", "glm", "kimi", "openai", "anthropic"];
}

export { AIService, AIProvider };
