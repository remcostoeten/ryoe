import { updateNoteWithValidation } from '@/services/note-service'
import type { TNoteUpdateData, TNoteWithMetadata } from '@/services/types'

export async function updateNoteMutation(
    id: number,
    data: TNoteUpdateData
): Promise<TNoteWithMetadata> {
    const result = await updateNoteWithValidation(id, data)
    if (!result.success) {
        throw new Error(result.error || 'Failed to update note')
    }
    return result.data!
} 