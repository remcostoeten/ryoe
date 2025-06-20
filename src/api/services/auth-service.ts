import { useQueryClient } from '@tanstack/react-query'
import type { TUserProfile } from '@/types'

export const AUTH_QUERY_KEYS = {
	CURRENT_USER: ['auth', 'current-user'] as const,
	USER_PROFILE: (id: number) => ['auth', 'user-profile', id] as const,
	ONBOARDING_STATUS: ['auth', 'onboarding-status'] as const,
} as const

export function getCurrentUserFromCache(
	queryClient: ReturnType<typeof useQueryClient>
): TUserProfile | undefined {
	return queryClient.getQueryData(AUTH_QUERY_KEYS.CURRENT_USER)
}

export function setCurrentUserCache(
	queryClient: ReturnType<typeof useQueryClient>,
	data: TUserProfile
) {
	queryClient.setQueryData(AUTH_QUERY_KEYS.CURRENT_USER, data)
}

export function invalidateAuthQueries(queryClient: ReturnType<typeof useQueryClient>) {
	queryClient.invalidateQueries({ queryKey: ['auth'] })
}
