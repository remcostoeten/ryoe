import { registerUser } from '@/services/user-service'
import type { TRegisterUserVariables } from '@/api/mutations/types'
import type { TUser } from '@/types'

export async function registerUserMutation(data: TRegisterUserVariables): Promise<TUser> {
	const result = await registerUser(data)
	if (!result.success) {
		throw new Error(result.error || 'Failed to register user')
	}
	return result.data!
}
