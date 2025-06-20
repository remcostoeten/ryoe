import { searchNotes } from '@/services/note-service'
import type { TSearchResult } from '@/services/types'

export async function searchNotesQuery(query: string): Promise<TSearchResult> {
	const result = await searchNotes(query)
	if (!result.success) {
		throw new Error(result.error || 'Failed to search notes')
	}
	return result.data!
}
