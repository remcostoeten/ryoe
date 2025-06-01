# Database Health Indicator Component

A beautiful, interactive database health indicator component for your Tauri application.

## 🎯 Features

- **Real-time Status Monitoring**: Automatically checks database health every 30 seconds
- **Visual Status Indicators**: Color-coded badges with icons for different states
- **Interactive Tooltips**: Hover to see detailed status information
- **Manual Refresh**: Click the refresh button to check status on-demand
- **Responsive Design**: Works seamlessly across different screen sizes
- **TypeScript Support**: Fully typed for better development experience

## 🎨 Status States

| Status           | Color     | Icon           | Description                     |
| ---------------- | --------- | -------------- | ------------------------------- |
| **Healthy**      | 🟢 Green  | ✅ CheckCircle | Database is responding normally |
| **Error**        | 🔴 Red    | ❌ XCircle     | Database connection failed      |
| **Disconnected** | 🟡 Yellow | ⚠️ AlertCircle | Database not initialized        |
| **Checking**     | ⚪ Gray   | 🔄 Loader2     | Currently checking status       |

## 📦 Usage

### Basic Usage

```tsx
import { DatabaseHealthIndicator } from '@/components/database-health-indicator'

function MyComponent() {
    return <DatabaseHealthIndicator />
}
```

### Advanced Usage

```tsx
<DatabaseHealthIndicator
    interval={60000} // Check every minute (default: 30000ms)
    showRefresh={false} // Hide refresh button (default: true)
    showDetails={false} // Hide response time (default: true)
    className="my-custom-class"
/>
```

## 🔧 Configuration Options

| Prop          | Type      | Default     | Description                           |
| ------------- | --------- | ----------- | ------------------------------------- |
| `interval`    | `number`  | `30000`     | Health check interval in milliseconds |
| `showRefresh` | `boolean` | `true`      | Show manual refresh button            |
| `showDetails` | `boolean` | `true`      | Show response time details            |
| `className`   | `string`  | `undefined` | Additional CSS classes                |

## 🏗️ Architecture

### Components

- **`DatabaseHealthIndicator`**: Main component with visual indicator
- **`useDatabaseHealth`**: Custom hook for health state management
- **`Badge`**: Reusable UI component for status display
- **`checkDatabaseHealth`**: Core function for database health checks

### Files Created

```
src/
├── components/
│   ├── ui/
│   │   └── badge.tsx                    # Badge UI component
│   ├── database-health-indicator.tsx    # Main indicator component
│   └── database-health-demo.tsx         # Demo component
├── hooks/
│   └── use-database-health.ts           # Custom hook
└── api/db/
    └── index.ts                         # Database health check logic
```

## 🚀 Next Steps

### For Production Use

1. **Implement Tauri Commands**: Move database operations to Rust backend
2. **Add Persistence**: Store health history for analytics
3. **Configure Alerts**: Add notifications for critical states
4. **Add Metrics**: Track response times and uptime

### Example Tauri Command Integration

```rust
// src-tauri/src/main.rs
#[tauri::command]
async fn check_database_health() -> Result<DatabaseHealth, String> {
    // Implement actual database health check in Rust
    Ok(DatabaseHealth {
        status: "healthy".to_string(),
        message: "Database is healthy".to_string(),
        response_time: Some(5),
    })
}
```

## 🎮 Demo

The application includes a demo section where you can:

1. **Simulate different states** by clicking the state buttons
2. **See real-time updates** when clicking the refresh button
3. **Hover over the indicator** to see detailed tooltips
4. **Watch automatic polling** (disabled in demo mode)

## 🔍 Troubleshooting

### Common Issues

1. **Blank Application**: Check browser console for errors
2. **Database Errors**: Currently using mock data - implement real database integration
3. **TypeScript Errors**: Ensure all dependencies are installed

### Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Run in Tauri
pnpm tauri dev
```

## 📝 License

This component follows the same license as your project.
