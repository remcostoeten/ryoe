import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNoteById, updateNoteWithValidation } from '@/services/note-service'

export function useNoteTitle(noteId: number) {
  const queryClient = useQueryClient()

  const { data: noteResult } = useQuery({
    queryKey: ['note', noteId],
    queryFn: () => getNoteById(noteId)
  })

  const title = noteResult?.success && noteResult.data ? noteResult.data.title : ''

  const updateMutation = useMutation({
    mutationFn: async (newTitle: string) => {
      const result = await updateNoteWithValidation(noteId, { title: newTitle })
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note', noteId] })
    }
  })

  const updateTitle = useCallback(async (newTitle: string) => {
    try {
      await updateMutation.mutateAsync(newTitle)
    } catch (error) {
      console.error('Failed to update note title:', error)
    }
  }, [updateMutation])

  return {
    title,
    updateTitle,
    isLoading: updateMutation.isPending
  }
} 