import { useQuery } from '@tanstack/react-query'
import { getFolders } from '@/services/folder-service'
import type { TFolder } from '@/services/types'

export function useFolders() {
    const { data: folders, isLoading } = useQuery<TFolder[]>({
        queryKey: ['folders'],
        queryFn: async () => {
            const result = await getFolders()
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch folders')
            }
            return result.data!
        }
    })

    return { folders, isLoading }
} 