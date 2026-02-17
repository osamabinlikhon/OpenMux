#!/bin/bash

# OpenMux Development Startup Script
# This script starts all services in development mode with hot reload

set -e

echo "🚀 Starting OpenMux Development Environment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists, if not create from example
if [ ! -f .env ]; then
    echo -e "${YELLOW}ℹ️  .env file not found, creating from .env.example${NC}"
    cp .env.example .env
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing root dependencies...${NC}"
    npm install
fi

echo -e "${BLUE}📦 Installing workspace dependencies...${NC}"
npm install --workspaces

# Check Docker
echo -e "${BLUE}🐳 Checking Docker daemon...${NC}"
if ! docker ps > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker daemon is not running. Starting...${NC}"
    sudo systemctl start docker || echo -e "${YELLOW}⚠️  Could not start Docker${NC}"
fi

# Build sandbox image
echo -e "${BLUE}🔨 Building sandbox Docker image...${NC}"
docker build -f docker/Dockerfile.sandbox -t openmux-sandbox:latest .

# Start services
echo -e "${GREEN}✅ Starting services...${NC}"
echo ""
echo -e "${BLUE}Web Frontend:${NC} http://localhost:5173"
echo -e "${BLUE}Server API:${NC} http://localhost:8000"
echo -e "${BLUE}Sandbox API:${NC} http://localhost:8080"
echo ""

# Start in tmux if available, otherwise use screen
if command -v tmux &> /dev/null; then
    echo -e "${BLUE}Starting services in tmux...${NC}"
    
    tmux new-session -d -s openmux
    
    tmux send-keys -t openmux "echo 'Starting Web Frontend...' && npm run web" Enter
    sleep 2
    
    tmux new-window -t openmux
    tmux send-keys -t openmux "echo 'Starting Server...' && npm run server" Enter
    sleep 2
    
    tmux new-window -t openmux
    tmux send-keys -t openmux "echo 'Starting Sandbox...' && npm run sandbox" Enter
    
    echo -e "${GREEN}✅ Services started in tmux session 'openmux'${NC}"
    echo -e "${YELLOW}📌 Attach to tmux session:${NC} tmux attach -t openmux"
    echo -e "${YELLOW}📌 List windows:${NC} tmux list-windows -t openmux"
    echo -e "${YELLOW}📌 Kill session:${NC} tmux kill-session -t openmux"
    
else
    echo -e "${BLUE}Starting services with npm...${NC}"
    
    # Start services in background
    npm run web &
    WEB_PID=$!
    
    npm run server &
    SERVER_PID=$!
    
    npm run sandbox &
    SANDBOX_PID=$!
    
    echo -e "${GREEN}✅ Services started${NC}"
    echo -e "${YELLOW}📌 Web PID: $WEB_PID${NC}"
    echo -e "${YELLOW}📌 Server PID: $SERVER_PID${NC}"
    echo -e "${YELLOW}📌 Sandbox PID: $SANDBOX_PID${NC}"
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
    
    # Wait for Ctrl+C
    trap "kill $WEB_PID $SERVER_PID $SANDBOX_PID; exit" INT
    wait
fi
