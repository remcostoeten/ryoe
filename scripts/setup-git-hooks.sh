#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}🔧 Setting up Git hooks for automatic versioning...${NC}"

# Create .git/hooks directory if it doesn't exist
mkdir -p .git/hooks

# Copy pre-commit hook
if [ -f ".githooks/pre-commit" ]; then
    cp .githooks/pre-commit .git/hooks/pre-commit
    chmod +x .git/hooks/pre-commit
    echo -e "${GREEN}✅ Pre-commit hook installed${NC}"
else
    echo -e "${RED}❌ Pre-commit hook file not found${NC}"
    exit 1
fi

# Make the increment script executable
chmod +x scripts/increment-version.js

echo -e "${YELLOW}📦 Git hooks setup complete!${NC}"
echo -e "${CYAN}ℹ️  From now on, every commit will automatically increment the version by 0.01${NC}"
