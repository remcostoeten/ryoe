import { getCurrentUser } from '@/services/user-service'
import type { TServiceResult, TUserProfile } from '@/services/types'

export async function getCurrentUserQuery(): Promise<TUserProfile> {
    const result = await getCurrentUser()
    if (!result.success) {
        throw new Error(result.error || 'Failed to get current user')
    }
    return result.data!
} 