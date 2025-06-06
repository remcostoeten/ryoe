# Folder Context Integration

This document explains the integrated folder context that combines your enterprise-grade folder management hooks into a unified React context.

## Overview

The `FolderContext` provides a centralized state management solution for folder operations, combining three core hooks:

- `useFolders` - Database operations and folder data management
- `useFolderTree` - Tree structure and UI state management  
- `useFolderOperations` - Advanced folder operations (move, reorder, etc.)

## Features

### ✅ Enterprise Architecture
- Integrates with your existing service layer
- Uses pure functions and proper async operations
- Follows your TypeScript conventions with T-prefixed types
- Includes comprehensive error handling and loading states

### ✅ Unified State Management
- Single source of truth for folder data
- Automatic synchronization between hooks
- Centralized UI state (selection, expansion, editing)
- Built-in search and filtering capabilities

### ✅ Performance Optimized
- Memoized filtered data to prevent unnecessary re-renders
- Efficient tree building algorithms
- Automatic refresh coordination between hooks

## Usage

### Basic Setup

```tsx
import { FolderProvider, useFolderContext } from '@/contexts/folder-context'

function App() {
  return (
    <FolderProvider parentId={null}>
      <YourFolderComponent />
    </FolderProvider>
  )
}
```

### Using the Context

```tsx
function FolderComponent() {
  const {
    // Data
    folders,           // Flat list of folders
    treeData,          // Hierarchical tree structure
    loading,           // Combined loading state
    error,             // Combined error state
    
    // UI State
    selectedFolderId,  // Currently selected folder
    expandedFolderIds, // Set of expanded folder IDs
    editingFolderId,   // Currently editing folder
    searchFilter,      // Current search query
    
    // Operations
    createFolder,      // Create new folder
    updateFolder,      // Update existing folder
    deleteFolder,      // Delete folder
    refreshFolders,    // Refresh all data
    
    // Tree Operations
    selectFolder,      // Select a folder
    toggleFolder,      // Toggle expansion
    startEditing,      // Start editing mode
    stopEditing,       // Stop editing mode
    renameFolder,      // Rename folder
    
    // Search & Filtering
    setSearchFilter,   // Set search query
    filteredFolders,   // Filtered flat list
    filteredTreeData   // Filtered tree structure
  } = useFolderContext()
  
  // Your component logic here
}
```

## API Reference

### Context Value Type

```typescript
type TFolderContextValue = {
  // Folder data
  folders: TFolder[]
  treeData: TFolderTreeNode[]
  loading: boolean
  error: string | null
  
  // UI state
  selectedFolderId: number | null
  expandedFolderIds: Set<number>
  editingFolderId: number | null
  searchFilter: string
  
  // Folder operations
  createFolder: (input: TCreateFolderInput) => Promise<TFolder | null>
  updateFolder: (input: TUpdateFolderInput) => Promise<TFolder | null>
  deleteFolder: (id: number, deleteChildren?: boolean) => Promise<boolean>
  refreshFolders: () => Promise<void>
  
  // Tree operations
  selectFolder: (folderId: number | null) => void
  expandFolder: (folderId: number) => void
  collapseFolder: (folderId: number) => void
  toggleFolder: (folderId: number) => void
  startEditing: (folderId: number) => void
  stopEditing: () => void
  renameFolder: (folderId: number, newName: string) => Promise<boolean>
  
  // Search and filtering
  setSearchFilter: (query: string) => void
  filteredFolders: TFolder[]
  filteredTreeData: TFolderTreeNode[]
}
```

### Provider Props

```typescript
type TFolderProviderProps = {
  children: ReactNode
  parentId?: number | null  // Optional parent folder ID for scoped operations
}
```

## Advanced Usage

### Scoped Folder Management

You can create multiple providers for different folder scopes:

```tsx
// Root level folders
<FolderProvider parentId={null}>
  <RootFolderManager />
</FolderProvider>

// Specific parent folder
<FolderProvider parentId={123}>
  <SubfolderManager />
</FolderProvider>
```

### Search and Filtering

The context provides built-in search functionality:

```tsx
function SearchableFolderList() {
  const { setSearchFilter, filteredFolders, searchFilter } = useFolderContext()
  
  return (
    <div>
      <input
        value={searchFilter}
        onChange={(e) => setSearchFilter(e.target.value)}
        placeholder="Search folders..."
      />
      {filteredFolders.map(folder => (
        <div key={folder.id}>{folder.name}</div>
      ))}
    </div>
  )
}
```

### Error Handling

```tsx
function FolderManager() {
  const { error, loading, refreshFolders } = useFolderContext()
  
  if (loading) return <div>Loading...</div>
  
  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={refreshFolders}>Retry</button>
      </div>
    )
  }
  
  // Normal render
}
```

## Integration Benefits

### Compared to Previous Implementation

**Before (Old Context):**
- Used mock data and simple state
- Synchronous operations only
- Limited type safety
- No database integration

**After (New Context):**
- Real database operations through service layer
- Async operations with proper error handling
- Full TypeScript integration
- Enterprise architecture compliance
- Advanced tree management
- Built-in search and filtering

### Key Improvements

1. **Real Data Persistence** - All operations persist to your database
2. **Error Handling** - Comprehensive error states and recovery
3. **Loading States** - Proper loading indicators for async operations
4. **Type Safety** - Full TypeScript integration with your existing types
5. **Performance** - Optimized with memoization and efficient updates
6. **Flexibility** - Supports both flat and hierarchical folder views

## Best Practices

1. **Use Single Provider** - One provider per folder scope
2. **Handle Loading States** - Always check loading before rendering
3. **Error Recovery** - Provide retry mechanisms for failed operations
4. **Optimistic Updates** - UI updates immediately, with rollback on failure
5. **Search Debouncing** - Consider debouncing search input for performance

## Migration Guide

If migrating from the old context:

1. Update import paths to use the new context
2. Replace synchronous operations with async equivalents
3. Add error handling for all operations
4. Update type definitions to use T-prefixed types
5. Test all folder operations with real database

This integrated context provides a robust, enterprise-grade solution for folder management that aligns with your existing architecture and preferences.
