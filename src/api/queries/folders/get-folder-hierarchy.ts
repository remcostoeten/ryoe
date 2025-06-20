import { getFolderHierarchyWithStats } from '@/services/folder-service'
import type { TFolderWithStats } from '@/services/types'

export async function getFolderHierarchyQuery(): Promise<TFolderWithStats[]> {
	const result = await getFolderHierarchyWithStats()
	if (!result.success) {
		throw new Error(result.error || 'Failed to get folder hierarchy')
	}
	return result.data!
}
