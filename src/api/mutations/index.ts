/**
 * Mutation layer exports
 * Centralized exports for all mutation hooks and utilities
 */

// Types
export type {
    TMutationOptions,
    TMutationContext,
    TOptimisticUpdate,
    TMutationState,
    TMutationResult,
    TSwitchStorageTypeVariables,
    TCreateNoteVariables,
    TUpdateNoteVariables,
    TDeleteNoteVariables,
    TReorderNotesVariables,
    TDeleteFolderVariables,
    TReorderFoldersVariables,
} from './types'

// Note mutation hooks
export {
    useCreateNote,
    useUpdateNote,
    useDeleteNote,
    useMoveNote,
    useDuplicateNote,
    useReorderNotes,
} from './note-mutations'

// Folder mutation hooks
export {
    useCreateFolder,
    useUpdateFolder,
    useDeleteFolder,
    useMoveFolder,
    useReorderFolders,
} from './folder-mutations'

// Database reset mutation hooks
export {
    useResetAllData,
    useHardResetDatabase,
    useValidateReset,
    useResetAndReload,
} from './database-reset-mutations' 