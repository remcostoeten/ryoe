import { getFolderPath } from '@/services/folder-service'
import type { TFolderWithStats } from '@/types'

export async function getFolderPathQuery(id: number): Promise<TFolderWithStats[]> {
	const result = await getFolderPath(id)
	if (!result.success || !result.data) {
		throw new Error(result.error || 'Failed to get folder path')
	}
	return result.data
}
