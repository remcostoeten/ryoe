/**
 * Note service - business logic for note operations
 * Pure functions only, no classes
 */

import { 
  findNoteById, 
  findNotes,
  findNotesByFolderId,
  searchNotes as searchNotesRepo,
  createNote, 
  updateNote, 
  deleteNote,
  moveNote,
  reorderNotes,
  duplicateNote
} from '@/repositories'
import { validateNoteTitle, validateNoteContent, calculateReadingTime, countWords } from '@/utilities'
import type { 
  TServiceResult, 
  TServiceListResult,
  TNoteCreationData, 
  TNoteUpdateData, 
  TNoteWithMetadata,
  TSearchOptions,
  TSearchResult
} from './types'
import type { TCreateNoteData, TUpdateNoteData, TNote } from '@/repositories/types'

function validateNoteCreation(data: TNoteCreationData): TServiceResult<null> {
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

  return { success: true }
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
    wordCount,
    characterCount,
    readingTime,
    lastModified: new Date(note.updatedAt * 1000).toISOString(),
    createdAt: note.createdAt,
    updatedAt: note.updatedAt
  }
}

export async function createNoteWithValidation(data: TNoteCreationData): Promise<TServiceResult<TNoteWithMetadata>> {
  try {
    // Validate input data
    const validation = validateNoteCreation(data)
    if (!validation.success) {
      return validation
    }

    // Convert to repository format
    const createData: TCreateNoteData = {
      title: data.title.trim(),
      content: data.content.trim(),
      folderId: data.folderId
    }

    // Create note in repository
    const result = await createNote(createData)
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to create note',
        code: 'CREATE_NOTE_FAILED'
      }
    }

    const noteWithMetadata = mapNoteToMetadata(result.data)
    return { success: true, data: noteWithMetadata }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'CREATE_NOTE_ERROR'
    }
  }
}

export async function updateNoteWithValidation(
  id: number, 
  data: TNoteUpdateData
): Promise<TServiceResult<TNoteWithMetadata>> {
  try {
    // Validate input data
    if (data.title !== undefined && !validateNoteTitle(data.title)) {
      return {
        success: false,
        error: 'Note title must be 1-100 characters long',
        code: 'INVALID_TITLE'
      }
    }

    if (data.content !== undefined && !validateNoteContent(data.content)) {
      return {
        success: false,
        error: 'Note content cannot be empty',
        code: 'INVALID_CONTENT'
      }
    }

    // Convert to repository format
    const updateData: TUpdateNoteData = {}
    if (data.title !== undefined) updateData.title = data.title.trim()
    if (data.content !== undefined) updateData.content = data.content.trim()
    if (data.folderId !== undefined) updateData.folderId = data.folderId

    // Update note in repository
    const result = await updateNote(id, updateData)
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to update note',
        code: 'UPDATE_NOTE_FAILED'
      }
    }

    const noteWithMetadata = mapNoteToMetadata(result.data)
    return { success: true, data: noteWithMetadata }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'UPDATE_NOTE_ERROR'
    }
  }
}

export async function getNoteById(id: number): Promise<TServiceResult<TNoteWithMetadata>> {
  try {
    const result = await findNoteById(id)
    if (!result.success) {
      return {
        success: false,
        error: result.error,
        code: 'FETCH_NOTE_FAILED'
      }
    }

    if (!result.data) {
      return {
        success: false,
        error: 'Note not found',
        code: 'NOTE_NOT_FOUND'
      }
    }

    const noteWithMetadata = mapNoteToMetadata(result.data)
    return { success: true, data: noteWithMetadata }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'GET_NOTE_ERROR'
    }
  }
}

export async function getNotesByFolder(folderId: number | null): Promise<TServiceListResult<TNoteWithMetadata>> {
  try {
    const result = await findNotesByFolderId(folderId)
    if (!result.success) {
      return {
        success: false,
        error: result.error,
        code: 'FETCH_NOTES_FAILED'
      }
    }

    const notesWithMetadata = (result.data || []).map(mapNoteToMetadata)
    return { 
      success: true, 
      data: notesWithMetadata,
      total: notesWithMetadata.length
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'GET_NOTES_ERROR'
    }
  }
}

export async function deleteNoteById(id: number): Promise<TServiceResult<boolean>> {
  try {
    const result = await deleteNote(id)
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to delete note',
        code: 'DELETE_NOTE_FAILED'
      }
    }

    return { success: true, data: result.data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'DELETE_NOTE_ERROR'
    }
  }
}

export async function moveNoteToFolder(
  id: number, 
  newFolderId: number | null, 
  newPosition?: number
): Promise<TServiceResult<TNoteWithMetadata>> {
  try {
    const result = await moveNote(id, newFolderId, newPosition)
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to move note',
        code: 'MOVE_NOTE_FAILED'
      }
    }

    const noteWithMetadata = mapNoteToMetadata(result.data)
    return { success: true, data: noteWithMetadata }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'MOVE_NOTE_ERROR'
    }
  }
}

export async function reorderNotesInFolder(
  folderId: number | null, 
  noteIds: number[]
): Promise<TServiceResult<boolean>> {
  try {
    const result = await reorderNotes(folderId, noteIds)
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to reorder notes',
        code: 'REORDER_NOTES_FAILED'
      }
    }

    return { success: true, data: result.data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'REORDER_NOTES_ERROR'
    }
  }
}

export async function duplicateNoteById(id: number): Promise<TServiceResult<TNoteWithMetadata>> {
  try {
    const result = await duplicateNote(id)
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to duplicate note',
        code: 'DUPLICATE_NOTE_FAILED'
      }
    }

    const noteWithMetadata = mapNoteToMetadata(result.data)
    return { success: true, data: noteWithMetadata }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'DUPLICATE_NOTE_ERROR'
    }
  }
}

export async function searchNotesWithOptions(options: TSearchOptions): Promise<TServiceResult<TSearchResult>> {
  try {
    if (!options.query || options.query.trim().length < 2) {
      return {
        success: false,
        error: 'Search query must be at least 2 characters long',
        code: 'INVALID_SEARCH_QUERY'
      }
    }

    const result = await searchNotesRepo(options.query.trim())
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Search failed',
        code: 'SEARCH_FAILED'
      }
    }

    let notes = (result.data || []).map(mapNoteToMetadata)

    // Apply folder filter if specified
    if (options.folderId !== undefined) {
      notes = notes.filter(note => note.folderId === options.folderId)
    }

    // Apply limit if specified
    if (options.limit && options.limit > 0) {
      notes = notes.slice(0, options.limit)
    }

    const searchResult: TSearchResult = {
      notes,
      folders: [], // TODO: Implement folder search
      total: notes.length
    }

    return { success: true, data: searchResult }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'SEARCH_ERROR'
    }
  }
}
