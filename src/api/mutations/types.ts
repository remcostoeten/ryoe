// import type { TServiceResult } from '@/types' // Unused import removed

// Basic mutation types
export type TMutationResult<T = any> = {
    data?: T
    error?: Error
}

export type TMutationState = 'idle' | 'loading' | 'success' | 'error'

export type TOptimisticUpdate<T = any> = (oldData: T) => T

export interface TMutationOptions<TData = unknown, TError = Error, TVariables = void> {
    onSuccess?: (data: TData, variables: TVariables) => void
    onError?: (error: TError, variables: TVariables) => void
    onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables) => void
    onMutate?: (variables: TVariables) => void
}

export interface TMutationContext<T = unknown> {
    previousData?: T
    optimisticData?: T
    meta?: Record<string, any>
}

// Re-export from services for consistency
export type {
    TServiceResult,
    TNoteCreationData as TCreateNoteVariables,
    TNoteUpdateData as TUpdateNoteVariables,
} from '@/types'

// User mutations
export interface TRegisterUserVariables {
    email: string
    password: string
    name: string
}

export interface TUpdateUserPreferencesVariables {
    userId: number
    preferences: {
        theme?: 'light' | 'dark' | 'system'
        storageType?: 'local' | 'turso'
        mdxStoragePath?: string
    }
}

export interface TSwitchStorageTypeVariables {
    storageType: 'local' | 'turso'
    migrationOptions?: {
        preserveData: boolean
        deleteOldData: boolean
    }
}

// Note mutations
export interface TDeleteNoteVariables {
    id: number
    force?: boolean
}

// Folder mutations
export interface TCreateFolderVariables {
    name: string
    parentId?: number | null
    position?: number
    isPublic?: boolean
}

export interface TUpdateFolderVariables {
    id: number
    name?: string
    parentId?: number | null
    position?: number
    isPublic?: boolean
    isFavorite?: boolean
}

export interface TDeleteFolderVariables {
    id: number
    force?: boolean
}

export interface TMoveFolderVariables {
    id: number
    parentId: number | null
}

export interface TReorderFoldersVariables {
    parentId: number | null
    folderIds: number[]
}

export interface TReorderNotesVariables {
    folderId: number | null
    noteIds: number[]
}

// Database reset variables
export interface TDatabaseResetVariables {
    resetType: 'soft' | 'hard'
    preserveUsers?: boolean
    preserveSettings?: boolean
}

// Bulk operations
export interface TBulkDeleteVariables {
    ids: number[]
    type: 'notes' | 'folders'
}

export interface TBulkMoveVariables {
    ids: number[]
    targetFolderId: number | null
    type: 'notes' | 'folders'
}

// Toggle favorite variables
export interface TToggleFavoriteVariables {
    id: number
    type: 'note' | 'folder'
}

// Export success/error response types
export interface TMutationSuccessResponse<T = any> {
    success: true
    data: T
    message?: string
}

export interface TMutationErrorResponse {
    success: false
    error: string
    code?: string
    details?: any
} 