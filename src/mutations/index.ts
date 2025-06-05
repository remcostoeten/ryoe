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
