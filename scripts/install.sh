#!/bin/bash

# OpenMux Installation Script
# This script sets up the development environment

set -e

echo "🔧 OpenMux Installation Setup"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Requirements check
echo -e "${BLUE}📋 Checking requirements...${NC}"

REQUIREMENTS_MET=true

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js${NC} $NODE_VERSION"
else
    echo -e "${RED}❌ Node.js is not installed${NC}"
    REQUIREMENTS_MET=false
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✅ npm${NC} $NPM_VERSION"
else
    echo -e "${RED}❌ npm is not installed${NC}"
    REQUIREMENTS_MET=false
fi

# Check Git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    echo -e "${GREEN}✅ Git${NC} $GIT_VERSION"
else
    echo -e "${RED}❌ Git is not installed${NC}"
    REQUIREMENTS_MET=false
fi

# Check Docker (optional for development)
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}✅ Docker${NC} $DOCKER_VERSION"
else
    echo -e "${YELLOW}⚠️  Docker is not installed (optional for development)${NC}"
fi

echo ""

if [ "$REQUIREMENTS_MET" = false ]; then
    echo -e "${RED}❌ Please install missing requirements${NC}"
    exit 1
fi

# Create .env file
if [ ! -f .env ]; then
    echo -e "${BLUE}📝 Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
else
    echo -e "${YELLOW}ℹ️  .env file already exists${NC}"
fi

# Make scripts executable
echo -e "${BLUE}🔐 Making scripts executable...${NC}"
chmod +x scripts/*.sh
echo -e "${GREEN}✅ Scripts are executable${NC}"

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install --workspaces
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Build TypeScript
echo -e "${BLUE}🔨 Building TypeScript...${NC}"
npm run build --workspaces
echo -e "${GREEN}✅ Build complete${NC}"

echo ""
echo -e "${GREEN}✅ Installation Complete!${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Copy .env.example to .env and configure if needed"
echo "2. Start development environment:"
echo "   - Without Docker: ./scripts/dev.sh"
echo "   - With Docker: ./scripts/docker.sh"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "- Web Frontend: http://localhost:5173"
echo "- Server API: http://localhost:8000"
echo "- API Docs: http://localhost:8000/api/health"
