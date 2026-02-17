import axios from 'axios';
import { EventEmitter } from 'events';
/**
 * XRequestClass - Handles HTTP requests with advanced features
 */
export class XRequestClass extends EventEmitter {
    constructor(baseURL, options = {}) {
        super();
        this.abortController = null;
        this.isRequesting = false;
        this.pendingParams = undefined;
        this.baseURL = baseURL;
        this.options = {
            method: 'POST',
            timeout: 30000,
            streamTimeout: 60000,
            retries: 3,
            retryDelay: 1000,
            retryTimes: 3,
            streamSeparator: '\n\n',
            partSeparator: '\n',
            kvSeparator: ':',
            manual: false,
            ...globalOptions,
            ...options,
        };
        this.client = this._createClient();
        // If manual mode and no initial run call, setup auto-run
        if (this.options.manual === false) {
            // Auto-run is default behavior
        }
    }
    _createClient() {
        return axios.create({
            baseURL: this.baseURL,
            timeout: this.options.timeout,
            headers: {
                'Content-Type': 'application/json',
                ...this.options.headers,
            },
        });
    }
    /**
     * Cancel the current request
     */
    abort() {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
        this.isRequesting = false;
        this.emit('abort');
    }
    /**
     * Get current requesting state
     */
    getIsRequesting() {
        return this.isRequesting;
    }
    /**
     * Manually execute request (when manual=true)
     */
    async run(params) {
        if (this.isRequesting) {
            console.warn('Request already in progress');
            return;
        }
        const finalParams = params || this.pendingParams;
        return this.request('/', finalParams);
    }
    /**
     * Make an HTTP request with retry logic and streaming support
     */
    async request(endpoint, data, customOptions, retryAttempt = 0) {
        const mergedOptions = { ...this.options, ...customOptions };
        const maxRetries = mergedOptions.retryTimes || mergedOptions.retries || 3;
        this.isRequesting = true;
        this.abortController = new AbortController();
        try {
            // Execute pre-request middleware
            let requestArgs = [this.baseURL + endpoint];
            if (mergedOptions.middlewares?.onRequest) {
                [requestArgs] = await mergedOptions.middlewares.onRequest(this.baseURL + endpoint, {
                    method: mergedOptions.method || 'POST',
                    headers: mergedOptions.headers,
                    body: data ? JSON.stringify(mergedOptions.transformRequest ? mergedOptions.transformRequest(data) : data) : undefined,
                    signal: this.abortController.signal,
                });
            }
            // Use custom fetch or default
            const fetchFn = mergedOptions.fetch || fetch;
            const requestConfig = {
                method: mergedOptions.method || 'POST',
                url: endpoint,
                headers: mergedOptions.headers,
                signal: this.abortController.signal,
                timeout: mergedOptions.timeout,
                ...(data && { data: mergedOptions.transformRequest ? mergedOptions.transformRequest(data) : data }),
            };
            let response;
            try {
                response = await this.client.request(requestConfig);
            }
            catch (error) {
                if (axios.isAxiosError(error)) {
                    throw error;
                }
                throw error;
            }
            // Execute post-response middleware
            if (mergedOptions.middlewares?.onResponse) {
                const responseObj = new Response(JSON.stringify(response.data), {
                    status: response.status,
                    headers: new Headers(response.headers),
                });
                await mergedOptions.middlewares.onResponse(responseObj);
            }
            // Transform response if needed
            const transformedResponse = mergedOptions.transformResponse
                ? mergedOptions.transformResponse(response.data)
                : response.data;
            // Call success callback
            if (mergedOptions.callbacks?.onSuccess) {
                mergedOptions.callbacks.onSuccess(Array.isArray(transformedResponse) ? transformedResponse : [transformedResponse], new Headers(response.headers), undefined);
            }
            this.isRequesting = false;
            this.emit('success', transformedResponse);
            return transformedResponse;
        }
        catch (error) {
            if (this.abortController?.signal.aborted) {
                this.isRequesting = false;
                return;
            }
            const err = error instanceof Error ? error : new Error(String(error));
            let retryDelay = mergedOptions.retryDelay || 1000;
            // Call error callback - it may return a custom retry interval
            if (mergedOptions.callbacks?.onError) {
                const callbackRetryInterval = mergedOptions.callbacks.onError(err, error, undefined, undefined);
                if (typeof callbackRetryInterval === 'number') {
                    retryDelay = callbackRetryInterval;
                }
            }
            // Retry logic
            const shouldRetry = retryAttempt < maxRetries;
            const isRetryableError = !axios.isAxiosError(error) ||
                (error.response && error.response.status >= 500) ||
                !error.response;
            if (shouldRetry && isRetryableError && (mergedOptions.retryInterval || mergedOptions.retryDelay)) {
                await this._delay(retryDelay);
                return this.request(endpoint, data, customOptions, retryAttempt + 1);
            }
            this.isRequesting = false;
            this.emit('error', err);
            throw err;
        }
    }
    /**
     * Process streaming response
     */
    async processStream(response, mergedOptions) {
        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('Response body is not readable');
        }
        const decoder = new TextDecoder();
        const streamSeparator = mergedOptions.streamSeparator || '\n\n';
        const partSeparator = mergedOptions.partSeparator || '\n';
        const kvSeparator = mergedOptions.kvSeparator || ':';
        let buffer = '';
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const parts = buffer.split(streamSeparator);
                // Process complete parts
                for (let i = 0; i < parts.length - 1; i++) {
                    const chunk = this._parseStreamChunk(parts[i], partSeparator, kvSeparator);
                    if (chunk && mergedOptions.callbacks?.onUpdate) {
                        mergedOptions.callbacks.onUpdate(chunk, response.headers, undefined);
                    }
                }
                // Keep incomplete part in buffer
                buffer = parts[parts.length - 1];
            }
            // Process remaining buffer
            if (buffer) {
                const chunk = this._parseStreamChunk(buffer, partSeparator, kvSeparator);
                if (chunk && mergedOptions.callbacks?.onUpdate) {
                    mergedOptions.callbacks.onUpdate(chunk, response.headers, undefined);
                }
            }
        }
        finally {
            reader.releaseLock();
        }
    }
    /**
     * Parse a stream chunk based on separators
     */
    _parseStreamChunk(chunk, partSeparator, kvSeparator) {
        const trimmed = chunk.trim();
        if (!trimmed)
            return null;
        const result = {};
        const parts = trimmed.split(partSeparator);
        for (const part of parts) {
            const [key, value] = part.split(kvSeparator).map((s) => s.trim());
            if (key && value !== undefined) {
                result[key] = value;
            }
        }
        return Object.keys(result).length > 0 ? result : null;
    }
    /**
     * GET request
     */
    async get(endpoint, customOptions) {
        return this.request(endpoint, undefined, { ...customOptions, method: 'GET' });
    }
    /**
     * POST request
     */
    async post(endpoint, data, customOptions) {
        return this.request(endpoint, data, { ...customOptions, method: 'POST' });
    }
    /**
     * PUT request
     */
    async put(endpoint, data, customOptions) {
        return this.request(endpoint, data, { ...customOptions, method: 'PUT' });
    }
    /**
     * DELETE request
     */
    async delete(endpoint, customOptions) {
        return this.request(endpoint, undefined, { ...customOptions, method: 'DELETE' });
    }
    /**
     * PATCH request
     */
    async patch(endpoint, data, customOptions) {
        return this.request(endpoint, data, { ...customOptions, method: 'PATCH' });
    }
    _delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
/**
 * Global options storage for all XRequest instances
 */
let globalOptions = {};
/**
 * Set global options for all XRequest instances
 */
export const setXRequestGlobalOptions = (options) => {
    globalOptions = {
        ...globalOptions,
        ...options,
    };
};
/**
 * Get current global options
 */
export const getXRequestGlobalOptions = () => {
    return { ...globalOptions };
};
/**
 * Reset global options to defaults
 */
export const resetXRequestGlobalOptions = () => {
    globalOptions = {};
};
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
export const XRequestFunction = (baseURL, options = {}) => {
    return new XRequestClass(baseURL, options);
};
export default XRequestFunction;
//# sourceMappingURL=XRequest.js.map