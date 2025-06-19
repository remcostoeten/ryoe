/**
 * User queries - React Query hooks for user operations
 * Pure functions only, no classes
 */

import { useQuery } from '@tanstack/react-query'
import { 
  getUserProfile, 
  getCurrentUser, 
  checkOnboardingStatus 
} from '@/services/user-service'
import { QUERY_KEYS, CACHE_TIMES, STALE_TIMES } from './types'
import type { TQueryOptions } from './types'
import type { TUserProfile } from '@/domain/entities/workspace'

export function useUserProfile(
  id: number, 
  options?: TQueryOptions<TUserProfile>
) {
  return useQuery({
    queryKey: QUERY_KEYS.USER_PROFILE(id),
    queryFn: async () => {
      const result = await getUserProfile(id)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch user profile')
      }
      return result.data!
    },
    enabled: !!id && (options?.enabled !== false),
    staleTime: options?.staleTime ?? STALE_TIMES.MEDIUM,
    gcTime: options?.cacheTime ?? CACHE_TIMES.LONG,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: options?.refetchOnMount ?? true,
    retry: options?.retry ?? 3,
  })
}

export function useCurrentUser(options?: TQueryOptions<TUserProfile>) {
  return useQuery({
    queryKey: QUERY_KEYS.CURRENT_USER,
    queryFn: async () => {
      const result = await getCurrentUser()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch current user')
      }
      return result.data!
    },
    enabled: options?.enabled !== false,
    staleTime: options?.staleTime ?? STALE_TIMES.MEDIUM,
    gcTime: options?.cacheTime ?? CACHE_TIMES.LONG,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: options?.refetchOnMount ?? true,
    retry: options?.retry ?? 3,
  })
}

export function useOnboardingStatus(options?: TQueryOptions<boolean>) {
  return useQuery({
    queryKey: QUERY_KEYS.ONBOARDING_STATUS,
    queryFn: async () => {
      const result = await checkOnboardingStatus()
      if (!result.success) {
        throw new Error(result.error || 'Failed to check onboarding status')
      }
      return result.data!
    },
    enabled: options?.enabled !== false,
    staleTime: options?.staleTime ?? STALE_TIMES.LONG,
    gcTime: options?.cacheTime ?? CACHE_TIMES.VERY_LONG,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: options?.refetchOnMount ?? true,
    retry: options?.retry ?? 3,
  })
}

export function prefetchUserProfile(queryClient: any, id: number) {
  return queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.USER_PROFILE(id),
    queryFn: async () => {
      const result = await getUserProfile(id)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch user profile')
      }
      return result.data!
    },
    staleTime: STALE_TIMES.MEDIUM,
  })
}

export function prefetchCurrentUser(queryClient: any) {
  return queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.CURRENT_USER,
    queryFn: async () => {
      const result = await getCurrentUser()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch current user')
      }
      return result.data!
    },
    staleTime: STALE_TIMES.MEDIUM,
  })
}

// Utility functions for cache management
export function invalidateUserQueries(queryClient: any, userId?: number) {
  if (userId) {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PROFILE(userId) })
  }
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CURRENT_USER })
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER })
}

export function setUserProfileCache(queryClient: any, userId: number, data: TUserProfile) {
  queryClient.setQueryData(QUERY_KEYS.USER_PROFILE(userId), data)
}

export function setCurrentUserCache(queryClient: any, data: TUserProfile) {
  queryClient.setQueryData(QUERY_KEYS.CURRENT_USER, data)
}

export function getUserProfileFromCache(queryClient: any, userId: number): TUserProfile | undefined {
  return queryClient.getQueryData(QUERY_KEYS.USER_PROFILE(userId))
}

export function getCurrentUserFromCache(queryClient: any): TUserProfile | undefined {
  return queryClient.getQueryData(QUERY_KEYS.CURRENT_USER)
}
