import { createFolder } from '@/services/folder-service'
import type { TFolderCreationData, TFolderWithStats } from '@/types'

export async function createFolderMutation(data: TFolderCreationData): Promise<TFolderWithStats> {
	const result = await createFolder(data)
	if (!result.success || !result.data) {
		throw new Error(result.error || 'Failed to create folder')
	}
	return result.data
}
