import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { getUserProfile } from '@/services/user-service'
import type { TUserProfile } from '@/types'

export function useCurrentUser() {
    const { data: user, isLoading } = useQuery<TUserProfile>({
        queryKey: ['user', 'current'],
        queryFn: async () => {
            const result = await getUserProfile(0)
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch user profile')
            }
            return result.data!
        }
    })

    return { user, isLoading }
}

export function useOnboardingStatus() {
    const navigate = useNavigate()
    const { user, isLoading } = useCurrentUser()

    useEffect(() => {
        if (!isLoading && user && !user.isSetupComplete) {
            navigate('/onboarding')
        }
    }, [user, isLoading, navigate])

    return { isComplete: user?.isSetupComplete ?? false, isLoading }
} 