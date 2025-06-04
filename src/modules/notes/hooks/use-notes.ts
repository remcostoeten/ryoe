import { useState, useEffect, useCallback } from 'react'
import { NoteService } from '@/api/services/note-service'
import type { Note, CreateNoteInput, UpdateNoteInput } from '@/types/notes'

const noteService = new NoteService()

export function useNotes(folderId?: number | null) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load notes for a specific folder
  const loadNotes = useCallback(async (targetFolderId?: number | null) => {
    setLoading(true)
    setError(null)

    try {
      const response = await noteService.list({ folderId: targetFolderId })

      if (response.success && response.data) {
        setNotes(response.data)
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
  const createNote = useCallback(async (noteData: CreateNoteInput): Promise<Note> => {
    setLoading(true)
    setError(null)

    try {
      const response = await noteService.create(noteData)

      if (response.success && response.data) {
        // Update local state if the note belongs to current folder
        if (response.data.folderId === folderId) {
          setNotes(prev => [...prev, response.data!])
        }
        return response.data
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
  const updateNote = useCallback(async (noteData: UpdateNoteInput): Promise<Note> => {
    setLoading(true)
    setError(null)

    try {
      const response = await noteService.update(noteData)

      if (response.success && response.data) {
        // Update local state
        setNotes(prev => prev.map(note =>
          note.id === noteData.id ? response.data! : note
        ))
        return response.data
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
      const response = await noteService.delete(noteId)

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
