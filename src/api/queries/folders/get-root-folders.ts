import { getRootFolders } from '@/services/folder-service'
import type { TFolderWithStats } from '@/types'

export async function getRootFoldersQuery(): Promise<TFolderWithStats[]> {
	const result = await getRootFolders()
	if (!result.success) {
		throw new Error(result.error || 'Failed to get root folders')
	}
	return result.data!
}
