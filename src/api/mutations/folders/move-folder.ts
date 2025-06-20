import { moveFolder } from '@/services/folder-service'
import type { TFolderWithStats } from '@/types'

export async function moveFolderMutation(
	id: number,
	newParentId: number | null,
): Promise<TFolderWithStats> {
	const result = await moveFolder(id, newParentId)
	if (!result.success || !result.data) {
		throw new Error(result.error || 'Failed to move folder')
	}
	return result.data
}
