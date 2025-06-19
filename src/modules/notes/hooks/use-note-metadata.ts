import { useQuery } from '@tanstack/react-query'
import { getNoteById } from '@/services/note-service'

export function useNoteMetadata(noteId: number) {
  const { data: noteResult } = useQuery({
    queryKey: ['note', noteId],
    queryFn: () => getNoteById(noteId)
  })

  const metadata = noteResult?.success && noteResult.data ? {
    createdAt: new Date(noteResult.data.createdAt * 1000),
    updatedAt: new Date(noteResult.data.updatedAt * 1000),
    isFavorite: noteResult.data.isFavorite || false,
    folderId: noteResult.data.folderId || null
  } : null

  return { metadata }
} 