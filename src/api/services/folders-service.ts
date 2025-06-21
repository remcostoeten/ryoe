import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
	getFolderByIdQuery,
	getRootFoldersQuery,
	getChildFoldersQuery,
	getFolderHierarchyQuery,
	getFolderPathQuery,
} from '@/api/queries/folders'
import {
	useCreateFolder as createFolderMutation,
	useUpdateFolder as updateFolderMutation,
	useDeleteFolder as deleteFolderMutation,
	useMoveFolder as moveFolderMutation,
} from '@/api/mutations/folders'
import { updateFolder } from '@/services/folder-service'
import type { TFolderWithStats } from '@/types'
import { TUpdateFolderVariables } from '../mutations/types'

// Query Keys
const FOLDERS_QUERY_KEYS = {
	FOLDER_BY_ID: (id: number) => ['folders', id] as const,
	ROOT_FOLDERS: ['folders', 'root'] as const,
	CHILD_FOLDERS: (parentId: number) => ['folders', 'children', parentId] as const,
	FOLDER_HIERARCHY: ['folders', 'hierarchy'] as const,
	FOLDER_PATH: (id: number) => ['folders', 'path', id] as const,
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

// Re-export mutation hooks
export { createFolderMutation as useCreateFolder }
export { updateFolderMutation as useUpdateFolder }
export { deleteFolderMutation as useDeleteFolder }
export { moveFolderMutation as useMoveFolder }

export function useToggleFolderFavorite() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: number) => {
			const folder = getFolderFromCache(queryClient, id)
			if (!folder) {
				throw new Error('Folder not found')
			}
			const result = await updateFolder(id, { isFavorite: !folder.isFavorite })
			if (!result.success) {
				throw new Error(result.error || 'Failed to toggle folder favorite')
			}
			return result.data!
		},
		onSuccess: (data) => {
			setFolderCache(queryClient, data)
			invalidateFolderQueries(queryClient, data.parentId)
		},
	})
}
