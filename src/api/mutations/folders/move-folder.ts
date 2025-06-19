import { moveFolderToParent } from '@/services/folder-service'
import type { TFolderWithStats } from '@/services/types'

export async function moveFolderMutation(
    id: number,
    newParentId: number | null,
    newPosition?: number
): Promise<TFolderWithStats> {
    const result = await moveFolderToParent(id, newParentId, newPosition)
    if (!result.success) {
        throw new Error(result.error || 'Failed to move folder')
    }
    return result.data!
} 