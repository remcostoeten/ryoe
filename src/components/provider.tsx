import { ReactNode, Suspense, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { TooltipProvider } from '@/components/ui/tooltip'
import { initializeDatabase } from '@/api'
import { initTheme } from '@/core/theme'
import { ToastProvider } from '@/components/ui/toast'
import { Spinner } from '@/components/ui/loaders/spinner'
import { debugEnvironment } from '@/shared/utils'

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 minutes
		},
	},
})

export function Providers({ children }: { children: ReactNode }) {
	useEffect(() => {
		const initializeApp = async () => {
			if (process.env.NODE_ENV === 'development') {
				debugEnvironment()
			}

			try {
				console.log('Initializing Turso database...')
				await initializeDatabase()
				console.log('Database initialized successfully')

				// TODO: Fix existing users that might have is_setup_complete = 0
			} catch (error) {
				console.error('Failed to initialize database:', error)
			}

			try {
				await initTheme()
			} catch (error) {
				console.error('Failed to initialize theme:', error)
			}
		}

		initializeApp()
	}, [])

	return (
		<QueryClientProvider client={queryClient}>
			<Suspense fallback={<Spinner />}>
				<ErrorBoundary
					FallbackComponent={({ error, resetErrorBoundary }) => (
						<div className='min-h-screen bg-black flex items-center justify-center p-6'>
							<div className='max-w-md w-full text-center space-y-6'>
								<div className='space-y-2'>
									<h1 className='text-2xl font-bold text-white'>
										Something went wrong
									</h1>
									<p className='text-gray-400'>
										{error?.message || 'An unexpected error occurred'}
									</p>
								</div>

								<div className='space-y-3'>
									<button
										onClick={resetErrorBoundary}
										className='w-full px-6 py-3 bg-white text-black rounded-full hover:bg-white/90 transition-colors font-medium'
									>
										Try Again
									</button>

									<button
										onClick={() => window.location.reload()}
										className='w-full px-6 py-3 bg-white/10 text-white border border-white/20 rounded-full hover:bg-white/20 transition-colors'
									>
										Reload Page
									</button>
								</div>

								{error && (
									<details className='text-left'>
										<summary className='text-gray-500 text-sm cursor-pointer'>
											Error Details
										</summary>
										<pre className='mt-2 text-xs text-gray-600 bg-gray-900 p-3 rounded overflow-auto'>
											{error.stack}
										</pre>
									</details>
								)}
							</div>
						</div>
					)}
				>
					<ToastProvider>
						<TooltipProvider>{children}</TooltipProvider>
					</ToastProvider>
				</ErrorBoundary>
			</Suspense>
		</QueryClientProvider>
	)
}
