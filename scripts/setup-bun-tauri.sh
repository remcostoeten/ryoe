#!/bin/bash

# Setup script for Bun + Tauri development environment
# This script ensures all dependencies are properly installed and configured

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Setting up Bun + Tauri development environment...${NC}"

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo -e "${RED}❌ Bun is not installed. Please install Bun first:${NC}"
    echo -e "${YELLOW}curl -fsSL https://bun.sh/install | bash${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Bun is installed: $(bun --version)${NC}"

# Check if Rust is installed
if ! command -v rustc &> /dev/null; then
    echo -e "${RED}❌ Rust is not installed. Please install Rust first:${NC}"
    echo -e "${YELLOW}curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Rust is installed: $(rustc --version)${NC}"

# Check if Tauri CLI is installed
if ! command -v tauri &> /dev/null; then
    echo -e "${YELLOW}⚠️  Tauri CLI not found. Installing...${NC}"
    bun add -D @tauri-apps/cli
fi

echo -e "${GREEN}✅ Tauri CLI is available${NC}"

# Install dependencies with Bun
echo -e "${BLUE}📦 Installing dependencies with Bun...${NC}"
bun install

# Build Rust dependencies
echo -e "${BLUE}🦀 Building Rust dependencies...${NC}"
cd src-tauri
cargo build
cd ..

# Verify TypeScript compilation
echo -e "${BLUE}🔍 Checking TypeScript compilation...${NC}"
bun run type-check

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${BLUE}🎯 Available commands:${NC}"
echo -e "${YELLOW}  bun run dev${NC}          - Start Vite dev server"
echo -e "${YELLOW}  bun run tauri:dev${NC}    - Start Tauri development"
echo -e "${YELLOW}  bun run build${NC}        - Build for production"
echo -e "${YELLOW}  bun run tauri:build${NC}  - Build Tauri app"
echo -e "${YELLOW}  bun run lint${NC}         - Run ESLint"
echo -e "${YELLOW}  bun run format${NC}       - Format code with Prettier"
echo ""
echo -e "${GREEN}🚀 Ready to start developing with Bun + Tauri!${NC}"
