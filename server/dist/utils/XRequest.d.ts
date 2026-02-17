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
export type XRequestFunction = <T = any>(url: string, config?: XRequestConfig, body?: any) => Promise<XRequestResponse<T>>;
export declare class XRequest {
    private defaultConfig;
    constructor(defaultConfig?: XRequestConfig);
    request<T = any>(url: string, config?: XRequestConfig, body?: any): Promise<XRequestResponse<T>>;
    private delay;
    get<T = any>(url: string, config?: XRequestConfig): Promise<XRequestResponse<T>>;
    post<T = any>(url: string, body?: any, config?: XRequestConfig): Promise<XRequestResponse<T>>;
    put<T = any>(url: string, body?: any, config?: XRequestConfig): Promise<XRequestResponse<T>>;
    delete<T = any>(url: string, config?: XRequestConfig): Promise<XRequestResponse<T>>;
    patch<T = any>(url: string, body?: any, config?: XRequestConfig): Promise<XRequestResponse<T>>;
}
export declare const xrequest: XRequest;
export default XRequest;
//# sourceMappingURL=XRequest.d.ts.map