export interface Tool {
    name: string;
    execute(action: string, params: Record<string, unknown>): Promise<unknown>;
}
export interface ToolResult {
    success: boolean;
    output: unknown;
    error?: string;
}
//# sourceMappingURL=types.d.ts.map