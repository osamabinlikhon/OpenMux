export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface XRequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface XRequestResponse<T = any> {
  data?: T;
  error?: string;
  status?: number;
  statusText?: string;
}

export type XRequestFunction = <T = any>(
  url: string,
  config?: XRequestConfig,
  body?: any,
) => Promise<XRequestResponse<T>>;

export class XRequest {
  private defaultConfig: XRequestConfig;

  constructor(defaultConfig: XRequestConfig = {}) {
    this.defaultConfig = {
      method: "GET",
      timeout: 30000,
      retries: 0,
      retryDelay: 1000,
      ...defaultConfig,
    };
  }

  async request<T = any>(
    url: string,
    config: XRequestConfig = {},
    body?: any,
  ): Promise<XRequestResponse<T>> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const { method, headers, timeout, retries, retryDelay } = finalConfig;

    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt <= (retries || 0)) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const fetchOptions: RequestInit = {
          method: method || "GET",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          signal: controller.signal,
        };

        if (body && method !== "GET") {
          fetchOptions.body = JSON.stringify(body);
        }

        clearTimeout(timeoutId);

        const response = await fetch(url, fetchOptions);

        let data: T | undefined;
        const contentType = response.headers.get("content-type");

        if (contentType?.includes("application/json")) {
          data = (await response.json()) as T;
        } else {
          data = (await response.text()) as unknown as T;
        }

        if (!response.ok) {
          return {
            data,
            error: `HTTP ${response.status}: ${response.statusText}`,
            status: response.status,
            statusText: response.statusText,
          };
        }

        return {
          data,
          status: response.status,
          statusText: response.statusText,
        };
      } catch (error: any) {
        lastError = error;

        if (error.name === "AbortError") {
          return {
            error: `Request timeout after ${timeout}ms`,
            status: 408,
            statusText: "Request Timeout",
          };
        }

        if (attempt < (retries || 0)) {
          attempt++;
          await this.delay(retryDelay || 1000);
          continue;
        }

        return {
          error: error.message || "Network error",
          status: 0,
          statusText: "Network Error",
        };
      }
    }

    return {
      error: lastError?.message || "Max retries exceeded",
      status: 0,
      statusText: "Max Retries",
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  get<T = any>(
    url: string,
    config?: XRequestConfig,
  ): Promise<XRequestResponse<T>> {
    return this.request<T>(url, { ...config, method: "GET" });
  }

  post<T = any>(
    url: string,
    body?: any,
    config?: XRequestConfig,
  ): Promise<XRequestResponse<T>> {
    return this.request<T>(url, { ...config, method: "POST" }, body);
  }

  put<T = any>(
    url: string,
    body?: any,
    config?: XRequestConfig,
  ): Promise<XRequestResponse<T>> {
    return this.request<T>(url, { ...config, method: "PUT" }, body);
  }

  delete<T = any>(
    url: string,
    config?: XRequestConfig,
  ): Promise<XRequestResponse<T>> {
    return this.request<T>(url, { ...config, method: "DELETE" });
  }

  patch<T = any>(
    url: string,
    body?: any,
    config?: XRequestConfig,
  ): Promise<XRequestResponse<T>> {
    return this.request<T>(url, { ...config, method: "PATCH" }, body);
  }
}

export const xrequest = new XRequest();
export default XRequest;
