import { EventEmitter } from 'events';
/**
 * Chat message format for streaming callbacks
 */
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
/**
 * Stream processing options
 */
export interface XStreamOptions<Output = Record<string, string>> {
    transformStream?: (response: Response) => ReadableStream<Output> | TransformStream<any, Output> | Promise<ReadableStream<Output>>;
    streamSeparator?: string;
    partSeparator?: string;
    kvSeparator?: string;
}
/**
 * Request callback handlers
 */
export interface XRequestCallbacks<Output = Record<string, string>> {
    onSuccess?: (chunks: Output[], responseHeaders: Headers, message?: ChatMessage) => void;
    onError?: (error: Error, errorInfo: any, responseHeaders?: Headers, message?: ChatMessage) => number | void;
    onUpdate?: (chunk: Output, responseHeaders: Headers, message?: ChatMessage) => void;
}
/**
 * Middleware handlers for request/response processing
 */
export interface XFetchMiddlewares {
    onRequest?: (url: string | URL | Request, init?: RequestInit) => Promise<[string | URL | Request, RequestInit | undefined]>;
    onResponse?: (response: Response) => Promise<Response>;
}
/**
 * Generic request options for XRequestFunction
 */
export interface XRequestOptions<Input = Record<PropertyKey, any>, Output = Record<string, string>> {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD';
    headers?: Record<string, string>;
    timeout?: number;
    streamTimeout?: number;
    retries?: number;
    retryDelay?: number;
    retryInterval?: number;
    retryTimes?: number;
    validateStatus?: (status: number) => boolean;
    transformRequest?: (data: Input) => any;
    transformResponse?: (data: any) => Output;
    callbacks?: XRequestCallbacks<Output>;
    middlewares?: XFetchMiddlewares;
    fetch?: typeof fetch;
    transformStream?: XStreamOptions<Output>['transformStream'] | ((baseURL: string, responseHeaders: Headers) => XStreamOptions<Output>['transformStream']);
    streamSeparator?: string;
    partSeparator?: string;
    kvSeparator?: string;
    manual?: boolean;
}
/**
 * Global options that can be set across all XRequest instances
 */
export type XRequestGlobalOptions<Input = Record<PropertyKey, any>, Output = Record<string, string>> = Pick<XRequestOptions<Input, Output>, 'headers' | 'timeout' | 'streamTimeout' | 'middlewares' | 'fetch' | 'transformStream' | 'manual'>;
/**
 * XRequestClass - Handles HTTP requests with advanced features
 */
export declare class XRequestClass<Input = Record<PropertyKey, any>, Output = Record<string, string>> extends EventEmitter {
    private client;
    private baseURL;
    private options;
    private abortController;
    private isRequesting;
    private pendingParams;
    constructor(baseURL: string, options?: XRequestOptions<Input, Output>);
    private _createClient;
    /**
     * Cancel the current request
     */
    abort(): void;
    /**
     * Get current requesting state
     */
    getIsRequesting(): boolean;
    /**
     * Manually execute request (when manual=true)
     */
    run(params?: Input): Promise<Output | void>;
    /**
     * Make an HTTP request with retry logic and streaming support
     */
    private request;
    /**
     * Process streaming response
     */
    private processStream;
    /**
     * Parse a stream chunk based on separators
     */
    private _parseStreamChunk;
    /**
     * GET request
     */
    get(endpoint: string, customOptions?: Partial<XRequestOptions<Input, Output>>): Promise<Output>;
    /**
     * POST request
     */
    post(endpoint: string, data: Input, customOptions?: Partial<XRequestOptions<Input, Output>>): Promise<Output>;
    /**
     * PUT request
     */
    put(endpoint: string, data: Input, customOptions?: Partial<XRequestOptions<Input, Output>>): Promise<Output>;
    /**
     * DELETE request
     */
    delete(endpoint: string, customOptions?: Partial<XRequestOptions<Input, Output>>): Promise<Output>;
    /**
     * PATCH request
     */
    patch(endpoint: string, data: Input, customOptions?: Partial<XRequestOptions<Input, Output>>): Promise<Output>;
    private _delay;
}
/**
 * Set global options for all XRequest instances
 */
export declare const setXRequestGlobalOptions: <Input = Record<PropertyKey, any>, Output = Record<string, string>>(options: XRequestGlobalOptions<Input, Output>) => void;
/**
 * Get current global options
 */
export declare const getXRequestGlobalOptions: () => XRequestGlobalOptions;
/**
 * Reset global options to defaults
 */
export declare const resetXRequestGlobalOptions: () => void;
/**
 * XRequestFunction - Factory function to create XRequestClass instances
 *
 * @example
 * const request = XRequestFunction<ChatInput, ChatOutput>(
 *   'https://opencode.ai/zen/v1',
 *   {
 *     method: 'POST',
 *     headers: { 'Authorization': 'Bearer token' },
 *     callbacks: {
 *       onSuccess: (chunks) => console.log('Success:', chunks),
 *       onError: (error) => console.error('Error:', error),
 *       onUpdate: (chunk) => console.log('Update:', chunk)
 *     }
 *   }
 * );
 *
 * const result = await request.post('/chat/completions', chatData);
 * request.abort(); // Cancel request
 *
 * // Manual mode
 * const manualRequest = XRequestFunction(url, { manual: true });
 * await manualRequest.run(data); // Execute manually
 */
export declare const XRequestFunction: <Input = Record<PropertyKey, any>, Output = Record<string, string>>(baseURL: string, options?: XRequestOptions<Input, Output>) => XRequestClass<Input, Output>;
export default XRequestFunction;
//# sourceMappingURL=XRequest.d.ts.map