# File Picker Implementation

This document describes the implementation of the cross-platform file picker functionality for MDX storage path selection.

## Overview

The file picker allows users to browse and select directories for storing MDX files, providing a native experience on desktop (Tauri) and a fallback for web browsers.

## Components

### DirectoryPicker

A general-purpose directory picker component with standard styling.

```typescript
<DirectoryPicker
  label="Choose Directory"
  value={path}
  onChange={setPath}
  placeholder="~/.config/ryoe"
  disabled={false}
  error={errorMessage}
/>
```

### OnboardingDirectoryPicker

A specialized variant with onboarding-specific styling (transparent background, white text).

```typescript
<OnboardingDirectoryPicker
  label="MDX Storage Location"
  value={path}
  onChange={setPath}
  placeholder="~/.config/ryoe"
/>
```

## Platform Support

### Tauri Desktop Application

Uses the native `@tauri-apps/plugin-dialog` for optimal user experience:

```typescript
import { open } from '@tauri-apps/plugin-dialog'

const result = await open({
  title: 'Select MDX Storage Directory',
  directory: true,
  multiple: false
})
```

**Features:**
- Native OS file picker dialog
- Full filesystem access
- Proper directory validation
- Consistent with OS conventions

### Web Browser Fallback

Provides multiple fallback strategies for web environments:

1. **File System Access API** (Chrome 86+, Edge 86+)
2. **Input element with webkitdirectory** (Most modern browsers)
3. **Graceful degradation** for unsupported browsers

## Configuration

### Tauri Configuration

**tauri.conf.json:**
```json
{
  "plugins": {
    "dialog": {
      "active": true
    }
  }
}
```

**Cargo.toml:**
```toml
[dependencies]
tauri-plugin-dialog = "2"
```

**main.rs:**
```rust
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        // ... other plugins
}
```

### NPM Dependencies

```json
{
  "dependencies": {
    "@tauri-apps/plugin-dialog": "^2.0.0"
  }
}
```

## Usage Examples

### Basic Usage

```typescript
import { DirectoryPicker } from '@/components/ui/directory-picker'

function SettingsForm() {
  const [storagePath, setStoragePath] = useState('~/.config/ryoe')
  
  return (
    <DirectoryPicker
      label="Storage Directory"
      value={storagePath}
      onChange={setStoragePath}
    />
  )
}
```

### With Validation

```typescript
import { validateMdxPath } from '@/utilities/file-picker'

function ValidatedPicker() {
  const [path, setPath] = useState('')
  const [error, setError] = useState<string>()
  
  const handleChange = (newPath: string) => {
    setPath(newPath)
    const validation = validateMdxPath(newPath)
    setError(validation.valid ? undefined : validation.error)
  }
  
  return (
    <DirectoryPicker
      value={path}
      onChange={handleChange}
      error={error}
    />
  )
}
```

### Direct API Usage

```typescript
import { openMdxDirectoryPicker } from '@/utilities/file-picker'

async function selectDirectory() {
  const result = await openMdxDirectoryPicker()
  
  if (result.success && result.path) {
    console.log('Selected directory:', result.path)
  } else {
    console.error('Selection failed:', result.error)
  }
}
```

## Features

### User Experience

- **Manual Input**: Users can type paths directly
- **Browse Button**: Native file picker for easy selection
- **Loading States**: Visual feedback during picker operations
- **Error Handling**: Clear error messages for invalid paths
- **Validation**: Real-time path validation

### Cross-Platform Compatibility

- **Desktop (Tauri)**: Native OS file picker
- **Web (Modern)**: File System Access API
- **Web (Legacy)**: Input element fallback
- **Graceful Degradation**: Works across all environments

### Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and descriptions
- **Focus Management**: Logical tab order
- **Error Announcements**: Screen reader accessible error messages

## Integration Points

### Onboarding Flow

The directory picker is integrated into the onboarding settings step:

```typescript
// src/features/onboarding/components/steps/SettingsStep.tsx
<OnboardingDirectoryPicker
  label="MDX Files Location"
  value={preferences.mdxStoragePath}
  onChange={(path) => updatePreference('mdxStoragePath', path)}
/>
```

### Profile Settings

Also available in the user profile for changing storage location:

```typescript
// src/app/routes/profile.tsx
<DirectoryPicker
  label="MDX Storage Path"
  value={preferences.mdxStoragePath}
  onChange={updateStoragePath}
/>
```

## Error Handling

The implementation includes comprehensive error handling:

- **Permission Errors**: When filesystem access is denied
- **Invalid Paths**: When selected paths are invalid
- **Network Errors**: When running in restricted environments
- **User Cancellation**: When user cancels the picker dialog

## Future Enhancements

- [ ] Recent directories list
- [ ] Bookmark favorite directories
- [ ] Directory creation from picker
- [ ] Path auto-completion
- [ ] Integration with cloud storage providers
