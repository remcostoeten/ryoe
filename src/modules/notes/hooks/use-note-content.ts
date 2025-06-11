import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNoteById, updateNoteWithValidation } from '@/services/note-service'

export function useNoteContent(noteId: number) {
  const queryClient = useQueryClient()
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const { data: noteResult } = useQuery({
    queryKey: ['note', noteId],
    queryFn: () => getNoteById(noteId)
  })

  const content = noteResult?.success && noteResult.data ? noteResult.data.content : ''

  const updateMutation = useMutation({
    mutationFn: async (newContent: string) => {
      const result = await updateNoteWithValidation(noteId, { content: newContent })
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note', noteId] })
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
    }
  })

  const updateContent = useCallback(async (newContent: string) => {
    setHasUnsavedChanges(true)
    try {
      await updateMutation.mutateAsync(newContent)
    } catch (error) {
      console.error('Failed to update note content:', error)
    }
  }, [updateMutation])

  return {
    content,
    updateContent,
    lastSaved,
    hasUnsavedChanges,
    isLoading: updateMutation.isPending
  }
} 