import { useState, useEffect, useCallback } from 'react'
import {
  createNoteWithValidation,
  updateNoteWithValidation,
  deleteNoteById,
  getNotesByFolder
} from '@/services/note-service'
import type { TNote, TCreateNoteInput, TUpdateNoteInput } from '@/types/notes'

export function useNotes(folderId?: number | null) {
  const [notes, setNotes] = useState<TNote[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load notes for a specific folder
  const loadNotes = useCallback(async (targetFolderId?: number | null) => {
    setLoading(true)
    setError(null)

    try {
      const response = await getNotesByFolder(targetFolderId || null)

      if (response.success && response.data) {
        // Convert TNoteWithMetadata to TNote
        const notes = response.data.map(note => ({
          id: note.id,
          title: note.title,
          content: note.content,
          folderId: note.folderId || null,
          position: note.position,
          isPublic: true, // Default value
          isFavorite: note.isFavorite || false,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        }))
        setNotes(notes)
      } else {
        setError(response.error || 'Failed to load notes')
        setNotes([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notes')
      setNotes([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Create a new note
  const createNote = useCallback(async (noteData: TCreateNoteInput): Promise<TNote> => {
    setLoading(true)
    setError(null)

    try {
      const response = await createNoteWithValidation({
        title: noteData.title,
        content: noteData.content,
        folderId: noteData.folderId || undefined
      })

      if (response.success && response.data) {
        // Convert TNoteWithMetadata to TNote
        const note: TNote = {
          id: response.data.id,
          title: response.data.title,
          content: response.data.content,
          folderId: response.data.folderId || null,
          position: response.data.position,
          isPublic: true, // Default value
          isFavorite: response.data.isFavorite || false,
          createdAt: new Date(response.data.createdAt),
          updatedAt: new Date(response.data.updatedAt)
        }

        // Update local state if the note belongs to current folder
        if (note.folderId === folderId) {
          setNotes(prev => [...prev, note])
        }
        return note
      } else {
        throw new Error(response.error || 'Failed to create note')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create note'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [folderId])

  // Update a note
  const updateNote = useCallback(async (noteData: TUpdateNoteInput): Promise<TNote> => {
    setLoading(true)
    setError(null)

    try {
      const response = await updateNoteWithValidation(noteData.id, {
        title: noteData.title,
        content: noteData.content,
        folderId: noteData.folderId || undefined
      })

      if (response.success && response.data) {
        // Convert TNoteWithMetadata to TNote
        const note: TNote = {
          id: response.data.id,
          title: response.data.title,
          content: response.data.content,
          folderId: response.data.folderId || null,
          position: response.data.position,
          isPublic: true, // Default value
          isFavorite: response.data.isFavorite || false,
          createdAt: new Date(response.data.createdAt),
          updatedAt: new Date(response.data.updatedAt)
        }

        // Update local state
        setNotes(prev => prev.map(n =>
          n.id === noteData.id ? note : n
        ))
        return note
      } else {
        throw new Error(response.error || 'Failed to update note')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update note'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete a note
  const deleteNote = useCallback(async (noteId: number): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const response = await deleteNoteById(noteId)

      if (response.success) {
        // Update local state
        setNotes(prev => prev.filter(note => note.id !== noteId))
      } else {
        throw new Error(response.error || 'Failed to delete note')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete note'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load notes when folderId changes
  useEffect(() => {
    loadNotes(folderId)
  }, [folderId, loadNotes])

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    refreshNotes: () => loadNotes(folderId)
  }
}
