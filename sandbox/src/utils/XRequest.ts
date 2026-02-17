import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
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
  transformStream?: (
    response: Response,
  ) => ReadableStream<Output> | TransformStream<any, Output> | Promise<ReadableStream<Output>>;
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
export type XRequestGlobalOptions<Input = Record<PropertyKey, any>, Output = Record<string, string>> = Pick<
  XRequestOptions<Input, Output>,
  'headers' | 'timeout' | 'streamTimeout' | 'middlewares' | 'fetch' | 'transformStream' | 'manual'
>;

/**
 * XRequestClass - Handles HTTP requests with advanced features
 */
export class XRequestClass<Input = Record<PropertyKey, any>, Output = Record<string, string>> extends EventEmitter {
  private client: AxiosInstance;
  private baseURL: string;
  private options: XRequestOptions<Input, Output>;
  private abortController: AbortController | null = null;
  private isRequesting = false;
  private pendingParams: Input | undefined = undefined;

  constructor(baseURL: string, options: XRequestOptions<Input, Output> = {}) {
    super();
    this.baseURL = baseURL;
    this.options = {
      method: 'POST' as const,
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
    } as XRequestOptions<Input, Output>;

    this.client = this._createClient();

    // If manual mode and no initial run call, setup auto-run
    if (this.options.manual === false) {
      // Auto-run is default behavior
    }
  }

  private _createClient(): AxiosInstance {
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
  abort(): void {
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
  getIsRequesting(): boolean {
    return this.isRequesting;
  }

  /**
   * Manually execute request (when manual=true)
   */
  async run(params?: Input): Promise<Output | void> {
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
  private async request(
    endpoint: string,
    data?: Input,
    customOptions?: Partial<XRequestOptions<Input, Output>>,
    retryAttempt = 0
  ): Promise<Output | void> {
    const mergedOptions = { ...this.options, ...customOptions } as XRequestOptions<Input, Output>;
    const maxRetries = mergedOptions.retryTimes || mergedOptions.retries || 3;

    this.isRequesting = true;
    this.abortController = new AbortController();

    try {
      // Execute pre-request middleware
      let requestUrl = this.baseURL + endpoint;
      let requestInit: RequestInit | undefined = {
        method: mergedOptions.method || 'POST',
        headers: mergedOptions.headers,
        body: data ? JSON.stringify(mergedOptions.transformRequest ? mergedOptions.transformRequest(data) : data) : undefined,
        signal: this.abortController.signal,
      };

      if (mergedOptions.middlewares?.onRequest) {
        const [updatedUrl, updatedInit] = await mergedOptions.middlewares.onRequest(requestUrl, requestInit);
        requestUrl = String(updatedUrl);
        requestInit = updatedInit;
      }

      // Use custom fetch or default
      const fetchFn = mergedOptions.fetch || fetch;
      const requestConfig: AxiosRequestConfig = {
        method: mergedOptions.method || 'POST',
        url: endpoint,
        headers: mergedOptions.headers,
        signal: this.abortController.signal,
        timeout: mergedOptions.timeout,
        ...(data && { data: mergedOptions.transformRequest ? mergedOptions.transformRequest(data) : data }),
      };

      let response: AxiosResponse;
      try {
        response = await this.client.request(requestConfig);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw error;
        }
        throw error;
      }

      // Execute post-response middleware
      if (mergedOptions.middlewares?.onResponse) {
        const responseObj = new Response(JSON.stringify(response.data), {
          status: response.status,
          headers: new Headers(response.headers as Record<string, string>),
        });
        await mergedOptions.middlewares.onResponse(responseObj);
      }

      // Transform response if needed
      const transformedResponse = mergedOptions.transformResponse
        ? mergedOptions.transformResponse(response.data)
        : response.data;

      // Call success callback
      if (mergedOptions.callbacks?.onSuccess) {
        mergedOptions.callbacks.onSuccess(
          Array.isArray(transformedResponse) ? transformedResponse : [transformedResponse],
          new Headers(response.headers as Record<string, string>),
          undefined
        );
      }

      this.isRequesting = false;
      this.emit('success', transformedResponse);
      return transformedResponse as Output;
    } catch (error) {
      if (this.abortController?.signal.aborted) {
        this.isRequesting = false;
        return;
      }

      const err = error instanceof Error ? error : new Error(String(error));
      let retryDelay = mergedOptions.retryDelay || 1000;

      // Call error callback - it may return a custom retry interval
      if (mergedOptions.callbacks?.onError) {
        const callbackRetryInterval = mergedOptions.callbacks.onError(
          err,
          error,
          undefined,
          undefined
        );
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
  private async processStream(
    response: Response,
    mergedOptions: XRequestOptions<Input, Output>
  ): Promise<void> {
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
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split(streamSeparator);

        // Process complete parts
        for (let i = 0; i < parts.length - 1; i++) {
          const chunk = this._parseStreamChunk(parts[i], partSeparator, kvSeparator);
          if (chunk && mergedOptions.callbacks?.onUpdate) {
            mergedOptions.callbacks.onUpdate(chunk as Output, response.headers, undefined);
          }
        }

        // Keep incomplete part in buffer
        buffer = parts[parts.length - 1];
      }

      // Process remaining buffer
      if (buffer) {
        const chunk = this._parseStreamChunk(buffer, partSeparator, kvSeparator);
        if (chunk && mergedOptions.callbacks?.onUpdate) {
          mergedOptions.callbacks.onUpdate(chunk as Output, response.headers, undefined);
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Parse a stream chunk based on separators
   */
  private _parseStreamChunk(
    chunk: string,
    partSeparator: string,
    kvSeparator: string
  ): Record<string, string> | null {
    const trimmed = chunk.trim();
    if (!trimmed) return null;

    const result: Record<string, string> = {};
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
  async get(endpoint: string, customOptions?: Partial<XRequestOptions<Input, Output>>): Promise<Output> {
    return this.request(endpoint, undefined, { ...customOptions, method: 'GET' }) as Promise<Output>;
  }

  /**
   * POST request
   */
  async post(
    endpoint: string,
    data: Input,
    customOptions?: Partial<XRequestOptions<Input, Output>>
  ): Promise<Output> {
    return this.request(endpoint, data, { ...customOptions, method: 'POST' }) as Promise<Output>;
  }

  /**
   * PUT request
   */
  async put(
    endpoint: string,
    data: Input,
    customOptions?: Partial<XRequestOptions<Input, Output>>
  ): Promise<Output> {
    return this.request(endpoint, data, { ...customOptions, method: 'PUT' }) as Promise<Output>;
  }

  /**
   * DELETE request
   */
  async delete(endpoint: string, customOptions?: Partial<XRequestOptions<Input, Output>>): Promise<Output> {
    return this.request(endpoint, undefined, { ...customOptions, method: 'DELETE' }) as Promise<Output>;
  }

  /**
   * PATCH request
   */
  async patch(
    endpoint: string,
    data: Input,
    customOptions?: Partial<XRequestOptions<Input, Output>>
  ): Promise<Output> {
    return this.request(endpoint, data, { ...customOptions, method: 'PATCH' }) as Promise<Output>;
  }

  private _delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Global options storage for all XRequest instances
 */
let globalOptions: any = {};

/**
 * Set global options for all XRequest instances
 */
export const setXRequestGlobalOptions = <
  Input = Record<PropertyKey, any>,
  Output = Record<string, string>
>(
  options: XRequestGlobalOptions<Input, Output>
): void => {
  globalOptions = {
    ...globalOptions,
    ...options,
  };
};

/**
 * Get current global options
 */
export const getXRequestGlobalOptions = (): XRequestGlobalOptions => {
  return { ...globalOptions };
};

/**
 * Reset global options to defaults
 */
export const resetXRequestGlobalOptions = (): void => {
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
export const XRequestFunction = <Input = Record<PropertyKey, any>, Output = Record<string, string>>(
  baseURL: string,
  options: XRequestOptions<Input, Output> = {},
): XRequestClass<Input, Output> => {
  return new XRequestClass(baseURL, options);
};

export default XRequestFunction;
