#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}🔧 Setting up Git hooks for automatic version increment...${NC}"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Not in a Git repository${NC}"
    exit 1
fi

# Create the pre-commit hook in the correct location
HOOK_PATH=".git/hooks/pre-commit"

# Create the pre-commit hook
cat > "$HOOK_PATH" << 'EOF'
#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}🔄 Auto-incrementing version before commit...${NC}"

# Check if this is an initial commit
if git rev-parse --verify HEAD >/dev/null 2>&1; then
    # Not initial commit, check for changes in relevant files
    CHANGED_FILES=$(git diff --cached --name-only)
    
    # Skip version increment for version-only commits to avoid infinite loops
    if echo "$CHANGED_FILES" | grep -E "(package\.json|src/app/config\.ts|src-tauri/)" > /dev/null; then
        # Check if this is ONLY version file changes (to avoid infinite loop)
        NON_VERSION_CHANGES=$(echo "$CHANGED_FILES" | grep -v -E "(package\.json|src/app/config\.ts|src-tauri/Cargo\.toml|src-tauri/tauri\.conf\.json)")
        
        if [ -z "$NON_VERSION_CHANGES" ]; then
            echo -e "${YELLOW}⏭️  Skipping version increment (version-only commit)${NC}"
            exit 0
        fi
    fi
fi

# Run the version increment script
node scripts/increment-version.js

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Version incremented successfully${NC}"
    
    # Add the updated files to the commit
    git add package.json
    git add src/app/config.ts
    git add src-tauri/Cargo.toml
    git add src-tauri/tauri.conf.json
    
    echo -e "${YELLOW}📦 Updated version files added to commit${NC}"
else
    echo -e "${RED}❌ Failed to increment version${NC}"
    exit 1
fi
EOF

# Make the hook executable
chmod +x "$HOOK_PATH"

echo -e "${GREEN}✅ Pre-commit hook installed at $HOOK_PATH${NC}"
echo -e "${YELLOW}💡 The hook will automatically increment version by 0.01 on each commit${NC}"
echo -e "${CYAN}🔧 To test the hook, make a commit and watch the version increment${NC}"
