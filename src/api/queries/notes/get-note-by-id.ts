import { getNoteById } from '@/services/note-service'
import type { TNoteWithMetadata } from '@/services/types'

export async function getNoteByIdQuery(id: number): Promise<TNoteWithMetadata> {
	const result = await getNoteById(id)
	if (!result.success) {
		throw new Error(result.error || 'Failed to get note')
	}
	return result.data!
}
