import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationOptions } from '@tanstack/react-query'
import type { TServiceResult } from '@/types'
import type { TMutationOptions } from './mutations/types'

export interface CRUDMutationFactory<T, TCreateData, TUpdateData> {
    create: (options?: TMutationOptions<T>) => UseMutationOptions<T, Error, TCreateData>
    update: (options?: TMutationOptions<T>) => UseMutationOptions<T, Error, { id: number; data: TUpdateData }>
    delete: (options?: TMutationOptions<void>) => UseMutationOptions<void, Error, number>
}

export function createMutationFactory<T, TCreateData, TUpdateData>(
    entityName: string,
    service: {
        create: (data: TCreateData) => Promise<TServiceResult<T>>
        update: (id: number, data: TUpdateData) => Promise<TServiceResult<T>>
        delete: (id: number) => Promise<TServiceResult<void>>
    }
): CRUDMutationFactory<T, TCreateData, TUpdateData> {
    return {
        create: (options?: TMutationOptions<T>) => ({
            mutationKey: [entityName, 'create'],
            mutationFn: async (data: TCreateData) => {
                const result = await service.create(data)
                if (!result.success) {
                    throw new Error(result.error || `Failed to create ${entityName}`)
                }
                return result.data!
            },
            onSuccess: options?.onSuccess,
            onError: options?.onError,
            onSettled: options?.onSettled,
        }),

        update: (options?: TMutationOptions<T>) => ({
            mutationKey: [entityName, 'update'],
            mutationFn: async ({ id, data }: { id: number; data: TUpdateData }) => {
                const result = await service.update(id, data)
                if (!result.success) {
                    throw new Error(result.error || `Failed to update ${entityName}`)
                }
                return result.data!
            },
            onSuccess: options?.onSuccess,
            onError: options?.onError,
            onSettled: options?.onSettled,
        }),

        delete: (options?: TMutationOptions<void>) => ({
            mutationKey: [entityName, 'delete'],
            mutationFn: async (id: number) => {
                const result = await service.delete(id)
                if (!result.success) {
                    throw new Error(result.error || `Failed to delete ${entityName}`)
                }
            },
            onSuccess: options?.onSuccess,
            onError: options?.onError,
            onSettled: options?.onSettled,
        }),
    }
}

export function createMutationHooks<T, TCreateData, TUpdateData>(
    factory: CRUDMutationFactory<T, TCreateData, TUpdateData>,
    queryKeys: string[]
) {
    const queryClient = useQueryClient()

    return {
        useCreate: (options?: TMutationOptions<T>) =>
            useMutation({
                ...factory.create(options),
                onSuccess: (data, _variables) => {
                    queryClient.invalidateQueries({ queryKey: queryKeys })
                    options?.onSuccess?.(data)
                },
            }),

        useUpdate: (options?: TMutationOptions<T>) =>
            useMutation({
                ...factory.update(options),
                onSuccess: (data, _variables) => {
                    queryClient.invalidateQueries({ queryKey: queryKeys })
                    options?.onSuccess?.(data)
                },
            }),

        useDelete: (options?: TMutationOptions<void>) =>
            useMutation({
                ...factory.delete(options),
                onSuccess: (data, _variables) => {
                    queryClient.invalidateQueries({ queryKey: queryKeys })
                    options?.onSuccess?.(data)
                },
            }),
    }
} 