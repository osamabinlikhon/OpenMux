# OpenMux Development Guide

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- Docker >= 20.10
- Docker Compose >= 2.0
- Git

### Quick Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd OpenMux

# 2. Run setup script
chmod +x setup.sh
./setup.sh

# 3. Install all dependencies
npm install

# 4. Start development servers
npm run docker
```

## Development Workflow

### Local Development (Without Docker)

**Terminal 1 - Web Frontend:**
```bash
npm run web
```
Runs on http://localhost:5173

**Terminal 2 - Server API:**
```bash
npm run server
```
Runs on http://localhost:8000

**Terminal 3 - Sandbox:**
```bash
npm run sandbox
```
Runs on http://localhost:8080

### Docker Development

```bash
# Build all services
npm run docker:build

# Start all services
npm run docker

# Stop all services
npm run docker:down
```

## Project Structure

### Web (`/web`)

React + TypeScript + Vite frontend

**Key Files:**
- `src/App.tsx` - Main App component
- `src/components/` - React components
- `src/store/sessionStore.ts` - Zustand store
- `vite.config.ts` - Vite configuration

**Commands:**
```bash
npm run web        # Dev server
npm run build      # Production build
npm run preview    # Preview production build
```

### Server (`/server`)

Express API server

**Key Files:**
- `src/index.ts` - Main server file
- Express routes for session management

**Commands:**
```bash
npm run server     # Dev server with hot reload
npm run build      # TypeScript compilation
npm start          # Production server
```

### Sandbox (`/sandbox`)

Tool execution environment

**Key Files:**
- `src/index.ts` - Sandbox API
- `src/tools/ToolRegistry.ts` - Tool management
- `src/tools/*.ts` - Individual tools

**Tools:**
- `BrowserTool` - Puppeteer-based browser automation
- `ShellTool` - Shell command execution
- `FileTool` - File system operations

**Commands:**
```bash
npm run sandbox    # Dev server
npm run build      # TypeScript compilation
npm start          # Production server
```

## Adding Features

### Adding a New API Endpoint

1. Edit `server/src/index.ts`

```typescript
app.post('/api/my-endpoint', (req: Request, res: Response) => {
  // Implementation
  res.json({ result: 'success' });
});
```

### Adding a New React Component

1. Create `web/src/components/MyComponent.tsx`

```typescript
import React from 'react';
import './MyComponent.css';

export default function MyComponent() {
  return <div>My Component</div>;
}
```

2. Import and use in `web/src/App.tsx`

### Adding a New Tool

1. Create `sandbox/src/tools/MyTool.ts`

```typescript
import { Tool } from './ToolRegistry';

export class MyTool implements Tool {
  name = 'mytool';
  description = 'My custom tool';

  listActions(): string[] {
    return ['action1'];
  }

  async execute(action: string, params: any): Promise<any> {
    // Implementation
    return { success: true };
  }
}
```

2. Register in `sandbox/src/index.ts`

```typescript
toolRegistry.register('mytool', new MyTool());
```

## Testing

### Running Tests

```bash
# All tests
npm test

# Specific workspace
npm test --workspace=web
npm test --workspace=server
npm test --workspace=sandbox

# Watch mode
npm test -- --watch
```

## Building for Production

### Build All Services

```bash
npm run build
```

### Build Docker Images

```bash
npm run docker:build
```

### Production Deployment

```bash
# Update environment variables
cp server/.env.example server/.env
# Edit server/.env with production values

# Build
npm run docker:build

# Deploy
docker-compose -f docker-compose.yml up -d
```

## Debugging

### Enable Debug Logging

**Server:**
```bash
DEBUG=* npm run server
```

**Sandbox:**
```bash
DEBUG=* npm run sandbox
```

### Browser DevTools

1. Open http://localhost:5173
2. Press F12 to open DevTools
3. Check Console, Network, etc.

### Docker Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f web
docker-compose logs -f server
docker-compose logs -f sandbox
```

## Performance Optimization

### Frontend
- Use React.memo for components
- Implement code splitting
- Optimize bundle size

### Backend
- Add caching for frequently accessed data
- Use connection pooling
- Implement rate limiting

### Sandbox
- Implement resource limits
- Clean up unused containers
- Monitor Docker disk usage

## Common Issues

### "Port already in use"
```bash
# Find process using the port
lsof -i :5173

# Kill the process
kill -9 <PID>
```

### "Docker socket permission denied"
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Log out and back in
```

### "Out of memory"
```bash
# Increase Docker memory limit in Docker Desktop settings
# Or in docker daemon.json
```

## Code Style

### ESLint

```bash
npm run lint
```

### Prettier (Optional)

```bash
npm run format
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
git add .
git commit -m "feat: add my feature"

# Push and create PR
git push origin feature/my-feature
```

## Documentation

- API documentation: [API.md](./docs/API.md)
- Architecture: See README.md
- Ubuntu Setup: [UBUNTU_SETUP_GUIDE.md](./UBUNTU_SETUP_GUIDE.md)

## Resources

- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Vite Guide](https://vitejs.dev/)

## Support

- Check existing issues
- Review documentation
- Ask in discussions

---

Happy coding! 🚀
