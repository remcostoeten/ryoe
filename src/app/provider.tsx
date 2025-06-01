import { ReactNode, Suspense, useEffect } from 'react'
import AppErrorPage from '@/features/errors/app-error'
import { ErrorBoundary } from 'react-error-boundary'
import { TooltipProvider } from '@/components/ui/tooltip'
import { initializeDatabase } from '@/api/db'
import { initTheme } from '@/lib/theme'
import { ToastProvider } from '@/components/ui/toast'

export default function AppProvider({ children }: { children: ReactNode }) {
    useEffect(() => {
        // Initialize database when app starts
        initializeDatabase().catch((error) => {
            console.error('Failed to initialize database:', error)
        })

        // Initialize theme
        initTheme().catch((error) => {
            console.error('Failed to initialize theme:', error)
        })
    }, [])

    return (
        <Suspense fallback={<>Loading...</>}>
            <ErrorBoundary FallbackComponent={AppErrorPage}>
                <ToastProvider>
                    <TooltipProvider>{children}</TooltipProvider>
                </ToastProvider>
            </ErrorBoundary>
        </Suspense>
    )
}
