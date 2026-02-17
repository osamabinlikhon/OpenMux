export interface AgentSession {
    id: string;
    containerId: string;
    status: 'initializing' | 'ready' | 'processing' | 'error' | 'terminated';
    createdAt: Date;
    updatedAt: Date;
    messages: Message[];
    metadata?: Record<string, any>;
}
export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}
export interface Tool {
    name: string;
    description: string;
    actions: string[];
    status: 'available' | 'unavailable';
}
export interface ExecutionResult {
    success: boolean;
    output?: any;
    error?: string;
    duration: number;
}
export interface ContainerInfo {
    id: string;
    status: 'running' | 'stopped' | 'error';
    ports: {
        api: number;
        vnc: number;
        cdp: number;
    };
    createdAt: Date;
}
//# sourceMappingURL=index.d.ts.map