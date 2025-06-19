import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import type { QueryKey, UseQueryOptions, UseInfiniteQueryOptions } from '@tanstack/react-query'

export interface CRUDQueryFactory<T, TCreate, TUpdate> {
    getById: (id: number) => UseQueryOptions<T>
    getAll: () => UseQueryOptions<T[]>
    getByParent?: (parentId: number) => UseQueryOptions<T[]>
    search?: (query: string) => UseQueryOptions<T[]>
}

export function createQueryFactory<T, TCreate, TUpdate>(
    entityName: string,
    service: {
        getById: (id: number) => Promise<T>
        getAll: () => Promise<T[]>
        getByParent?: (parentId: number) => Promise<T[]>
        search?: (query: string) => Promise<T[]>
    }
): CRUDQueryFactory<T, TCreate, TUpdate> {
    return {
        getById: (id: number) => ({
            queryKey: [entityName, id],
            queryFn: () => service.getById(id),
            enabled: !!id && id > 0
        }),

        getAll: () => ({
            queryKey: [entityName],
            queryFn: () => service.getAll()
        }),

        ...(service.getByParent && {
            getByParent: (parentId: number) => ({
                queryKey: [entityName, 'parent', parentId],
                queryFn: () => service.getByParent!(parentId),
                enabled: parentId !== null && parentId !== undefined
            })
        }),

        ...(service.search && {
            search: (query: string) => ({
                queryKey: [entityName, 'search', query],
                queryFn: () => service.search!(query),
                enabled: query.length > 2
            })
        })
    }
}

// Hook factory
export function createQueryHooks<T, TCreate, TUpdate>(
    factory: CRUDQueryFactory<T, TCreate, TUpdate>
) {
    return {
        useGetById: (id: number, options?: Partial<UseQueryOptions<T>>) =>
            useQuery({ ...factory.getById(id), ...options }),

        useGetAll: (options?: Partial<UseQueryOptions<T[]>>) =>
            useQuery({ ...factory.getAll(), ...options }),

        ...(factory.getByParent && {
            useGetByParent: (parentId: number, options?: Partial<UseQueryOptions<T[]>>) =>
                useQuery({ ...factory.getByParent!(parentId), ...options })
        }),

        ...(factory.search && {
            useSearch: (query: string, options?: Partial<UseQueryOptions<T[]>>) =>
                useQuery({ ...factory.search!(query), ...options })
        })
    }
} 