import { useQuery } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'
import type { TServiceResult } from '@/types'

export interface CRUDQueryFactory<T> {
    getById: (id: number) => UseQueryOptions<T>
    getAll: () => UseQueryOptions<T[]>
    getByParent?: (parentId: number) => UseQueryOptions<T[]>
    search?: (query: string) => UseQueryOptions<T[]>
}

export function createQueryFactory<T>(
    entityName: string,
    service: {
        getById: (id: number) => Promise<TServiceResult<T>>
        getAll: () => Promise<TServiceResult<T[]>>
        getByParent?: (parentId: number) => Promise<TServiceResult<T[]>>
        search?: (query: string) => Promise<TServiceResult<T[]>>
    }
): CRUDQueryFactory<T> {
    return {
        getById: (id: number) => ({
            queryKey: [entityName, id],
            queryFn: async () => {
                const result = await service.getById(id)
                if (!result.success) {
                    throw new Error(result.error || `Failed to get ${entityName}`)
                }
                return result.data!
            },
            enabled: !!id && id > 0,
        }),

        getAll: () => ({
            queryKey: [entityName],
            queryFn: async () => {
                const result = await service.getAll()
                if (!result.success) {
                    throw new Error(result.error || `Failed to get ${entityName}s`)
                }
                return result.data!
            },
        }),

        ...(service.getByParent && {
            getByParent: (parentId: number) => ({
                queryKey: [entityName, 'parent', parentId],
                queryFn: async () => {
                    const result = await service.getByParent!(parentId)
                    if (!result.success) {
                        throw new Error(result.error || `Failed to get ${entityName}s by parent`)
                    }
                    return result.data!
                },
                enabled: parentId !== null && parentId !== undefined,
            }),
        }),

        ...(service.search && {
            search: (query: string) => ({
                queryKey: [entityName, 'search', query],
                queryFn: async () => {
                    const result = await service.search!(query)
                    if (!result.success) {
                        throw new Error(result.error || `Failed to search ${entityName}s`)
                    }
                    return result.data!
                },
                enabled: query.length > 2,
            }),
        }),
    }
}

export function createQueryHooks<T>(factory: CRUDQueryFactory<T>) {
    return {
        useGetById: (id: number, options?: Partial<UseQueryOptions<T>>) =>
            useQuery({ ...factory.getById(id), ...options }),

        useGetAll: (options?: Partial<UseQueryOptions<T[]>>) =>
            useQuery({ ...factory.getAll(), ...options }),

        ...(factory.getByParent && {
            useGetByParent: (parentId: number, options?: Partial<UseQueryOptions<T[]>>) =>
                useQuery({ ...factory.getByParent!(parentId), ...options }),
        }),

        ...(factory.search && {
            useSearch: (query: string, options?: Partial<UseQueryOptions<T[]>>) =>
                useQuery({ ...factory.search!(query), ...options }),
        }),
    }
} 