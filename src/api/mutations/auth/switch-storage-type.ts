import { switchStorageType } from '@/services/user-service'
import type { TUserProfile } from '@/services/types'

export async function switchStorageTypeMutation(
	storageType: 'turso' | 'local'
): Promise<TUserProfile> {
	const result = await switchStorageType(storageType)
	if (!result.success) {
		throw new Error(result.error || 'Failed to switch storage type')
	}
	return result.data!
}
