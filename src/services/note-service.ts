/**
 * Note service - business logic for note operations
 * Pure functions only, no classes
 */

import {
  findNoteById,
  findNotesByFolderId,
  searchNotes as searchNotesRepo,
  createNote,
  updateNote,
  deleteNote,
  moveNote,
  reorderNotes,
  duplicateNote,
  toggleNoteFavorite,
  findFavoriteNotes
} from '@/repositories'
import { validateNoteTitle, validateNoteContent, calculateReadingTime, countWords } from '@/shared/utils'
import type {
  TServiceResult,
  TServiceListResult,
  TNoteCreationData,
  TNoteUpdateData,
  TNoteWithMetadata,
  TSearchResult
} from './types'
import type { TCreateNoteData, TNote } from '@/domain/entities/workspace'

function validateNoteCreation(data: TNoteCreationData): TServiceResult<TNoteWithMetadata> {
  if (!data.title || !validateNoteTitle(data.title)) {
    return {
      success: false,
      error: 'Note title must be 1-100 characters long',
      code: 'INVALID_TITLE'
    }
  }

  if (!data.content || !validateNoteContent(data.content)) {
    return {
      success: false,
      error: 'Note content cannot be empty',
      code: 'INVALID_CONTENT'
    }
  }

  // Validation passed - return success
  return {
    success: true,
    data: null as any // This will be replaced by actual data in createNoteWithValidation
  }
}

function mapNoteToMetadata(note: TNote): TNoteWithMetadata {
  const wordCount = countWords(note.content)
  const characterCount = note.content.length
  const readingTime = calculateReadingTime(note.content)

  return {
    id: note.id,
    title: note.title,
    content: note.content,
    folderId: note.folderId,
    position: note.position,
    isFavorite: note.isFavorite,
    wordCount,
    characterCount,
    readingTime,
    lastModified: new Date(note.updatedAt * 1000).toISOString(),
    createdAt: note.createdAt,
    updatedAt: note.updatedAt
  }
}

// Create a new note
export async function createNoteWithValidation(data: TNoteCreationData): Promise<TServiceResult<TNoteWithMetadata>> {
  const validation = validateNoteCreation(data)
  if (!validation.success) {
    return validation
  }

  try {
    const createData: TCreateNoteData = {
      title: data.title,
      content: data.content,
      folderId: data.folderId
    }

    const result = await createNote(createData)
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to create note',
        code: 'CREATE_NOTE_ERROR'
      }
    }

    return {
      success: true,
      data: mapNoteToMetadata(result.data)
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create note',
      code: 'CREATE_NOTE_ERROR'
    }
  }
}

// Update an existing note
export async function updateNoteWithValidation(
  noteId: number,
  data: TNoteUpdateData
): Promise<TServiceResult<TNoteWithMetadata>> {
  if (data.title && !validateNoteTitle(data.title)) {
    return {
      success: false,
      error: 'Note title must be 1-100 characters long',
      code: 'INVALID_TITLE'
    }
  }

  if (data.content && !validateNoteContent(data.content)) {
    return {
      success: false,
      error: 'Note content cannot be empty',
      code: 'INVALID_CONTENT'
    }
  }

  try {
    const result = await updateNote(noteId, data)
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to update note',
        code: 'UPDATE_NOTE_ERROR'
      }
    }

    return {
      success: true,
      data: mapNoteToMetadata(result.data)
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update note',
      code: 'UPDATE_NOTE_ERROR'
    }
  }
}

// Get a note by ID
export async function getNoteById(noteId: number): Promise<TServiceResult<TNoteWithMetadata>> {
  try {
    const result = await findNoteById(noteId)
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Note not found',
        code: 'GET_NOTE_ERROR'
      }
    }

    return {
      success: true,
      data: mapNoteToMetadata(result.data)
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get note',
      code: 'GET_NOTE_ERROR'
    }
  }
}

// Get notes by folder ID
export async function getNotesByFolderId(folderId: number | null): Promise<TServiceListResult<TNoteWithMetadata>> {
  try {
    const result = await findNotesByFolderId(folderId)
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to get notes',
        code: 'GET_NOTES_ERROR'
      }
    }

    return {
      success: true,
      data: result.data.map(mapNoteToMetadata)
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get notes',
      code: 'GET_NOTES_ERROR'
    }
  }
}

// Get notes by folder
export async function getNotesByFolder(folderId: number | null): Promise<TServiceListResult<TNoteWithMetadata>> {
  return getNotesByFolderId(folderId)
}

// Search notes
export async function searchNotes(query: string): Promise<TServiceResult<TSearchResult>> {
  try {
    const result = await searchNotesRepo(query)
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to search notes',
        code: 'SEARCH_NOTES_ERROR'
      }
    }

    const notes = result.data.map(mapNoteToMetadata)
    return {
      success: true,
      data: {
        notes,
        folders: [],
        total: notes.length
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search notes',
      code: 'SEARCH_NOTES_ERROR'
    }
  }
}

// Search notes with options
export async function searchNotesWithOptions(query: string): Promise<TServiceResult<TSearchResult>> {
  return searchNotes(query)
}

// Delete a note
export async function deleteNoteById(noteId: number): Promise<TServiceResult<null>> {
  try {
    const result = await deleteNote(noteId)
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to delete note',
        code: 'DELETE_NOTE_ERROR'
      }
    }

    return { success: true, data: null }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete note',
      code: 'DELETE_NOTE_ERROR'
    }
  }
}

// Move a note to a different folder
export async function moveNoteToFolder(
  noteId: number,
  folderId: number | null,
  newPosition?: number
): Promise<TServiceResult<TNoteWithMetadata>> {
  try {
    const result = await moveNote(noteId, folderId, newPosition)
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to move note',
        code: 'MOVE_NOTE_ERROR'
      }
    }

    return {
      success: true,
      data: mapNoteToMetadata(result.data)
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to move note',
      code: 'MOVE_NOTE_ERROR'
    }
  }
}

// Reorder notes within a folder
export async function reorderNotesInFolder(
  folderId: number | null,
  noteIds: number[]
): Promise<TServiceListResult<TNoteWithMetadata>> {
  try {
    const result = await reorderNotes(noteIds)
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to reorder notes',
        code: 'REORDER_NOTES_ERROR'
      }
    }

    // After reordering, fetch the updated notes
    const updatedNotes = await findNotesByFolderId(folderId)
    if (!updatedNotes.success || !updatedNotes.data) {
      return {
        success: false,
        error: 'Failed to fetch updated notes',
        code: 'REORDER_NOTES_ERROR'
      }
    }

    return {
      success: true,
      data: updatedNotes.data.map(mapNoteToMetadata)
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reorder notes',
      code: 'REORDER_NOTES_ERROR'
    }
  }
}

// Duplicate a note
export async function duplicateNoteById(noteId: number): Promise<TServiceResult<TNoteWithMetadata>> {
  try {
    const result = await duplicateNote(noteId)
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to duplicate note',
        code: 'DUPLICATE_NOTE_ERROR'
      }
    }

    return {
      success: true,
      data: mapNoteToMetadata(result.data)
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to duplicate note',
      code: 'DUPLICATE_NOTE_ERROR'
    }
  }
}

// Toggle note favorite status
export async function toggleNoteFavoriteStatus(noteId: number): Promise<TServiceResult<TNoteWithMetadata>> {
  try {
    const result = await toggleNoteFavorite(noteId)
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to toggle note favorite',
        code: 'TOGGLE_FAVORITE_ERROR'
      }
    }

    return {
      success: true,
      data: mapNoteToMetadata(result.data)
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle note favorite',
      code: 'TOGGLE_FAVORITE_ERROR'
    }
  }
}

// Get favorite notes
export async function getFavoriteNotes(): Promise<TServiceListResult<TNoteWithMetadata>> {
  try {
    const result = await findFavoriteNotes()
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to get favorite notes',
        code: 'GET_FAVORITES_ERROR'
      }
    }

    return {
      success: true,
      data: result.data.map(mapNoteToMetadata)
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get favorite notes',
      code: 'GET_FAVORITES_ERROR'
    }
  }
}

// Get favorite notes with metadata
export async function getFavoriteNotesWithMetadata(): Promise<TServiceListResult<TNoteWithMetadata>> {
  return getFavoriteNotes()
}


