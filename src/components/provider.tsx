import { ReactNode, Suspense, useEffect } from 'react'
import AppErrorPage from '@/features/errors/app-error'
import { ErrorBoundary } from 'react-error-boundary'
import { TooltipProvider } from '@/components/ui/tooltip'
import { initializeDatabase } from '@/api/db'
import { initTheme } from '@/lib/theme'
import { ToastProvider } from '@/components/ui/toast'
import { Spinner } from '@/components/ui/loaders/spinner'
import { debugEnvironment } from '@/lib/environment'

export function Providers({ children }: { children: ReactNode }) {
    useEffect(() => {
        const initializeApp = async () => {
            // Debug environment information in development
            if (process.env.NODE_ENV === 'development') {
                debugEnvironment()
            }

            // Initialize Turso database (works in both web and Tauri environments)
            try {
                console.log('Initializing Turso database...')
                await initializeDatabase()
                console.log('Database initialized successfully')
            } catch (error) {
                console.error('Failed to initialize database:', error)
            }

            // Initialize theme (works in both environments)
            try {
                await initTheme()
            } catch (error) {
                console.error('Failed to initialize theme:', error)
            }
        }

        initializeApp()
    }, [])

    return (
        <Suspense fallback={<Spinner />}>
            <ErrorBoundary FallbackComponent={AppErrorPage}>
                <ToastProvider>
                    <TooltipProvider>{children}</TooltipProvider>
                </ToastProvider>
            </ErrorBoundary>
        </Suspense>
    )
}
