import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { checkOnboardingStatus } from '@/features/onboarding/api/onboarding-api'
import { Spinner } from '@/components/ui/loaders/spinner'

interface AppGuardProps {
  children: React.ReactNode
}

export function AppGuard({ children }: AppGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    async function checkSetup() {
      try {
        // Skip check if already on onboarding page
        if (location.pathname === '/onboarding') {
          setIsLoading(false)
          return
        }

        const isComplete = await checkOnboardingStatus()
        
        if (!isComplete) {
          setNeedsOnboarding(true)
          navigate('/onboarding', { replace: true })
        } else {
          setNeedsOnboarding(false)
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error)
        // On error, assume onboarding is needed
        setNeedsOnboarding(true)
        navigate('/onboarding', { replace: true })
      } finally {
        setIsLoading(false)
      }
    }

    checkSetup()
  }, [navigate, location.pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  // If on onboarding page or onboarding is complete, show children
  if (location.pathname === '/onboarding' || !needsOnboarding) {
    return <>{children}</>
  }

  // This shouldn't happen due to navigation above, but just in case
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Spinner />
    </div>
  )
}
