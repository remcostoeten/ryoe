# Ryoe Architecture Guide

## 🎯 Overview

Welcome to the new **scalable, factory-driven architecture** for Ryoe! This guide will help you understand how to work with our new system.

## 🏗️ Architecture Principles

### 1. **Separation of Concerns**

- **API Layer** (`src/api/`) - All data operations
- **Modules** (`src/modules/`) - Feature-specific UI and logic
- **Shared** (`src/components/`, `src/hooks/`) - Reusable components

### 2. **Factory-Driven CRUD**

- 90% less boilerplate with CRUD factories
- Consistent patterns across all entities
- Type-safe with full TypeScript support

### 3. **Modular Organization**

src/api/queries/notes/
├── get-note-by-id.ts # Generated via factory
├── get-notes-by-folder.ts # Generated via factory
├── search-notes.ts # Custom implementation
└── get-recent-notes.ts # Custom implementation

````

## 🚀 Quick Start

### Creating a New Entity

1. **Define types**:
```typescript
// src/api/types/index.ts
export interface Note {
  id: number
  title: string
  content: string
  folderId: number | null
}

export interface CreateNoteData {
  title: string
  content: string
  folderId: number | null
}

export interface UpdateNoteData {
  title?: string
  content?: string
  folderId?: number | null
}
````

2. **Create service**:

```typescript
// src/api/services/note-service.ts
import { createCRUDService } from '@/api/factories/service-factory'

export const noteService = createCRUDService<
  Note,
  CreateNoteData,
  UpdateNoteData
>('notes', db)
```

3. **Generate queries and mutations**:

```typescript
// src/api/queries/notes/index.ts
import {
  createQueryFactory,
  createQueryHooks,
} from '@/api/factories/query-factory'
import { noteService } from '@/api/services/note-service'

export const noteQueries = createQueryFactory('notes', noteService)
export const noteHooks = createQueryHooks(noteQueries)
```

4. **Use in modules**:

```typescript
// src/modules/notes/hooks/use-notes.ts
import { noteHooks } from '@/api/queries/notes'

export function useNotes(folderId: number) {
  return noteHooks.useGetByParent(folderId)
}
```

## 📚 Guides

- [**CRUD Factories**](./crud-factories.md) - How to use and extend factories
- [**Queries & Hooks**](./queries-and-hooks.md) - Query patterns and React hooks
- [**Mutations**](./mutations.md) - Data modification patterns
- [**Services**](./services.md) - Business logic layer
- [**Modules**](./modules.md) - Feature organization
- [**Examples**](./examples.md) - Real-world usage examples

## 🛠️ Migration Status

See [Implementation Roadmap](../implementation/roadmap.md) for current migration progress.
