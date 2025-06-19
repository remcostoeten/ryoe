import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toggleFolderFavoriteStatus } from '@/services'
import { QUERY_KEYS } from '@/api/types'

export function useToggleFolderFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (folderId: number) => toggleFolderFavoriteStatus(folderId),
    onSuccess: () => {
      // Invalidate all folder-related queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FOLDERS })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROOT_FOLDERS })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FOLDER_HIERARCHY })
    },
    onError: (error) => {
      console.error('Failed to toggle folder favorite:', error)
    }
  })
}
