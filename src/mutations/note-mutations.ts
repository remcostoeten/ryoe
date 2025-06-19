import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createNoteWithValidation,
  updateNoteWithValidation,
  deleteNoteById,
  moveNoteToFolder,
  reorderNotesInFolder,
  duplicateNoteById,
  toggleNoteFavoriteStatus
} from '@/services/note-service'
import {
  invalidateNoteQueries,
  setNoteCache,
  moveNoteBetweenFoldersCache,
  getNoteFromCache
} from '@/queries/note-queries'
import type {
  TMutationOptions,
  TMoveNoteVariables
} from './types'
import type { TNoteCreationData, TNoteUpdateData } from '@/domain/entities/workspace'
import type { TNoteWithMetadata } from '@/domain/entities/workspace'

export function useCreateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TNoteCreationData) => {
      const result = await createNoteWithValidation(data)
      if (!result.success) {
        throw new Error(result.error || 'Failed to create note')
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    }
  })
}

export function useUpdateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: TNoteUpdateData }) => {
      const result = await updateNoteWithValidation(id, data)
      if (!result.success) {
        throw new Error(result.error || 'Failed to update note')
      }
      return result.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['note', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    }
  })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const result = await deleteNoteById(id)
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete note')
      }
      return result.data
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.invalidateQueries({ queryKey: ['note', id] })
    }
  })
}

export function useMoveNote(
  options?: TMutationOptions<TNoteWithMetadata, TMoveNoteVariables>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: TMoveNoteVariables) => {
      const result = await moveNoteToFolder(variables.id, variables.newFolderId, variables.newPosition)
      if (!result.success) {
        throw new Error(result.error || 'Failed to move note')
      }
      return result.data!
    },
    onMutate: async (variables) => {
      // Get current note
      const currentNote = getNoteFromCache(queryClient, variables.id)

      if (currentNote) {
        // Optimistically move note between folders
        moveNoteBetweenFoldersCache(
          queryClient,
          currentNote,
          currentNote.folderId || null,
          variables.newFolderId
        )
      }

      options?.onMutate?.(variables)

      return { currentNote }
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.currentNote) {
        moveNoteBetweenFoldersCache(
          queryClient,
          context.currentNote,
          variables.newFolderId,
          context.currentNote.folderId ?? null
        )
      }

      console.error('Failed to move note:', error)
      options?.onError?.(error, variables)
    },
    onSuccess: (data, variables, _context) => {
      // Update cache with server response
      setNoteCache(queryClient, variables.id, data)

      options?.onSuccess?.(data, variables)
    },
    onSettled: (data, error, variables, context) => {
      // Invalidate queries to ensure consistency
      invalidateNoteQueries(queryClient, variables.id, variables.newFolderId)
      if (context?.currentNote?.folderId !== variables.newFolderId) {
        invalidateNoteQueries(queryClient, undefined, context?.currentNote?.folderId)
      }

      options?.onSettled?.(data, error, variables)
    }
  })
}

export function useMoveNoteToFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: { id: number; newFolderId: number | null; newPosition?: number }) => {
      const result = await moveNoteToFolder(variables.id, variables.newFolderId, variables.newPosition)
      if (!result.success) {
        throw new Error(result.error || 'Failed to move note')
      }
      return result.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.invalidateQueries({ queryKey: ['note', variables.id] })
    }
  })
}

export function useReorderNotes() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: { folderId: number | null; noteIds: number[] }) => {
      const result = await reorderNotesInFolder(variables.folderId, variables.noteIds)
      if (!result.success) {
        throw new Error(result.error || 'Failed to reorder notes')
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    }
  })
}

export function useDuplicateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const result = await duplicateNoteById(id)
      if (!result.success) {
        throw new Error(result.error || 'Failed to duplicate note')
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    }
  })
}

export function useToggleNoteFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const result = await toggleNoteFavoriteStatus(id)
      if (!result.success) {
        throw new Error(result.error || 'Failed to toggle note favorite')
      }
      return result.data
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.invalidateQueries({ queryKey: ['note', id] })
    }
  })
}
