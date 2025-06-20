import { getFolderHierarchy } from '@/services/folder-service'
import type { TFolderWithStats } from '@/types'

export async function getFolderHierarchyQuery(): Promise<TFolderWithStats[]> {
	const result = await getFolderHierarchy()
	if (!result.success || !result.data) {
		throw new Error(result.error || 'Failed to get folder hierarchy')
	}
	return result.data
}
