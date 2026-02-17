/**
 * AIRequestTool Usage Examples
 * ==============================
 *
 * This file demonstrates how to use the AIRequestTool for making requests
 * to external AI APIs (MiniMax, GLM, Kimi) through the OpenMux sandbox.
 */
/**
 * EXAMPLE 1: List Available AI Models
 * ====================================
 *
 * Request:
 * POST http://localhost:8080/tools/ai-request/list-models
 * Content-Type: application/json
 * Body: { "params": {} }
 *
 * Response:
 * {
 *   "success": true,
 *   "models": [
 *     {
 *       "id": "minimax-m2.5-free",
 *       "name": "MiniMax M2.5 Free",
 *       "provider": "MiniMax",
 *       "baseURL": "https://opencode.ai/zen/v1",
 *       "supportedEndpoints": ["/chat/completions", "/models"]
 *     },
 *     {
 *       "id": "glm-5-free",
 *       "name": "GLM 5 Free",
 *       "provider": "GLM",
 *       "baseURL": "https://opencode.ai/zen/v1",
 *       "supportedEndpoints": ["/chat/completions", "/models"]
 *     },
 *     {
 *       "id": "kimi-k2.5-free",
 *       "name": "Kimi K2.5 Free",
 *       "provider": "Kimi",
 *       "baseURL": "https://opencode.ai/zen/v1",
 *       "supportedEndpoints": ["/chat/completions", "/models"]
 *     }
 *   ]
 * }
 */
/**
 * EXAMPLE 2: Send a Chat Completion Request
 * ==========================================
 *
 * Request:
 * POST http://localhost:8080/tools/ai-request/chat-completion
 * Content-Type: application/json
 * Body:
 * {
 *   "params": {
 *     "modelId": "minimax-m2.5-free",
 *     "messages": [
 *       {
 *         "role": "system",
 *         "content": "You are a helpful assistant."
 *       },
 *       {
 *         "role": "user",
 *         "content": "What is 2 + 2?"
 *       }
 *     ],
 *     "temperature": 0.7,
 *     "max_tokens": 256
 *   }
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "chatcmpl-123...",
 *     "object": "chat.completion",
 *     "created": 1702000000,
 *     "model": "minimax-m2.5-free",
 *     "choices": [
 *       {
 *         "index": 0,
 *         "message": {
 *           "role": "assistant",
 *           "content": "2 + 2 equals 4."
 *         },
 *         "finish_reason": "stop"
 *       }
 *     ],
 *     "usage": {
 *       "prompt_tokens": 30,
 *       "completion_tokens": 10,
 *       "total_tokens": 40
 *     }
 *   }
 * }
 */
/**
 * EXAMPLE 3: Get Model Information
 * =================================
 *
 * Request:
 * POST http://localhost:8080/tools/ai-request/get-model-info
 * Content-Type: application/json
 * Body: { "params": { "modelId": "minimax-m2.5-free" } }
 *
 * Response:
 * {
 *   "success": true,
 *   "model": {
 *     "id": "minimax-m2.5-free",
 *     "name": "MiniMax M2.5 Free",
 *     "provider": "MiniMax",
 *     "baseURL": "https://opencode.ai/zen/v1",
 *     "supportedEndpoints": ["/chat/completions", "/models"]
 *   }
 * }
 */
/**
 * ENVIRONMENT CONFIGURATION
 * ==========================
 *
 * Set the AI_API_KEY in your .env file to authenticate with the AI APIs:
 *
 * .env file:
 * AI_API_KEY=your_api_key_here
 * SANDBOX_API_PORT=8080
 *
 * The AIRequestTool will automatically include this key in the Authorization header
 * for all API requests to external AI services.
 */
/**
 * XRequestFunction Features
 * ==========================
 *
 * The underlying XRequestFunction utility provides:
 *
 * - Generic HTTP client for any API endpoint
 * - Automatic retry logic with configurable delays
 * - Request/response transformation
 * - Custom header support
 * - Timeout configuration
 * - Status code validation
 *
 * Usage:
 *
 * import { XRequestFunction } from '../utils/XRequest';
 *
 * const request = XRequestFunction(
 *   'https://api.example.com/v1',
 *   {
 *     method: 'POST',
 *     headers: { 'Authorization': 'Bearer token' },
 *     timeout: 30000,
 *     retries: 3,
 *     retryDelay: 1000
 *   }
 * );
 *
 * const result = await request.post('/endpoint', data);
 * const result = await request.get('/endpoint');
 * const result = await request.put('/endpoint', data);
 * const result = await request.delete('/endpoint');
 * const result = await request.patch('/endpoint', data);
 */
/**
 * Adding New AI Models
 * ====================
 *
 * To add support for a new AI model, update the AI_MODELS object in AIRequestTool.ts:
 *
 * export const AI_MODELS: Record<string, AIModel> = {
 *   ...existing models...
 *   'new-model-id': {
 *     id: 'new-model-id',
 *     name: 'New Model Name',
 *     provider: 'Provider Name',
 *     baseURL: 'https://api.provider.com/v1',
 *     supportedEndpoints: ['/chat/completions', '/models'],
 *   },
 * };
 */
export {};
//# sourceMappingURL=AIRequestTool.examples.d.ts.map