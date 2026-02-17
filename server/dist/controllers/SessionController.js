import { Router } from "express";
import { sessionService } from "../services/SessionService";
import { createAIFromEnv, isAIConfigured, getAIConfig, } from "../services/AIFactory";
const aiService = createAIFromEnv();
export const createSessionRouter = () => {
    const router = Router();
    /**
     * POST /sessions/create
     * Create a new agent session
     */
    router.post("/create", async (req, res) => {
        try {
            const session = await sessionService.createSession();
            res.json({
                sessionId: session.id,
                status: "ready",
                metadata: session.metadata,
            });
        }
        catch (error) {
            console.error("Error creating session:", error);
            res.status(500).json({ error: "Failed to create session" });
        }
    });
    /**
     * GET /sessions/:id
     * Get session details
     */
    router.get("/:id", (req, res) => {
        const { id } = req.params;
        const session = sessionService.getSession(id);
        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }
        res.json({
            id: session.id,
            status: session.status,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
            messagesCount: session.messages.length,
            metadata: session.metadata,
        });
    });
    /**
     * GET /sessions
     * List all sessions
     */
    router.get("/", (req, res) => {
        const sessions = sessionService.getAllSessions();
        res.json({
            sessions: sessions.map((s) => ({
                id: s.id,
                status: s.status,
                createdAt: s.createdAt,
                messagesCount: s.messages.length,
            })),
        });
    });
    /**
     * POST /sessions/:id/message
     * Send a message to a session
     */
    router.post("/:id/message", async (req, res) => {
        try {
            const { id } = req.params;
            const { message, useAI } = req.body;
            if (!message) {
                return res.status(400).json({ error: "Message is required" });
            }
            const session = sessionService.getSession(id);
            if (!session) {
                return res.status(404).json({ error: "Session not found" });
            }
            sessionService.addMessage(id, "user", message);
            let assistantMessage;
            if (useAI && aiService && isAIConfigured()) {
                const conversationHistory = session.messages.map((m) => ({
                    role: m.role,
                    content: m.content,
                }));
                conversationHistory.push({ role: "user", content: message });
                const aiResponse = await aiService.chat({
                    model: "",
                    messages: conversationHistory,
                    temperature: 0.7,
                    max_tokens: 4096,
                });
                assistantMessage =
                    aiResponse.choices[0]?.message?.content || "No response from AI";
            }
            else {
                const containerInfo = await sessionService.getContainerInfo(id);
                if (!containerInfo) {
                    assistantMessage =
                        "Sandbox not available. Configure AI_API_KEY for AI responses.";
                }
                else {
                    const sandboxResponse = await fetch(`http://localhost:${containerInfo.ports.api}/tools/shell/execute`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            params: { command: `echo "${message}"` },
                        }),
                    });
                    const result = (await sandboxResponse.json());
                    assistantMessage =
                        result.stdout || result.output || "Processing complete";
                }
            }
            sessionService.addMessage(id, "assistant", assistantMessage);
            res.json({
                response: assistantMessage,
                events: [],
                ai: useAI && isAIConfigured(),
            });
        }
        catch (error) {
            console.error("Error processing message:", error);
            res.status(500).json({ error: "Failed to process message" });
        }
    });
    /**
     * DELETE /sessions/:id
     * Terminate a session
     */
    router.delete("/:id", async (req, res) => {
        try {
            const { id } = req.params;
            await sessionService.terminateSession(id);
            res.json({ status: "terminated" });
        }
        catch (error) {
            console.error("Error terminating session:", error);
            res.status(500).json({ error: "Failed to terminate session" });
        }
    });
    /**
     * GET /ai/config
     * Check AI service configuration
     */
    router.get("/ai/config", (req, res) => {
        const configured = isAIConfigured();
        const config = getAIConfig();
        res.json({
            configured,
            provider: configured ? config.provider : null,
            model: configured ? config.defaultModel : null,
            availableProviders: [
                "minimax",
                "glm",
                "kimi",
                "openai",
                "anthropic",
                "opencode",
            ],
        });
    });
    return router;
};
//# sourceMappingURL=SessionController.js.map