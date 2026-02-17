import { Sandbox } from "@e2b/desktop";
import { v4 as uuidv4 } from "uuid";

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

const E2B_API_KEY = process.env.E2B_API_KEY;

class E2BDesktopService {
  private sessions = new Map<string, E2BSession>();
  private defaultApiKey: string | undefined;

  constructor() {
    this.defaultApiKey = E2B_API_KEY;
  }

  async createSession(apiKey?: string): Promise<E2BSession> {
    const sessionId = uuidv4();

    const session: E2BSession = {
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
    } catch (error) {
      session.status = "terminated";
      console.error("Failed to create E2B Desktop session:", error);
      throw error;
    }
  }

  async launchApplication(sessionId: string, app: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.sandbox) {
      throw new Error("Session not found or not ready");
    }

    await session.sandbox.launch(app);
    session.status = "active";
  }

  async screenshot(sessionId: string): Promise<Buffer> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.sandbox) {
      throw new Error("Session not found or not ready");
    }

    const image = await session.sandbox.screenshot();
    return Buffer.from(image);
  }

  async startStream(
    sessionId: string,
    windowId?: string,
  ): Promise<{ url: string; authKey?: string }> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.sandbox) {
      throw new Error("Session not found or not ready");
    }

    const streamOptions: any = {};
    if (windowId) {
      streamOptions.windowId = windowId;
    }

    await session.sandbox.stream.start(streamOptions);

    const url = session.sandbox.stream.getUrl();
    const authKey = (session.sandbox.stream as any).getAuthKey
      ? await (session.sandbox.stream as any).getAuthKey()
      : undefined;

    return { url, authKey };
  }

  async stopStream(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.sandbox) {
      throw new Error("Session not found or not ready");
    }

    await session.sandbox.stream.stop();
  }

  async getStreamUrl(
    sessionId: string,
    requireAuth: boolean = false,
  ): Promise<string> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.sandbox) {
      throw new Error("Session not found or not ready");
    }

    const options: any = {};
    if (requireAuth && (session.sandbox.stream as any).getAuthKey) {
      options.authKey = await (session.sandbox.stream as any).getAuthKey();
    }

    return session.sandbox.stream.getUrl(options);
  }

  async getCurrentWindowId(sessionId: string): Promise<string> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.sandbox) {
      throw new Error("Session not found or not ready");
    }

    return session.sandbox.getCurrentWindowId();
  }

  async getApplicationWindows(
    sessionId: string,
    appName: string,
  ): Promise<string[]> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.sandbox) {
      throw new Error("Session not found or not ready");
    }

    return session.sandbox.getApplicationWindows(appName);
  }

  async getWindowTitle(sessionId: string, windowId: string): Promise<string> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.sandbox) {
      throw new Error("Session not found or not ready");
    }

    return session.sandbox.getWindowTitle(windowId);
  }

  async mouseClick(
    sessionId: string,
    x?: number,
    y?: number,
    button: "left" | "right" | "middle" = "left",
  ): Promise<void> {
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
    } else {
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

  async doubleClick(sessionId: string, x?: number, y?: number): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.sandbox) {
      throw new Error("Session not found or not ready");
    }

    if (x !== undefined && y !== undefined) {
      await session.sandbox.doubleClick(x, y);
    } else {
      await session.sandbox.doubleClick();
    }
  }

  async scroll(sessionId: string, amount: number): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.sandbox) {
      throw new Error("Session not found or not ready");
    }

    await (session.sandbox as any).scroll(amount);
  }

  async moveMouse(sessionId: string, x: number, y: number): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.sandbox) {
      throw new Error("Session not found or not ready");
    }

    await session.sandbox.moveMouse(x, y);
  }

  async writeText(
    sessionId: string,
    text: string,
    options?: { chunkSize?: number; delayInMs?: number },
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.sandbox) {
      throw new Error("Session not found or not ready");
    }

    await session.sandbox.write(text, options as any);
  }

  async pressKey(sessionId: string, keys: string | string[]): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.sandbox) {
      throw new Error("Session not found or not ready");
    }

    await session.sandbox.press(keys);
  }

  async runCommand(sessionId: string, command: string): Promise<string> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.sandbox) {
      throw new Error("Session not found or not ready");
    }

    const result = await session.sandbox.commands.run(command);
    return result.stdout || result.stderr || String(result);
  }

  async openFile(sessionId: string, path: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.sandbox) {
      throw new Error("Session not found or not ready");
    }

    await session.sandbox.open(path);
  }

  async writeFile(
    sessionId: string,
    path: string,
    content: string,
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.sandbox) {
      throw new Error("Session not found or not ready");
    }

    await session.sandbox.files.write(path, content);
  }

  async wait(sessionId: string, ms: number): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.sandbox) {
      throw new Error("Session not found or not ready");
    }

    await session.sandbox.wait(ms);
  }

  getSession(sessionId: string): E2BSession | undefined {
    return this.sessions.get(sessionId);
  }

  getAllSessions(): E2BSession[] {
    return Array.from(this.sessions.values());
  }

  async terminateSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    try {
      if (session.sandbox) {
        await session.sandbox.kill();
      }
    } catch (error) {
      console.error("Error terminating E2B session:", error);
    }

    session.status = "terminated";
    this.sessions.delete(sessionId);
    console.log(`E2B Desktop session terminated: ${sessionId}`);
  }

  isConfigured(): boolean {
    return !!this.defaultApiKey;
  }
}

export const e2bService = new E2BDesktopService();
export default e2bService;
