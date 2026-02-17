import { Sandbox } from "@e2b/desktop";
import { v4 as uuidv4 } from "uuid";
const E2B_API_KEY = process.env.E2B_API_KEY;
class E2BDesktopService {
    constructor() {
        this.sessions = new Map();
        this.defaultApiKey = E2B_API_KEY;
    }
    async createSession(apiKey) {
        const sessionId = uuidv4();
        const session = {
            id: sessionId,
            sandbox: null,
            status: "initializing",
            createdAt: new Date(),
        };
        this.sessions.set(sessionId, session);
        try {
            const sandbox = await Sandbox.create({
                apiKey: apiKey || this.defaultApiKey,
            });
            session.sandbox = sandbox;
            session.status = "ready";
            console.log(`E2B Desktop session created: ${sessionId}`);
            return session;
        }
        catch (error) {
            session.status = "terminated";
            console.error("Failed to create E2B Desktop session:", error);
            throw error;
        }
    }
    async launchApplication(sessionId, app) {
        const session = this.sessions.get(sessionId);
        if (!session || !session.sandbox) {
            throw new Error("Session not found or not ready");
        }
        await session.sandbox.launch(app);
        session.status = "active";
    }
    async screenshot(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session || !session.sandbox) {
            throw new Error("Session not found or not ready");
        }
        const image = await session.sandbox.screenshot();
        return Buffer.from(image);
    }
    async startStream(sessionId, windowId) {
        const session = this.sessions.get(sessionId);
        if (!session || !session.sandbox) {
            throw new Error("Session not found or not ready");
        }
        const streamOptions = {};
        if (windowId) {
            streamOptions.windowId = windowId;
        }
        await session.sandbox.stream.start(streamOptions);
        const url = session.sandbox.stream.getUrl();
        const authKey = session.sandbox.stream.getAuthKey
            ? await session.sandbox.stream.getAuthKey()
            : undefined;
        return { url, authKey };
    }
    async stopStream(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session || !session.sandbox) {
            throw new Error("Session not found or not ready");
        }
        await session.sandbox.stream.stop();
    }
    async getStreamUrl(sessionId, requireAuth = false) {
        const session = this.sessions.get(sessionId);
        if (!session || !session.sandbox) {
            throw new Error("Session not found or not ready");
        }
        const options = {};
        if (requireAuth && session.sandbox.stream.getAuthKey) {
            options.authKey = await session.sandbox.stream.getAuthKey();
        }
        return session.sandbox.stream.getUrl(options);
    }
    async getCurrentWindowId(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session || !session.sandbox) {
            throw new Error("Session not found or not ready");
        }
        return session.sandbox.getCurrentWindowId();
    }
    async getApplicationWindows(sessionId, appName) {
        const session = this.sessions.get(sessionId);
        if (!session || !session.sandbox) {
            throw new Error("Session not found or not ready");
        }
        return session.sandbox.getApplicationWindows(appName);
    }
    async getWindowTitle(sessionId, windowId) {
        const session = this.sessions.get(sessionId);
        if (!session || !session.sandbox) {
            throw new Error("Session not found or not ready");
        }
        return session.sandbox.getWindowTitle(windowId);
    }
    async mouseClick(sessionId, x, y, button = "left") {
        const session = this.sessions.get(sessionId);
        if (!session || !session.sandbox) {
            throw new Error("Session not found or not ready");
        }
        if (x !== undefined && y !== undefined) {
            switch (button) {
                case "left":
                    await session.sandbox.leftClick(x, y);
                    break;
                case "right":
                    await session.sandbox.rightClick(x, y);
                    break;
                case "middle":
                    await session.sandbox.middleClick(x, y);
                    break;
            }
        }
        else {
            switch (button) {
                case "left":
                    await session.sandbox.leftClick();
                    break;
                case "right":
                    await session.sandbox.rightClick();
                    break;
                case "middle":
                    await session.sandbox.middleClick();
                    break;
            }
        }
    }
    async doubleClick(sessionId, x, y) {
        const session = this.sessions.get(sessionId);
        if (!session || !session.sandbox) {
            throw new Error("Session not found or not ready");
        }
        if (x !== undefined && y !== undefined) {
            await session.sandbox.doubleClick(x, y);
        }
        else {
            await session.sandbox.doubleClick();
        }
    }
    async scroll(sessionId, amount) {
        const session = this.sessions.get(sessionId);
        if (!session || !session.sandbox) {
            throw new Error("Session not found or not ready");
        }
        await session.sandbox.scroll(amount);
    }
    async moveMouse(sessionId, x, y) {
        const session = this.sessions.get(sessionId);
        if (!session || !session.sandbox) {
            throw new Error("Session not found or not ready");
        }
        await session.sandbox.moveMouse(x, y);
    }
    async writeText(sessionId, text, options) {
        const session = this.sessions.get(sessionId);
        if (!session || !session.sandbox) {
            throw new Error("Session not found or not ready");
        }
        await session.sandbox.write(text, options);
    }
    async pressKey(sessionId, keys) {
        const session = this.sessions.get(sessionId);
        if (!session || !session.sandbox) {
            throw new Error("Session not found or not ready");
        }
        await session.sandbox.press(keys);
    }
    async runCommand(sessionId, command) {
        const session = this.sessions.get(sessionId);
        if (!session || !session.sandbox) {
            throw new Error("Session not found or not ready");
        }
        const result = await session.sandbox.commands.run(command);
        return result.stdout || result.stderr || String(result);
    }
    async openFile(sessionId, path) {
        const session = this.sessions.get(sessionId);
        if (!session || !session.sandbox) {
            throw new Error("Session not found or not ready");
        }
        await session.sandbox.open(path);
    }
    async writeFile(sessionId, path, content) {
        const session = this.sessions.get(sessionId);
        if (!session || !session.sandbox) {
            throw new Error("Session not found or not ready");
        }
        await session.sandbox.files.write(path, content);
    }
    async wait(sessionId, ms) {
        const session = this.sessions.get(sessionId);
        if (!session || !session.sandbox) {
            throw new Error("Session not found or not ready");
        }
        await session.sandbox.wait(ms);
    }
    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }
    getAllSessions() {
        return Array.from(this.sessions.values());
    }
    async terminateSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return;
        }
        try {
            if (session.sandbox) {
                await session.sandbox.kill();
            }
        }
        catch (error) {
            console.error("Error terminating E2B session:", error);
        }
        session.status = "terminated";
        this.sessions.delete(sessionId);
        console.log(`E2B Desktop session terminated: ${sessionId}`);
    }
    isConfigured() {
        return !!this.defaultApiKey;
    }
}
export const e2bService = new E2BDesktopService();
export default e2bService;
//# sourceMappingURL=E2BDesktopService.js.map