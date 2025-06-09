import { useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  createNoteWithValidation, 
  updateNoteWithValidation, 
  deleteNoteById,
  moveNoteToFolder,
  reorderNotesInFolder,
  duplicateNoteById
} from '@/services/note-service'
import { 
  invalidateNoteQueries,
  setNoteCache,
  addNoteToFolderCache,
  updateNoteInFolderCache,
  removeNoteFromFolderCache,
  moveNoteBetweenFoldersCache,
  getNoteFromCache,
  getNotesByFolderFromCache
} from '@/queries/note-queries'
import type { 
  TMutationOptions,
  TCreateNoteVariables,
  TUpdateNoteVariables,
  TDeleteNoteVariables,
  TMoveNoteVariables,
  TReorderNotesVariables,
  TDuplicateNoteVariables
} from './types'
import type { TNoteWithMetadata } from '@/services/types'

export function useCreateNote(
  options?: TMutationOptions<TNoteWithMetadata, TCreateNoteVariables>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: TCreateNoteVariables) => {
      const result = await createNoteWithValidation(variables)
      if (!result.success) {
        throw new Error(result.error || 'Failed to create note')
      }
      return result.data!
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notes', 'folder', variables.folderId] })

      // Snapshot previous value
      const previousNotes = getNotesByFolderFromCache(queryClient, variables.folderId || null)

      // Optimistically add note
      const optimisticNote: TNoteWithMetadata = {
        id: Date.now(), // Temporary ID
        title: variables.title,
        content: variables.content,
        folderId: variables.folderId,
        position: previousNotes?.length || 0,
        isFavorite: false,
        wordCount: variables.content.split(/\s+/).length,
        characterCount: variables.content.length,
        readingTime: Math.ceil(variables.content.split(/\s+/).length / 200),
        lastModified: new Date().toISOString(),
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000)
      }

      addNoteToFolderCache(queryClient, variables.folderId || null, optimisticNote)

      options?.onMutate?.(variables)

      return { previousNotes, optimisticNote }
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousNotes) {
        queryClient.setQueryData(['notes', 'folder', variables.folderId], context.previousNotes)
      }

      console.error('Failed to create note:', error)
      options?.onError?.(error, variables)
    },
    onSuccess: (data, variables, context) => {
      // Replace optimistic note with real data
      if (context?.optimisticNote) {
        removeNoteFromFolderCache(queryClient, variables.folderId || null, context.optimisticNote.id)
      }
      addNoteToFolderCache(queryClient, variables.folderId || null, data)
      setNoteCache(queryClient, data.id, data)
      
      options?.onSuccess?.(data, variables)
    },
    onSettled: (data, error, variables) => {
      // Invalidate queries to ensure consistency
      invalidateNoteQueries(queryClient, data?.id, variables.folderId || null)
      
      options?.onSettled?.(data, error, variables)
    }
  })
}

export function useUpdateNote(
  options?: TMutationOptions<TNoteWithMetadata, TUpdateNoteVariables>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: TUpdateNoteVariables) => {
      const result = await updateNoteWithValidation(variables.id, variables)
      if (!result.success) {
        throw new Error(result.error || 'Failed to update note')
      }
      return result.data!
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notes', variables.id] })

      // Snapshot previous value
      const previousNote = getNoteFromCache(queryClient, variables.id)

      // Optimistically update note
      if (previousNote) {
        const optimisticNote = {
          ...previousNote,
          ...variables,
          lastModified: new Date().toISOString(),
          updatedAt: Math.floor(Date.now() / 1000)
        }

        setNoteCache(queryClient, variables.id, optimisticNote)
        updateNoteInFolderCache(queryClient, previousNote.folderId || null, variables.id, () => optimisticNote)
      }

      options?.onMutate?.(variables)

      return { previousNote }
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousNote) {
        setNoteCache(queryClient, variables.id, context.previousNote)
        updateNoteInFolderCache(queryClient, context.previousNote.folderId ?? null, variables.id, () => context.previousNote!)
      }

      console.error('Failed to update note:', error)
      options?.onError?.(error, variables)
    },
    onSuccess: (data, variables) => {
      // Update cache with server response
      setNoteCache(queryClient, variables.id, data)
      updateNoteInFolderCache(queryClient, data.folderId ?? null, variables.id, () => data)
      
      options?.onSuccess?.(data, variables)
    },
    onSettled: (data, error, variables) => {
      // Invalidate queries to ensure consistency
      invalidateNoteQueries(queryClient, variables.id, data?.folderId)
      
      options?.onSettled?.(data, error, variables)
    }
  })
}

export function useDeleteNote(
  options?: TMutationOptions<boolean, TDeleteNoteVariables>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: TDeleteNoteVariables) => {
      const result = await deleteNoteById(variables.id)
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete note')
      }
      return result.data!
    },
    onMutate: async (variables) => {
      // Get note before deletion for rollback
      const noteToDelete = getNoteFromCache(queryClient, variables.id)

      // Optimistically remove note
      if (noteToDelete) {
        removeNoteFromFolderCache(queryClient, noteToDelete.folderId || null, variables.id)
        queryClient.removeQueries({ queryKey: ['notes', variables.id] })
      }

      options?.onMutate?.(variables)

      return { noteToDelete }
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.noteToDelete) {
        addNoteToFolderCache(queryClient, context.noteToDelete.folderId ?? null, context.noteToDelete)
        setNoteCache(queryClient, variables.id, context.noteToDelete)
      }

      console.error('Failed to delete note:', error)
      options?.onError?.(error, variables)
    },
    onSuccess: (data, variables, context) => {
      // Ensure note is removed from all caches
      queryClient.removeQueries({ queryKey: ['notes', variables.id] })
      
      if (context?.noteToDelete) {
        removeNoteFromFolderCache(queryClient, context.noteToDelete.folderId ?? null, variables.id)
      }
      
      options?.onSuccess?.(data, variables)
    },
    onSettled: (data, error, variables, context) => {
      // Invalidate queries to ensure consistency
      invalidateNoteQueries(queryClient, variables.id, context?.noteToDelete?.folderId)
      
      options?.onSettled?.(data, error, variables)
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

export function useDuplicateNote(
  options?: TMutationOptions<TNoteWithMetadata, TDuplicateNoteVariables>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: TDuplicateNoteVariables) => {
      const result = await duplicateNoteById(variables.id)
      if (!result.success) {
        throw new Error(result.error || 'Failed to duplicate note')
      }
      return result.data!
    },
    onSuccess: (data, variables) => {
      // Add duplicated note to cache
      addNoteToFolderCache(queryClient, data.folderId ?? null, data)
      setNoteCache(queryClient, data.id, data)
      
      options?.onSuccess?.(data, variables)
    },
    onError: (error, variables) => {
      console.error('Failed to duplicate note:', error)
      options?.onError?.(error, variables)
    },
    onSettled: (data, error, variables) => {
      // Invalidate queries to ensure consistency
      invalidateNoteQueries(queryClient, data?.id, data?.folderId)

      options?.onSettled?.(data, error, variables)
    }
  })
}

export function useReorderNotes(
  options?: TMutationOptions<boolean, TReorderNotesVariables>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: TReorderNotesVariables) => {
      const result = await reorderNotesInFolder(variables.folderId, variables.noteIds)
      if (!result.success) {
        throw new Error(result.error || 'Failed to reorder notes')
      }
      return result.data!
    },
    onMutate: async (variables) => {
      // Get current notes
      const currentNotes = getNotesByFolderFromCache(queryClient, variables.folderId)

      if (currentNotes) {
        // Optimistically reorder notes
        const reorderedNotes = variables.noteIds.map((noteId, index) => {
          const note = currentNotes.find(n => n.id === noteId)
          return note ? { ...note, position: index } : null
        }).filter(Boolean) as TNoteWithMetadata[]

        queryClient.setQueryData(['notes', 'folder', variables.folderId], reorderedNotes)
      }

      options?.onMutate?.(variables)

      return { currentNotes }
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.currentNotes) {
        queryClient.setQueryData(['notes', 'folder', variables.folderId], context.currentNotes)
      }

      console.error('Failed to reorder notes:', error)
      options?.onError?.(error, variables)
    },
    onSuccess: (data, variables) => {
      options?.onSuccess?.(data, variables)
    },
    onSettled: (data, error, variables) => {
      // Invalidate queries to ensure consistency
      invalidateNoteQueries(queryClient, undefined, variables.folderId)

      options?.onSettled?.(data, error, variables)
    }
  })
}
