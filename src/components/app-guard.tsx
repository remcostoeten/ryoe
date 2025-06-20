import { useOnboardingStatus } from '@/hooks/use-onboarding'
import { useNavigate, useLocation } from 'react-router'
import { useEffect } from 'react'
import { Spinner } from '@/components/ui/loaders/spinner'

interface AppGuardProps {
	children: React.ReactNode
}

export function AppGuard({ children }: AppGuardProps) {
	const { isComplete, isLoading } = useOnboardingStatus()
	const navigate = useNavigate()
	const location = useLocation()

	useEffect(() => {
		if (!isLoading && !isComplete && location.pathname !== '/onboarding') {
			navigate('/onboarding')
		}
	}, [isComplete, isLoading, navigate, location])

	if (isLoading) {
		return (
			<div className='flex items-center justify-center h-screen'>
				<Spinner />
			</div>
		)
	}

	return children
}
