import { getFavoriteFoldersWithStats } from '@/services/folder-service'
import type { TFolderWithStats } from '@/services/types'

export async function getFavoriteFoldersQuery(): Promise<TFolderWithStats[]> {
	const result = await getFavoriteFoldersWithStats()
	if (!result.success) {
		throw new Error(result.error || 'Failed to get favorite folders')
	}
	return result.data!
}
