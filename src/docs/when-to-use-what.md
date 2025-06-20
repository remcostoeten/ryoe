# When to Use What: Practical Decision Guide

This guide provides specific scenarios and clear decisions for choosing the right architectural pattern.

## Decision Flowchart

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           I need to...                                     │
└─────────────────────────┬───────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Is it data-related?                                      │
├─────────────────────────┬───────────────────────────────────────────────────┤
│         YES             │                    NO                             │
│         │               │                    │                             │
│         ▼               │                    ▼                             │
│ ┌─────────────────────┐ │          ┌─────────────────────┐                 │
│ │ Multiple components │ │          │ Use local useState  │                 │
│ │ need this data?     │ │          │ or useReducer       │                 │
│ └─────────┬───────────┘ │          └─────────────────────┘                 │
│           │             │                                                  │
│    ┌──────▼──────┐      │                                                  │
│    │    YES      │      │                                                  │
│    │      │      │      │                                                  │
│    │      ▼      │      │                                                  │
│    │  CONTEXT    │      │                                                  │
│    └─────────────┘      │                                                  │
│           │             │                                                  │
│    ┌──────▼──────┐      │                                                  │
│    │     NO      │      │                                                  │
│    │      │      │      │                                                  │
│    │      ▼      │      │                                                  │
│    │    HOOK     │      │                                                  │
│    └─────────────┘      │                                                  │
└─────────────────────────┴───────────────────────────────────────────────────┘
```

## Scenario-Based Decisions

### **Scenario 1: Simple Form Input**

```typescript
// ✅ Use: Local useState
function CreateFolderForm() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  return (
    <form>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
    </form>
  )
}

// ❌ Don't use: Context for simple form state
// This is overkill for component-local state
```

### **Scenario 2: Folder List in Sidebar**

```typescript
// ✅ Use: Hook → Service → Repository
function FolderSidebar() {
  const { folders, loading, error } = useFolders()

  // Single component, reusable logic, data fetching
  // Perfect use case for a custom hook
}

// Hook implementation
function useFolders() {
  const [folders, setFolders] = useState([])

  useEffect(() => {
    getRootFolders() // Service call
      .then(response => setFolders(response.data))
  }, [])

  return { folders, loading, error }
}
```

### **Scenario 3: Folder Management Dashboard**

```typescript
// ✅ Use: Context → Multiple Hooks
function FolderDashboard() {
  return (
    <FolderProvider>
      <div className="grid grid-cols-3">
        <FolderTree />        {/* Needs tree state + operations */}
        <FolderDetails />     {/* Needs selected folder */}
        <FolderActions />     {/* Needs CRUD operations */}
      </div>
    </FolderProvider>
  )
}

// Multiple components need coordinated state
// Context coordinates multiple hooks
```

### **Scenario 4: User Authentication**

```typescript
// ✅ Use: Context (Global State)
function App() {
  return (
    <UserProvider>
      <Router>
        <Header />     {/* Needs user info */}
        <Sidebar />    {/* Needs user permissions */}
        <MainContent /> {/* Needs user preferences */}
      </Router>
    </UserProvider>
  )
}

// Global state needed across entire app
// Perfect use case for context
```

### **Scenario 5: API Data Fetching**

```typescript
// ✅ Use: Hook → Service
function useNotes(folderId: number) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getNotesByFolder(folderId) // Service call
      .then(response => {
        setNotes(response.data)
        setLoading(false)
      })
  }, [folderId])

  return { notes, loading }
}

// Reusable data fetching logic
// Can be used in multiple components
```

## Layer Decision Matrix

| Need                | Repository | Service | Hook | Context |
| ------------------- | ---------- | ------- | ---- | ------- |
| Save to database    | ✅         | ❌      | ❌   | ❌      |
| Business validation | ❌         | ✅      | ❌   | ❌      |
| Component state     | ❌         | ❌      | ✅   | ❌      |
| Global state        | ❌         | ❌      | ❌   | ✅      |
| Data transformation | ❌         | ✅      | ❌   | ❌      |
| UI coordination     | ❌         | ❌      | ✅   | ✅      |
| Error handling      | ✅         | ✅      | ✅   | ✅      |
| Caching             | ❌         | ❌      | ✅   | ✅      |

## Common Patterns in Your Codebase

### **Pattern 1: Simple Data Display**

```typescript
// Component → Hook → Service → Repository
function NoteList({ folderId }: { folderId: number }) {
  const { notes, loading } = useNotes(folderId)

  return (
    <div>
      {loading ? <Spinner /> : notes.map(note => <NoteItem key={note.id} note={note} />)}
    </div>
  )
}
```

### **Pattern 2: Complex State Management**

```typescript
// Component → Context → Hook → Service → Repository
function NotesApp() {
  return (
    <NotesProvider>
      <div className="app">
        <NotesSidebar />   {/* Uses context */}
        <NotesEditor />    {/* Uses context */}
        <NotesToolbar />   {/* Uses context */}
      </div>
    </NotesProvider>
  )
}
```

### **Pattern 3: Business Operations**

```typescript
// Hook → Service (with business logic) → Repository
function useNoteOperations() {
  const createNote = async (data: CreateNoteInput) => {
    // Hook handles UI concerns
    setLoading(true)

    try {
      // Service handles business logic
      const result = await createNoteWithValidation(data)

      if (result.success) {
        toast.success('Note created!')
        return result.data
      } else {
        toast.error(result.error)
        return null
      }
    } finally {
      setLoading(false)
    }
  }

  return { createNote }
}
```

## When NOT to Use Each Pattern

### **❌ Don't Use Context When:**

- Only one component needs the data
- State changes frequently (performance issues)
- Simple form inputs
- Temporary UI state (modals, dropdowns)

```typescript
// ❌ Bad: Context for simple toggle
const ModalContext = createContext()

function Modal() {
  const { isOpen, setIsOpen } = useContext(ModalContext)
  // Just use local useState instead
}

// ✅ Good: Local state for simple toggle
function Modal() {
  const [isOpen, setIsOpen] = useState(false)
}
```

### **❌ Don't Use Hooks When:**

- Logic is only used once
- No state or side effects needed
- Simple calculations

```typescript
// ❌ Bad: Hook for simple calculation
function useCalculateTotal(items: Item[]) {
  return items.reduce((sum, item) => sum + item.price, 0)
}

// ✅ Good: Simple function
function calculateTotal(items: Item[]) {
  return items.reduce((sum, item) => sum + item.price, 0)
}
```

### **❌ Don't Use Services When:**

- Simple CRUD with no business logic
- Pure data transformation
- UI-specific logic

```typescript
// ❌ Bad: Service for simple data fetch
async function getUserById(id: number) {
  return await findUserById(id) // Just call repository directly
}

// ✅ Good: Service with business logic
async function getUserWithPermissions(id: number) {
  const user = await findUserById(id)
  if (!user.success) return user

  const permissions = await getUserPermissions(id)
  return {
    ...user,
    data: { ...user.data, permissions: permissions.data },
  }
}
```

## Quick Decision Checklist

**Before creating a new hook, ask:**

- [ ] Is this logic reused in multiple components?
- [ ] Does it manage state or side effects?
- [ ] Is it more than a simple calculation?

**Before creating a context, ask:**

- [ ] Do multiple components need this state?
- [ ] Is the state global or semi-global?
- [ ] Do components need to coordinate operations?

**Before creating a service, ask:**

- [ ] Is there business logic beyond simple CRUD?
- [ ] Do I need validation or complex rules?
- [ ] Am I coordinating multiple repositories?

**Before creating a repository function, ask:**

- [ ] Is this a pure data operation?
- [ ] Am I just mapping between database and app types?
- [ ] Is there no business logic involved?

This guide should help you make quick, consistent decisions about which architectural pattern to use in any given situation.
