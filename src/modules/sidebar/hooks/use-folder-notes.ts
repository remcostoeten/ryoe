import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNotes } from '@/hooks/use-notes'
import type { TNote } from '@/types'

// Hook to manage notes for multiple folders in the sidebar
export function useFolderNotes(folderIds: number[]) {
	const [folderNotes, setFolderNotes] = useState<Record<number, TNote[]>>({})
	const { notes, isLoading } = useNotes()

	useEffect(() => {
		if (!isLoading && notes) {
			const notesByFolder = folderIds.reduce((acc, folderId) => {
				acc[folderId] = notes.filter(note => note.folderId === folderId)
				return acc
			}, {} as Record<number, TNote[]>)
			setFolderNotes(notesByFolder)
		}
	}, [notes, isLoading, folderIds])

	return { folderNotes, isLoading }
}

// Hook for managing a single folder's notes with full CRUD operations
export function useSingleFolderNotes(folderId: number | null) {
	const notesHook = useNotes(folderId)
	const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null)
	const [editingNoteId, setEditingNoteId] = useState<number | null>(null)

	const selectedNote = useMemo(() => {
		return notesHook.notes.find(note => note.id === selectedNoteId) || null
	}, [notesHook.notes, selectedNoteId])

	const selectNote = useCallback((note: TNote) => {
		setSelectedNoteId(note.id)
	}, [])

	const startEditingNote = useCallback((noteId: number) => {
		setEditingNoteId(noteId)
	}, [])

	const stopEditingNote = useCallback(() => {
		setEditingNoteId(null)
	}, [])

	const createNote = useCallback(
		async (title: string = 'Untitled') => {
			if (!folderId) return null

			try {
				const note = await notesHook.createNote({
					title,
					content: JSON.stringify([
						{
							id: 'initial-block',
							type: 'paragraph',
							content: [],
						},
					]),
					folderId,
					isPublic: false,
				})

				// Auto-select the new note
				setSelectedNoteId(note.id)
				return note
			} catch (error) {
				console.error('Failed to create note:', error)
				return null
			}
		},
		[folderId, notesHook]
	)

	const duplicateNote = useCallback(
		async (note: TNote) => {
			if (!folderId) return null

			try {
				const duplicatedNote = await notesHook.createNote({
					title: `${note.title} (Copy)`,
					content: note.content,
					folderId,
					isPublic: note.isPublic,
				})

				return duplicatedNote
			} catch (error) {
				console.error('Failed to duplicate note:', error)
				return null
			}
		},
		[folderId, notesHook]
	)

	const renameNote = useCallback(
		async (noteId: number, newTitle: string) => {
			const note = notesHook.notes.find(n => n.id === noteId)
			if (!note) return false

			try {
				await notesHook.updateNote({
					id: noteId,
					title: newTitle,
				})
				return true
			} catch (error) {
				console.error('Failed to rename note:', error)
				return false
			}
		},
		[notesHook]
	)

	const deleteNote = useCallback(
		async (noteId: number) => {
			try {
				await notesHook.deleteNote(noteId)

				// Clear selection if the deleted note was selected
				if (selectedNoteId === noteId) {
					setSelectedNoteId(null)
				}

				return true
			} catch (error) {
				console.error('Failed to delete note:', error)
				return false
			}
		},
		[notesHook, selectedNoteId]
	)

	return {
		...notesHook,
		selectedNote,
		selectedNoteId,
		editingNoteId,
		selectNote,
		startEditingNote,
		stopEditingNote,
		createNote,
		duplicateNote,
		renameNote,
		deleteNote,
	}
}
