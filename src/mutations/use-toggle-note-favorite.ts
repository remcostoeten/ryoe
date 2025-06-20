import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toggleNoteFavoriteStatus } from '@/services'
import { QUERY_KEYS } from '@/api/types'

export function useToggleNoteFavorite() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (noteId: number) => toggleNoteFavoriteStatus(noteId),
		onSuccess: () => {
			// Invalidate all note-related queries to refresh the UI
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTES })
		},
		onError: error => {
			console.error('Failed to toggle note favorite:', error)
		},
	})
}
