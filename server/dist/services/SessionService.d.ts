import { AgentSession, Message, ContainerInfo } from "../types/index";
export declare class SessionService {
    private sessions;
    createSession(): Promise<AgentSession>;
    getSession(sessionId: string): AgentSession | undefined;
    getAllSessions(): AgentSession[];
    addMessage(sessionId: string, role: "user" | "assistant" | "system", content: string): Message;
    terminateSession(sessionId: string): Promise<void>;
    getContainerInfo(sessionId: string): Promise<ContainerInfo | null>;
}
export declare const sessionService: SessionService;
//# sourceMappingURL=SessionService.d.ts.map