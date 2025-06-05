/**
 * Mutation layer exports
 * Centralized exports for all mutation hooks and utilities
 */

// Types
export type {
  TMutationResult,
  TMutationState,
  TMutationOptions,
  TOptimisticUpdate,
  TMutationContext,
  TRegisterUserVariables,
  TUpdateUserPreferencesVariables,
  TSwitchStorageTypeVariables,
  TCreateNoteVariables,
  TUpdateNoteVariables,
  TDeleteNoteVariables,
  TMoveNoteVariables,
  TReorderNotesVariables,
  TDuplicateNoteVariables,
  TCreateFolderVariables,
  TUpdateFolderVariables,
  TDeleteFolderVariables,
  TMoveFolderVariables,
  TReorderFoldersVariables
} from './types'

// User mutation hooks
export {
  useRegisterUser,
  useUpdateUserPreferences,
  useSwitchStorageType,
  createOptimisticUserUpdate,
  handleUserMutationError,
  handleUserMutationSuccess
} from './user-mutations'

// Note mutation hooks
export {
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  useMoveNote,
  useDuplicateNote,
  useReorderNotes
} from './note-mutations'

// Folder mutation hooks
export {
  useCreateFolder,
  useUpdateFolder,
  useDeleteFolder,
  useMoveFolder,
  useReorderFolders
} from './folder-mutations'
