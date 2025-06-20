import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useCurrentUser } from './use-current-user'

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
