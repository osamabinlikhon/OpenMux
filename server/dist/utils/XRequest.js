export class XRequest {
    constructor(defaultConfig = {}) {
        this.defaultConfig = {
            method: "GET",
            timeout: 30000,
            retries: 0,
            retryDelay: 1000,
            ...defaultConfig,
        };
    }
    async request(url, config = {}, body) {
        const finalConfig = { ...this.defaultConfig, ...config };
        const { method, headers, timeout, retries, retryDelay } = finalConfig;
        let lastError = null;
        let attempt = 0;
        while (attempt <= (retries || 0)) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);
                const fetchOptions = {
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
                let data;
                const contentType = response.headers.get("content-type");
                if (contentType?.includes("application/json")) {
                    data = (await response.json());
                }
                else {
                    data = (await response.text());
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
            }
            catch (error) {
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
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    get(url, config) {
        return this.request(url, { ...config, method: "GET" });
    }
    post(url, body, config) {
        return this.request(url, { ...config, method: "POST" }, body);
    }
    put(url, body, config) {
        return this.request(url, { ...config, method: "PUT" }, body);
    }
    delete(url, config) {
        return this.request(url, { ...config, method: "DELETE" });
    }
    patch(url, body, config) {
        return this.request(url, { ...config, method: "PATCH" }, body);
    }
}
export const xrequest = new XRequest();
export default XRequest;
//# sourceMappingURL=XRequest.js.map