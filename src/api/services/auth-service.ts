import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCurrentUserQuery, getUserProfileQuery, checkOnboardingStatusQuery } from '@/api/queries/auth'
import { registerUserMutation, updateUserPreferencesMutation, switchStorageTypeMutation } from '@/api/mutations/auth'
import type { TUserRegistrationData, TUserPreferencesUpdate, TUserProfile } from '@/services/types'

// Query Keys
export const AUTH_QUERY_KEYS = {
    CURRENT_USER: ['auth', 'current-user'] as const,
    USER_PROFILE: (id: number) => ['auth', 'user-profile', id] as const,
    ONBOARDING_STATUS: ['auth', 'onboarding-status'] as const,
} as const

// Query Hooks
export function useCurrentUser(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: AUTH_QUERY_KEYS.CURRENT_USER,
        queryFn: getCurrentUserQuery,
        enabled: options?.enabled !== false,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        retry: 3,
    })
}

export function useUserProfile(id: number, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: AUTH_QUERY_KEYS.USER_PROFILE(id),
        queryFn: () => getUserProfileQuery(id),
        enabled: !!id && options?.enabled !== false,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 3,
    })
}

export function useOnboardingStatus(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: AUTH_QUERY_KEYS.ONBOARDING_STATUS,
        queryFn: checkOnboardingStatusQuery,
        enabled: options?.enabled !== false,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 3,
    })
}

// Mutation Hooks
export function useRegisterUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: registerUserMutation,
        onSuccess: (data) => {
            // Update cache
            queryClient.setQueryData(AUTH_QUERY_KEYS.CURRENT_USER, data)
            queryClient.setQueryData(AUTH_QUERY_KEYS.USER_PROFILE(data.id), data)
            queryClient.setQueryData(AUTH_QUERY_KEYS.ONBOARDING_STATUS, true)

            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['auth'] })
        }
    })
}

export function useUpdateUserPreferences() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, preferences }: { id: number; preferences: TUserPreferencesUpdate }) =>
            updateUserPreferencesMutation(id, preferences),
        onSuccess: (data) => {
            // Update cache
            queryClient.setQueryData(AUTH_QUERY_KEYS.CURRENT_USER, data)
            queryClient.setQueryData(AUTH_QUERY_KEYS.USER_PROFILE(data.id), data)

            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['auth'] })
        }
    })
}

export function useSwitchStorageType() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: switchStorageTypeMutation,
        onSuccess: (data) => {
            // Update cache
            queryClient.setQueryData(AUTH_QUERY_KEYS.CURRENT_USER, data)
            queryClient.setQueryData(AUTH_QUERY_KEYS.USER_PROFILE(data.id), data)

            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['auth'] })
        }
    })
}

// Cache utilities
export function getCurrentUserFromCache(queryClient: ReturnType<typeof useQueryClient>): TUserProfile | undefined {
    return queryClient.getQueryData(AUTH_QUERY_KEYS.CURRENT_USER)
}

export function setCurrentUserCache(queryClient: ReturnType<typeof useQueryClient>, data: TUserProfile) {
    queryClient.setQueryData(AUTH_QUERY_KEYS.CURRENT_USER, data)
}

export function invalidateAuthQueries(queryClient: ReturnType<typeof useQueryClient>) {
    queryClient.invalidateQueries({ queryKey: ['auth'] })
} 