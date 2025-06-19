import { updateUserPreferences } from '@/services/user-service'
import type { TUserPreferencesUpdate, TUserProfile } from '@/services/types'

export async function updateUserPreferencesMutation(
    id: number,
    preferences: TUserPreferencesUpdate
): Promise<TUserProfile> {
    const result = await updateUserPreferences(id, preferences)
    if (!result.success) {
        throw new Error(result.error || 'Failed to update user preferences')
    }
    return result.data!
} 