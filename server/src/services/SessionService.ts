import { v4 as uuidv4 } from "uuid";
import Docker from "dockerode";
import { AgentSession, Message, ContainerInfo } from "../types/index";

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

export class SessionService {
  private sessions = new Map<string, AgentSession>();

  async createSession(): Promise<AgentSession> {
    try {
      const sessionId = uuidv4();

      const apiPort = 8080 + Math.floor(Math.random() * 100);
      const vncPort = 5900 + Math.floor(Math.random() * 100);
      const cdpPort = 9222 + Math.floor(Math.random() * 100);

      const apiPortStr = apiPort + "/tcp";
      const vncPortStr = vncPort + "/tcp";
      const cdpPortStr = cdpPort + "/tcp";

      const container = await docker.createContainer({
        Image: "openmux-sandbox:latest",
        Env: [
          "SANDBOX_API_PORT=" + apiPort,
          "SANDBOX_VNC_PORT=" + vncPort,
          "SANDBOX_CDP_PORT=" + cdpPort,
        ],
        ExposedPorts: {
          [apiPortStr]: {},
          [vncPortStr]: {},
          [cdpPortStr]: {},
        },
        HostConfig: {
          PortBindings: {
            [apiPortStr]: [{ HostPort: String(apiPort) }],
            [vncPortStr]: [{ HostPort: String(vncPort) }],
            [cdpPortStr]: [{ HostPort: String(cdpPort) }],
          },
        },
      });

      await container.start();

      const session: AgentSession = {
        id: sessionId,
        containerId: container.id,
        status: "ready",
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
        metadata: {
          ports: { api: apiPort, vnc: vncPort, cdp: cdpPort },
        },
      };

      this.sessions.set(sessionId, session);
      return session;
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  }

  getSession(sessionId: string): AgentSession | undefined {
    return this.sessions.get(sessionId);
  }

  getAllSessions(): AgentSession[] {
    return Array.from(this.sessions.values());
  }

  addMessage(
    sessionId: string,
    role: "user" | "assistant" | "system",
    content: string,
  ): Message {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error("Session " + sessionId + " not found");
    }

    const message: Message = {
      id: uuidv4(),
      role,
      content,
      timestamp: new Date(),
    };

    session.messages.push(message);
    session.updatedAt = new Date();

    return message;
  }

  async terminateSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error("Session " + sessionId + " not found");
    }

    try {
      const container = docker.getContainer(session.containerId);
      await container.stop();
      await container.remove();

      session.status = "terminated";
      session.updatedAt = new Date();
    } catch (error) {
      console.error("Error terminating session:", error);
      throw error;
    }
  }

  async getContainerInfo(sessionId: string): Promise<ContainerInfo | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    try {
      const container = docker.getContainer(session.containerId);
      const info = await container.inspect();

      return {
        id: session.containerId,
        status: info.State.Running ? "running" : "stopped",
        ports:
          session.metadata && session.metadata.ports
            ? session.metadata.ports
            : { api: 8080, vnc: 5900, cdp: 9222 },
        createdAt: new Date(info.Created),
      };
    } catch (error) {
      console.error("Error getting container info:", error);
      return null;
    }
  }
}

export const sessionService = new SessionService();
