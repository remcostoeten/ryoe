import { createFolderWithValidation } from '@/services/folder-service'
import type { TFolderCreationData, TFolderWithStats } from '@/services/types'

export async function createFolderMutation(data: TFolderCreationData): Promise<TFolderWithStats> {
	const result = await createFolderWithValidation(data)
	if (!result.success) {
		throw new Error(result.error || 'Failed to create folder')
	}
	return result.data!
}
