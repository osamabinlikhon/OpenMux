export interface Tool {
    name: string;
    description: string;
    execute(action: string, params: any): Promise<any>;
    listActions(): string[];
}
export declare class ToolRegistry {
    private tools;
    register(name: string, tool: Tool): void;
    listTools(): Array<{
        name: string;
        description: string;
        actions: string[];
    }>;
    execute(toolName: string, action: string, params: any): Promise<any>;
}
//# sourceMappingURL=ToolRegistry.d.ts.map