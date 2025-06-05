/**
 * Query layer exports
 * Centralized exports for all query hooks and utilities
 */

// Types
export type {
  TQueryKey,
  TQueryOptions,
  TMutationOptions,
  TInvalidateOptions
} from './types'

export {
  QUERY_KEYS,
  CACHE_TIMES,
  STALE_TIMES
} from './types'

// User query hooks
export {
  useUserProfile,
  useCurrentUser,
  useOnboardingStatus,
  prefetchUserProfile,
  prefetchCurrentUser,
  invalidateUserQueries,
  setUserProfileCache,
  setCurrentUserCache,
  getUserProfileFromCache,
  getCurrentUserFromCache
} from './user-queries'

// Note query hooks
export {
  useNote,
  useNotesByFolder,
  useSearchNotes,
  prefetchNote,
  prefetchNotesByFolder,
  invalidateNoteQueries,
  setNoteCache,
  setNotesByFolderCache,
  getNoteFromCache,
  getNotesByFolderFromCache,
  updateNoteInFolderCache,
  addNoteToFolderCache,
  removeNoteFromFolderCache,
  moveNoteBetweenFoldersCache
} from './note-queries'

// Folder query hooks
export {
  useFolder,
  useRootFolders,
  useChildFolders,
  useFolderHierarchy,
  useFolderPath,
  prefetchFolder,
  prefetchRootFolders,
  prefetchChildFolders,
  invalidateFolderQueries,
  setFolderCache,
  setRootFoldersCache,
  setChildFoldersCache,
  getFolderFromCache,
  getRootFoldersFromCache,
  getChildFoldersFromCache,
  updateFolderInParentCache,
  addFolderToParentCache,
  removeFolderFromParentCache,
  moveFolderBetweenParentsCache
} from './folder-queries'
