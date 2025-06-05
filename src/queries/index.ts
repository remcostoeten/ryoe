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
