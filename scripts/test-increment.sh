#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}🧪 Testing version increment system...${NC}"

# Check current version
echo -e "${YELLOW}📦 Current version in config.ts:${NC}"
grep "APP_VERSION" src/app/config.ts

echo -e "${YELLOW}📦 Current version in package.json:${NC}"
grep "version" package.json | head -1

# Test the increment script
echo -e "${CYAN}🔄 Running increment script...${NC}"
node scripts/increment-version.js

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Version increment test successful${NC}"
    
    echo -e "${YELLOW}📦 New version in config.ts:${NC}"
    grep "APP_VERSION" src/app/config.ts
    
    echo -e "${YELLOW}📦 New version in package.json:${NC}"
    grep "version" package.json | head -1
    
    # Reset changes for testing
    echo -e "${CYAN}🔄 Resetting changes (this is just a test)...${NC}"
    git checkout -- package.json src/app/config.ts src-tauri/Cargo.toml src-tauri/tauri.conf.json 2>/dev/null || true
    
else
    echo -e "${RED}❌ Version increment test failed${NC}"
    exit 1
fi

