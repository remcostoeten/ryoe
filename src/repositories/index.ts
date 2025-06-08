/**
 * Repository layer exports
 * Centralized exports for all repository functions
 */

// Types
export type {
  TUser,
  TCreateUserData,
  TUpdateUserData,
  TNote,
  TCreateNoteData,
  TUpdateNoteData,
  TFolder,
  TCreateFolderData,
  TUpdateFolderData,
  TSnippet,
  TCreateSnippetData,
  TUpdateSnippetData,
  TRepositoryResult,
  TRepositoryListResult,
  TPaginationOptions,
  TSortOptions,
  TFilterOptions
} from './types'

// Base repository functions
export {
  findById,
  findMany,
  create,
  update,
  deleteById
} from './base-repository'

// User repository functions
export {
  findUserById,
  findUsers,
  findUserByName,
  findSetupCompleteUsers,
  createUser,
  updateUser,
  markUserSetupComplete,
  markAllUsersSetupComplete,
  deleteUser,
  getUserCount,
  getSetupCompleteUserCount
} from './user-repository'

// Note repository functions
export {
  findNoteById,
  findNotes,
  findNotesByFolderId,
  findNotesByTitle,
  searchNotes,
  createNote,
  updateNote,
  deleteNote,
  moveNote,
  reorderNotes,
  duplicateNote,
  toggleNoteFavorite,
  findFavoriteNotes
} from './note-repository'

// Folder repository functions
export {
  findFolderById,
  findFolders,
  findRootFolders,
  findChildFolders,
  findFoldersByName,
  createFolder,
  updateFolder,
  deleteFolder,
  moveFolder,
  reorderFolders,
  getFolderHierarchy,
  getFolderPath,
  toggleFolderFavorite,
  findFavoriteFolders
} from './folder-repository'
