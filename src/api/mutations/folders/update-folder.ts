import { updateFolderWithValidation } from '@/services/folder-service'
import type { TFolderUpdateData, TFolderWithStats } from '@/services/types'

export async function updateFolderMutation(
    id: number,
    data: TFolderUpdateData
): Promise<TFolderWithStats> {
    const result = await updateFolderWithValidation(id, data)
    if (!result.success) {
        throw new Error(result.error || 'Failed to update folder')
    }
    return result.data!
} 