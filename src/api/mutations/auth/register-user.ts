import { registerUser } from '@/services/user-service'
import type { TUserRegistrationData, TUserProfile } from '@/services/types'

export async function registerUserMutation(data: TUserRegistrationData): Promise<TUserProfile> {
    const result = await registerUser(data)
    if (!result.success) {
        throw new Error(result.error || 'Failed to register user')
    }
    return result.data!
} 