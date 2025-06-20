// Repository types
export interface TRepositoryResult<T> {
    success: boolean
    data?: T
    error?: string
    code?: string
}

export interface TRepositoryListResult<T> {
    success: boolean
    data?: T[]
    error?: string
    total: number
    hasMore: boolean
    page?: number
    limit?: number
}

// Re-export domain entity types for repositories
export type {
    TFolder,
    TNote,
    TUserProfile as TUser,
    TCreateFolderData,
    TUpdateFolderData,
    TCreateNoteData,
    TNoteCreationData,
    TNoteUpdateData,
    TCreateUserData,
    TUpdateUserData,
} from '@/domain/entities/workspace'

// Additional repository-specific types
export interface TSnippet {
    id: number
    title: string
    content: string
    language: string
    tags?: string[]
    isPublic: boolean
    createdAt: Date
    updatedAt: Date
}

export interface TCreateSnippetData {
    title: string
    content: string
    language: string
    tags?: string[]
    isPublic?: boolean
}

export interface TUpdateSnippetData {
    title?: string
    content?: string
    language?: string
    tags?: string[]
    isPublic?: boolean
}

// Pagination types
export interface TPaginationOptions {
    page?: number
    limit?: number
    offset?: number
}

export interface TSortOptions {
    field: string
    direction: 'asc' | 'desc'
}

export interface TFilterOptions {
    [key: string]: string | number | boolean | null | undefined
}

// Query options for repositories
export interface TRepositoryQueryOptions {
    pagination?: TPaginationOptions
    sort?: TSortOptions
    filters?: TFilterOptions
}

// Database entity base types
export interface TDatabaseEntity {
    id: number
    createdAt: Date
    updatedAt: Date
}

// Repository operation types
export type TRepositoryOperation = 'create' | 'read' | 'update' | 'delete' | 'list'

export interface TRepositoryError {
    operation: TRepositoryOperation
    entityType: string
    entityId?: number | string
    error: string
    code?: string
    details?: Record<string, unknown>
}

// Export commonly used utilities
export type TRepositoryCallback<T> = (result: TRepositoryResult<T>) => void
export type TRepositoryAsyncCallback<T> = (result: TRepositoryResult<T>) => Promise<void> 