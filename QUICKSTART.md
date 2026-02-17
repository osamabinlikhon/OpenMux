# OpenMux Quick Start Guide

Get OpenMux up and running in minutes!

## 🚀 5-Minute Setup

### 1. Clone and Install

```bash
git clone https://github.com/osamabinlikhon/OpenMux.git
cd OpenMux
chmod +x scripts/install.sh
./scripts/install.sh
```

### 2. Start Development (choose one)

**Option A: Local Development (recommended)**
```bash
chmod +x scripts/dev.sh
./scripts/dev.sh
```

**Option B: Docker**
```bash
chmod +x scripts/docker.sh
./scripts/docker.sh
```

### 3. Access the Application

Open your browser to:
- **Web UI**: http://localhost:5173
- **API Docs**: http://localhost:8000

## 📋 What's Included

| Service | Port | Purpose |
|---------|------|---------|
| Web Frontend | 5173 | React chat interface |
| Server API | 8000 | Session & container management |
| Sandbox API | 8080 | Tool execution |
| VNC Server | 5900 | Desktop display |
| Chrome CDP | 9222 | Browser automation |

## 🎯 First Steps

### Create Your First Session

1. Open http://localhost:5173
2. The app automatically creates a session on load
3. Type a message in the chat box
4. The AI agent processes your request

### Example Messages

- "Hello, what can you do?"
- "Show me available tools"
- "Create a file called test.txt"
- "Run ls -la command"

### Explore the Interface

**Chat Tab** 💬
- Send messages to the AI agent
- View responses and logs
- Clear chat history

**Browser Tab** 🌐
- View desktop environment
- Use keyboard and mouse
- Interact with applications

**Tools Tab** 🛠️
- View available tools
- Copy tool names
- See supported actions

## 🔧 Common Commands

```bash
# Start development server
./scripts/dev.sh

# Start with Docker
./scripts/docker.sh

# Install dependencies
npm install --workspaces

# Build all workspaces
npm run build --workspaces

# Run tests
npm test --workspaces

# Clean install
rm -rf node_modules && npm install --workspaces

# View server logs
docker-compose logs server

# Stop all services
docker-compose down
```

## 📚 Available Tools

### File Tool
- Read, write, delete, list files
- Check file existence

### Shell Tool  
- Execute shell commands
- Run bash/sh scripts

### Browser Tool
- Launch browser
- Navigate to URLs
- Take screenshots
- Click elements
- Type text

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process
lsof -i :8000

# Kill it
kill -9 <PID>
```

### Docker Issues

```bash
# Restart Docker
docker-compose restart

# Remove containers
docker-compose down
```

### Dependencies Issues

```bash
# Clean install
rm -rf node_modules
npm install --workspaces
```

## 📖 Full Documentation

- [README.md](README.md) - Project overview
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development guide
- [UBUNTU_SETUP_GUIDE.md](UBUNTU_SETUP_GUIDE.md) - Ubuntu on Android guide

## 🤝 Need Help?

1. Check the [DEVELOPMENT.md](DEVELOPMENT.md) guide
2. Review error messages in terminal
3. Check Docker logs: `docker-compose logs`
4. Open an issue on GitHub

## 🎓 Next Steps

After getting started:

1. **Explore the code**: Check `web/src`, `server/src`, `sandbox/src`
2. **Create a tool**: Add a custom tool to the sandbox
3. **Add features**: Extend the web interface
4. **Deploy**: Use Docker Compose for production

## 📌 Key Paths

- **Web Frontend**: `/web/src`
- **Server API**: `/server/src`
- **Sandbox Tools**: `/sandbox/src/tools`
- **Docker Config**: `/docker`
- **Scripts**: `/scripts`

## ⚡ Pro Tips

1. Use `npm run dev` in individual folders for isolated development
2. Set `DEBUG=openmux:*` environment variable for verbose logging
3. Use VS Code with TypeScript extension for better DX
4. Check browser DevTools for frontend debugging

---

Ready to build something amazing? Start coding! 🚀
