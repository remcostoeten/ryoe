import { ReactNode, Suspense, useEffect } from 'react'
import AppErrorPage from '@/features/errors/app-error'
import { ErrorBoundary } from 'react-error-boundary'
import { TooltipProvider } from '@/components/ui/tooltip'
import { initializeDatabase } from '@/api/db'

export default function AppProvider({ children }: { children: ReactNode }) {
    useEffect(() => {
        // Initialize database when app starts
        initializeDatabase().catch((error) => {
            console.error('Failed to initialize database:', error)
        })
    }, [])

    return (
        <Suspense fallback={<>Loading...</>}>
            <ErrorBoundary FallbackComponent={AppErrorPage}>
                <TooltipProvider>{children}</TooltipProvider>
            </ErrorBoundary>
        </Suspense>
    )
}
