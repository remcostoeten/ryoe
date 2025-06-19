/**
 * Note queries - React Query hooks for note operations
 * Pure functions only, no classes
 */

import { useQuery } from '@tanstack/react-query'
import {
  getNoteById,
  getNotesByFolder,
  searchNotesWithOptions
} from '@/services/note-service'
import { QUERY_KEYS, CACHE_TIMES, STALE_TIMES } from './types'
import type { TQueryOptions } from './types'
import type { TNoteWithMetadata, TSearchOptions, TSearchResult } from '@/services/types'

export function useNote(
  id: number,
  options?: TQueryOptions<TNoteWithMetadata>
) {
  return useQuery({
    queryKey: QUERY_KEYS.NOTE(id),
    queryFn: async () => {
      const result = await getNoteById(id)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch note')
      }
      return result.data!
    },
    enabled: !!id && (options?.enabled !== false),
    staleTime: options?.staleTime ?? STALE_TIMES.SHORT,
    gcTime: options?.cacheTime ?? CACHE_TIMES.MEDIUM,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: options?.refetchOnMount ?? true,
    retry: options?.retry ?? 3,


  })
}

export function useNotesByFolder(
  folderId: number | null,
  options?: TQueryOptions<TNoteWithMetadata[]>
) {
  return useQuery({
    queryKey: QUERY_KEYS.NOTES_BY_FOLDER(folderId),
    queryFn: async () => {
      const result = await getNotesByFolder(folderId)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch notes')
      }
      return result.data || []
    },
    enabled: options?.enabled !== false,
    staleTime: options?.staleTime ?? STALE_TIMES.SHORT,
    gcTime: options?.cacheTime ?? CACHE_TIMES.MEDIUM,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: options?.refetchOnMount ?? true,
    retry: options?.retry ?? 3,


  })
}

export function useSearchNotes(
  searchOptions: TSearchOptions,
  options?: TQueryOptions<TSearchResult>
) {
  return useQuery({
    queryKey: QUERY_KEYS.SEARCH_NOTES(searchOptions.query),
    queryFn: async () => {
      const result = await searchNotesWithOptions(searchOptions.query)
      if (!result.success) {
        throw new Error(result.error || 'Failed to search notes')
      }
      return result.data!
    },
    enabled: !!searchOptions.query && searchOptions.query.length >= 2 && (options?.enabled !== false),
    staleTime: options?.staleTime ?? STALE_TIMES.MEDIUM,
    gcTime: options?.cacheTime ?? CACHE_TIMES.SHORT,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: options?.refetchOnMount ?? false,
    retry: options?.retry ?? 2,


  })
}

// Prefetch functions for performance optimization
export function prefetchNote(queryClient: any, id: number) {
  return queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.NOTE(id),
    queryFn: async () => {
      const result = await getNoteById(id)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch note')
      }
      return result.data!
    },
    staleTime: STALE_TIMES.SHORT,
  })
}

export function prefetchNotesByFolder(queryClient: any, folderId: number | null) {
  return queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.NOTES_BY_FOLDER(folderId),
    queryFn: async () => {
      const result = await getNotesByFolder(folderId)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch notes')
      }
      return result.data || []
    },
    staleTime: STALE_TIMES.SHORT,
  })
}

// Utility functions for cache management
export function invalidateNoteQueries(queryClient: any, noteId?: number, folderId?: number | null) {
  if (noteId) {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTE(noteId) })
  }
  if (folderId !== undefined) {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTES_BY_FOLDER(folderId) })
  }
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTES })
  queryClient.invalidateQueries({ queryKey: ['notes', 'search'] })
}

export function setNoteCache(queryClient: any, noteId: number, data: TNoteWithMetadata) {
  queryClient.setQueryData(QUERY_KEYS.NOTE(noteId), data)
}

export function setNotesByFolderCache(queryClient: any, folderId: number | null, data: TNoteWithMetadata[]) {
  queryClient.setQueryData(QUERY_KEYS.NOTES_BY_FOLDER(folderId), data)
}

export function getNoteFromCache(queryClient: any, noteId: number): TNoteWithMetadata | undefined {
  return queryClient.getQueryData(QUERY_KEYS.NOTE(noteId))
}

export function getNotesByFolderFromCache(queryClient: any, folderId: number | null): TNoteWithMetadata[] | undefined {
  return queryClient.getQueryData(QUERY_KEYS.NOTES_BY_FOLDER(folderId))
}

// Optimistic update helpers
export function updateNoteInFolderCache(
  queryClient: any,
  folderId: number | null,
  noteId: number,
  updater: (note: TNoteWithMetadata) => TNoteWithMetadata
) {
  const notes = getNotesByFolderFromCache(queryClient, folderId)
  if (notes) {
    const updatedNotes = notes.map(note =>
      note.id === noteId ? updater(note) : note
    )
    setNotesByFolderCache(queryClient, folderId, updatedNotes)
  }
}

export function addNoteToFolderCache(
  queryClient: any,
  folderId: number | null,
  note: TNoteWithMetadata
) {
  const notes = getNotesByFolderFromCache(queryClient, folderId) || []
  const updatedNotes = [...notes, note].sort((a, b) => a.position - b.position)
  setNotesByFolderCache(queryClient, folderId, updatedNotes)
}

export function removeNoteFromFolderCache(
  queryClient: any,
  folderId: number | null,
  noteId: number
) {
  const notes = getNotesByFolderFromCache(queryClient, folderId)
  if (notes) {
    const updatedNotes = notes.filter(note => note.id !== noteId)
    setNotesByFolderCache(queryClient, folderId, updatedNotes)
  }
}

export function moveNoteBetweenFoldersCache(
  queryClient: any,
  note: TNoteWithMetadata,
  oldFolderId: number | null,
  newFolderId: number | null
) {
  // Remove from old folder
  removeNoteFromFolderCache(queryClient, oldFolderId, note.id)

  // Add to new folder
  const updatedNote = { ...note, folderId: newFolderId }
  addNoteToFolderCache(queryClient, newFolderId, { ...updatedNote, folderId: updatedNote.folderId || undefined })

  // Update individual note cache
  setNoteCache(queryClient, note.id, { ...updatedNote, folderId: updatedNote.folderId || undefined })
}
