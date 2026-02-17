import { Tool } from './ToolRegistry';
/**
 * Supported AI models and their metadata
 */
export interface AIModel {
    id: string;
    name: string;
    provider: string;
    baseURL: string;
    supportedEndpoints: string[];
}
/**
 * Available AI models across different providers
 */
export declare const AI_MODELS: Record<string, AIModel>;
/**
 * Chat message format for AI APIs
 */
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
/**
 * Chat completion request
 */
export interface ChatCompletionRequest {
    model: string;
    messages: ChatMessage[];
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
    stream?: boolean;
}
/**
 * Chat completion response
 */
export interface ChatCompletionResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message: ChatMessage;
        finish_reason: string;
    }>;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}
/**
 * AIRequestTool - Manages requests to external AI APIs
 */
export declare class AIRequestTool implements Tool {
    name: string;
    description: string;
    private requestClients;
    constructor();
    /**
     * Initialize request clients for all available models
     */
    private _initializeClients;
    listActions(): string[];
    execute(action: string, params: any): Promise<any>;
    /**
     * Send a chat completion request to an AI API
     */
    chatCompletion(params: {
        modelId: string;
        messages: ChatMessage[];
        temperature?: number;
        top_p?: number;
        max_tokens?: number;
        stream?: boolean;
    }): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
    /**
     * List all available AI models
     */
    listModels(): Promise<{
        success: boolean;
        models: AIModel[];
    }>;
    /**
     * Get information about a specific model
     */
    getModelInfo(modelId: string): Promise<{
        success: boolean;
        model?: AIModel;
        error?: string;
    }>;
    /**
     * Set or update an API key for authentication
     */
    setApiKey(apiKey: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
export default AIRequestTool;
//# sourceMappingURL=AIRequestTool.d.ts.map