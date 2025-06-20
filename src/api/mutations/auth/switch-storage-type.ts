import { switchStorageType } from '@/services/user-service'
import type { TSwitchStorageTypeVariables } from '@/api/mutations/types'

export async function switchStorageTypeMutation(
	data: TSwitchStorageTypeVariables
): Promise<void> {
	const result = await switchStorageType(data)
	if (!result.success) {
		throw new Error(result.error || 'Failed to switch storage type')
	}
}
