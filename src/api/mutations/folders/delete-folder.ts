import { deleteFolderById } from '@/services/folder-service'

export async function deleteFolderMutation(
	id: number,
	options?: { force?: boolean }
): Promise<boolean> {
	const result = await deleteFolderById(id, options)
	if (!result.success) {
		throw new Error(result.error || 'Failed to delete folder')
	}
	return result.data!
}
