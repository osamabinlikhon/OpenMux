# AGENTS.md — OpenMux Developer Guide

This file provides guidance for AI coding agents working in this repository.

---

## 1. Build, Lint & Test Commands

### Setup

```bash
npm install              # Install all dependencies
./setup.sh              # Run initial setup (if exists)
```

### Development (Three Terminals)

```bash
npm run dev:web         # Start web frontend (Vite + React) — port 5173
npm run dev:server      # Start API server (Express + TSX) — port 8000
npm run dev:sandbox     # Start sandbox service — port 8080

# Or run all at once:
npm run dev
```

### Build

```bash
npm run build              # Build all workspaces
npm run build:web          # Build web only
npm run build:server       # Build server only
npm run build:sandbox      # Build sandbox only
```

### Docker (Recommended for Full System)

```bash
npm run docker:build       # Build Docker images
npm run docker             # Start all services
npm run docker:down        # Stop containers
```

### Linting & Formatting

```bash
npm run lint               # ESLint on all .ts/.tsx files
npm run format             # Prettier format all files
```

### Testing

```bash
# Run all tests
npm test

# Run tests for specific workspace
npm run test --workspace=server
npm run test --workspace=sandbox

# Note: Web workspace has no test script configured
# To run a single test file, use the test runner directly:
cd server && npx vitest run src/specific.test.ts
# Or with mocha/jest if configured:
npm test -- --testPathPattern="SessionService"
```

---

## 2. Code Style Guidelines

### Language

- **TypeScript** across all workspaces (`web/`, `server/`, `sandbox/`)
- Strict mode enabled in `tsconfig.json` for server and sandbox

### Imports & Organization

- Use explicit relative imports (e.g., `import { XRequest } from '../utils/XRequest'`)
- Group imports: external → internal → types
- Use path aliases defined in tsconfig (e.g., `@openmux/...` for workspace packages)

```typescript
// ✅ Good
import { Router, Request, Response } from "express";
import { sessionService } from "../services/SessionService";
import { AIService, AIMessage } from "../services/AIService";
import type { AgentSession } from "../types";

// ❌ Avoid
import * as Express from "express";
import "../services/SessionService"; // side effects only
```

### Naming Conventions

- **Files**: kebab-case (`session-controller.ts`, `x-request.ts`)
- **Classes/P Types**: PascalCase (`class SessionService`, `interface AIRequest`)
- **Functions/Variables**: camelCase (`createSession()`, `getAllSessions()`)
- **Constants**: UPPER_SNAKE_CASE for compile-time constants, camelCase for runtime

### TypeScript Guidelines

- Use explicit return types for public API functions
- Prefer interfaces over types for object shapes
- Use `any` sparingly — prefer `unknown` and type guards

```typescript
// ✅ Good
export async function createSession(): Promise<AgentSession> {
  // ...
}

// ⚠️ Acceptable for internal functions
function helper(data: unknown): boolean {
  if (typeof data === "string") return data.length > 0;
  return false;
}
```

### Error Handling

- Always wrap async controller logic in try/catch
- Return proper HTTP status codes (400 for bad input, 404 for not found, 500 for server errors)
- Log errors with contextual information

```typescript
// ✅ Good (Express)
router.post("/create", async (req: Request, res: Response) => {
  try {
    const session = await sessionService.createSession();
    res.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: "Failed to create session" });
  }
});

// ❌ Avoid
router.post("/create", async (req, res) => {
  const session = await sessionService.createSession(); // no try/catch
  res.json(session);
});
```

### Formatting

- Use **2 spaces** for indentation
- Use **single quotes** for strings in TypeScript
- Use **trailing commas** in multi-line objects/arrays
- Maximum line length: 100 characters (soft limit)

```typescript
// ✅ Good
const config = {
  provider: "opencode",
  apiKey: "secret",
  defaultModel: "claude-sonnet-4-5",
};

const url = "http://localhost:" + port + "/api/health";

// ❌ Avoid
const config = { provider: "opencode", apiKey: "secret" };
```

### React/Frontend Patterns

- Use functional components with hooks
- Name components descriptively (`ChatInterface.tsx`, `VNCViewer.tsx`)
- Co-locate styles with components (e.g., `ChatInterface.css` alongside `ChatInterface.tsx`)
- Use Zustand for global state (see `web/src/store/sessionStore.ts`)

```typescript
// ✅ Good
export default function ChatInterface({
  onSendMessage,
  isLoading,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  // ...
}
```

---

## 3. Project Structure

```
/workspaces/OpenMux
├── web/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── store/        # Zustand state
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
├── server/               # Express API server
│     │   ├── ├── src/
│ controllers/ # Route handlers
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Utilities
│   │   ├── types/        # TypeScript types
│   │   └── index.ts      # Entry point
│   └── package.json
│
├── sandbox/              # Tool execution environment
│   ├── src/
│   │   ├── tools/        # Tool implementations
│   │   ├── services/     # Service integrations
│   │   └── index.ts      # Entry point
│   └── package.json
│
├── docker/               # Docker configs
├── docker-compose.yml    # Full system orchestration
├── package.json          # Root workspace config
└── README.md             # Project overview
```

---

## 4. Adding New Tools

1. Create tool class in `sandbox/src/tools/` implementing the `Tool` interface
2. Register in `sandbox/src/index.ts` with `toolRegistry.register()`
3. Add API route if needed
4. Update documentation

Example structure:

```typescript
// sandbox/src/tools/MyTool.ts
import { Tool } from "./ToolRegistry";

export class MyTool implements Tool {
  name = "mytool";
  description = "Description of what it does";

  listActions(): string[] {
    return ["action1", "action2"];
  }

  async execute(action: string, params: any): Promise<any> {
    switch (action) {
      case "action1":
        return this.action1(params);
      default:
        throw new Error(`Action "${action}" not supported`);
    }
  }

  private async action1(params: any): Promise<any> {
    // implementation
  }
}
```

---

## 5. Security Guidelines

- **Never** bypass sandbox isolation
- Validate all inputs at the server boundary
- Use environment variables for secrets (`.env` files)
- Don't commit secrets to git
- When spawning Docker containers, use random ports and proper resource limits

---

## 6. Key Files Reference

| File                                          | Purpose                       |
| --------------------------------------------- | ----------------------------- |
| `server/src/index.ts`                         | Express app setup & routing   |
| `server/src/controllers/SessionController.ts` | Session CRUD operations       |
| `sandbox/src/tools/ToolRegistry.ts`           | Tool registration & execution |
| `sandbox/src/services/E2BDesktopService.ts`   | E2B desktop sandbox           |
| `sandbox/src/services/AIService.ts`           | AI provider integration       |
| `web/src/store/sessionStore.ts`               | Frontend state                |
| `docker-compose.yml`                          | Full system config            |

---

## 7. Ports & Environment

| Service     | Port | Env Variable       |
| ----------- | ---- | ------------------ |
| Web         | 5173 | —                  |
| Server      | 8000 | `PORT`             |
| Sandbox API | 8080 | `SANDBOX_API_PORT` |
| VNC         | 5900 | `SANDBOX_VNC_PORT` |
| Chrome CDP  | 9222 | `SANDBOX_CDP_PORT` |

Key env vars (see `server/.env.example`):

- `AI_PROVIDER` — `minimax`, `glm`, `kimi`, `openai`, `anthropic`, `opencode`
- `AI_API_KEY` — API key for AI service
- `AI_DEFAULT_MODEL` — Default model ID
- `E2B_API_KEY` — E2B desktop sandbox key

---

## 8. Testing Framework Notes

- Server uses **tsx** for TypeScript execution in dev
- No formal test framework configured yet (Vitest/Jest can be added)
- For now, test manually via API endpoints or use `tsx` to run test files directly

---

_Last updated: 2026-02-17_
