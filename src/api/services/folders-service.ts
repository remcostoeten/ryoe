import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
	getFolderByIdQuery,
	getRootFoldersQuery,
	getChildFoldersQuery,
	getFolderHierarchyQuery,
	getFolderPathQuery,
	getFavoriteFoldersQuery,
} from '@/api/queries/folders'
import {
	createFolderMutation,
	updateFolderMutation,
	deleteFolderMutation,
	moveFolderMutation,
	toggleFolderFavoriteMutation,
} from '@/api/mutations/folders'
import type { TFolderCreationData, TFolderUpdateData, TFolderWithStats } from '@/services/types'

// Query Keys
export const FOLDERS_QUERY_KEYS = {
	FOLDERS: ['folders'] as const,
	FOLDER_BY_ID: (id: number) => ['folders', 'by-id', id] as const,
	ROOT_FOLDERS: ['folders', 'root'] as const,
	CHILD_FOLDERS: (parentId: number) => ['folders', 'children', parentId] as const,
	FOLDER_HIERARCHY: ['folders', 'hierarchy'] as const,
	FOLDER_PATH: (id: number) => ['folders', 'path', id] as const,
	FAVORITE_FOLDERS: ['folders', 'favorites'] as const,
} as const

// Query Hooks
export function useFolder(id: number, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: FOLDERS_QUERY_KEYS.FOLDER_BY_ID(id),
		queryFn: () => getFolderByIdQuery(id),
		enabled: !!id && options?.enabled !== false,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
		refetchOnWindowFocus: false,
		retry: 3,
	})
}

export function useRootFolders(options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: FOLDERS_QUERY_KEYS.ROOT_FOLDERS,
		queryFn: getRootFoldersQuery,
		enabled: options?.enabled !== false,
		staleTime: 2 * 60 * 1000, // 2 minutes
		gcTime: 5 * 60 * 1000, // 5 minutes
		refetchOnWindowFocus: false,
		retry: 3,
	})
}

export function useChildFolders(parentId: number, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: FOLDERS_QUERY_KEYS.CHILD_FOLDERS(parentId),
		queryFn: () => getChildFoldersQuery(parentId),
		enabled: !!parentId && options?.enabled !== false,
		staleTime: 2 * 60 * 1000, // 2 minutes
		gcTime: 5 * 60 * 1000, // 5 minutes
		refetchOnWindowFocus: false,
		retry: 3,
	})
}

export function useFolderHierarchy(options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: FOLDERS_QUERY_KEYS.FOLDER_HIERARCHY,
		queryFn: getFolderHierarchyQuery,
		enabled: options?.enabled !== false,
		staleTime: 3 * 60 * 1000, // 3 minutes
		gcTime: 8 * 60 * 1000, // 8 minutes
		refetchOnWindowFocus: false,
		retry: 3,
	})
}

export function useFolderPath(id: number, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: FOLDERS_QUERY_KEYS.FOLDER_PATH(id),
		queryFn: () => getFolderPathQuery(id),
		enabled: !!id && options?.enabled !== false,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
		refetchOnWindowFocus: false,
		retry: 3,
	})
}

export function useFavoriteFolders(options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: FOLDERS_QUERY_KEYS.FAVORITE_FOLDERS,
		queryFn: getFavoriteFoldersQuery,
		enabled: options?.enabled !== false,
		staleTime: 3 * 60 * 1000, // 3 minutes
		gcTime: 8 * 60 * 1000, // 8 minutes
		refetchOnWindowFocus: false,
		retry: 3,
	})
}

// Mutation Hooks
export function useCreateFolder() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: createFolderMutation,
		onSuccess: data => {
			// Add to cache
			queryClient.setQueryData(FOLDERS_QUERY_KEYS.FOLDER_BY_ID(data.id), data)

			// Invalidate parent queries
			if (data.parentId) {
				queryClient.invalidateQueries({
					queryKey: FOLDERS_QUERY_KEYS.CHILD_FOLDERS(data.parentId),
				})
			} else {
				queryClient.invalidateQueries({
					queryKey: FOLDERS_QUERY_KEYS.ROOT_FOLDERS,
				})
			}

			// Invalidate hierarchy
			queryClient.invalidateQueries({
				queryKey: FOLDERS_QUERY_KEYS.FOLDER_HIERARCHY,
			})
		},
	})
}

export function useUpdateFolder() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: TFolderUpdateData }) =>
			updateFolderMutation(id, data),
		onSuccess: data => {
			// Update individual folder cache
			queryClient.setQueryData(FOLDERS_QUERY_KEYS.FOLDER_BY_ID(data.id), data)

			// Invalidate parent queries
			if (data.parentId) {
				queryClient.invalidateQueries({
					queryKey: FOLDERS_QUERY_KEYS.CHILD_FOLDERS(data.parentId),
				})
			} else {
				queryClient.invalidateQueries({
					queryKey: FOLDERS_QUERY_KEYS.ROOT_FOLDERS,
				})
			}

			// Invalidate hierarchy and path
			queryClient.invalidateQueries({
				queryKey: FOLDERS_QUERY_KEYS.FOLDER_HIERARCHY,
			})
			queryClient.invalidateQueries({ queryKey: ['folders', 'path'] })

			// Invalidate favorites if needed
			if (data.isFavorite !== undefined) {
				queryClient.invalidateQueries({
					queryKey: FOLDERS_QUERY_KEYS.FAVORITE_FOLDERS,
				})
			}
		},
	})
}

export function useDeleteFolder() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ id, force }: { id: number; force?: boolean }) =>
			deleteFolderMutation(id, { force }),
		onSuccess: (_, variables) => {
			// Remove from cache
			queryClient.removeQueries({
				queryKey: FOLDERS_QUERY_KEYS.FOLDER_BY_ID(variables.id),
			})

			// Invalidate all folder queries
			queryClient.invalidateQueries({ queryKey: ['folders'] })

			// Invalidate related notes queries
			queryClient.invalidateQueries({ queryKey: ['notes'] })
		},
	})
}

export function useMoveFolder() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			id,
			newParentId,
			newPosition,
		}: {
			id: number
			newParentId: number | null
			newPosition?: number
		}) => moveFolderMutation(id, newParentId, newPosition),
		onSuccess: data => {
			// Update individual folder cache
			queryClient.setQueryData(FOLDERS_QUERY_KEYS.FOLDER_BY_ID(data.id), data)

			// Invalidate all parent/child queries since structure changed
			queryClient.invalidateQueries({
				queryKey: FOLDERS_QUERY_KEYS.ROOT_FOLDERS,
			})
			queryClient.invalidateQueries({ queryKey: ['folders', 'children'] })
			queryClient.invalidateQueries({
				queryKey: FOLDERS_QUERY_KEYS.FOLDER_HIERARCHY,
			})
			queryClient.invalidateQueries({ queryKey: ['folders', 'path'] })
		},
	})
}

export function useToggleFolderFavorite() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: toggleFolderFavoriteMutation,
		onSuccess: data => {
			// Update individual folder cache
			queryClient.setQueryData(FOLDERS_QUERY_KEYS.FOLDER_BY_ID(data.id), data)

			// Invalidate favorites
			queryClient.invalidateQueries({
				queryKey: FOLDERS_QUERY_KEYS.FAVORITE_FOLDERS,
			})

			// Invalidate parent queries
			if (data.parentId) {
				queryClient.invalidateQueries({
					queryKey: FOLDERS_QUERY_KEYS.CHILD_FOLDERS(data.parentId),
				})
			} else {
				queryClient.invalidateQueries({
					queryKey: FOLDERS_QUERY_KEYS.ROOT_FOLDERS,
				})
			}
		},
	})
}

// Cache utilities
export function getFolderFromCache(
	queryClient: ReturnType<typeof useQueryClient>,
	id: number
): TFolderWithStats | undefined {
	return queryClient.getQueryData(FOLDERS_QUERY_KEYS.FOLDER_BY_ID(id))
}

export function setFolderCache(
	queryClient: ReturnType<typeof useQueryClient>,
	folder: TFolderWithStats
) {
	queryClient.setQueryData(FOLDERS_QUERY_KEYS.FOLDER_BY_ID(folder.id), folder)
}

export function invalidateFolderQueries(
	queryClient: ReturnType<typeof useQueryClient>,
	parentId?: number | null
) {
	if (parentId !== undefined) {
		if (parentId) {
			queryClient.invalidateQueries({
				queryKey: FOLDERS_QUERY_KEYS.CHILD_FOLDERS(parentId),
			})
		} else {
			queryClient.invalidateQueries({
				queryKey: FOLDERS_QUERY_KEYS.ROOT_FOLDERS,
			})
		}
	}
	queryClient.invalidateQueries({ queryKey: ['folders'] })
}
