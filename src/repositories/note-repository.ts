/**
 * Note repository - pure functions for note data access
 */

import { findById, findMany, create, update, deleteById } from './base-repository'
import type { 
  TNote, 
  TCreateNoteData, 
  TUpdateNoteData, 
  TRepositoryResult, 
  TRepositoryListResult,
  TPaginationOptions,
  TSortOptions,
  TFilterOptions
} from './types'

const TABLE_NAME = 'notes'

function mapRowToNote(row: any): TNote {
  return {
    id: Number(row.id),
    title: String(row.title),
    content: String(row.content),
    folderId: row.folder_id ? Number(row.folder_id) : undefined,
    position: Number(row.position || 0),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at)
  }
}

function mapNoteDataToRow(data: TCreateNoteData | TUpdateNoteData): Record<string, any> {
  const row: Record<string, any> = {}
  
  if ('title' in data && data.title !== undefined) {
    row.title = data.title
  }
  if ('content' in data && data.content !== undefined) {
    row.content = data.content
  }
  if ('folderId' in data) {
    row.folder_id = data.folderId || null
  }
  if ('position' in data && data.position !== undefined) {
    row.position = data.position
  }
  
  return row
}

export async function findNoteById(id: number): Promise<TRepositoryResult<TNote>> {
  return findById(TABLE_NAME, id, mapRowToNote)
}

export async function findNotes(options?: {
  filters?: TFilterOptions
  sort?: TSortOptions
  pagination?: TPaginationOptions
}): Promise<TRepositoryListResult<TNote>> {
  return findMany(TABLE_NAME, mapRowToNote, options)
}

export async function findNotesByFolderId(folderId: number | null): Promise<TRepositoryListResult<TNote>> {
  const filters = folderId ? { folder_id: folderId } : { folder_id: null }
  
  return findNotes({
    filters,
    sort: { field: 'position', direction: 'asc' }
  })
}

export async function findNotesByTitle(title: string): Promise<TRepositoryListResult<TNote>> {
  return findNotes({
    filters: { title },
    sort: { field: 'created_at', direction: 'desc' }
  })
}

export async function searchNotes(searchTerm: string): Promise<TRepositoryListResult<TNote>> {
  // Note: This is a simplified search. In a real app, you'd use FTS or more advanced search
  try {
    const result = await findNotes()
    if (!result.success || !result.data) {
      return result
    }

    const filteredNotes = result.data.filter(note => 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return { success: true, data: filteredNotes }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function createNote(data: TCreateNoteData): Promise<TRepositoryResult<TNote>> {
  // If no position specified, get the next position in the folder
  let position = data.position
  if (position === undefined) {
    const existingNotes = await findNotesByFolderId(data.folderId || null)
    if (existingNotes.success && existingNotes.data) {
      position = existingNotes.data.length
    } else {
      position = 0
    }
  }

  const rowData = {
    ...mapNoteDataToRow({ ...data, position })
  }
  
  return create(TABLE_NAME, rowData, mapRowToNote)
}

export async function updateNote(id: number, data: TUpdateNoteData): Promise<TRepositoryResult<TNote>> {
  const rowData = mapNoteDataToRow(data)
  return update(TABLE_NAME, id, rowData, mapRowToNote)
}

export async function deleteNote(id: number): Promise<TRepositoryResult<boolean>> {
  return deleteById(TABLE_NAME, id)
}

export async function moveNote(id: number, newFolderId: number | null, newPosition?: number): Promise<TRepositoryResult<TNote>> {
  // If no position specified, move to end of target folder
  let position = newPosition
  if (position === undefined) {
    const existingNotes = await findNotesByFolderId(newFolderId)
    if (existingNotes.success && existingNotes.data) {
      position = existingNotes.data.length
    } else {
      position = 0
    }
  }

  return updateNote(id, { folderId: newFolderId, position })
}

export async function reorderNotes(folderId: number | null, noteIds: number[]): Promise<TRepositoryResult<boolean>> {
  try {
    // Update position for each note
    const updatePromises = noteIds.map((noteId, index) => 
      updateNote(noteId, { position: index })
    )

    const results = await Promise.all(updatePromises)
    const hasErrors = results.some(result => !result.success)

    if (hasErrors) {
      return { success: false, error: 'Failed to reorder some notes' }
    }

    return { success: true, data: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function duplicateNote(id: number): Promise<TRepositoryResult<TNote>> {
  try {
    const originalNote = await findNoteById(id)
    if (!originalNote.success || !originalNote.data) {
      return { success: false, error: 'Note not found' }
    }

    const duplicateData: TCreateNoteData = {
      title: `${originalNote.data.title} (Copy)`,
      content: originalNote.data.content,
      folderId: originalNote.data.folderId
    }

    return createNote(duplicateData)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
