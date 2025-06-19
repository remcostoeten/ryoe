/**
 * Note history service - basic history tracking
 * This is a simplified implementation until proper versioning is added to the database
 */

import type { TNote } from '@/domain/entities/workspace'
import type { TServiceResult } from './types'

export type TNoteHistoryEntry = {
  id: string
  noteId: number
  title: string
  content: string
  changeType: 'created' | 'updated' | 'title_changed' | 'content_changed'
  timestamp: Date
  wordCount: number
  characterCount: number
}

// In-memory history storage (in a real app, this would be in the database)
const noteHistory = new Map<number, TNoteHistoryEntry[]>()

function generateHistoryId(): string {
  return `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function calculateWordCount(content: string): number {
  return content.trim().split(/\s+/).filter(word => word.length > 0).length
}

// Add a history entry for a note
export function addNoteHistoryEntry(
  note: TNote,
  changeType: TNoteHistoryEntry['changeType']
): TNoteHistoryEntry {
  const entry: TNoteHistoryEntry = {
    id: generateHistoryId(),
    noteId: note.id,
    title: note.title,
    content: note.content,
    changeType,
    timestamp: new Date(),
    wordCount: calculateWordCount(note.content),
    characterCount: note.content.length
  }

  const history = noteHistory.get(note.id) || []
  history.push(entry)

  // Keep only the last 50 entries per note
  if (history.length > 50) {
    history.splice(0, history.length - 50)
  }

  noteHistory.set(note.id, history)

  return entry
}

// Get history for a specific note
export async function getNoteHistory(noteId: number): Promise<TServiceResult<TNoteHistoryEntry[]>> {
  try {
    const history = noteHistory.get(noteId) || []

    // Sort by timestamp descending (newest first)
    const sortedHistory = [...history].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    return {
      success: true,
      data: sortedHistory
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get note history',
      code: 'GET_HISTORY_ERROR'
    }
  }
}

// Get recent changes across all notes
export async function getRecentChanges(limit: number = 20): Promise<TServiceResult<TNoteHistoryEntry[]>> {
  try {
    const allEntries: TNoteHistoryEntry[] = []

    for (const history of noteHistory.values()) {
      allEntries.push(...history)
    }

    // Sort by timestamp descending and limit
    const recentChanges = allEntries
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)

    return {
      success: true,
      data: recentChanges
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get recent changes',
      code: 'GET_RECENT_CHANGES_ERROR'
    }
  }
}

// Get history statistics for a note
export async function getNoteHistoryStats(noteId: number): Promise<TServiceResult<{
  totalEntries: number
  firstEntry: Date | null
  lastEntry: Date | null
  totalWordChanges: number
  totalCharacterChanges: number
}>> {
  try {
    const history = noteHistory.get(noteId) || []

    if (history.length === 0) {
      return {
        success: true,
        data: {
          totalEntries: 0,
          firstEntry: null,
          lastEntry: null,
          totalWordChanges: 0,
          totalCharacterChanges: 0
        }
      }
    }

    const sortedHistory = [...history].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    const firstEntry = sortedHistory[0]
    const lastEntry = sortedHistory[sortedHistory.length - 1]

    let totalWordChanges = 0
    let totalCharacterChanges = 0

    for (let i = 1; i < sortedHistory.length; i++) {
      const prev = sortedHistory[i - 1]
      const curr = sortedHistory[i]
      totalWordChanges += Math.abs(curr.wordCount - prev.wordCount)
      totalCharacterChanges += Math.abs(curr.characterCount - prev.characterCount)
    }

    return {
      success: true,
      data: {
        totalEntries: history.length,
        firstEntry: firstEntry.timestamp,
        lastEntry: lastEntry.timestamp,
        totalWordChanges,
        totalCharacterChanges
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get history stats',
      code: 'GET_HISTORY_STATS_ERROR'
    }
  }
}

// Clear history for a note
export async function clearNoteHistory(noteId: number): Promise<TServiceResult<boolean>> {
  try {
    noteHistory.delete(noteId)

    return {
      success: true,
      data: true
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear history',
      code: 'CLEAR_HISTORY_ERROR'
    }
  }
}

// Export history as JSON
export async function exportNoteHistory(noteId: number): Promise<TServiceResult<string>> {
  try {
    const historyResult = await getNoteHistory(noteId)

    if (!historyResult.success) {
      return historyResult as TServiceResult<string>
    }

    const exportData = {
      noteId,
      exportedAt: new Date().toISOString(),
      totalEntries: historyResult.data!.length,
      history: historyResult.data!.map(entry => ({
        ...entry,
        timestamp: entry.timestamp.toISOString()
      }))
    }

    const jsonContent = JSON.stringify(exportData, null, 2)

    // Download the file
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `note-${noteId}-history.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    return {
      success: true,
      data: `History exported for note ${noteId}`
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export history',
      code: 'EXPORT_HISTORY_ERROR'
    }
  }
}

// Initialize history tracking for existing notes
export function initializeNoteHistory(note: TNote) {
  const existingHistory = noteHistory.get(note.id)

  if (!existingHistory || existingHistory.length === 0) {
    addNoteHistoryEntry(note, 'created')
  }
}

// Track note changes (call this when notes are updated)
export function trackNoteChange(oldNote: TNote, newNote: TNote) {
  if (oldNote.title !== newNote.title && oldNote.content !== newNote.content) {
    addNoteHistoryEntry(newNote, 'updated')
  } else if (oldNote.title !== newNote.title) {
    addNoteHistoryEntry(newNote, 'title_changed')
  } else if (oldNote.content !== newNote.content) {
    addNoteHistoryEntry(newNote, 'content_changed')
  }
}
