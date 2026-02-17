import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ToolRegistry } from "./tools/ToolRegistry";
import { BrowserTool } from "./tools/BrowserTool";
import { ShellTool } from "./tools/ShellTool";
import { FileTool } from "./tools/FileTool";
import { AIRequestTool } from "./tools/AIRequestTool";
import { e2bService } from "./services/E2BDesktopService";

dotenv.config();

const app: Express = express();
const PORT = process.env.SANDBOX_API_PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Tool Registry
const toolRegistry = new ToolRegistry();
toolRegistry.register("browser", new BrowserTool());
toolRegistry.register("shell", new ShellTool());
toolRegistry.register("file", new FileTool());
toolRegistry.register("ai-request", new AIRequestTool());

// Get Available Tools
app.get("/tools", (req, res) => {
  res.json({
    tools: toolRegistry.listTools(),
  });
});

// Execute Tool
app.post("/tools/:toolName/:action", async (req, res) => {
  try {
    const { toolName, action } = req.params;
    const { params } = req.body;

    const result = await toolRegistry.execute(toolName, action, params);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

// VNC Proxy (for browser access)
app.get("/vnc", (req, res) => {
  res.json({
    status: "vnc_ready",
    port: process.env.SANDBOX_VNC_PORT || 5900,
  });
});

// Chrome CDP Proxy
app.get("/cdp", (req, res) => {
  res.json({
    status: "cdp_ready",
    port: process.env.SANDBOX_CDP_PORT || 9222,
  });
});

// E2B Desktop Endpoints
app.get("/e2b/status", (req, res) => {
  res.json({
    configured: e2bService.isConfigured(),
    sessions: e2bService.getAllSessions().map((s) => ({
      id: s.id,
      status: s.status,
      createdAt: s.createdAt,
    })),
  });
});

app.post("/e2b/sessions", async (req, res) => {
  try {
    const { apiKey } = req.body;
    const session = await e2bService.createSession(apiKey);
    res.json({
      sessionId: session.id,
      status: session.status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: String(error),
    });
  }
});

app.post("/e2b/sessions/:sessionId/launch", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { app: appName } = req.body;
    await e2bService.launchApplication(sessionId, appName);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

app.get("/e2b/sessions/:sessionId/screenshot", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const screenshot = await e2bService.screenshot(sessionId);
    res.set("Content-Type", "image/png");
    res.send(screenshot);
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

app.post("/e2b/sessions/:sessionId/stream/start", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { windowId } = req.body;
    const result = await e2bService.startStream(sessionId, windowId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

app.post("/e2b/sessions/:sessionId/stream/stop", async (req, res) => {
  try {
    const { sessionId } = req.params;
    await e2bService.stopStream(sessionId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

app.post("/e2b/sessions/:sessionId/input", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { action, x, y, button, keys, text, amount } = req.body;

    switch (action) {
      case "click":
        await e2bService.mouseClick(sessionId, x, y, button || "left");
        break;
      case "doubleClick":
        await e2bService.doubleClick(sessionId, x, y);
        break;
      case "scroll":
        await e2bService.scroll(sessionId, amount || 10);
        break;
      case "moveMouse":
        await e2bService.moveMouse(sessionId, x || 0, y || 0);
        break;
      case "write":
        await e2bService.writeText(sessionId, text || "");
        break;
      case "press":
        await e2bService.pressKey(sessionId, keys || "enter");
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

app.delete("/e2b/sessions/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    await e2bService.terminateSession(sessionId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Health Check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🐳 OpenMux Sandbox API running on http://localhost:${PORT}`);
  console.log(`📝 Available Tools:`);
  console.log(`   - Browser (Puppeteer)`);
  console.log(`   - Shell (Command execution)`);
  console.log(`   - File (File operations)`);
  console.log(`   - AI Request (External API access)`);
  console.log(
    `   - E2B Desktop (${e2bService.isConfigured() ? "configured" : "not configured"})`,
  );
});

export default app;
