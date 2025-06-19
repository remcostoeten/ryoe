import { getFavoriteNotesWithMetadata } from '@/services/note-service'
import type { TNoteWithMetadata } from '@/services/types'

export async function getFavoriteNotesQuery(): Promise<TNoteWithMetadata[]> {
    const result = await getFavoriteNotesWithMetadata()
    if (!result.success) {
        throw new Error(result.error || 'Failed to get favorite notes')
    }
    return result.data!
} 