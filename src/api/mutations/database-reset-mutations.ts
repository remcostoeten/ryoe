import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { TMutationOptions } from './types'
import { databaseService } from '@/services/database-service'

export function useResetAllData(options?: TMutationOptions<void>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ['database', 'reset'],
        mutationFn: async () => {
            const result = await databaseService.resetAllData()
            if (!result.success) {
                throw new Error(result.error || 'Failed to reset database')
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

export function useHardResetDatabase(options?: TMutationOptions<void>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ['database', 'hard-reset'],
        mutationFn: async () => {
            const result = await databaseService.hardReset()
            if (!result.success) {
                throw new Error(result.error || 'Failed to hard reset database')
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

export function useValidateReset(options?: TMutationOptions<void>) {
    return useMutation({
        mutationKey: ['database', 'validate-reset'],
        mutationFn: async () => {
            const result = await databaseService.validateReset()
            if (!result.success) {
                throw new Error(result.error || 'Failed to validate database reset')
            }
        },
        onSuccess: options?.onSuccess,
        onError: options?.onError,
        onSettled: options?.onSettled,
    })
}

export function useResetAndReload(options?: TMutationOptions<void>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ['database', 'reset-and-reload'],
        mutationFn: async () => {
            const result = await databaseService.resetAndReload()
            if (!result.success) {
                throw new Error(result.error || 'Failed to reset and reload database')
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries()
            window.location.reload()
            options?.onSuccess?.()
        },
        onError: options?.onError,
        onSettled: options?.onSettled,
    })
} 