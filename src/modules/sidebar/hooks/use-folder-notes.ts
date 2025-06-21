import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getNotesByFolder } from '@/services/note-service'
import type { TNote } from '@/types'

export function useFolderNotes(folderIds: number[]) {
	const [folderNotes, setFolderNotes] = useState<Record<number, TNote[]>>({})

	// TODO: Implement proper multi-folder note fetching
	const { data: notesResult, isLoading } = useQuery({
		queryKey: ['notes', 'folder', folderIds[0] || null],
		queryFn: () => getNotesByFolder(folderIds[0] || null),
		enabled: folderIds.length > 0
	})

	const notes = notesResult?.success ? notesResult.data : []

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

export function useSingleFolderNotes(folderId: number | null) {
	const { data: notesResult, isLoading } = useQuery({
		queryKey: ['notes', 'folder', folderId],
		queryFn: () => getNotesByFolder(folderId),
		enabled: folderId !== undefined
	})

	const notes = notesResult?.success ? notesResult.data : []
	const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null)
	const [editingNoteId, setEditingNoteId] = useState<number | null>(null)

	const selectedNote = useMemo(() => {
		return (notes || []).find(note => note.id === selectedNoteId) || null
	}, [notes, selectedNoteId])

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
				// TODO: Implement actual note creation using the note service
				console.log('Creating note:', { title, folderId })
				return null
			} catch (error) {
				console.error('Failed to create note:', error)
				return null
			}
		},
		[folderId]
	)

	const duplicateNote = useCallback(
		async (note: TNote) => {
			if (!folderId) return null

			try {
				// TODO: Implement actual note duplication using the note service
				console.log('Duplicating note:', note)
				return null
			} catch (error) {
				console.error('Failed to duplicate note:', error)
				return null
			}
		},
		[folderId]
	)

	const renameNote = useCallback(
		async (noteId: number, newTitle: string) => {
			const note = (notes || []).find(n => n.id === noteId)
			if (!note) return false

			try {
				// TODO: Implement actual note update using the note service
				console.log('Renaming note:', { noteId, newTitle })
				return true
			} catch (error) {
				console.error('Failed to rename note:', error)
				return false
			}
		},
		[notes]
	)

	const deleteNote = useCallback(
		async (noteId: number) => {
			try {
				// TODO: Implement actual note deletion using the note service
				console.log('Deleting note:', noteId)

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
		[selectedNoteId]
	)

	return {
		notes: notes || [],
		isLoading,
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
