import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { TFolder } from '@/types'
import type {
    TMutationOptions,
    TCreateFolderVariables,
    TUpdateFolderVariables,
    TDeleteFolderVariables,
    TMoveFolderVariables,
    TReorderFoldersVariables,
} from './types'
import { folderService } from '@/services/folder-service'

export function useCreateFolder(options?: TMutationOptions<TFolder>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ['folders', 'create'],
        mutationFn: async (variables: TCreateFolderVariables) => {
            const result = await folderService.create(variables)
            if (!result.success) {
                throw new Error(result.error || 'Failed to create folder')
            }
            return result.data!
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['folders'] })
            options?.onSuccess?.(data)
        },
        onError: options?.onError,
        onSettled: options?.onSettled,
    })
}

export function useUpdateFolder(options?: TMutationOptions<TFolder>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ['folders', 'update'],
        mutationFn: async (variables: TUpdateFolderVariables) => {
            const result = await folderService.update(variables.id, variables)
            if (!result.success) {
                throw new Error(result.error || 'Failed to update folder')
            }
            return result.data!
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['folders'] })
            options?.onSuccess?.(data)
        },
        onError: options?.onError,
        onSettled: options?.onSettled,
    })
}

export function useDeleteFolder(options?: TMutationOptions<void>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ['folders', 'delete'],
        mutationFn: async (variables: TDeleteFolderVariables) => {
            const result = await folderService.delete(variables.id, variables.deleteChildren, variables.force)
            if (!result.success) {
                throw new Error(result.error || 'Failed to delete folder')
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['folders'] })
            options?.onSuccess?.()
        },
        onError: options?.onError,
        onSettled: options?.onSettled,
    })
}

export function useMoveFolder(options?: TMutationOptions<TFolder>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ['folders', 'move'],
        mutationFn: async (variables: TMoveFolderVariables) => {
            const result = await folderService.move(variables.id, variables.parentId)
            if (!result.success) {
                throw new Error(result.error || 'Failed to move folder')
            }
            return result.data!
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['folders'] })
            options?.onSuccess?.(data)
        },
        onError: options?.onError,
        onSettled: options?.onSettled,
    })
}

export function useReorderFolders(options?: TMutationOptions<void>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ['folders', 'reorder'],
        mutationFn: async (variables: TReorderFoldersVariables) => {
            const result = await folderService.reorder(variables.parentId, variables.folderIds)
            if (!result.success) {
                throw new Error(result.error || 'Failed to reorder folders')
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['folders'] })
            options?.onSuccess?.()
        },
        onError: options?.onError,
        onSettled: options?.onSettled,
    })
} 