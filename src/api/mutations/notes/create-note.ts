import { createNoteWithValidation } from '@/services/note-service'
import type { TNoteCreationData, TNoteWithMetadata } from '@/services/types'

export async function createNoteMutation(data: TNoteCreationData): Promise<TNoteWithMetadata> {
    const result = await createNoteWithValidation(data)
    if (!result.success) {
        throw new Error(result.error || 'Failed to create note')
    }
    return result.data!
} 