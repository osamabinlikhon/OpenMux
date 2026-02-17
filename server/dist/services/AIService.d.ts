export type AIProvider = "minimax" | "glm" | "kimi" | "openai" | "anthropic" | "opencode";
export declare const OPENCODE_MODELS: readonly ["claude-opus-4-6", "claude-opus-4-5", "claude-opus-4-1", "claude-sonnet-4", "claude-sonnet-4-5", "claude-3-5-haiku", "claude-haiku-4-5", "gemini-3-pro", "gemini-3-flash", "gpt-5.2", "gpt-5.2-codex", "gpt-5.1", "gpt-5.1-codex-max", "gpt-5.1-codex", "gpt-5.1-codex-mini", "gpt-5", "gpt-5-codex", "gpt-5-nano", "glm-5", "glm-4.7", "glm-4.6", "minimax-m2.5", "minimax-m2.5-free", "minimax-m2.1", "minimax-m2.1-free", "kimi-k2.5", "kimi-k2.5-free", "kimi-k2", "kimi-k2-thinking", "trinity-large-preview-free", "big-pickle", "glm-5-free"];
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
export declare class AIService {
    private config;
    private requestHeaders;
    constructor(config: AIServiceConfig);
    private buildHeaders;
    private getEndpoint;
    chat(request: AIRequest): Promise<AIResponse>;
    chatStream(request: AIRequest, onChunk: (chunk: string) => void): Promise<AIResponse>;
    static create(provider: AIProvider, apiKey: string, options?: Partial<AIServiceConfig>): AIService;
}
export declare function createAIService(config: AIServiceConfig): AIService;
export default AIService;
//# sourceMappingURL=AIService.d.ts.map