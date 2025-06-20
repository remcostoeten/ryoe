import { DatabaseHealthIndicator } from '@/modules/database-actions/ui/database-health-indicator'
import { UserCreationForm } from '@/modules/database-actions/ui/user-creation-form'
import { DatabaseQueryTester } from '@/modules/database-actions/ui/database-query-tester'
import { FooterEnhanced } from '@/components/footer-enhanced'
import { UserProfile } from '@/components/layout/UserProfile'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { resetDemoUser } from '@/services/user-service'
import { useQueryClient } from '@tanstack/react-query'

export function HomePage() {
	const queryClient = useQueryClient()

	const handleResetDemo = async () => {
		try {
			await resetDemoUser()
			queryClient.invalidateQueries({ queryKey: ['user', 'current'] })
			window.location.reload()
		} catch (error) {
			console.error('Failed to reset demo user:', error)
		}
	}

	return (
		<div className='min-h-screen p-6 pt-20'>
			<div className='max-w-6xl mx-auto space-y-8'>
				{/* Header with User Profile */}
				<div className='flex justify-between items-center'>
					<h1 className='text-2xl font-bold text-gray-200'>Ryoe Dashboard</h1>
					<div className='flex items-center gap-4'>
						<Button
							variant="outline"
							size="sm"
							onClick={handleResetDemo}
							className="flex items-center gap-2"
						>
							<RefreshCw className="w-4 h-4" />
							Reset Demo
						</Button>
						<UserProfile />
					</div>
				</div>

				<div className='text-center space-y-6'>
					<main className='pt-4 space-y-4 pb-16'>
						<div className='flex justify-center'>
							<DatabaseHealthIndicator />
						</div>

						<div className='text-sm text-muted-foreground'>
							<p>Database health indicator shows real-time SQLite database status</p>
						</div>

						<div className='flex justify-center'>
							<DatabaseQueryTester />
						</div>

						<div className='mt-8 p-6 bg-card rounded-lg shadow-sm'>
							<h2 className='text-xl font-semibold mb-4'>Create User</h2>
							<UserCreationForm />
						</div>
					</main>
				</div>
			</div>
			{/* <Footer /> */}
			<FooterEnhanced />
		</div>
	)
}

export const Component = HomePage
