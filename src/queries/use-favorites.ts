import { useQuery } from '@tanstack/react-query'
import { getFavoriteFoldersWithStats, getFavoriteNotesWithMetadata } from '@/services'
import { QUERY_KEYS, CACHE_TIMES } from './types'

export function useFavoriteFolders() {
	return useQuery({
		queryKey: [...QUERY_KEYS.FOLDERS, 'favorites'],
		queryFn: async () => {
			const result = await getFavoriteFoldersWithStats()
			if (!result.success) {
				throw new Error(result.error || 'Failed to fetch favorite folders')
			}
			return result.data || []
		},
		staleTime: CACHE_TIMES.SHORT,
		gcTime: CACHE_TIMES.MEDIUM,
	})
}

export function useFavoriteNotes() {
	return useQuery({
		queryKey: [...QUERY_KEYS.NOTES, 'favorites'],
		queryFn: async () => {
			const result = await getFavoriteNotesWithMetadata()
			if (!result.success) {
				throw new Error(result.error || 'Failed to fetch favorite notes')
			}
			return result.data || []
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
