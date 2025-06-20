import { getNotesByFolder } from '@/services/note-service'
import type { TNoteWithMetadata } from '@/services/types'

export async function getNotesByFolderQuery(folderId: number | null): Promise<TNoteWithMetadata[]> {
	const result = await getNotesByFolder(folderId)
	if (!result.success) {
		throw new Error(result.error || 'Failed to get notes')
	}
	return result.data!
}
