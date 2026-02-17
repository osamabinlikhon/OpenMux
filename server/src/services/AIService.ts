export type AIProvider =
  | "minimax"
  | "glm"
  | "kimi"
  | "openai"
  | "anthropic"
  | "opencode";

export const OPENCODE_MODELS = [
  "claude-opus-4-6",
  "claude-opus-4-5",
  "claude-opus-4-1",
  "claude-sonnet-4",
  "claude-sonnet-4-5",
  "claude-3-5-haiku",
  "claude-haiku-4-5",
  "gemini-3-pro",
  "gemini-3-flash",
  "gpt-5.2",
  "gpt-5.2-codex",
  "gpt-5.1",
  "gpt-5.1-codex-max",
  "gpt-5.1-codex",
  "gpt-5.1-codex-mini",
  "gpt-5",
  "gpt-5-codex",
  "gpt-5-nano",
  "glm-5",
  "glm-4.7",
  "glm-4.6",
  "minimax-m2.5",
  "minimax-m2.5-free",
  "minimax-m2.1",
  "minimax-m2.1-free",
  "kimi-k2.5",
  "kimi-k2.5-free",
  "kimi-k2",
  "kimi-k2-thinking",
  "trinity-large-preview-free",
  "big-pickle",
  "glm-5-free",
] as const;

export type OpenCodeModel = (typeof OPENCODE_MODELS)[number];

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIRequest {
  model: string;
  messages: AIMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  tools?: any[];
}

export interface AIResponse {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    message: AIMessage;
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  created?: number;
}

export interface AIError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

export interface AIServiceConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
}

const PROVIDER_ENDPOINTS: Record<
  AIProvider,
  { baseUrl: string; defaultModel: string }
> = {
  minimax: {
    baseUrl: "https://api.minimax.chat/v1",
    defaultModel: "abab6.5s-chat",
  },
  glm: {
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    defaultModel: "glm-4",
  },
  kimi: {
    baseUrl: "https://api.moonshot.cn/v1",
    defaultModel: "kimi-k2",
  },
  openai: {
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4",
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com/v1",
    defaultModel: "claude-3-5-sonnet-20241022",
  },
  opencode: {
    baseUrl: "https://opencode.ai/zen/v1",
    defaultModel: "claude-sonnet-4-5",
  },
};

export class AIService {
  private config: AIServiceConfig;
  private requestHeaders: Record<string, string>;

  constructor(config: AIServiceConfig) {
    this.config = config;
    const endpoint = PROVIDER_ENDPOINTS[config.provider];

    this.requestHeaders = this.buildHeaders(config.provider, config.apiKey);

    if (config.baseUrl) {
      endpoint.baseUrl = config.baseUrl;
    }

    if (!config.defaultModel) {
      config.defaultModel = endpoint.defaultModel;
    }
  }

  private buildHeaders(
    provider: AIProvider,
    apiKey: string,
  ): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    switch (provider) {
      case "minimax":
        headers["Authorization"] = "Bearer " + apiKey;
        break;
      case "glm":
        headers["Authorization"] = "Bearer " + apiKey;
        break;
      case "kimi":
        headers["Authorization"] = "Bearer " + apiKey;
        break;
      case "openai":
        headers["Authorization"] = "Bearer " + apiKey;
        break;
      case "anthropic":
        headers["x-api-key"] = apiKey;
        headers["anthropic-version"] = "2023-06-01";
        break;
      case "opencode":
        headers["Authorization"] = "Bearer " + apiKey;
        break;
    }

    return headers;
  }

  private getEndpoint(action: string): string {
    const endpoint = PROVIDER_ENDPOINTS[this.config.provider];
    const baseUrl = this.config.baseUrl || endpoint.baseUrl;

    switch (this.config.provider) {
      case "minimax":
        return baseUrl + "/text/chatcompletion_v2";
      case "glm":
        return baseUrl + "/chat/completions";
      case "kimi":
        return baseUrl + "/chat/completions";
      case "openai":
        return baseUrl + "/chat/completions";
      case "anthropic":
        return baseUrl + "/messages";
      case "opencode":
        return baseUrl + "/chat/completions";
      default:
        return baseUrl + "/chat/completions";
    }
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    const endpoint = this.getEndpoint("chat");
    const model =
      request.model ||
      this.config.defaultModel ||
      PROVIDER_ENDPOINTS[this.config.provider].defaultModel;

    let body: any = {
      model,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.max_tokens ?? 4096,
    };

    if (this.config.provider === "anthropic") {
      body = {
        model,
        messages: request.messages.map((m) => ({
          role: m.role === "system" ? "developer" : m.role,
          content: m.content,
        })),
        temperature: request.temperature ?? 0.7,
        max_tokens: request.max_tokens ?? 4096,
        stream: false,
      };

      if (request.tools && request.tools.length > 0) {
        body.tools = request.tools;
      }
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: this.requestHeaders,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as AIError;
      throw new Error(
        errorData.error?.message ||
          `AI API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as AIResponse;
    return data;
  }

  async chatStream(
    request: AIRequest,
    onChunk: (chunk: string) => void,
  ): Promise<AIResponse> {
    const endpoint = this.getEndpoint("chat");
    const model =
      request.model ||
      this.config.defaultModel ||
      PROVIDER_ENDPOINTS[this.config.provider].defaultModel;

    const body: any = {
      model,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.max_tokens ?? 4096,
      stream: true,
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: this.requestHeaders,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as AIError;
      throw new Error(
        errorData.error?.message ||
          `AI API error: ${response.status} ${response.statusText}`,
      );
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter((line) => line.trim() !== "");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);

          if (data === "[DONE]") {
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || "";
            fullResponse += content;
            onChunk(content);
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }

    return {
      id: "stream-" + Date.now(),
      model: model,
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: fullResponse },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
      created: Math.floor(Date.now() / 1000),
    };
  }

  static create(
    provider: AIProvider,
    apiKey: string,
    options?: Partial<AIServiceConfig>,
  ): AIService {
    return new AIService({
      provider,
      apiKey,
      ...options,
    });
  }
}

export function createAIService(config: AIServiceConfig): AIService {
  return new AIService(config);
}

export default AIService;
