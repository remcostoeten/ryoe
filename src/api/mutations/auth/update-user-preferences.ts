import { updateUserPreferences } from '@/services/user-service'
import type { TUpdateUserPreferencesVariables } from '@/api/mutations/types'
import type { TUser } from '@/types'

export async function updateUserPreferencesMutation(
	data: TUpdateUserPreferencesVariables
): Promise<TUser> {
	const result = await updateUserPreferences(data)
	if (!result.success) {
		throw new Error(result.error || 'Failed to update user preferences')
	}
	return result.data!
}
