import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { getCurrentUser } from '@/services/user-service'
import type { TUserProfile } from '@/types'


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