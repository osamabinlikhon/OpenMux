import { Sandbox } from "@e2b/desktop";
export interface E2BSession {
    id: string;
    sandbox: Sandbox | null;
    status: "initializing" | "ready" | "active" | "terminated";
    createdAt: Date;
}
export interface E2BConfig {
    apiKey?: string;
    template?: string;
}
declare class E2BDesktopService {
    private sessions;
    private defaultApiKey;
    constructor();
    createSession(apiKey?: string): Promise<E2BSession>;
    launchApplication(sessionId: string, app: string): Promise<void>;
    screenshot(sessionId: string): Promise<Buffer>;
    startStream(sessionId: string, windowId?: string): Promise<{
        url: string;
        authKey?: string;
    }>;
    stopStream(sessionId: string): Promise<void>;
    getStreamUrl(sessionId: string, requireAuth?: boolean): Promise<string>;
    getCurrentWindowId(sessionId: string): Promise<string>;
    getApplicationWindows(sessionId: string, appName: string): Promise<string[]>;
    getWindowTitle(sessionId: string, windowId: string): Promise<string>;
    mouseClick(sessionId: string, x?: number, y?: number, button?: "left" | "right" | "middle"): Promise<void>;
    doubleClick(sessionId: string, x?: number, y?: number): Promise<void>;
    scroll(sessionId: string, amount: number): Promise<void>;
    moveMouse(sessionId: string, x: number, y: number): Promise<void>;
    writeText(sessionId: string, text: string, options?: {
        chunkSize?: number;
        delayInMs?: number;
    }): Promise<void>;
    pressKey(sessionId: string, keys: string | string[]): Promise<void>;
    runCommand(sessionId: string, command: string): Promise<string>;
    openFile(sessionId: string, path: string): Promise<void>;
    writeFile(sessionId: string, path: string, content: string): Promise<void>;
    wait(sessionId: string, ms: number): Promise<void>;
    getSession(sessionId: string): E2BSession | undefined;
    getAllSessions(): E2BSession[];
    terminateSession(sessionId: string): Promise<void>;
    isConfigured(): boolean;
}
export declare const e2bService: E2BDesktopService;
export default e2bService;
//# sourceMappingURL=E2BDesktopService.d.ts.map