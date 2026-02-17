#!/bin/bash

# OpenMux Development Setup Script
# This script starts all OpenMux services in development mode

set -e

echo "🚀 OpenMux Development Environment Setup"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
echo -e "${BLUE}Checking Docker...${NC}"
if ! docker ps > /dev/null 2>&1; then
    echo -e "${YELLOW}Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"
echo ""

# Install dependencies if needed
echo -e "${BLUE}Installing dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    npm install
fi

# Check and copy env files
echo -e "${BLUE}Setting up environment files...${NC}"
if [ ! -f "server/.env" ]; then
    cp server/.env.example server/.env
    echo -e "${GREEN}✓ Created server/.env${NC}"
fi

echo ""
echo -e "${BLUE}Available commands:${NC}"
echo "  npm run web          - Start web frontend only"
echo "  npm run server       - Start server API only"
echo "  npm run sandbox      - Start sandbox only"
echo "  docker:build         - Build Docker images"
echo "  npm run docker       - Start all services with Docker"
echo ""

echo -e "${BLUE}Services will be available at:${NC}"
echo "  Web Frontend:  http://localhost:5173"
echo "  Server API:    http://localhost:8000"
echo "  Sandbox API:   http://localhost:8080"
echo "  VNC (Browser): localhost:5900"
echo "  Chrome CDP:    localhost:9222"
echo ""

echo -e "${YELLOW}Tip: First run 'npm install' to install dependencies for all workspaces${NC}"
echo ""

echo -e "${GREEN}Setup complete!${NC}"
