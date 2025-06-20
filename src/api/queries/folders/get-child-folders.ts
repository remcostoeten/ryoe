import { getChildFolders } from '@/services/folder-service'
import type { TFolderWithStats } from '@/types'

export async function getChildFoldersQuery(parentId: number): Promise<TFolderWithStats[]> {
	const result = await getChildFolders(parentId)
	if (!result.success) {
		throw new Error(result.error || 'Failed to get child folders')
	}
	return result.data!
}
