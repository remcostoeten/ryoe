import { getUserProfile } from '@/services/user-service'
import type { TServiceResult, TUserProfile } from '@/services/types'

export async function getUserProfileQuery(id: number): Promise<TUserProfile> {
    const result = await getUserProfile(id)
    if (!result.success) {
        throw new Error(result.error || 'Failed to get user profile')
    }
    return result.data!
} 