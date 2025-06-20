# Port Manager Module

A comprehensive port management system for development environments, built with Tauri and React.

## Features

### 🖥️ **System Tray Integration (macOS)**

- **Menu Bar Access**: Click the port manager icon in the macOS menu bar
- **Quick Port Overview**: See active development ports at a glance
- **One-Click Actions**: Kill ports or open in browser directly from the tray

### 🌐 **Frontend Interface**

- **Full Port Manager Page**: Complete interface at `/port-manager`
- **Real-time Scanning**: Auto-refresh port status every 5-30 seconds
- **Smart Filtering**: Show only development ports or all ports
- **Bulk Operations**: Select and kill multiple ports at once

### 🔍 **Port Detection**

- **Development Port Recognition**: Automatically identifies common dev ports
- **Process Information**: Shows process name and PID for each port
- **Port Categories**: Groups ports by framework (React, Node.js, Python, etc.)
- **Status Monitoring**: Real-time active/inactive status

### ⚡ **Quick Actions**

- **Kill Process**: Terminate processes running on specific ports
- **Open in Browser**: Launch localhost URLs directly
- **Bulk Kill**: Kill multiple selected ports simultaneously
- **Search & Filter**: Find ports by number, process name, or category

## Architecture

### Backend (Rust)

```
src-tauri/src/port_manager.rs
├── Port scanning (lsof, netstat)
├── Process killing (kill, taskkill)
├── Cross-platform support (macOS, Windows, Linux)
└── Tauri commands for frontend communication
```

### Frontend (TypeScript/React)

```
src/modules/port-manager/
├── components/
│   ├── port-manager.tsx          # Main interface
│   ├── port-card.tsx             # Individual port display
│   ├── port-manager-dropdown.tsx # Compact dropdown view
│   └── port-manager-tray.tsx     # System tray integration
├── hooks/
│   └── use-port-manager.ts       # Port management logic
└── types/
    └── port-manager.ts           # TypeScript definitions
```

## Usage

### System Tray (macOS)

1. Look for the network icon in your menu bar
2. Click to see active development ports
3. Use quick actions to kill ports or open in browser
4. Click "View All Ports" for the full interface

### Full Interface

1. Navigate to `/port-manager` in the app
2. Use the search bar to find specific ports
3. Toggle filters to show only development ports
4. Select multiple ports for bulk operations
5. Enable auto-refresh for real-time monitoring

### Keyboard Shortcuts

- **Auto Refresh**: Toggle automatic port scanning
- **Search**: Find ports by number or process name
- **Bulk Select**: Select all visible ports

## Port Categories

The system automatically categorizes ports:

- **React/Next.js**: 3000-3005
- **Express/Node.js**: 4000-4005
- **Python/Flask**: 5000-5005
- **Vite**: 5173-5178
- **Django**: 8000-8005
- **Java/Tomcat**: 8080-8085
- **Tauri**: 1420-1425
- **Storybook**: 6006-6011
- **Various**: 7000-7005, 9000-9005

## API

### Tauri Commands

```rust
// Scan all listening ports
scan_ports() -> Result<PortScanResult, String>

// Kill a process on a specific port
kill_port(port: u16) -> Result<bool, String>
```

### React Hooks

```typescript
const {
  ports, // Array of port information
  isScanning, // Loading state
  scanPorts, // Manual refresh
  killPort, // Kill single port
  killSelectedPorts, // Kill multiple ports
  autoRefresh, // Auto-refresh toggle
} = usePortManager()
```

## Configuration

```typescript
const config: TPortManagerConfig = {
  autoRefreshInterval: 5000, // Refresh every 5 seconds
  showOnlyDevelopmentPorts: true, // Filter dev ports only
  groupByProcess: false, // Group by process name
  notifications: true, // Show kill notifications
}
```

## Cross-Platform Support

- **macOS**: Uses `lsof` for port scanning, `kill` for termination
- **Windows**: Uses `netstat` and `taskkill`
- **Linux**: Uses `lsof` and `kill` (same as macOS)

## Integration

The port manager integrates seamlessly with the main application:

1. **Navigation**: Added to main sidebar and navigation
2. **Header Tray**: Available in document header for quick access
3. **System Tray**: macOS menu bar integration
4. **Auto-refresh**: Background monitoring with configurable intervals

## Development

To extend the port manager:

1. **Add new port categories** in `types/port-manager.ts`
2. **Customize UI components** in `components/`
3. **Modify scanning logic** in `src-tauri/src/port_manager.rs`
4. **Add new actions** via Tauri commands and React hooks

## Security

- **Process isolation**: Each port scan runs in a separate process
- **Permission handling**: Requires appropriate system permissions
- **Error handling**: Graceful fallbacks for permission denied scenarios
- **Safe termination**: Confirms process ownership before killing
