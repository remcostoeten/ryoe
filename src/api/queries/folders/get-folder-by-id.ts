import { getFolderById } from '@/services/folder-service'
import type { TFolderWithStats } from '@/services/types'

export async function getFolderByIdQuery(id: number): Promise<TFolderWithStats> {
	const result = await getFolderById(id)
	if (!result.success) {
		throw new Error(result.error || 'Failed to get folder')
	}
	return result.data!
}
