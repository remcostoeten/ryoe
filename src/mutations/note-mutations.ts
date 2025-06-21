import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
	createNoteWithValidation,
	updateNoteWithValidation,
	deleteNoteById,
	moveNoteToFolder,
	reorderNotes,
	duplicateNote,
	toggleNoteFavorite,
} from '@/services/note-service'
import type { TMutationOptions } from './types'
import type { TCreateNoteVariables, TUpdateNoteVariables } from '@/api/mutations/types'
import type { TNoteWithMetadata, TNote } from '@/types'

interface TMoveNoteVariables {
	id: number
	folderId: number | null
}

interface TToggleNoteFavoriteVariables {
	id: number
	isFavorite: boolean
}

export function useCreateNote() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (data: TCreateNoteVariables) => {
			const result = await createNoteWithValidation(data)
			if (!result.success) {
				throw new Error(result.error || 'Failed to create note')
			}
			return result.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['notes'] })
		},
	})
}

export function useUpdateNote() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ id, data }: { id: number; data: TUpdateNoteVariables }) => {
			const result = await updateNoteWithValidation(id, data)
			if (!result.success) {
				throw new Error(result.error || 'Failed to update note')
			}
			return result.data
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ['notes'] })
			queryClient.invalidateQueries({ queryKey: ['note', variables.id] })
		},
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
		},
	})
}

export function useMoveNote(options?: TMutationOptions<TNoteWithMetadata, Error, TMoveNoteVariables>) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (variables: TMoveNoteVariables) => {
			const result = await moveNoteToFolder(variables.id, variables.folderId)
			if (!result.success) {
				throw new Error(result.error || 'Failed to move note')
			}
			return result.data!
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: ['notes'] })
			queryClient.invalidateQueries({ queryKey: ['note', variables.id] })
			queryClient.invalidateQueries({ queryKey: ['folders'] })
			options?.onSuccess?.(data, variables)
		},
		onError: (error, variables) => {
			console.error('Failed to move note:', error)
			options?.onError?.(error, variables)
		},
		onSettled: (data, error, variables) => {
			options?.onSettled?.(data, error, variables)
		},
	})
}

export function useMoveNoteToFolder() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (variables: {
			id: number
			newFolderId: number | null
			newPosition?: number
		}) => {
			const result = await moveNoteToFolder(
				variables.id,
				variables.newFolderId
			)
			if (!result.success) {
				throw new Error(result.error || 'Failed to move note')
			}
			return result.data
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ['notes'] })
			queryClient.invalidateQueries({ queryKey: ['note', variables.id] })
		},
	})
}

export function useReorderNotes() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (variables: { folderId: number | null; noteIds: number[] }) => {
			const result = await reorderNotes(variables.folderId, variables.noteIds)
			if (!result.success) {
				throw new Error(result.error || 'Failed to reorder notes')
			}
			return result.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['notes'] })
		},
	})
}

export function useDuplicateNote() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: number) => {
			const result = await duplicateNote(id)
			if (!result.success) {
				throw new Error(result.error || 'Failed to duplicate note')
			}
			return result.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['notes'] })
		},
	})
}

export function useToggleNoteFavorite() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: number) => {
			const result = await toggleNoteFavorite(id)
			if (!result.success) {
				throw new Error(result.error || 'Failed to toggle note favorite')
			}
			return result.data!
		},
		onSuccess: (data) => {
			queryClient.setQueryData(['note', data.id], data)
			queryClient.invalidateQueries({ queryKey: ['notes'] })
		},
	})
}
