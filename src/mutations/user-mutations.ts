/**
 * User mutations - React Query mutations for user operations
 * Pure functions only, no classes
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  registerUser, 
  updateUserPreferences, 
  switchStorageType 
} from '@/services/user-service'
import { QUERY_KEYS } from '@/queries/types'
import { 
  invalidateUserQueries, 
  setCurrentUserCache, 
  setUserProfileCache 
} from '@/queries/user-queries'
import type { 
  TMutationOptions,
  TRegisterUserVariables,
  TUpdateUserPreferencesVariables,
  TSwitchStorageTypeVariables
} from './types'
import type { TUserProfile } from '@/services/types'

export function useRegisterUser(
  options?: TMutationOptions<TUserProfile, TRegisterUserVariables>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: TRegisterUserVariables) => {
      const result = await registerUser(variables)
      if (!result.success) {
        throw new Error(result.error || 'Failed to register user')
      }
      return result.data!
    },
    onSuccess: (data, variables) => {
      // Update cache with new user data
      setCurrentUserCache(queryClient, data)
      setUserProfileCache(queryClient, data.id, data)
      
      // Mark onboarding as complete
      queryClient.setQueryData(QUERY_KEYS.ONBOARDING_STATUS, true)
      
      // Call custom success handler
      options?.onSuccess?.(data, variables)
    },
    onError: (error, variables) => {
      console.error('Failed to register user:', error)
      options?.onError?.(error, variables)
    },
    onSettled: (data, error, variables) => {
      options?.onSettled?.(data, error, variables)
    },
    onMutate: (variables) => {
      options?.onMutate?.(variables)
    }
  })
}

export function useUpdateUserPreferences(
  options?: TMutationOptions<TUserProfile, TUpdateUserPreferencesVariables>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: TUpdateUserPreferencesVariables) => {
      const result = await updateUserPreferences(variables.userId, variables.preferences)
      if (!result.success) {
        throw new Error(result.error || 'Failed to update user preferences')
      }
      return result.data!
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.USER_PROFILE(variables.userId) })
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.CURRENT_USER })

      // Snapshot previous values
      const previousUserProfile = queryClient.getQueryData(QUERY_KEYS.USER_PROFILE(variables.userId))
      const previousCurrentUser = queryClient.getQueryData(QUERY_KEYS.CURRENT_USER)

      // Optimistically update cache
      if (previousUserProfile) {
        const optimisticUpdate = {
          ...previousUserProfile as TUserProfile,
          preferences: {
            ...(previousUserProfile as TUserProfile).preferences,
            ...variables.preferences
          }
        }
        setUserProfileCache(queryClient, variables.userId, optimisticUpdate)
        setCurrentUserCache(queryClient, optimisticUpdate)
      }

      // Call custom mutate handler
      options?.onMutate?.(variables)

      // Return context for rollback
      return { previousUserProfile, previousCurrentUser }
    },
    onError: (error, variables, context) => {
      // Rollback optimistic updates
      if (context?.previousUserProfile) {
        queryClient.setQueryData(
          QUERY_KEYS.USER_PROFILE(variables.userId), 
          context.previousUserProfile
        )
      }
      if (context?.previousCurrentUser) {
        queryClient.setQueryData(QUERY_KEYS.CURRENT_USER, context.previousCurrentUser)
      }

      console.error('Failed to update user preferences:', error)
      options?.onError?.(error, variables)
    },
    onSuccess: (data, variables) => {
      // Update cache with server response
      setUserProfileCache(queryClient, variables.userId, data)
      setCurrentUserCache(queryClient, data)
      
      options?.onSuccess?.(data, variables)
    },
    onSettled: (data, error, variables) => {
      // Invalidate queries to ensure consistency
      invalidateUserQueries(queryClient, variables.userId)
      
      options?.onSettled?.(data, error, variables)
    }
  })
}

export function useSwitchStorageType(
  options?: TMutationOptions<TUserProfile, TSwitchStorageTypeVariables>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: TSwitchStorageTypeVariables) => {
      const result = await switchStorageType(variables.storageType)
      if (!result.success) {
        throw new Error(result.error || 'Failed to switch storage type')
      }
      return result.data!
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.CURRENT_USER })

      // Snapshot previous value
      const previousCurrentUser = queryClient.getQueryData(QUERY_KEYS.CURRENT_USER)

      // Optimistically update cache
      if (previousCurrentUser) {
        const optimisticUpdate = {
          ...previousCurrentUser as TUserProfile,
          storageType: variables.storageType,
          preferences: {
            ...(previousCurrentUser as TUserProfile).preferences,
            storageType: variables.storageType
          }
        }
        setCurrentUserCache(queryClient, optimisticUpdate)
      }

      options?.onMutate?.(variables)

      return { previousCurrentUser }
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousCurrentUser) {
        queryClient.setQueryData(QUERY_KEYS.CURRENT_USER, context.previousCurrentUser)
      }

      console.error('Failed to switch storage type:', error)
      options?.onError?.(error, variables)
    },
    onSuccess: (data, variables) => {
      // Update cache with server response
      setCurrentUserCache(queryClient, data)
      setUserProfileCache(queryClient, data.id, data)
      
      options?.onSuccess?.(data, variables)
    },
    onSettled: (data, error, variables) => {
      // Invalidate queries to ensure consistency
      invalidateUserQueries(queryClient, data?.id)
      
      options?.onSettled?.(data, error, variables)
    }
  })
}

// Utility functions for common mutation patterns
export function createOptimisticUserUpdate(
  currentUser: TUserProfile,
  updates: Partial<TUserProfile>
): TUserProfile {
  return {
    ...currentUser,
    ...updates,
    preferences: {
      ...currentUser.preferences,
      ...(updates.preferences || {})
    }
  }
}

export function handleUserMutationError(error: Error, operation: string) {
  console.error(`User ${operation} failed:`, error)
  
  // You could add toast notifications, error tracking, etc. here
  // For now, just log the error
}

export function handleUserMutationSuccess(data: TUserProfile, operation: string) {
  console.log(`User ${operation} successful:`, data.name)
  
  // You could add success notifications, analytics, etc. here
}
