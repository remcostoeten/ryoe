# Notr - Desktop Note-Taking Application

A modern, cross-platform desktop application built with Tauri, React, and TypeScript for efficient note-taking and code snippet management.

## Features

### 🖥️ **Screen Position Persistence** _(New!)_

- Automatically saves and restores window position and size
- Multi-monitor support with intelligent fallbacks
- Seamless experience across application restarts
- Zero configuration required

### 📝 **Note Management**

- Create, edit, and organize notes efficiently
- Rich text editing capabilities
- Fast search and filtering

### 💾 **Code Snippets**

- Store and manage code snippets by language
- Syntax highlighting support
- Quick copy and paste functionality

### 🗄️ **Local Storage**

- SQLite database for reliable data persistence
- File-based storage for configuration
- Cross-platform compatibility

### 🎨 **Modern UI**

- Clean, responsive interface
- Dark/light theme support
- Customizable layout and preferences

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Rust (latest stable)
- pnpm package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/remcostoeten/notr-tauri.git
cd notr-tauri

# Install dependencies
pnpm install

# Install Rust dependencies
cd src-tauri
cargo build
cd ..
```

### Development

```bash
# Start development server (web)
pnpm dev

# Start Tauri development (desktop)
pnpm tauri dev
```

### Building

```bash
# Build for production
pnpm build

# Build Tauri application
pnpm tauri build
```

## Architecture

### Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Rust, Tauri Framework
- **Database**: SQLite with Drizzle ORM
- **Storage**: Tauri Store Plugin + Browser Storage
- **Window Management**: tauri-plugin-window-state

### Project Structure

```
notr-tauri/
├── src/                    # React frontend
│   ├── app/               # Application routes and pages
│   ├── components/        # Reusable UI components
│   ├── docs/             # Documentation (MDX)
│   ├── lib/              # Utilities and helpers
│   └── shared/           # Shared components
├── src-tauri/            # Rust backend
│   ├── src/              # Rust source code
│   ├── Cargo.toml        # Rust dependencies
│   └── tauri.conf.json   # Tauri configuration
└── dist/                 # Built application
```

## Documentation

Comprehensive documentation is available at `/docs` when running the application:

- **[Storage & File System](/docs/storage)** - Local storage and file operations
- **[Database Operations](/docs/db-operations)** - SQLite and query patterns
- **[Storage API Reference](/docs/storage-api)** - Complete API documentation
- **[Window Management](/docs/window-management)** - Screen position persistence _(New!)_

## Environment Support

### Desktop (Tauri)

- Full feature set including window state persistence
- Native file system access
- SQLite database integration
- System tray and notifications

### Web Browser

- Core functionality with graceful feature degradation
- Browser storage fallbacks
- Responsive design for all screen sizes

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Remco Stoeten**

- GitHub: [@remcostoeten](https://github.com/remcostoeten)
- Website: [remcostoeten.com](https://remcostoeten.com)

---

Built with ❤️ using Tauri, React, and modern web technologies.
