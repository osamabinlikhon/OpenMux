import XRequestFunction from '../utils/XRequest';
/**
 * Available AI models across different providers
 */
export const AI_MODELS = {
    'minimax-m2.5-free': {
        id: 'minimax-m2.5-free',
        name: 'MiniMax M2.5 Free',
        provider: 'MiniMax',
        baseURL: 'https://opencode.ai/zen/v1',
        supportedEndpoints: ['/chat/completions', '/models'],
    },
    'glm-5-free': {
        id: 'glm-5-free',
        name: 'GLM 5 Free',
        provider: 'GLM',
        baseURL: 'https://opencode.ai/zen/v1',
        supportedEndpoints: ['/chat/completions', '/models'],
    },
    'kimi-k2.5-free': {
        id: 'kimi-k2.5-free',
        name: 'Kimi K2.5 Free',
        provider: 'Kimi',
        baseURL: 'https://opencode.ai/zen/v1',
        supportedEndpoints: ['/chat/completions', '/models'],
    },
};
/**
 * AIRequestTool - Manages requests to external AI APIs with advanced features
 */
export class AIRequestTool {
    constructor() {
        this.name = 'ai-request';
        this.description = 'Make requests to external AI APIs (MiniMax, GLM, Kimi, etc.) with advanced retry and streaming support';
        this.requestClients = new Map();
        this.streamChunks = new Map();
        this._initializeClients();
    }
    /**
     * Initialize request clients for all available models
     */
    _initializeClients() {
        const uniqueBaseURLs = new Set(Object.values(AI_MODELS).map((m) => m.baseURL));
        uniqueBaseURLs.forEach((baseURL) => {
            const callbacks = {
                onSuccess: (chunks) => {
                    console.log(`[AIRequestTool] Request succeeded with ${chunks.length} chunks`);
                },
                onError: (error, errorInfo) => {
                    console.error(`[AIRequestTool] Request error: ${error.message}`);
                    // Return 5 second delay for retries
                    return 5000;
                },
                onUpdate: (chunk) => {
                    console.log(`[AIRequestTool] Stream update:`, chunk);
                },
            };
            const client = XRequestFunction(baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.AI_API_KEY || ''}`,
                },
                timeout: 30000,
                streamTimeout: 60000,
                retries: 3,
                retryDelay: 1000,
                retryTimes: 3,
                retryInterval: 2000,
                callbacks: callbacks,
                middlewares: {
                    onRequest: async (url, init) => {
                        console.log(`[AIRequestTool] Making request to: ${url}`);
                        return [url, init];
                    },
                    onResponse: async (response) => {
                        console.log(`[AIRequestTool] Response status: ${response.status}`);
                        return response;
                    },
                },
            });
            this.requestClients.set(baseURL, client);
        });
    }
    listActions() {
        return ['chat-completion', 'list-models', 'get-model-info', 'stream-chat'];
    }
    async execute(action, params) {
        switch (action) {
            case 'chat-completion':
                return this.chatCompletion(params);
            case 'stream-chat':
                return this.streamChat(params);
            case 'list-models':
                return this.listModels();
            case 'get-model-info':
                return this.getModelInfo(params.modelId);
            default:
                throw new Error(`Action "${action}" not supported in AIRequestTool`);
        }
    }
    /**
     * Send a chat completion request to an AI API
     */
    async chatCompletion(params) {
        try {
            const model = AI_MODELS[params.modelId];
            if (!model) {
                throw new Error(`Model "${params.modelId}" not found in available models`);
            }
            const client = this.requestClients.get(model.baseURL);
            if (!client) {
                throw new Error(`No client configured for model "${params.modelId}"`);
            }
            const requestData = {
                model: params.modelId,
                messages: params.messages,
                temperature: params.temperature || 0.7,
                top_p: params.top_p || 0.95,
                max_tokens: params.max_tokens || 2048,
                stream: params.stream || false,
            };
            const response = await client.post('/chat/completions', requestData);
            return {
                success: true,
                data: response,
            };
        }
        catch (error) {
            return {
                success: false,
                error: String(error),
            };
        }
    }
    /**
     * Stream chat completion with callback support
     */
    async streamChat(params) {
        try {
            const model = AI_MODELS[params.modelId];
            if (!model) {
                throw new Error(`Model "${params.modelId}" not found in available models`);
            }
            const streamId = params.streamId || `stream-${Date.now()}`;
            this.streamChunks.set(streamId, []);
            const requestData = {
                model: params.modelId,
                messages: params.messages,
                temperature: params.temperature || 0.7,
                top_p: params.top_p || 0.95,
                max_tokens: params.max_tokens || 2048,
                stream: true,
            };
            const client = this.requestClients.get(model.baseURL);
            if (!client) {
                throw new Error(`No client configured for model "${params.modelId}"`);
            }
            await client.post('/chat/completions', requestData);
            return {
                success: true,
                streamId: streamId,
                message: 'Stream started',
            };
        }
        catch (error) {
            return {
                success: false,
                streamId: params.streamId || 'unknown',
                error: String(error),
            };
        }
    }
    /**
     * List all available AI models
     */
    async listModels() {
        try {
            return {
                success: true,
                models: Object.values(AI_MODELS),
            };
        }
        catch (error) {
            return {
                success: false,
                models: [],
            };
        }
    }
    /**
     * Get information about a specific model
     */
    async getModelInfo(modelId) {
        try {
            const model = AI_MODELS[modelId];
            if (!model) {
                throw new Error(`Model "${modelId}" not found`);
            }
            return {
                success: true,
                model,
            };
        }
        catch (error) {
            return {
                success: false,
                error: String(error),
            };
        }
    }
    /**
     * Set or update an API key for authentication
     */
    async setApiKey(apiKey) {
        try {
            process.env.AI_API_KEY = apiKey;
            // Reinitialize clients with new API key
            this._initializeClients();
            return {
                success: true,
                message: 'API key updated successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                message: String(error),
            };
        }
    }
    /**
     * Abort an ongoing stream
     */
    async abortStream(streamId) {
        try {
            const clients = Array.from(this.requestClients.values());
            clients.forEach(client => client.abort());
            this.streamChunks.delete(streamId);
            return {
                success: true,
                message: `Stream ${streamId} aborted`,
            };
        }
        catch (error) {
            return {
                success: false,
                message: String(error),
            };
        }
    }
}
export default AIRequestTool;
//# sourceMappingURL=AIRequestTool.js.map