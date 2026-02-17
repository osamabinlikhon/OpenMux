# OpenMux

> **The AI that actually does things** - A general-purpose AI Agent system that supports running various tools and operations in a sandbox environment.

## 🎯 Overview

OpenMux is a sophisticated AI Agent system designed to execute complex tasks autonomously. It combines:

- **Web Frontend** - Interactive chat interface with browser and tools view
- **Server API** - Orchestrates sandboxes and manages sessions
- **Sandbox Environment** - Ubuntu Docker container with Chrome, VNC, and tool APIs
- **Tool Suite** - File operations, shell commands, browser automation, and more

### Key Features

✨ **Multi-tab Interface**
- 💬 Chat with the AI agent
- 🌐 Browser automation via VNC
- 🛠️ Direct tool execution panel

🐳 **Docker-based Sandboxes**
- Isolated execution environments
- Dynamic port allocation
- Automatic cleanup

🔧 **Rich Tool Set**
- File system operations (read, write, delete, list)
- Shell command execution
- Browser automation with Puppeteer
- VNC for desktop viewing
- Chrome DevTools Protocol

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Web Frontend (5173)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Chat Tab     │  │ Browser Tab  │  │ Tools Tab    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
                 ┌───────▼────────┐
                 │ Server API     │
                 │ (Port 8000)    │
                 │                │
                 │ - Session Mgmt │
                 │ - Docker API   │
                 │ - Message Flow │
                 └───────┬────────┘
                         │
      ┌──────────────────┼──────────────────┐
      │                  │                  │
  ┌───▼──┐          ┌───▼──┐          ┌───▼──┐
  │Sandbox│         │Sandbox│         │Sandbox│
  │  #1   │         │  #2   │         │  #3   │
  │       │         │       │         │       │
  │ Ubuntu│         │ Ubuntu│         │ Ubuntu│
  │Docker │         │Docker │         │Docker │
  └───────┘         └───────┘         └───────┘
```

### Port Map

| Service | Port | Purpose |
|---------|------|---------|
| Web Frontend | 5173 | React UI (Vite dev server) |
| Server API | 8000 | Main API service |
| Sandbox API | 8080 | Tool execution & operations |
| VNC Server | 5900 | Desktop visualization |
| Chrome CDP | 9222 | Chrome automation |

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- Docker & Docker Compose
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repo-url>
cd OpenMux
```

2. **Run setup script**
```bash
chmod +x setup.sh
./setup.sh
```

3. **Install dependencies**
```bash
npm install
```

4. **Start services**

**Option A: Docker (Recommended)**
```bash
npm run docker
```

**Option B: Local development**
```bash
# Terminal 1: Web frontend
npm run web

# Terminal 2: Server API
npm run server

# Terminal 3: Sandbox
npm run sandbox
```

5. **Access the application**
- Web UI: http://localhost:5173
- API Docs: http://localhost:8000

## 📁 Project Structure

```
OpenMux/
├── web/                          # React frontend
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── VNCViewer.tsx
│   │   │   └── ToolsPanel.tsx
│   │   ├── store/              # Zustand state management
│   │   └── App.tsx
│   ├── vite.config.ts
│   └── package.json
├── server/                       # Express API server
│   ├── src/
│   │   └── index.ts            # Main server
│   ├── tsconfig.json
│   └── package.json
├── sandbox/                      # Tool execution environment
│   ├── src/
│   │   ├── index.ts            # Sandbox API
│   │   └── tools/
│   │       ├── ToolRegistry.ts
│   │       ├── BrowserTool.ts
│   │       ├── ShellTool.ts
│   │       └── FileTool.ts
│   └── package.json
├── docker/                       # Docker configurations
│   ├── Dockerfile.web
│   ├── Dockerfile.server
│   └── Dockerfile.sandbox
├── docker-compose.yml           # Orchestration
├── package.json                 # Monorepo root
└── setup.sh                     # Setup script
```

## 🔧 API Documentation

### Session Management

**Create Session**
```bash
POST /api/sessions/create
```
Returns: `{ sessionId, status }`

**Send Message**
```bash
POST /api/sessions/:sessionId/message
Body: { message: "your message" }
```
Returns: `{ response, events }`

**Get Session**
```bash
GET /api/sessions/:sessionId
```

**Terminate Session**
```bash
DELETE /api/sessions/:sessionId
```

### Tools API

**List Tools**
```bash
GET /tools
```

**Execute Tool**
```bash
POST /tools/:toolName/:action
Body: { params: {...} }
```

**Example: File Operations**
```bash
POST /tools/file/read
Body: { params: { path: "/path/to/file" } }
```

**Example: Shell Commands**
```bash
POST /tools/shell/execute
Body: { params: { command: "ls -la" } }
```

## 🛠️ Development

### Adding a New Tool

1. Create a new tool class in `sandbox/src/tools/`
```typescript
import { Tool } from './ToolRegistry';

export class MyTool implements Tool {
  name = 'mytool';
  description = 'My tool description';

  listActions(): string[] {
    return ['action1', 'action2'];
  }

  async execute(action: string, params: any): Promise<any> {
    // Implementation
  }
}
```

2. Register it in `sandbox/src/index.ts`
```typescript
toolRegistry.register('mytool', new MyTool());
```

### Running Tests

```bash
# Web tests
npm run test --workspace=web

# Server tests  
npm run test --workspace=server

# Sandbox tests
npm run test --workspace=sandbox
```

### Building for Production

```bash
npm run build
npm run docker:build
```

## 📊 Features by Service

### Web Frontend
- React 18 with TypeScript
- Zustand state management
- Responsive dark theme UI
- Real-time message streaming (SSE ready)
- Tab-based interface

### Server API
- Express.js server
- Docker integration via Dockerode
- Session management
- Dynamic Docker container spawning
- Message routing to sandboxes

### Sandbox Environment
- Ubuntu 24.04 base
- Node.js runtime
- Puppeteer for browser automation
- VNC server for desktop access
- Tool execution engine

## 🔐 Security Considerations

- Sandboxes are isolated Docker containers
- Network-level port allocation prevents conflicts
- Tool execution is restricted to sandbox directories
- Environment variables are isolated per session

## 📝 Configuration

### Server Configuration (server/.env)

```env
PORT=8000
NODE_ENV=development
DOCKER_HOST=unix:///var/run/docker.sock
SANDBOX_API_PORT=8080
SANDBOX_VNC_PORT=5900
SANDBOX_CDP_PORT=9222
```

### Docker Environment Variables

See `docker-compose.yml` for all available variables.

## 🐛 Troubleshooting

### Docker socket not accessible
```bash
# On Linux, ensure user is in docker group
sudo usermod -aG docker $USER
```

### Port already in use
```bash
# Find and kill process on port
lsof -i :8000
kill -9 <PID>
```

### Node modules issues
```bash
# Clean install
rm -rf node_modules
npm install
```

## 📚 Learning Resources

- [Vite Documentation](https://vitejs.dev/)
- [Express.js Guide](https://expressjs.com/)
- [Docker Documentation](https://docs.docker.com/)
- [Puppeteer API](https://pptr.dev/)

## 📄 Documentation

- [Ubuntu Setup Guide](UBUNTU_SETUP_GUIDE.md) - Guide for running Ubuntu in Termux on Android

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review API examples

---

**Built with ❤️ by the OpenMux team**
