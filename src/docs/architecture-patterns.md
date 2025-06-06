# Architecture Patterns: Context vs Hooks vs Services

This document explains the architectural layers in our enterprise application and when to use each pattern.

## Overview of Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  React Components                                           │
│  ├── Context Providers (Global State)                      │
│  ├── Custom Hooks (Component Logic)                        │
│  └── UI Components (Pure Presentation)                     │
├─────────────────────────────────────────────────────────────┤
│                    BUSINESS LOGIC LAYER                     │
├─────────────────────────────────────────────────────────────┤
│  Services (Business Rules & Validation)                    │
│  ├── folder-service.ts                                     │
│  ├── note-service.ts                                       │
│  └── user-service.ts                                       │
├─────────────────────────────────────────────────────────────┤
│                    DATA ACCESS LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  Repositories (Data Operations)                            │
│  ├── folder-repository.ts                                  │
│  ├── note-repository.ts                                    │
│  └── user-repository.ts                                    │
├─────────────────────────────────────────────────────────────┤
│                    STORAGE LAYER                            │
├─────────────────────────────────────────────────────────────┤
│  Database/Storage Providers                                │
│  ├── Turso SQLite (Production)                            │
│  └── Local SQLite (Development)                           │
└─────────────────────────────────────────────────────────────┘
```

## When to Use Context

### ✅ **Use Context When:**

1. **Global State Management**
   - User authentication state
   - Application-wide settings
   - Theme/UI preferences
   - Current workspace/project

2. **Cross-Component Communication**
   - Multiple components need the same data
   - Avoiding prop drilling through many levels
   - Shared UI state (modals, notifications)

3. **Complex State Coordination**
   - Multiple related hooks need synchronization
   - UI state that affects multiple components
   - Search/filter state across components

### ❌ **Don't Use Context When:**

1. **Simple Local State**
   - Component-specific state
   - Form inputs
   - Toggle states

2. **Performance-Critical Operations**
   - Frequently changing data
   - Large datasets that change often
   - Real-time updates

3. **Single Component Usage**
   - Data only used in one component
   - Simple API calls

### **Context Examples:**

```tsx
// ✅ Good: Global user state
<UserProvider>
  <App />
</UserProvider>

// ✅ Good: Folder management across multiple components
<FolderProvider parentId={null}>
  <FolderTree />
  <FolderCreateForm />
  <FolderSearchBar />
</FolderProvider>

// ❌ Bad: Simple form state
const [name, setName] = useState('') // Use local state instead
```

## When to Use Hooks

### ✅ **Use Custom Hooks When:**

1. **Reusable Logic**
   - Same logic used across multiple components
   - Stateful logic that can be abstracted
   - Complex state management patterns

2. **API Integration**
   - Data fetching and caching
   - CRUD operations
   - Real-time subscriptions

3. **Side Effect Management**
   - Event listeners
   - Timers and intervals
   - External library integration

### **Hook Categories:**

#### **Data Hooks** (Service Layer Integration)
```tsx
// ✅ Hooks that call services directly
function useFolders(parentId?: number | null) {
  const [folders, setFolders] = useState<TFolder[]>([])
  const [loading, setLoading] = useState(true)
  
  const loadFolders = useCallback(async () => {
    const response = await getRootFolders() // Service call
    if (response.success) {
      setFolders(response.data)
    }
  }, [])
  
  return { folders, loading, loadFolders }
}
```

#### **UI State Hooks** (Component Logic)
```tsx
// ✅ Hooks for UI-specific state management
function useInlineEditing() {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  
  const startEditing = (id: number, currentValue: string) => {
    setEditingId(id)
    setEditValue(currentValue)
  }
  
  return { editingId, editValue, startEditing }
}
```

#### **Operation Hooks** (Business Logic)
```tsx
// ✅ Hooks that orchestrate multiple operations
function useFolderOperations() {
  const createFolder = useCallback(async (input: TCreateFolderInput) => {
    const result = await createFolderWithValidation(input) // Service call
    if (result.success) {
      toast.success('Folder created')
      return result.data
    }
    toast.error(result.error)
    return null
  }, [])
  
  return { createFolder }
}
```

## Service Layer: Business Logic

### **Purpose:**
- Implement business rules and validation
- Coordinate between repositories
- Handle complex operations
- Provide clean API for hooks

### **Service Flow:**
```
Hook → Service → Repository → Database
```

### **Service Examples:**

```tsx
// ✅ Service handles business logic
export async function createFolderWithValidation(
  data: TFolderCreationData
): Promise<TServiceResult<TFolderWithStats>> {
  // 1. Validate business rules
  if (!data.name.trim()) {
    return { success: false, error: 'Folder name is required' }
  }
  
  // 2. Check for duplicates
  const existing = await findFolderByName(data.name, data.parentId)
  if (existing.success && existing.data) {
    return { success: false, error: 'Folder name already exists' }
  }
  
  // 3. Create folder via repository
  const result = await createFolder({
    name: data.name.trim(),
    parentId: data.parentId,
    position: data.position
  })
  
  // 4. Return with additional metadata
  if (result.success && result.data) {
    return {
      success: true,
      data: {
        ...result.data,
        noteCount: 0,
        subfolderCount: 0,
        totalSize: 0
      }
    }
  }
  
  return result
}
```

## Repository Layer: Data Access

### **Purpose:**
- Pure data operations (CRUD)
- Database abstraction
- No business logic
- Consistent error handling

### **Repository Flow:**
```
Service → Repository → Database Provider → SQLite
```

### **Repository Examples:**

```tsx
// ✅ Repository handles pure data operations
export async function createFolder(
  data: TCreateFolderData
): Promise<TRepositoryResult<TFolder>> {
  // Calculate position if not provided
  let position = data.position
  if (position === undefined) {
    const siblings = await findChildFolders(data.parentId || null)
    position = siblings.success ? siblings.data!.length : 0
  }
  
  // Map to database row format
  const rowData = {
    name: data.name,
    parent_id: data.parentId || null,
    position,
    created_at: Date.now(),
    updated_at: Date.now()
  }
  
  // Execute database operation
  return create(TABLE_NAME, rowData, mapRowToFolder)
}
```

## Data Flow Patterns

### **Pattern 1: Simple Data Fetching**
```
Component → Hook → Service → Repository → Database
```

```tsx
// Component
function FolderList() {
  const { folders, loading } = useFolders()
  // Render folders
}

// Hook
function useFolders() {
  useEffect(() => {
    loadFolders() // Calls service
  }, [])
}

// Service
async function getRootFolders() {
  return await findRootFolders() // Calls repository
}

// Repository
async function findRootFolders() {
  return await findMany(TABLE_NAME, { parent_id: null })
}
```

### **Pattern 2: Complex Operations with Context**
```
Component → Context → Hook → Service → Repository → Database
```

```tsx
// Component
function FolderManager() {
  const { createFolder } = useFolderContext()
  // Use context operations
}

// Context
function FolderProvider() {
  const operations = useFolderOperations() // Hook
  const data = useFolders() // Hook
  // Combine and coordinate
}

// Hook
function useFolderOperations() {
  const createFolder = async (input) => {
    return await createFolderWithValidation(input) // Service
  }
}
```

### **Pattern 3: Mutations vs Queries**

#### **Queries (Read Operations):**
```tsx
// ✅ Direct service calls in hooks
function useFolders() {
  const loadFolders = async () => {
    const result = await getRootFolders() // Service
    setFolders(result.data)
  }
}
```

#### **Mutations (Write Operations):**
```tsx
// ✅ Service calls with additional logic
function useFolderOperations() {
  const createFolder = async (input) => {
    const result = await createFolderWithValidation(input) // Service
    if (result.success) {
      // Additional UI logic
      toast.success('Created!')
      await refreshFolders()
    }
    return result
  }
}
```

## Decision Matrix

| Scenario | Use | Reason |
|----------|-----|--------|
| Global user state | Context | Shared across entire app |
| Folder CRUD operations | Hook → Service | Reusable business logic |
| Simple form state | Local useState | Component-specific |
| Complex folder tree UI | Context | Multiple components need coordination |
| Database operations | Repository | Pure data access |
| Business validation | Service | Business rules enforcement |
| API caching | Hook | Reusable data management |
| Modal state | Context (if global) or Hook (if local) | Depends on scope |

## Best Practices

### **Context Best Practices:**
1. Keep context focused and specific
2. Avoid putting everything in one context
3. Use multiple providers for different domains
4. Memoize context values to prevent re-renders

### **Hook Best Practices:**
1. One responsibility per hook
2. Return consistent interfaces
3. Handle loading and error states
4. Use proper dependency arrays

### **Service Best Practices:**
1. Pure functions only
2. Validate inputs
3. Handle errors gracefully
4. Return consistent result types

### **Repository Best Practices:**
1. No business logic
2. Consistent error handling
3. Type-safe operations
4. Database abstraction

This architecture ensures clean separation of concerns, testability, and maintainability while following enterprise patterns.
