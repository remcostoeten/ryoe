#!/bin/bash

# Optimized development script for Bun + Tauri
# This script provides fast development startup with proper port management

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Development ports
VITE_PORT=1420
TAURI_PORTS=(1420 1421 1422)

echo -e "${PURPLE}🚀 Starting Bun + Tauri development environment...${NC}"

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti tcp:"$port" 2>/dev/null || echo "")
    
    if [[ -n "$pid" ]]; then
        echo -e "${YELLOW}⚠️  Port $port is in use by PID $pid. Killing process...${NC}"
        kill -9 $pid 2>/dev/null || true
        sleep 1
        echo -e "${GREEN}✅ Port $port is now free${NC}"
        return 0
    else
        echo -e "${GREEN}✅ Port $port is already free${NC}"
        return 1
    fi
}

# Function to check if Bun is installed
check_bun() {
    if ! command -v bun &> /dev/null; then
        echo -e "${RED}❌ Bun is not installed. Please install it first:${NC}"
        echo -e "${YELLOW}curl -fsSL https://bun.sh/install | bash${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Bun $(bun --version) is ready${NC}"
}

# Function to check if Tauri CLI is available
check_tauri() {
    if ! bun tauri --version &> /dev/null; then
        echo -e "${YELLOW}⚠️  Installing Tauri CLI...${NC}"
        bun add -D @tauri-apps/cli
    fi
    echo -e "${GREEN}✅ Tauri CLI is ready${NC}"
}

# Function to install dependencies if needed
check_dependencies() {
    if [[ ! -d "node_modules" ]] || [[ ! -f "bun.lockb" ]]; then
        echo -e "${BLUE}📦 Installing dependencies with Bun...${NC}"
        bun install
    else
        echo -e "${GREEN}✅ Dependencies are up to date${NC}"
    fi
}

# Function to build Rust dependencies if needed
check_rust_deps() {
    if [[ ! -d "src-tauri/target" ]]; then
        echo -e "${BLUE}🦀 Building Rust dependencies...${NC}"
        cd src-tauri
        cargo build
        cd ..
    else
        echo -e "${GREEN}✅ Rust dependencies are built${NC}"
    fi
}

# Main execution
main() {
    echo -e "${BLUE}🔍 Checking environment...${NC}"
    check_bun
    check_tauri
    check_dependencies
    check_rust_deps
    
    echo -e "${BLUE}🧹 Cleaning up ports...${NC}"
    # Clean up Vite port
    kill_port $VITE_PORT
    
    # Clean up Tauri ports
    for port in "${TAURI_PORTS[@]}"; do
        kill_port $port
    done
    
    echo -e "${BLUE}🎯 Starting development servers...${NC}"
    
    # Check if we should run Tauri or just Vite
    if [[ "$1" == "--web-only" ]]; then
        echo -e "${YELLOW}🌐 Starting web-only development (Vite only)...${NC}"
        bun run dev
    else
        echo -e "${YELLOW}🖥️  Starting Tauri development (Vite + Tauri)...${NC}"
        bun run tauri:dev
    fi
}

# Handle script arguments
case "$1" in
    --help|-h)
        echo -e "${BLUE}Bun + Tauri Development Script${NC}"
        echo ""
        echo -e "${YELLOW}Usage:${NC}"
        echo -e "  $0                Start full Tauri development"
        echo -e "  $0 --web-only     Start web-only development (Vite only)"
        echo -e "  $0 --help         Show this help message"
        echo ""
        echo -e "${YELLOW}Features:${NC}"
        echo -e "  • Automatic port cleanup"
        echo -e "  • Dependency checking"
        echo -e "  • Fast Bun-powered builds"
        echo -e "  • Rust dependency management"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
