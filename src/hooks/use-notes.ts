import { useQuery } from '@tanstack/react-query'
import { getNotes } from '@/services/note-service'
import type { TNote } from '@/services/types'

export function useNotes() {
    const { data: notes, isLoading } = useQuery<TNote[]>({
        queryKey: ['notes'],
        queryFn: async () => {
            const result = await getNotes()
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch notes')
            }
            return result.data!
        }
    })

    return { notes, isLoading }
} 