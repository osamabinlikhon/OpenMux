# Getting Started with OpenMux

Welcome to OpenMux! Here's the quickest way to get up and running.

## 🚀 5-Minute Quick Start

### Prerequisites

Before you start, make sure you have:
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Docker** & **Docker Compose** ([Download](https://www.docker.com/products/docker-desktop/))
- **Git** ([Download](https://git-scm.com/))

### Installation Steps

```bash
# 1. Clone the repository
git clone <repo-url>
cd OpenMux

# 2. Install dependencies (this installs for all 3 services)
npm install

# 3. Start all services with Docker
npm run docker
```

That's it! Your services will be running in about 30-60 seconds.

## 📍 What's Running?

Once started, you'll have:

| Service | URL | Purpose |
|---------|-----|---------|
| **Web UI** | http://localhost:5173 | Chat with the AI |
| **Server API** | http://localhost:8000 | Backend API |
| **Sandbox API** | http://localhost:8080 | Tool execution |

Open http://localhost:5173 in your browser and start chatting! 🎉

## 🔧 Local Development (No Docker)

If you prefer to run services locally:

```bash
# Terminal 1: Start the web frontend
npm run web
# → Open http://localhost:5173

# Terminal 2: Start the server API
npm run server
# → Runs on http://localhost:8000

# Terminal 3: Start the sandbox
npm run sandbox
# → Runs on http://localhost:8080
```

## 📝 Basic Usage

1. **Open** http://localhost:5173
2. **Click** the chat input field
3. **Type** a message, e.g., "Hello! What can you do?"
4. **Hit** Enter or click Send
5. **See** the AI respond and execute tools

## 🛠️ Common Commands

```bash
# Install/update dependencies
npm install

# Start all services with Docker
npm run docker

# Stop Docker services
npm run docker:down

# Build production bundles
npm run build

# View logs
docker-compose logs -f
```

## 📚 Want to Learn More?

- **Architecture Overview**: See [README.md](./README.md)
- **Development Guide**: See [DEVELOPER.md](./DEVELOPER.md)  
- **API Documentation**: Start the server and visit http://localhost:8000
- **Ubuntu Guide**: See [UBUNTU_SETUP_GUIDE.md](./UBUNTU_SETUP_GUIDE.md)

## 🐛 Troubleshooting

### "Port 5173 already in use"
```bash
# Find and kill the process
lsof -i :5173
kill -9 <PID>
```

### "Docker socket permission denied"
```bash
# Add your user to the docker group
sudo usermod -aG docker $USER
# Log out and back in for changes to take effect
```

### "npm install fails"
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### "Container won't start"
```bash
# Check Docker is running and rebuild
docker-compose down
npm run docker:build
npm run docker
```

## 💡 Tips

- **First run slow?** Docker needs to pull and build images (~5-10 min)
- **Port conflicts?** Change ports in `docker-compose.yml`
- **Want to contribute?** Check out [DEVELOPER.md](./DEVELOPER.md) for guidelines
- **Questions?** Open an issue or check documentation

## 🎯 Next Steps

1. **Explore the UI**: Try the Chat, Browser, and Tools tabs
2. **Test tools**: Try file operations or shell commands
3. **Read code**: Check out the architecture in [README.md](./README.md)
4. **Build features**: Follow [DEVELOPER.md](./DEVELOPER.md) to add features

---

**Enjoy OpenMux!** 🤖✨

For detailed help, see the [complete documentation](./README.md).
