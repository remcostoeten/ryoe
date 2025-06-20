import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { TNote } from '@/types'
import type {
    TMutationOptions,
    TCreateNoteVariables,
    TUpdateNoteVariables,
    TDeleteNoteVariables,
    TMoveNoteVariables,
    TReorderNotesVariables,
} from './types'
import { noteService } from '@/services/note-service'

export function useCreateNote(options?: TMutationOptions<TNote>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ['notes', 'create'],
        mutationFn: async (variables: TCreateNoteVariables) => {
            const result = await noteService.create(variables)
            if (!result.success) {
                throw new Error(result.error || 'Failed to create note')
            }
            return result.data!
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['notes'] })
            options?.onSuccess?.(data)
        },
        onError: options?.onError,
        onSettled: options?.onSettled,
    })
}

export function useUpdateNote(options?: TMutationOptions<TNote>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ['notes', 'update'],
        mutationFn: async (variables: TUpdateNoteVariables) => {
            const result = await noteService.update(variables.id, variables)
            if (!result.success) {
                throw new Error(result.error || 'Failed to update note')
            }
            return result.data!
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['notes'] })
            options?.onSuccess?.(data)
        },
        onError: options?.onError,
        onSettled: options?.onSettled,
    })
}

export function useDeleteNote(options?: TMutationOptions<void>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ['notes', 'delete'],
        mutationFn: async (variables: TDeleteNoteVariables) => {
            const result = await noteService.delete(variables.id, variables.force)
            if (!result.success) {
                throw new Error(result.error || 'Failed to delete note')
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] })
            options?.onSuccess?.()
        },
        onError: options?.onError,
        onSettled: options?.onSettled,
    })
}

export function useMoveNote(options?: TMutationOptions<TNote>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ['notes', 'move'],
        mutationFn: async (variables: TMoveNoteVariables) => {
            const result = await noteService.move(variables.id, variables.folderId)
            if (!result.success) {
                throw new Error(result.error || 'Failed to move note')
            }
            return result.data!
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['notes'] })
            options?.onSuccess?.(data)
        },
        onError: options?.onError,
        onSettled: options?.onSettled,
    })
}

export function useDuplicateNote(options?: TMutationOptions<TNote>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ['notes', 'duplicate'],
        mutationFn: async (id: number) => {
            const result = await noteService.duplicate(id)
            if (!result.success) {
                throw new Error(result.error || 'Failed to duplicate note')
            }
            return result.data!
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['notes'] })
            options?.onSuccess?.(data)
        },
        onError: options?.onError,
        onSettled: options?.onSettled,
    })
}

export function useReorderNotes(options?: TMutationOptions<void>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: ['notes', 'reorder'],
        mutationFn: async (variables: TReorderNotesVariables) => {
            const result = await noteService.reorder(variables.folderId, variables.noteIds)
            if (!result.success) {
                throw new Error(result.error || 'Failed to reorder notes')
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] })
            options?.onSuccess?.()
        },
        onError: options?.onError,
        onSettled: options?.onSettled,
    })
} 