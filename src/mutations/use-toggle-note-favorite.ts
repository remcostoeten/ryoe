import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toggleNoteFavoriteStatus } from '@/services'
import { QUERY_KEYS } from '@/queries/types'

export function useToggleNoteFavorite() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (noteId: number) => toggleNoteFavoriteStatus(noteId),
		onSuccess: () => {
			// Invalidate all note-related queries to refresh the UI
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTES })

			// Invalidate favorites queries specifically  
			queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.NOTES, 'favorites'] })
		},
		onError: error => {
			console.error('Failed to toggle note favorite:', error)
		},
	})
}
