# OpenMux Development Guide

This guide will help you set up and develop OpenMux locally.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Debugging](#debugging)
- [Contributing](#contributing)

## Prerequisites

Before starting, ensure you have the following installed:

### Required
- **Node.js**: v20.0.0 or higher
- **npm**: v10.0.0 or higher
- **Git**: v2.40.0 or higher

### Optional (for Docker development)
- **Docker**: v24.0.0 or higher
- **Docker Compose**: v2.20.0 or higher

### Verify Installation

```bash
node --version    # Should be v20+
npm --version     # Should be v10+
git --version     # Should be v2.40+
docker --version  # Optional, should be v24+
```

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/osamabinlikhon/OpenMux.git
cd OpenMux
```

### 2. Run Installation Script

```bash
chmod +x scripts/install.sh
./scripts/install.sh
```

This script will:
- Check all prerequisites
- Create `.env` file from `.env.example`
- Install all npm dependencies
- Build TypeScript code

### 3. Manual Setup (if needed)

```bash
# Install root dependencies
npm install

# Install workspace dependencies
npm install --workspaces

# Build all workspaces
npm run build --workspaces
```

## Development Workflow

### Option 1: Local Development (Recommended for development)

Start all services with hot reload:

```bash
./scripts/dev.sh
```

This will start:
- Web Frontend (http://localhost:5173)
- Server API (http://localhost:8000)
- Sandbox (http://localhost:8080)

Or start each service individually:

```bash
# Terminal 1: Web Frontend with hot reload
npm run web

# Terminal 2: Server API with hot reload
npm run server

# Terminal 3: Sandbox with hot reload
npm run sandbox
```

### Option 2: Docker Development

```bash
./scripts/docker.sh
```

This uses Docker Compose to run all services in containers.

### Option 3: Hybrid (Local Web + Docker Services)

```bash
docker-compose up sandbox server
npm run web
```

## File Structure for Development

```
OpenMux/
├── web/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── store/        # Zustand stores
│   │   ├── types/        # TypeScript types
│   │   ├── styles/       # CSS files
│   │   └── App.tsx       # Main component
│   ├── index.html        # HTML entry point
│   ├── vite.config.ts    # Vite configuration
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── services/     # Business logic
│   │   ├── types/        # TypeScript types
│   │   └── index.ts      # Entry point
│   ├── tsconfig.json
│   └── package.json
│
├── sandbox/
│   ├── src/
│   │   ├── tools/        # Tool implementations
│   │   │   ├── ToolRegistry.ts
│   │   │   ├── BrowserTool.ts
│   │   │   ├── ShellTool.ts
│   │   │   └── FileTool.ts
│   │   └── index.ts      # Entry point
│   ├── tsconfig.json
│   └── package.json
```

## Development Patterns

### Adding a New API Endpoint

1. Create controller in `server/src/controllers/`:

```typescript
// server/src/controllers/MyController.ts
import { Router, Request, Response } from 'express';

export const createMyRouter = () => {
  const router = Router();

  router.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Hello from my controller' });
  });

  return router;
};
```

2. Register in `server/src/index.ts`:

```typescript
import { createMyRouter } from './controllers/MyController';

app.use('/api/my', createMyRouter());
```

### Adding a New Tool

1. Create tool class in `sandbox/src/tools/`:

```typescript
// sandbox/src/tools/MyTool.ts
import { Tool } from './ToolRegistry';

export class MyTool implements Tool {
  name = 'mytool';
  description = 'Description of my tool';

  listActions(): string[] {
    return ['action1', 'action2'];
  }

  async execute(action: string, params: any): Promise<any> {
    switch (action) {
      case 'action1':
        return this.action1(params);
      case 'action2':
        return this.action2(params);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async action1(params: any): Promise<any> {
    // Implementation
    return { success: true };
  }

  private async action2(params: any): Promise<any> {
    // Implementation
    return { success: true };
  }
}
```

2. Register in `sandbox/src/index.ts`:

```typescript
import { MyTool } from './tools/MyTool';

const toolRegistry = new ToolRegistry();
toolRegistry.register('mytool', new MyTool());
```

### Adding a New React Component

1. Create component in `web/src/components/`:

```typescript
// web/src/components/MyComponent.tsx
import React, { FC } from 'react';

interface MyComponentProps {
  title: string;
}

const MyComponent: FC<MyComponentProps> = ({ title }) => {
  return <div className="my-component">{title}</div>;
};

export default MyComponent;
```

2. Create stylesheet:

```css
/* web/src/components/MyComponent.css */
.my-component {
  padding: 16px;
  border: 1px solid #ddd;
}
```

3. Use in App.tsx:

```typescript
import MyComponent from './components/MyComponent';

// In App component
<MyComponent title="Hello World" />
```

## Testing

### Run Tests

```bash
# All tests
npm test --workspaces

# Specific workspace
npm test --workspace=web
npm test --workspace=server
npm test --workspace=sandbox
```

### Write Tests

Create test files next to implementation:

```typescript
// sandbox/src/tools/MyTool.test.ts
import { describe, it, expect } from 'vitest';
import { MyTool } from './MyTool';

describe('MyTool', () => {
  it('should execute action1', async () => {
    const tool = new MyTool();
    const result = await tool.execute('action1', {});
    expect(result.success).toBe(true);
  });
});
```

## Debugging

### Debug Server

```bash
NODE_DEBUG=* npm run server
```

### Debug with VS Code

1. Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Server",
      "program": "${workspaceFolder}/server/dist/index.js",
      "preLaunchTask": "build:server",
      "outFiles": ["${workspaceFolder}/server/dist/**/*.js"]
    }
  ]
}
```

2. Set breakpoints and press F5 to debug

### Browser DevTools

1. Open http://localhost:5173
2. Press F12 to open developer tools
3. Use Console, Network, and Elements tabs

## Common Tasks

### Install New Dependency

```bash
# To root workspace
npm install <package>

# To specific workspace
npm install <package> --workspace=web
npm install <package> --workspace=server
npm install <package> --workspace=sandbox

# As dev dependency
npm install -D <package> --workspace=web
```

### Build for Production

```bash
npm run build --workspaces
docker-compose build
```

### Clean Build

```bash
# Remove all node_modules and build outputs
rm -rf node_modules
find . -type d -name "dist" -exec rm -rf {} +
find . -type d -name "node_modules" -exec rm -rf {} +

# Reinstall
npm install --workspaces
npm run build --workspaces
```

### Update Dependencies

```bash
# Check for updates
npm outdated --workspaces

# Update packages
npm update --workspaces

# Update to latest major versions
npm upgrade --workspaces
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :8000  # Check port 8000

# Kill process
kill -9 <PID>
```

### Docker Issues

```bash
# Remove all containers
docker-compose down

# Rebuild images
docker-compose build --no-cache

# Check logs
docker-compose logs -f service_name
```

### Permission Issues

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Fix Node modules permissions
sudo chown -R $USER node_modules/
```

## Environment Variables

Create `.env` file in project root:

```bash
# Server
PORT=8000
NODE_ENV=development

# Sandbox
SANDBOX_API_PORT=8080
SANDBOX_VNC_PORT=5900
SANDBOX_CDP_PORT=9222

# Frontend
VITE_API_URL=http://localhost:8000

# Debug
DEBUG=openmux:*
```

## Performance Tips

1. **Use npm workspaces** for faster builds
2. **Enable TypeScript incremental compilation**
3. **Use file watchers** for hot reload during development
4. **Cache Docker layers** by ordering Dockerfile commands

## Code Style

### TypeScript

- Use `export` instead of `module.exports`
- Use `interface` for object types
- Use `type` for unions and primitives
- Always specify return types for functions

### React

- Use functional components with hooks
- Use TypeScript for prop types
- Keep components focused and small
- Extract reusable logic to custom hooks

### Express

- Use controller pattern for routes
- Use service pattern for business logic
- Always handle errors with try-catch
- Use middleware for cross-cutting concerns

## Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Docker Documentation](https://docs.docker.com/)

## Getting Help

1. Check existing issues on GitHub
2. Review API documentation at http://localhost:8000
3. Check error logs in console/terminal
4. Open a new issue with detailed information

---

Happy coding! 🚀
