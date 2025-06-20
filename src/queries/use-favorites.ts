import { useQuery } from '@tanstack/react-query'
import type { TFolderWithStats, TNote } from '@/types'
import { findFavoriteFolders, findFavoriteNotes } from '@/repositories'
import { QUERY_KEYS, CACHE_TIMES } from './types'

export function useFavoriteFolders() {
	return useQuery({
		queryKey: [...QUERY_KEYS.FOLDERS, 'favorites'],
		queryFn: async (): Promise<TFolderWithStats[]> => {
			const result = await findFavoriteFolders()
			if (!result.success) {
				throw new Error(result.error || 'Failed to fetch favorite folders')
			}
			return (result.data || []).map(folder => ({
				...folder,
				parentId: folder.parentId ?? null,
				createdAt: new Date(folder.createdAt).toISOString(),
				updatedAt: new Date(folder.updatedAt).toISOString(),
				noteCount: 0,
				childFolderCount: 0,
				totalNoteCount: 0,
				lastModified: new Date(folder.updatedAt).toISOString(),
			}))
		},
		staleTime: CACHE_TIMES.SHORT,
		gcTime: CACHE_TIMES.MEDIUM,
	})
}

export function useFavoriteNotes() {
	return useQuery({
		queryKey: [...QUERY_KEYS.NOTES, 'favorites'],
		queryFn: async (): Promise<TNote[]> => {
			const result = await findFavoriteNotes()
			if (!result.success) {
				throw new Error(result.error || 'Failed to fetch favorite notes')
			}
			return (result.data || []).map(note => ({
				...note,
				folderId: note.folderId ?? null,
				createdAt: new Date(note.createdAt).toISOString(),
				updatedAt: new Date(note.updatedAt).toISOString(),
			}))
		},
		staleTime: CACHE_TIMES.SHORT,
		gcTime: CACHE_TIMES.MEDIUM,
	})
}

export function useFavorites() {
	const favoriteFolders = useFavoriteFolders()
	const favoriteNotes = useFavoriteNotes()

	return {
		folders: favoriteFolders.data || [],
		notes: favoriteNotes.data || [],
		isLoading: favoriteFolders.isLoading || favoriteNotes.isLoading,
		error: favoriteFolders.error || favoriteNotes.error,
		refetch: () => {
			favoriteFolders.refetch()
			favoriteNotes.refetch()
		},
	}
}
