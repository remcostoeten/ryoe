import { updateFolder } from '@/services/folder-service'
import type { TFolder, TFolderWithStats } from '@/types'

export async function updateFolderMutation(id: number, data: Partial<TFolder>): Promise<TFolderWithStats> {
	const result = await updateFolder(id, data)
	if (!result.success || !result.data) {
		throw new Error(result.error || 'Failed to update folder')
	}
	return result.data
}
