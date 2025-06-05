/**
 * Service layer exports
 * Centralized exports for all service functions
 */

// Types
export type {
  TServiceResult,
  TServiceListResult,
  TUserRegistrationData,
  TUserProfile,
  TUserPreferencesUpdate,
  TNoteCreationData,
  TNoteUpdateData,
  TNoteWithMetadata,
  TFolderCreationData,
  TFolderUpdateData,
  TFolderWithStats,
  TSearchOptions,
  TSearchResult,
  TExportOptions,
  TImportOptions,
  TBackupData
} from './types'

// User service functions
export {
  registerUser,
  getUserProfile,
  updateUserPreferences,
  checkOnboardingStatus,
  getCurrentUser,
  switchStorageType,
  getDefaultMdxPath
} from './user-service'

// Note service functions
export {
  createNoteWithValidation,
  updateNoteWithValidation,
  getNoteById,
  getNotesByFolder,
  deleteNoteById,
  moveNoteToFolder,
  reorderNotesInFolder,
  duplicateNoteById,
  searchNotesWithOptions
} from './note-service'

// Folder service functions
export {
  createFolderWithValidation,
  updateFolderWithValidation,
  getFolderById,
  getRootFolders,
  getChildFolders,
  deleteFolderById,
  moveFolderToParent,
  reorderFoldersInParent,
  getFolderHierarchyWithStats,
  getFolderPathWithStats
} from './folder-service'
