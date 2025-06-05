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
