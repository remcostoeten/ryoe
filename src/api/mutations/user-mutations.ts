import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { TUser } from '@/types'
import type { TRegisterUserVariables, TUpdateUserPreferencesVariables, TSwitchStorageTypeVariables, TMutationOptions } from './types'
import { userService } from '@/services/user-service'

export function useRegisterUser(options?: TMutationOptions<TUser>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ['user', 'register'],
        mutationFn: async (variables: TRegisterUserVariables) => {
            const result = await userService.register(variables)
            if (!result.success) {
                throw new Error(result.error || 'Failed to register user')
            }
            return result.data!
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['user'] })
            options?.onSuccess?.(data)
        },
        onError: options?.onError,
        onSettled: options?.onSettled,
    })
}

export function useUpdateUserPreferences(options?: TMutationOptions<TUser>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ['user', 'preferences'],
        mutationFn: async (variables: TUpdateUserPreferencesVariables) => {
            const result = await userService.updatePreferences(variables)
            if (!result.success) {
                throw new Error(result.error || 'Failed to update user preferences')
            }
            return result.data!
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['user'] })
            options?.onSuccess?.(data)
        },
        onError: options?.onError,
        onSettled: options?.onSettled,
    })
}

export function useSwitchStorageType(options?: TMutationOptions<void>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ['user', 'storage'],
        mutationFn: async (variables: TSwitchStorageTypeVariables) => {
            const result = await userService.switchStorageType(variables)
            if (!result.success) {
                throw new Error(result.error || 'Failed to switch storage type')
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries()
            options?.onSuccess?.()
        },
        onError: options?.onError,
        onSettled: options?.onSettled,
    })
} 