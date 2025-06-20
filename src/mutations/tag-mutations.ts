import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
	createTagWithValidation,
	updateTagWithValidation,
	deleteTagWithValidation,
	addTagToNote,
	removeTagFromNote,
} from '@/services/tag-service'

export const TAG_QUERY_KEYS = {
	all: ['tags'] as const,
	lists: () => [...TAG_QUERY_KEYS.all, 'list'] as const,
	list: (filters: Record<string, any>) => [...TAG_QUERY_KEYS.lists(), { filters }] as const,
	details: () => [...TAG_QUERY_KEYS.all, 'detail'] as const,
	detail: (id: number) => [...TAG_QUERY_KEYS.details(), id] as const,
	notesTags: (noteId: number) => ['notes', noteId, 'tags'] as const,
}

export type TCreateTagVariables = TCreateTagData

export type TUpdateTagVariables = {
	id: number
} & TUpdateTagData

export type TDeleteTagVariables = {
	id: number
}

export type TAddTagToNoteVariables = {
	noteId: number
	tagId: number
}

export type TRemoveTagFromNoteVariables = {
	noteId: number
	tagId: number
}

export function useCreateTag() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (variables: TCreateTagVariables) => {
			const response = await createTagWithValidation(variables)

			if (!response.success) {
				throw new Error(response.error)
			}

			return response.data!
		},
		onSuccess: (newTag: TTag) => {
			// Invalidate and refetch tags list
			queryClient.invalidateQueries({ queryKey: TAG_QUERY_KEYS.lists() })

			// Add the new tag to the cache
			queryClient.setQueryData(TAG_QUERY_KEYS.detail(newTag.id), newTag)

			console.log('Tag created successfully:', newTag.name)
		},
		onError: (error: Error) => {
			console.error('Failed to create tag:', error.message)
		},
	})
}

// Update tag mutation
export function useUpdateTag() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (variables: TUpdateTagVariables) => {
			const { id, ...updateData } = variables
			const response = await updateTagWithValidation(id, updateData)

			if (!response.success) {
				throw new Error(response.error)
			}

			return response.data!
		},
		onSuccess: (updatedTag: TTag) => {
			// Update the tag in the cache
			queryClient.setQueryData(TAG_QUERY_KEYS.detail(updatedTag.id), updatedTag)

			// Invalidate tags list to reflect changes
			queryClient.invalidateQueries({ queryKey: TAG_QUERY_KEYS.lists() })

			// Invalidate any note-tag relationships that might be affected
			queryClient.invalidateQueries({ queryKey: ['notes'] })

			console.log('Tag updated successfully:', updatedTag.name)
		},
		onError: (error: Error) => {
			console.error('Failed to update tag:', error.message)
		},
	})
}

// Delete tag mutation
export function useDeleteTag() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (variables: TDeleteTagVariables) => {
			const response = await deleteTagWithValidation(variables.id)

			if (!response.success) {
				throw new Error(response.error)
			}

			return variables.id
		},
		onMutate: async (variables: TDeleteTagVariables) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({
				queryKey: TAG_QUERY_KEYS.detail(variables.id),
			})
			await queryClient.cancelQueries({
				queryKey: TAG_QUERY_KEYS.lists(),
			})

			// Snapshot the previous value
			const previousTag = queryClient.getQueryData(TAG_QUERY_KEYS.detail(variables.id))
			const previousTags = queryClient.getQueryData(TAG_QUERY_KEYS.lists())

			// Optimistically remove the tag
			queryClient.removeQueries({
				queryKey: TAG_QUERY_KEYS.detail(variables.id),
			})

			// Update tags list
			if (previousTags) {
				queryClient.setQueryData(TAG_QUERY_KEYS.lists(), (old: TTag[] | undefined) =>
					old ? old.filter(tag => tag.id !== variables.id) : []
				)
			}

			return { previousTag, previousTags }
		},
		onError: (error: Error, variables: TDeleteTagVariables, context) => {
			// Rollback on error
			if (context?.previousTag) {
				queryClient.setQueryData(TAG_QUERY_KEYS.detail(variables.id), context.previousTag)
			}
			if (context?.previousTags) {
				queryClient.setQueryData(TAG_QUERY_KEYS.lists(), context.previousTags)
			}

			console.error('Failed to delete tag:', error.message)
		},
		onSuccess: (deletedTagId: number) => {
			// Invalidate related queries
			queryClient.invalidateQueries({ queryKey: ['notes'] })

			console.log('Tag deleted successfully:', deletedTagId)
		},
	})
}

// Add tag to note mutation
export function useAddTagToNote() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (variables: TAddTagToNoteVariables) => {
			const response = await addTagToNote(variables.noteId, variables.tagId)

			if (!response.success) {
				throw new Error(response.error)
			}

			return response.data
		},
		onSuccess: (_, variables) => {
			// Invalidate note's tags
			queryClient.invalidateQueries({
				queryKey: TAG_QUERY_KEYS.notesTags(variables.noteId),
			})

			// Invalidate notes list to reflect tag changes
			queryClient.invalidateQueries({ queryKey: ['notes'] })

			console.log('Tag added to note successfully:', variables)
		},
		onError: (error: Error) => {
			console.error('Failed to add tag to note:', error.message)
		},
	})
}

// Remove tag from note mutation
export function useRemoveTagFromNote() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (variables: TRemoveTagFromNoteVariables) => {
			const response = await removeTagFromNote(variables.noteId, variables.tagId)

			if (!response.success) {
				throw new Error(response.error)
			}

			return variables
		},
		onSuccess: variables => {
			// Invalidate note's tags
			queryClient.invalidateQueries({
				queryKey: TAG_QUERY_KEYS.notesTags(variables.noteId),
			})

			// Invalidate notes list to reflect tag changes
			queryClient.invalidateQueries({ queryKey: ['notes'] })

			console.log('Tag removed from note successfully:', variables)
		},
		onError: (error: Error) => {
			console.error('Failed to remove tag from note:', error.message)
		},
	})
}
