#!/bin/bash

# OpenMux Docker Startup Script
# This script starts all services using Docker Compose

set -e

echo "🚀 Starting OpenMux with Docker Compose..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}ℹ️  .env file not found, creating from .env.example${NC}"
    cp .env.example .env
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose --help &> /dev/null 2>&1; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi

# Get the compose command
if docker compose --help &> /dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

echo -e "${BLUE}Using: $COMPOSE_CMD${NC}"

# Check Docker daemon
echo -e "${BLUE}🐳 Checking Docker daemon...${NC}"
if ! docker ps > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker daemon is not running${NC}"
    exit 1
fi

# Build images
echo -e "${BLUE}🔨 Building Docker images...${NC}"
$COMPOSE_CMD build

# Start services
echo -e "${GREEN}✅ Starting services with Docker Compose...${NC}"
$COMPOSE_CMD up

# On Ctrl+C
trap "$COMPOSE_CMD down; exit" INT TERM

echo ""
echo -e "${GREEN}✅ All services are running!${NC}"
echo ""
echo -e "${BLUE}Web Frontend:${NC} http://localhost:5173"
echo -e "${BLUE}Server API:${NC} http://localhost:8000"
echo -e "${BLUE}Sandbox API:${NC} http://localhost:8080 (containerized)"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
