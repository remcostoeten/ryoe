import { deleteFolder } from '@/services/folder-service'

export async function deleteFolderMutation(id: number, options?: { force?: boolean }): Promise<void> {
	const result = await deleteFolder(id, options)
	if (!result.success) {
		throw new Error(result.error || 'Failed to delete folder')
	}
}
