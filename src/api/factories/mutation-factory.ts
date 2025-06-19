import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface CRUDMutationFactory<T, TCreate, TUpdate> {
    create: () => ReturnType<typeof useMutation<T, Error, TCreate>>
    update: () => ReturnType<typeof useMutation<T, Error, { id: number; data: TUpdate }>>
    delete: () => ReturnType<typeof useMutation<void, Error, number>>
}

export function createMutationFactory<T, TCreate, TUpdate>(
    entityName: string,
    service: {
        create: (data: TCreate) => Promise<T>
        update: (id: number, data: TUpdate) => Promise<T>
        delete: (id: number) => Promise<void>
    },
    options?: {
        onCreateSuccess?: (data: T) => void
        onUpdateSuccess?: (data: T) => void
        onDeleteSuccess?: (id: number) => void
        invalidateQueries?: string[]
    }
): CRUDMutationFactory<T, TCreate, TUpdate> {
    return {
        create: () => {
            const queryClient = useQueryClient()
            return useMutation({
                mutationFn: service.create,
                onSuccess: (data) => {
                    // Invalidate related queries
                    queryClient.invalidateQueries({ queryKey: [entityName] })
                    if (options?.invalidateQueries) {
                        options.invalidateQueries.forEach(queryKey => {
                            queryClient.invalidateQueries({ queryKey: [queryKey] })
                        })
                    }
                    options?.onCreateSuccess?.(data)
                }
            })
        },

        update: () => {
            const queryClient = useQueryClient()
            return useMutation({
                mutationFn: ({ id, data }) => service.update(id, data),
                onSuccess: (data) => {
                    queryClient.invalidateQueries({ queryKey: [entityName] })
                    if (options?.invalidateQueries) {
                        options.invalidateQueries.forEach(queryKey => {
                            queryClient.invalidateQueries({ queryKey: [queryKey] })
                        })
                    }
                    options?.onUpdateSuccess?.(data)
                }
            })
        },

        delete: () => {
            const queryClient = useQueryClient()
            return useMutation({
                mutationFn: service.delete,
                onSuccess: (_, id) => {
                    queryClient.invalidateQueries({ queryKey: [entityName] })
                    if (options?.invalidateQueries) {
                        options.invalidateQueries.forEach(queryKey => {
                            queryClient.invalidateQueries({ queryKey: [queryKey] })
                        })
                    }
                    options?.onDeleteSuccess?.(id)
                }
            })
        }
    }
} 