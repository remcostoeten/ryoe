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

// Database reset types
export type {
  TDatabaseResetResult
} from './database-reset-service'

// User service functions
export {
  registerUser,
  getUserProfile,
  updateUserPreferences,
  checkOnboardingStatus,
  getCurrentUser,
  switchStorageType,
  getDefaultMdxPath,
  fixExistingUsersSetupStatus
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
  searchNotesWithOptions,
  toggleNoteFavoriteStatus,
  getFavoriteNotesWithMetadata
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
  getFolderPathWithStats,
  toggleFolderFavoriteStatus,
  getFavoriteFoldersWithStats
} from './folder-service'

// Database reset service functions
export {
  resetAllData,
  hardResetDatabase,
  validateReset
} from './database-reset-service'
