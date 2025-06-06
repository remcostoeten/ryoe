/**
 * Mutation layer types
 * All types use T prefix as requested
 */

export type TMutationResult<T> = {
  success: boolean
  data?: T
  error?: string
  code?: string
}

export type TMutationState = 'idle' | 'loading' | 'success' | 'error'

export type TMutationOptions<TData, TVariables, TError = Error> = {
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>
  onError?: (error: TError, variables: TVariables) => void | Promise<void>
  onSettled?: (
    data: TData | undefined, 
    error: TError | null, 
    variables: TVariables
  ) => void | Promise<void>
  onMutate?: (variables: TVariables) => void | Promise<void>
}

export type TOptimisticUpdate<T> = {
  queryKey: readonly unknown[]
  updater: (oldData: T | undefined) => T
}

export type TMutationContext = {
  previousData?: any
  optimisticUpdates?: TOptimisticUpdate<any>[]
}

// User mutation types
export type TRegisterUserVariables = {
  username: string
  preferences: {
    mdxStoragePath: string
    storageType: 'turso' | 'local'
    theme?: 'light' | 'dark' | 'system'
  }
}

export type TUpdateUserPreferencesVariables = {
  userId: number
  preferences: {
    mdxStoragePath?: string
    storageType?: 'turso' | 'local'
    theme?: 'light' | 'dark' | 'system'
    [key: string]: any
  }
}

export type TSwitchStorageTypeVariables = {
  storageType: 'turso' | 'local'
}

// Note mutation types
export type TCreateNoteVariables = {
  title: string
  content: string
  folderId?: number
  tags?: string[]
}

export type TUpdateNoteVariables = {
  id: number
  title?: string
  content?: string
  folderId?: number
  tags?: string[]
}

export type TDeleteNoteVariables = {
  id: number
}

export type TMoveNoteVariables = {
  id: number
  newFolderId: number | null
  newPosition?: number
}

export type TReorderNotesVariables = {
  folderId: number | null
  noteIds: number[]
}

export type TDuplicateNoteVariables = {
  id: number
}

// Folder mutation types
export type TCreateFolderVariables = {
  name: string
  parentId?: number
  description?: string
}

export type TUpdateFolderVariables = {
  id: number
  name?: string
  parentId?: number
  description?: string
}

export type TDeleteFolderVariables = {
  id: number
}

export type TMoveFolderVariables = {
  id: number
  newParentId: number | null
  newPosition?: number
}

export type TReorderFoldersVariables = {
  parentId: number | null
  folderIds: number[]
}
