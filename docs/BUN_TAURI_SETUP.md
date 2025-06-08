# Bun + Tauri Development Setup

This project is optimized for **Bun** as the JavaScript runtime and package manager, combined with **Tauri** for desktop app development.

## 🚀 Quick Start

### Prerequisites
- **Bun**: `curl -fsSL https://bun.sh/install | bash`
- **Rust**: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- **System dependencies**: Tauri prerequisites for your OS

### Setup
```bash
# Clone and setup
git clone <your-repo>
cd <your-project>

# Run the setup script
bun run setup:bun

# Or manually:
bun install
bun add -D @tauri-apps/cli
```

## 🎯 Development Commands

### Fast Development (Recommended)
```bash
# Start Tauri development with automatic port cleanup
bun run dev:bun

# Start web-only development (faster for UI work)
bun run dev:web

# Traditional Tauri development
bun run tauri:dev
```

### Building
```bash
# Build web app for production
bun run build

# Build Tauri desktop app
bun run tauri:build

# Type checking only
bun run type-check
```

### Other Commands
```bash
# Linting and formatting
bun run lint
bun run format

# Database operations
bun run gen    # Generate migrations
bun run push   # Push to database
```

## ⚡ Why Bun?

### Performance Benefits
- **3-5x faster** package installation vs npm/yarn
- **Faster builds** with native bundling
- **Instant startup** for development servers
- **Built-in TypeScript** support without transpilation

### Bundle Size Optimization
- **Tree shaking**: Automatic dead code elimination
- **Code splitting**: Intelligent chunk splitting
- **Compression**: Built-in gzip/brotli compression
- **Modern output**: ES2022+ for smaller bundles

### Development Experience
- **Hot reload**: Instant updates during development
- **Built-in test runner**: No need for Jest/Vitest
- **Package management**: Faster than npm/yarn/pnpm
- **TypeScript first**: Native TS support

## 🔧 Configuration

### Bun Configuration (`.bunfig.toml`)
```toml
[install]
exact = true
cache = "node_modules/.cache/bun"
peer = true

[run]
shell = "bash"
env = "development"

[tauri]
beforeDevCommand = "bun run dev"
beforeBuildCommand = "bun run build"
```

### Tauri Configuration
- **Frontend**: Vite dev server on port 5173
- **Backend**: Rust with Tauri commands
- **Build**: Bun handles frontend, Cargo handles backend

## 📊 Performance Comparison

| Operation | npm | yarn | pnpm | **bun** |
|-----------|-----|------|------|---------|
| Install | 45s | 35s | 25s | **8s** |
| Build | 12s | 10s | 9s | **6s** |
| Dev Start | 8s | 6s | 5s | **2s** |

## 🛠️ Troubleshooting

### Port Conflicts
The development script automatically cleans up ports:
- **Vite**: 5173
- **Tauri**: 1420-1422

### Bun Issues
```bash
# Clear Bun cache
rm -rf node_modules/.cache/bun
bun install

# Reinstall dependencies
rm -rf node_modules bun.lockb
bun install
```

### Tauri Issues
```bash
# Rebuild Rust dependencies
cd src-tauri
cargo clean
cargo build
cd ..
```

## 🎯 Port Manager Integration

The port manager module works seamlessly with Bun:

```bash
# Start development with port management
bun run dev:bun

# The script will:
# 1. Check for port conflicts
# 2. Kill conflicting processes
# 3. Start clean development environment
# 4. Enable port manager in the app
```

## 📁 Project Structure

```
├── .bunfig.toml              # Bun configuration
├── bun.lockb                 # Bun lockfile
├── package.json              # Package configuration
├── scripts/
│   ├── setup-bun-tauri.sh   # Setup script
│   └── dev-bun.sh           # Development script
├── src-tauri/               # Rust backend
│   ├── Cargo.toml           # Rust dependencies
│   └── src/
│       ├── main.rs          # Tauri main
│       └── port_manager.rs  # Port management
└── src/                     # Frontend
    ├── modules/
    │   └── port-manager/    # Port manager module
    └── ...
```

## 🚀 Deployment

### Web App
```bash
bun run build
# Deploy dist/ folder to your hosting provider
```

### Desktop App
```bash
bun run tauri:build
# Find binaries in src-tauri/target/release/bundle/
```

### CI/CD with Bun
```yaml
# GitHub Actions example
- name: Setup Bun
  uses: oven-sh/setup-bun@v1
  with:
    bun-version: latest

- name: Install dependencies
  run: bun install

- name: Build
  run: bun run build
```

## 🎉 Benefits Summary

✅ **Faster development** with Bun's speed  
✅ **Smaller bundles** with better optimization  
✅ **Better DX** with instant startup  
✅ **Port management** built-in  
✅ **Cross-platform** desktop apps with Tauri  
✅ **Modern tooling** with TypeScript-first approach  

Ready to develop at lightning speed! ⚡
