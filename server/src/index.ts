import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createSessionRouter } from "./controllers/SessionController";

dotenv.config();

const app: Express = express();
const port = parseInt(process.env.PORT || "8000", 10);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/sessions", createSessionRouter());

/**
 * Health check endpoint
 */
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "0.1.0",
  });
});

/**
 * Root endpoint
 */
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "OpenMux Server API",
    version: "0.1.0",
    documentation: "http://localhost:" + port + "/api/docs",
    endpoints: {
      "POST /api/sessions/create": "Create a new agent session",
      "POST /api/sessions/:id/message": "Send a message to an agent",
      "GET /api/sessions/:id": "Get session details",
      "GET /api/sessions": "List all sessions",
      "DELETE /api/sessions/:id": "Terminate a session",
      "GET /api/health": "Health check",
    },
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: Function) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    path: req.path,
  });
});

// Start server
app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 OpenMux Server running on http://0.0.0.0:${port}`);
  console.log(`📝 API Documentation: http://localhost:${port}`);
  console.log(`🏥 Health check: http://localhost:${port}/api/health`);
});

export default app;
