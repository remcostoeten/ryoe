import { Spinner } from '@/components/ui/loaders/spinner'
import { useOnboardingStatus } from '@/hooks/useOnboarding'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'

type TProps = {
	children: React.ReactNode
}

export function AppGuard({ children }: TProps) {
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
