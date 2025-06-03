# Automatic Versioning System

## Overview

The application now has an automatic versioning system that:
- Starts at version `0.01`
- Increments by `0.01` with each commit
- Synchronizes version across all configuration files
- Displays dynamically in the UI

## How It Works

### 1. **Dynamic Version Injection**
- Vite reads the version from `package.json` at build time
- Injects it as a global constant `__APP_VERSION__`
- The app config uses this dynamic value

### 2. **Automatic Increment on Commit**
- Git pre-commit hook runs `scripts/increment-version.js`
- Updates version in all files:
  - `package.json`
  - `src/app/config.ts`
  - `src-tauri/Cargo.toml`
  - `src-tauri/tauri.conf.json`
- Adds updated files to the commit

### 3. **Minimal Footer Display**
- Shows: `Notr • v0.01`
- Height: 30-60px max
- Centered with circle separators

## Setup Instructions

### 1. Install Git Hooks
```bash
pnpm run setup:hooks
```

### 2. Manual Version Increment (if needed)
```bash
pnpm run version:increment
```

## Files Involved

- **`scripts/increment-version.js`** - Version increment logic
- **`.githooks/pre-commit`** - Git hook that runs on commit
- **`scripts/setup-git-hooks.sh`** - Installs the git hooks
- **`vite.config.ts`** - Injects version at build time
- **`src/app/config.ts`** - Uses dynamic version
- **`src/components/minimal-footer.tsx`** - Displays version

## Version Flow

1. Developer makes changes
2. Runs `git commit`
3. Pre-commit hook increments version automatically
4. All config files updated with new version
5. Updated files added to commit
6. Commit proceeds with new version
7. App displays new version in footer

## Current Version: 0.01
Next commit will be: 0.02
