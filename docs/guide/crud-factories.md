# CRUD Factories Guide

## 🏭 What are CRUD Factories?

CRUD factories automatically generate **90% of your data operations** with consistent patterns, types, and caching.

## 🎯 Basic Usage

### 1. Query Factory

Generates standard queries for any entity:

```typescript
import { createQueryFactory, createQueryHooks } from '@/api/factories/query-factory'

// Create factory
const noteQueries = createQueryFactory('notes', noteService)
const noteHooks = createQueryHooks(noteQueries)

// Auto-generated hooks:
noteHooks.useGetById(1)           // Get note by ID
noteHooks.useGetAll()             // Get all notes
noteHooks.useGetByParent(5)       // Get notes by folder ID
noteHooks.useSearch('react')      // Search notes
```

### 2. Mutation Factory

Generates standard mutations:

```typescript
import { createMutationFactory } from '@/api/factories/mutation-factory'

const noteMutations = createMutationFactory('notes', noteService, {
  onCreateSuccess: (note) => {
    console.log('Created:', note.title)
  }
})

// Auto-generated mutations:
const createMutation = noteMutations.create()
const updateMutation = noteMutations.update() 
const deleteMutation = noteMutations.delete()
```

### 3. Service Factory

Generates database operations:

```typescript
import { createCRUDService } from '@/api/factories/service-factory'

const noteService = createCRUDService<Note, CreateNoteData, UpdateNoteData>(
  'notes',
  db,
  {
    transform: {
      fromDb: (data) => ({
        ...data,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }),
      toDb: (data) => ({
        ...data,
        created_at: data.createdAt?.toISOString(),
        updated_at: data.updatedAt?.toISOString()
      })
    }
  }
)
```

## 🎨 Customization

### Adding Custom Queries

When you need custom logic beyond basic CRUD:

```typescript
// src/api/queries/notes/search-notes.ts
export const useSearchNotes = (query: string, filters?: SearchFilters) => {
  return useQuery({
    queryKey: ['notes', 'search', query, filters],
    queryFn: async () => {
      // Custom search with ranking, filters, etc.
      return await complexSearchWithRanking(query, filters)
    },
    enabled: query.length > 2
  })
}
```

### Custom Mutations

```typescript
// src/api/mutations/notes/duplicate-note.ts
export const useDuplicateNote = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (noteId: number) => {
      const original = await noteService.getById(noteId)
      return await noteService.create({
        title: `${original.title} (Copy)`,
        content: original.content,
        folderId: original.folderId
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    }
  })
}
```

## 🔧 Advanced Patterns

### Hierarchical Data

For entities with parent-child relationships:

```typescript
const folderService = createCRUDService<Folder, CreateFolderData, UpdateFolderData>(
  'folders',
  db,
  {
    hierarchical: true,
    parentField: 'parent_id'
  }
)

const folderQueries = createQueryFactory('folders', {
  ...folderService,
  getChildren: (parentId: number) => db.query(`
    SELECT * FROM folders WHERE parent_id = ?
  `, [parentId]),
  getAncestors: (id: number) => db.query(`
    WITH RECURSIVE folder_path AS (
      SELECT * FROM folders WHERE id = ?
      UNION ALL
      SELECT f.* FROM folders f
      JOIN folder_path fp ON f.id = fp.parent_id
    )
    SELECT * FROM folder_path
  `, [id])
})
```

### Soft Deletes

```typescript
const noteService = createCRUDService<Note, CreateNoteData, UpdateNoteData>(
  'notes',
  db,
  {
    softDelete: true,
    deletedField: 'deleted_at',
    transform: {
      fromDb: (data) => ({ ...data, isDeleted: !!data.deleted_at })
    }
  }
)
```

## ✅ Best Practices

1. **Use factories for 90% of operations**
2. **Create custom queries/mutations only when needed**
3. **Keep transformations in service layer**
4. **Use consistent naming patterns**
5. **Add proper TypeScript types**

## 🐛 Common Pitfalls

❌ **Don't bypass the factory for simple operations**
```typescript
// Bad
const { data } = useQuery(['notes', id], () => 
  fetch(`/api/notes/${id}`).then(r => r.json())
)

// Good  
const { data } = noteHooks.useGetById(id)
```

❌ **Don't put business logic in components**
```typescript
// Bad - in component
const handleCreateNote = async () => {
  const note = await createNote(data)
  toast.success('Note created!')
  navigate(`/notes/${note.id}`)
}

// Good - in mutation factory
const noteMutations = createMutationFactory('notes', noteService, {
  onCreateSuccess: (note) => {
    toast.success('Note created!')
    navigate(`/notes/${note.id}`)
  }
})
``` 