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
 * AIRequestTool - Manages requests to external AI APIs
 */
export class AIRequestTool {
    constructor() {
        this.name = 'ai-request';
        this.description = 'Make requests to external AI APIs (MiniMax, GLM, Kimi, etc.)';
        this.requestClients = new Map();
        this._initializeClients();
    }
    /**
     * Initialize request clients for all available models
     */
    _initializeClients() {
        const uniqueBaseURLs = new Set(Object.values(AI_MODELS).map((m) => m.baseURL));
        uniqueBaseURLs.forEach((baseURL) => {
            const client = XRequestFunction(baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.AI_API_KEY || ''}`,
                },
                timeout: 30000,
                retries: 3,
                retryDelay: 1000,
            });
            this.requestClients.set(baseURL, client);
        });
    }
    listActions() {
        return ['chat-completion', 'list-models', 'get-model-info'];
    }
    async execute(action, params) {
        switch (action) {
            case 'chat-completion':
                return this.chatCompletion(params);
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
}
export default AIRequestTool;
//# sourceMappingURL=AIRequestTool.js.map