// Basic mutation types
export type TMutationResult<T = any> = {
    data?: T
    error?: Error
}

export type TMutationState = 'idle' | 'loading' | 'success' | 'error'

export type TOptimisticUpdate<T = any> = (oldData: T) => T

export type TMutationContext = {
    previousData?: any
    meta?: Record<string, any>
}

// Re-export from services for consistency
export type {
    TServiceResult,
    TMoveNoteVariables,
    TMoveFolderVariables,
    TNoteCreationData as TCreateNoteVariables,
    TNoteUpdateData as TUpdateNoteVariables,
    TFolderCreationData as TCreateFolderVariables,
    TFolderUpdateData as TUpdateFolderVariables,
    TUserRegistrationData as TRegisterUserVariables,
    TUserPreferencesUpdate as TUpdateUserPreferencesVariables,
} from '@/types'

// Storage switch variables
export type TSwitchStorageTypeVariables = {
    newStorageType: 'local' | 'turso'
    migrationOptions?: {
        preserveData: boolean
        deleteOldData: boolean
    }
}

export type TDeleteNoteVariables = {
    noteId: number
}

export type TDeleteFolderVariables = {
    folderId: number
}

export type TReorderNotesVariables = {
    notes: Array<{ id: number; position: number }>
    folderId?: number | null
}

export type TReorderFoldersVariables = {
    folders: Array<{ id: number; position: number }>
    parentId?: number | null
}

// Mutation Options Type
export interface TMutationOptions<TData = unknown, TError = Error, TVariables = void> {
    onSuccess?: (data: TData, variables: TVariables) => void
    onError?: (error: TError, variables: TVariables) => void
    onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables) => void
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

// Reorder variables
export interface TReorderVariables {
    items: Array<{ id: number; position: number }>
    parentId?: number | null
}

// Toggle favorite variables
export interface TToggleFavoriteVariables {
    id: number
    type: 'note' | 'folder'
}

// Export success response types
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