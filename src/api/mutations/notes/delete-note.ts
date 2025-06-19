import { deleteNoteById } from '@/services/note-service'

export async function deleteNoteMutation(id: number): Promise<void> {
    const result = await deleteNoteById(id)
    if (!result.success) {
        throw new Error(result.error || 'Failed to delete note')
    }
} 