import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNotes } from '@/modules/notes/hooks/use-notes'
import type { TNote } from '@/types/notes'

// Hook to manage notes for multiple folders in the sidebar
export function useFolderNotes(folderIds: number[]) {
  const [folderNotes, setFolderNotes] = useState<Record<number, TNote[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load notes for all folders
  const loadAllFolderNotes = useCallback(async () => {
    if (folderIds.length === 0) {
      setFolderNotes({})
      return
    }

    setLoading(true)
    setError(null)

    try {
      const notesPromises = folderIds.map(async (folderId) => {
        // We'll use the existing useNotes hook logic but call the service directly
        const { getNotesByFolder } = await import('@/services/note-service')
        const response = await getNotesByFolder(folderId)
        
        if (response.success && response.data) {
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
          return { folderId, notes }
        }
        return { folderId, notes: [] }
      })

      const results = await Promise.all(notesPromises)
      const newFolderNotes: Record<number, TNote[]> = {}
      
      results.forEach(({ folderId, notes }) => {
        newFolderNotes[folderId] = notes
      })

      setFolderNotes(newFolderNotes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load folder notes')
    } finally {
      setLoading(false)
    }
  }, [folderIds])

  // Get notes for a specific folder
  const getNotesForFolder = useCallback((folderId: number): TNote[] => {
    return folderNotes[folderId] || []
  }, [folderNotes])

  // Add a note to a folder
  const addNoteToFolder = useCallback((folderId: number, note: TNote) => {
    setFolderNotes(prev => ({
      ...prev,
      [folderId]: [...(prev[folderId] || []), note]
    }))
  }, [])

  // Update a note in a folder
  const updateNoteInFolder = useCallback((folderId: number, updatedNote: TNote) => {
    setFolderNotes(prev => ({
      ...prev,
      [folderId]: (prev[folderId] || []).map(note => 
        note.id === updatedNote.id ? updatedNote : note
      )
    }))
  }, [])

  // Remove a note from a folder
  const removeNoteFromFolder = useCallback((folderId: number, noteId: number) => {
    setFolderNotes(prev => ({
      ...prev,
      [folderId]: (prev[folderId] || []).filter(note => note.id !== noteId)
    }))
  }, [])

  // Move a note between folders
  const moveNoteBetweenFolders = useCallback((
    fromFolderId: number, 
    toFolderId: number, 
    note: TNote
  ) => {
    setFolderNotes(prev => {
      const newState = { ...prev }
      
      // Remove from source folder
      if (newState[fromFolderId]) {
        newState[fromFolderId] = newState[fromFolderId].filter(n => n.id !== note.id)
      }
      
      // Add to destination folder
      if (!newState[toFolderId]) {
        newState[toFolderId] = []
      }
      newState[toFolderId] = [...newState[toFolderId], { ...note, folderId: toFolderId }]
      
      return newState
    })
  }, [])

  // Load notes when folder IDs change
  useEffect(() => {
    loadAllFolderNotes()
  }, [loadAllFolderNotes])

  // Memoized total notes count
  const totalNotesCount = useMemo(() => {
    return Object.values(folderNotes).reduce((total, notes) => total + notes.length, 0)
  }, [folderNotes])

  return {
    folderNotes,
    loading,
    error,
    getNotesForFolder,
    addNoteToFolder,
    updateNoteInFolder,
    removeNoteFromFolder,
    moveNoteBetweenFolders,
    refreshNotes: loadAllFolderNotes,
    totalNotesCount
  }
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

  const createNote = useCallback(async (title: string = "Untitled") => {
    if (!folderId) return null

    try {
      const note = await notesHook.createNote({
        title,
        content: JSON.stringify([
          {
            id: 'initial-block',
            type: 'paragraph',
            content: []
          }
        ]),
        folderId,
        isPublic: false
      })
      
      // Auto-select the new note
      setSelectedNoteId(note.id)
      return note
    } catch (error) {
      console.error('Failed to create note:', error)
      return null
    }
  }, [folderId, notesHook])

  const duplicateNote = useCallback(async (note: TNote) => {
    if (!folderId) return null

    try {
      const duplicatedNote = await notesHook.createNote({
        title: `${note.title} (Copy)`,
        content: note.content,
        folderId,
        isPublic: note.isPublic
      })
      
      return duplicatedNote
    } catch (error) {
      console.error('Failed to duplicate note:', error)
      return null
    }
  }, [folderId, notesHook])

  const renameNote = useCallback(async (noteId: number, newTitle: string) => {
    const note = notesHook.notes.find(n => n.id === noteId)
    if (!note) return false

    try {
      await notesHook.updateNote({
        id: noteId,
        title: newTitle
      })
      return true
    } catch (error) {
      console.error('Failed to rename note:', error)
      return false
    }
  }, [notesHook])

  const deleteNote = useCallback(async (noteId: number) => {
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
  }, [notesHook, selectedNoteId])

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
    deleteNote
  }
}
