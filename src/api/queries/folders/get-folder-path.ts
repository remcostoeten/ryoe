import { getFolderPathWithStats } from '@/services/folder-service'
import type { TFolderWithStats } from '@/services/types'

export async function getFolderPathQuery(id: number): Promise<TFolderWithStats[]> {
    const result = await getFolderPathWithStats(id)
    if (!result.success) {
        throw new Error(result.error || 'Failed to get folder path')
    }
    return result.data!
} 