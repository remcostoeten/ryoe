import type { TServiceResult } from '@/types'

export interface TMutationOptions<TData = unknown, TError = Error> {
    onSuccess?: (data: TData) => void
    onError?: (error: TError) => void
    onSettled?: () => void
}

export interface TMutationContext<T = unknown> {
    previousData?: T
    optimisticData?: T
}

export interface TOptimisticUpdate<T = unknown> {
    data: T
    rollback: () => void
}

export interface TMutationState<TData = unknown, TError = Error> {
    isLoading: boolean
    isSuccess: boolean
    isError: boolean
    data?: TData
    error?: TError
}

export interface TMutationResult<TData = unknown, TError = Error> extends TMutationState<TData, TError> {
    mutate: (variables: unknown) => void
    reset: () => void
}

// User mutations
export interface TRegisterUserVariables {
    email: string
    password: string
    name: string
}

export interface TUpdateUserPreferencesVariables {
    theme?: 'light' | 'dark' | 'system'
    storageType?: 'local' | 'turso'
    mdxStoragePath?: string
}

export interface TSwitchStorageTypeVariables {
    type: 'local' | 'turso'
    path?: string
}

// Note mutations
export interface TCreateNoteVariables {
    title: string
    content: string
    folderId?: number | null
    position?: number
    isPublic?: boolean
}

export interface TUpdateNoteVariables {
    id: number
    title?: string
    content?: string
    folderId?: number | null
    position?: number
    isPublic?: boolean
    isFavorite?: boolean
}

export interface TDeleteNoteVariables {
    id: number
    force?: boolean
}

export interface TMoveNoteVariables {
    id: number
    folderId: number | null
}

export interface TReorderNotesVariables {
    folderId: number | null
    noteIds: number[]
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
    deleteChildren?: boolean
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