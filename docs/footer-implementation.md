# Footer Implementation

## Overview

Added a minimal, aesthetic footer to the Notr desktop application that displays essential app information and maintains the clean design aesthetic.

## Components Created

### 1. **App Configuration** (`src/app/config.ts`)

```typescript
export const APP_NAME = 'Notr'
export const APP_VERSION = '0.1.0'
export const APP_AUTHOR = 'Remco Stoeten'
export const APP_AUTHOR_URL = 'https://github.com/remcostoeten'
export const APP_REPOSITORY_URL = 'https://github.com/remcostoeten/notr-tauri'
```

### 2. **Basic Footer** (`src/components/footer.tsx`)

- Clean, minimal design matching the app's aesthetic
- Environment-aware (shows "Desktop" or "Web")
- Displays app name, version, and build information
- Author attribution with clickable link

### 3. **Enhanced Footer** (`src/components/footer-enhanced.tsx`)

- Includes database health status (Tauri only)
- Real-time status indicators
- More detailed build information
- Periodic health checks

### 4. **Git Information Utilities** (`src/lib/git-info.ts`)

- Build-time git information
- Commit hash, message, and date
- Environment variables for CI/CD integration

## Design Features

### **Visual Design**

- **Position**: Fixed at bottom of screen
- **Background**: Semi-transparent with backdrop blur (`bg-[#1f1f1f57] backdrop-blur-sm`)
- **Border**: Subtle top border (`border-t border-[#333]`)
- **Typography**: Small, muted text with hover effects

### **Layout Structure**

```
[App Name] • [Version] • [Environment]     [Built with ❤️ by Author] • [Build Info]
```

### **Color Scheme**

- Primary text: `text-gray-300`
- Secondary text: `text-gray-400`
- Muted elements: `text-gray-500`
- Interactive elements: Hover transitions to white

## Environment Awareness

### **Desktop Environment (Tauri)**

- Shows "Desktop" environment indicator
- Includes database health status (enhanced version)
- Full functionality available

### **Web Environment**

- Shows "Web" environment indicator
- Simplified information display
- No database status (not applicable)

## Integration

### **Layout Integration**

Updated `src/components/layout.tsx`:

```typescript
export function Layout({ children }: TProps) {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pb-12">{children}</main>
            <Footer />
        </div>
    )
}
```

### **Responsive Design**

- Fixed positioning ensures visibility
- Proper z-index layering
- Content padding to prevent overlap

## Build Integration

### **Environment Variables**

For CI/CD integration, add these environment variables:

```bash
VITE_GIT_COMMIT_HASH=abc1234
VITE_GIT_COMMIT_MESSAGE="feat: add footer component"
VITE_GIT_COMMIT_DATE=2024-01-15T10:30:00Z
VITE_GIT_BRANCH=main
VITE_GIT_DIRTY=false
```

### **Build Script Example**

```bash
#!/bin/bash
export VITE_GIT_COMMIT_HASH=$(git rev-parse HEAD)
export VITE_GIT_COMMIT_MESSAGE=$(git log -1 --pretty=%B)
export VITE_GIT_COMMIT_DATE=$(git log -1 --format=%cI)
export VITE_GIT_BRANCH=$(git branch --show-current)
export VITE_GIT_DIRTY=$(git diff --quiet || echo "true")

pnpm build
```

## Usage

### **Basic Footer**

```typescript
import { Footer } from '@/components/footer';

// Use in layout
<Footer />
```

### **Enhanced Footer**

```typescript
import { FooterEnhanced } from '@/components/footer-enhanced';

// Use for more detailed information
<FooterEnhanced />
```

## Customization

### **Styling**

Modify the Tailwind classes in the footer components:

- Background: `bg-[#1f1f1f57]`
- Text colors: `text-gray-*` classes
- Spacing: `px-6 py-2`

### **Content**

Update `src/app/config.ts` to change:

- App name and version
- Author information
- Repository URL

### **Features**

Toggle between basic and enhanced versions based on needs:

- Basic: Minimal information
- Enhanced: Database status, detailed build info

## Benefits

1. **Professional Appearance**: Clean, minimal footer enhances app credibility
2. **Useful Information**: Version and build info for debugging
3. **Environment Awareness**: Clear indication of runtime environment
4. **Responsive Design**: Works across different screen sizes
5. **Easy Maintenance**: Centralized configuration
6. **Build Integration**: Automatic git information inclusion

## Future Enhancements

1. **Status Indicators**: Add more system status indicators
2. **Theme Integration**: Footer styling based on app theme
3. **Keyboard Shortcuts**: Show available shortcuts
4. **Update Notifications**: Indicate when updates are available
5. **Performance Metrics**: Show app performance information
