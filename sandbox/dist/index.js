import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ToolRegistry } from './tools/ToolRegistry';
import { BrowserTool } from './tools/BrowserTool';
import { ShellTool } from './tools/ShellTool';
import { FileTool } from './tools/FileTool';
import { AIRequestTool } from './tools/AIRequestTool';
dotenv.config();
const app = express();
const PORT = process.env.SANDBOX_API_PORT || 8080;
// Middleware
app.use(cors());
app.use(express.json());
// Tool Registry
const toolRegistry = new ToolRegistry();
toolRegistry.register('browser', new BrowserTool());
toolRegistry.register('shell', new ShellTool());
toolRegistry.register('file', new FileTool());
toolRegistry.register('ai-request', new AIRequestTool());
// Get Available Tools
app.get('/tools', (req, res) => {
    res.json({
        tools: toolRegistry.listTools(),
    });
});
// Execute Tool
app.post('/tools/:toolName/:action', async (req, res) => {
    try {
        const { toolName, action } = req.params;
        const { params } = req.body;
        const result = await toolRegistry.execute(toolName, action, params);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: String(error),
        });
    }
});
// VNC Proxy (for browser access)
app.get('/vnc', (req, res) => {
    res.json({
        status: 'vnc_ready',
        port: process.env.SANDBOX_VNC_PORT || 5900,
    });
});
// Chrome CDP Proxy
app.get('/cdp', (req, res) => {
    res.json({
        status: 'cdp_ready',
        port: process.env.SANDBOX_CDP_PORT || 9222,
    });
});
// Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});
// Start Server
app.listen(PORT, () => {
    console.log(`🐳 OpenMux Sandbox API running on http://localhost:${PORT}`);
    console.log(`📝 Available Tools:`);
    console.log(`   - Browser (VNC on port ${process.env.SANDBOX_VNC_PORT || 5900})`);
    console.log(`   - Shell (Command execution)`);
    console.log(`   - File (File operations)`);
    console.log(`   - AI Request (External API access)`);
});
export default app;
//# sourceMappingURL=index.js.map