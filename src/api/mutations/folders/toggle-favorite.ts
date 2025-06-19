import { toggleFolderFavoriteStatus } from '@/services/folder-service'
import type { TFolderWithStats } from '@/services/types'

export async function toggleFolderFavoriteMutation(id: number): Promise<TFolderWithStats> {
    const result = await toggleFolderFavoriteStatus(id)
    if (!result.success) {
        throw new Error(result.error || 'Failed to toggle folder favorite')
    }
    return result.data!
} 