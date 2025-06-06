# Data Flow Guide: From Database to UI

This guide explains the complete data flow in our enterprise architecture and when to use each layer.

## Complete Data Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   DATABASE      │◄───│   REPOSITORY    │◄───│    SERVICE      │◄───│      HOOK       │
│                 │    │                 │    │                 │    │                 │
│ • SQLite        │    │ • Pure CRUD     │    │ • Business      │    │ • State Mgmt    │
│ • Turso         │    │ • Data Mapping  │    │ • Validation    │    │ • Side Effects  │
│ • Local Files   │    │ • Error Handle  │    │ • Coordination  │    │ • UI Logic      │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
                                                                              ▲
                                                                              │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   COMPONENT     │◄───│    CONTEXT      │◄───│   HOOK COMBO    │◄───┘
│                 │    │                 │    │                 │
│ • UI Rendering  │    │ • Global State  │    │ • Multiple      │
│ • User Events   │    │ • Coordination  │    │   Hooks         │
│ • Presentation  │    │ • Shared Logic  │    │ • Orchestration │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Layer Responsibilities

### 1. Repository Layer
**Purpose:** Pure data access, no business logic

```typescript
// ✅ Repository: Pure CRUD operations
export async function createFolder(data: TCreateFolderData): Promise<TRepositoryResult<TFolder>> {
  // 1. Data validation (structure only)
  if (!data.name) {
    return { success: false, error: 'Name is required' }
  }
  
  // 2. Calculate position if needed
  let position = data.position ?? 0
  if (position === undefined) {
    const siblings = await findChildFolders(data.parentId)
    position = siblings.success ? siblings.data!.length : 0
  }
  
  // 3. Map to database format
  const rowData = mapFolderDataToRow({ ...data, position })
  
  // 4. Execute database operation
  return create(TABLE_NAME, rowData, mapRowToFolder)
}

// ❌ Repository: Don't put business logic here
export async function createFolder(data: TCreateFolderData) {
  // ❌ Business validation doesn't belong here
  if (data.name.includes('admin')) {
    return { success: false, error: 'Cannot use admin in name' }
  }
  
  // ❌ Complex business rules don't belong here
  const userPermissions = await checkUserPermissions()
  if (!userPermissions.canCreateFolders) {
    return { success: false, error: 'No permission' }
  }
}
```

### 2. Service Layer
**Purpose:** Business logic, validation, coordination

```typescript
// ✅ Service: Business logic and validation
export async function createFolderWithValidation(
  data: TFolderCreationData
): Promise<TServiceResult<TFolderWithStats>> {
  
  // 1. Business validation
  const validation = validateFolderName(data.name)
  if (!validation.isValid) {
    return { success: false, error: validation.errors[0].message }
  }
  
  // 2. Business rules
  if (data.parentId) {
    const parent = await findFolderById(data.parentId)
    if (!parent.success || !parent.data) {
      return { success: false, error: 'Parent folder not found' }
    }
    
    // Check depth limit (business rule)
    const depth = await calculateFolderDepth(data.parentId)
    if (depth >= MAX_FOLDER_DEPTH) {
      return { success: false, error: 'Maximum folder depth exceeded' }
    }
  }
  
  // 3. Check for duplicates (business rule)
  const existing = await findFolderByName(data.name, data.parentId)
  if (existing.success && existing.data) {
    return { success: false, error: 'Folder name already exists' }
  }
  
  // 4. Call repository for data operation
  const result = await createFolder({
    name: data.name.trim(),
    parentId: data.parentId,
    position: data.position
  })
  
  // 5. Enhance with business data
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

// ❌ Service: Don't put UI logic here
export async function createFolderWithValidation(data: TFolderCreationData) {
  const result = await createFolder(data)
  
  // ❌ UI concerns don't belong in service
  if (result.success) {
    toast.success('Folder created!') // UI logic
    router.push('/folders') // Navigation logic
  }
  
  return result
}
```

### 3. Hook Layer
**Purpose:** State management, side effects, UI coordination

```typescript
// ✅ Hook: State management and UI coordination
export function useFolders(parentId?: number | null): UseFoldersReturn {
  const [folders, setFolders] = useState<TFolder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Data loading with proper state management
  const loadFolders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Call service layer
      const response = parentId 
        ? await getChildFolders(parentId)
        : await getRootFolders()

      if (response.success && response.data) {
        setFolders(response.data)
      } else {
        setError(response.error || 'Failed to load folders')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [parentId])

  // CRUD operations with UI feedback
  const createFolder = useCallback(async (input: TCreateFolderInput): Promise<TFolder | null> => {
    try {
      setError(null)
      
      // Call service layer
      const response = await createFolderWithValidation({
        name: input.name,
        parentId: input.parentId ?? undefined
      })

      if (response.success && response.data) {
        // Update local state optimistically
        if (input.parentId === parentId) {
          setFolders(prev => [...prev, response.data!])
        }
        
        // UI feedback (belongs in hook)
        toast.success('Folder created successfully')
        return response.data
      } else {
        setError(response.error || 'Failed to create folder')
        toast.error(response.error || 'Failed to create folder')
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    }
  }, [parentId])

  // Load data on mount
  useEffect(() => {
    loadFolders()
  }, [loadFolders])

  return {
    folders,
    loading,
    error,
    createFolder,
    refreshFolders: loadFolders
  }
}

// ❌ Hook: Don't put business logic here
export function useFolders() {
  const createFolder = useCallback(async (input: TCreateFolderInput) => {
    // ❌ Business validation doesn't belong in hook
    if (input.name.length > 50) {
      return { success: false, error: 'Name too long' }
    }
    
    // ❌ Complex business rules don't belong in hook
    const userRole = await getUserRole()
    if (userRole !== 'admin' && input.name.startsWith('system_')) {
      return { success: false, error: 'System folders require admin' }
    }
    
    // This should be in service layer instead
  }, [])
}
```

### 4. Context Layer
**Purpose:** Global state coordination, cross-component communication

```typescript
// ✅ Context: Coordinate multiple hooks and provide global state
export function FolderProvider({ children, parentId = null }: TFolderProviderProps) {
  const [searchFilter, setSearchFilter] = useState("")
  
  // Combine multiple hooks
  const folderHook = useFolders(parentId)
  const treeHook = useFolderTree(parentId)
  const operationsHook = useFolderOperations()

  // Coordinate operations across hooks
  const createFolderWithRefresh = useCallback(async (input: TCreateFolderInput) => {
    const result = await operationsHook.createFolder(input)
    if (result) {
      // Coordinate refreshes across multiple hooks
      await Promise.all([
        folderHook.refreshFolders(),
        treeHook.refreshTree()
      ])
    }
    return result
  }, [operationsHook, folderHook, treeHook])

  // Provide coordinated state
  const contextValue = {
    // Combined data
    folders: folderHook.folders,
    treeData: treeHook.treeData,
    loading: folderHook.loading || treeHook.loading,
    
    // Coordinated operations
    createFolder: createFolderWithRefresh,
    
    // Global UI state
    searchFilter,
    setSearchFilter
  }

  return (
    <FolderContext.Provider value={contextValue}>
      {children}
    </FolderContext.Provider>
  )
}

// ❌ Context: Don't put business logic here
export function FolderProvider({ children }: TFolderProviderProps) {
  const createFolder = useCallback(async (input: TCreateFolderInput) => {
    // ❌ Business validation doesn't belong in context
    if (!input.name.trim()) {
      return { success: false, error: 'Name required' }
    }
    
    // ❌ Database operations don't belong in context
    const result = await database.folders.create(input)
    
    // Context should coordinate hooks, not replace them
  }, [])
}
```

## When to Use Each Pattern

### **Direct Hook → Service**
Use when: Single component needs data, no global state required

```typescript
function FolderList() {
  const { folders, loading, createFolder } = useFolders()
  // Simple, direct usage
}
```

### **Context → Hook → Service**
Use when: Multiple components need coordinated state

```typescript
function App() {
  return (
    <FolderProvider>
      <FolderTree />      {/* Uses context */}
      <FolderForm />      {/* Uses context */}
      <FolderSearch />    {/* Uses context */}
    </FolderProvider>
  )
}
```

### **Query vs Mutation Patterns**

#### **Queries (Read Operations):**
```
Component → Hook → Service → Repository → Database
```

#### **Mutations (Write Operations):**
```
Component → Context → Hook → Service → Repository → Database
                ↓
            UI Updates & Coordination
```

## Decision Tree

```
Need data/operation?
├── Used by single component?
│   └── Hook → Service → Repository
├── Used by multiple components?
│   └── Context → Hook → Service → Repository
├── Simple CRUD operation?
│   └── Repository only
├── Business logic required?
│   └── Service → Repository
└── UI coordination needed?
    └── Context → Multiple Hooks
```

## Common Anti-Patterns

### ❌ **Skipping Layers**
```typescript
// ❌ Component directly calling repository
function Component() {
  const [folders, setFolders] = useState([])
  
  useEffect(() => {
    findRootFolders().then(setFolders) // Skip service layer
  }, [])
}
```

### ❌ **Wrong Layer Responsibilities**
```typescript
// ❌ Repository with business logic
async function createFolder(data) {
  if (data.name.includes('admin')) { // Business logic in repository
    return { error: 'Invalid name' }
  }
}

// ❌ Service with UI logic
async function createFolder(data) {
  const result = await repository.create(data)
  toast.success('Created!') // UI logic in service
  return result
}
```

### ❌ **Context Overuse**
```typescript
// ❌ Context for simple local state
function Component() {
  const { inputValue, setInputValue } = useFormContext() // Overkill
  // Should use local useState instead
}
```

## Real-World Examples from Your Codebase

### **Example 1: Simple Folder List (Hook → Service)**
```typescript
// Component needs folder data, no global state
function FolderSidebar() {
  const { folders, loading, error } = useFolders(null) // Hook

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <ul>
      {folders.map(folder => (
        <li key={folder.id}>{folder.name}</li>
      ))}
    </ul>
  )
}

// Hook calls service
function useFolders(parentId) {
  useEffect(() => {
    getRootFolders() // Service function
      .then(response => setFolders(response.data))
  }, [])
}

// Service calls repository
async function getRootFolders() {
  return await findRootFolders() // Repository function
}
```

### **Example 2: Complex Folder Management (Context → Hooks)**
```typescript
// Multiple components need coordinated folder state
function FolderManagementPage() {
  return (
    <FolderProvider parentId={null}>
      <div className="grid grid-cols-3 gap-4">
        <FolderTree />        {/* Needs tree state */}
        <FolderCreateForm />  {/* Needs create operation */}
        <FolderSearchBar />   {/* Needs search state */}
      </div>
    </FolderProvider>
  )
}

// Context coordinates multiple hooks
function FolderProvider({ children }) {
  const folderData = useFolders()      // Data hook
  const treeState = useFolderTree()    // UI state hook
  const operations = useFolderOps()    // Operations hook

  // Coordinate operations
  const createWithRefresh = async (input) => {
    const result = await operations.create(input)
    if (result) {
      await folderData.refresh()
      await treeState.refresh()
    }
    return result
  }

  return (
    <FolderContext.Provider value={{
      ...folderData,
      ...treeState,
      createFolder: createWithRefresh
    }}>
      {children}
    </FolderContext.Provider>
  )
}
```

### **Example 3: Business Logic in Service**
```typescript
// Service handles complex business rules
export async function createFolderWithValidation(data: TFolderCreationData) {
  // 1. Input validation
  if (!data.name?.trim()) {
    return { success: false, error: 'Folder name is required' }
  }

  // 2. Business rule: Check depth limit
  if (data.parentId) {
    const depth = await calculateFolderDepth(data.parentId)
    if (depth >= 10) {
      return { success: false, error: 'Maximum folder depth exceeded' }
    }
  }

  // 3. Business rule: Check for duplicates
  const existing = await findFolderByName(data.name, data.parentId)
  if (existing.success && existing.data) {
    return { success: false, error: 'Folder name already exists in this location' }
  }

  // 4. Business rule: Validate name format
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(data.name)) {
    return { success: false, error: 'Folder name contains invalid characters' }
  }

  // 5. Call repository for data operation
  const result = await createFolder({
    name: data.name.trim(),
    parentId: data.parentId,
    position: data.position
  })

  // 6. Add business metadata
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

## Quick Reference Guide

| I need to... | Use | Example |
|--------------|-----|---------|
| Display folder list in one component | Hook → Service | `useFolders()` |
| Manage folders across multiple components | Context → Hooks | `<FolderProvider>` |
| Add business validation | Service Layer | `createFolderWithValidation()` |
| Save data to database | Repository Layer | `createFolder()` |
| Handle form state | Local useState | `const [name, setName] = useState('')` |
| Share search state | Context | `const { searchFilter } = useFolderContext()` |
| Cache API responses | Hook with service | `useFolders()` with caching |
| Coordinate multiple operations | Context | Context with multiple hooks |

This layered architecture ensures clean separation of concerns, testability, and maintainability while providing clear guidelines for where each type of logic belongs.
