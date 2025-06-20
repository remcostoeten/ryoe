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
	TRegisterUserVariables,
	TUpdateUserPreferencesVariables,
	TSwitchStorageTypeVariables,
	TCreateNoteVariables,
	TUpdateNoteVariables,
	TDeleteNoteVariables,
	TMoveNoteVariables,
	TReorderNotesVariables,
	TCreateFolderVariables,
	TUpdateFolderVariables,
	TDeleteFolderVariables,
	TMoveFolderVariables,
	TReorderFoldersVariables,
} from '@/api/mutations/types'

// User mutation hooks
export {
	useRegisterUser,
	useUpdateUserPreferences,
	useSwitchStorageType,
} from '@/api/mutations/user-mutations'

// Note mutation hooks
export {
	useCreateNote,
	useUpdateNote,
	useDeleteNote,
	useMoveNote,
	useDuplicateNote,
	useReorderNotes,
} from '@/api/mutations/note-mutations'

// Folder mutation hooks
export {
	useCreateFolder,
	useUpdateFolder,
	useDeleteFolder,
	useMoveFolder,
	useReorderFolders,
} from '@/api/mutations/folder-mutations'

// Database reset mutation hooks
export {
	useResetAllData,
	useHardResetDatabase,
	useValidateReset,
	useResetAndReload,
} from '@/api/mutations/database-reset-mutations'
