import { ReactNode, Suspense, useEffect } from 'react'
import AppErrorPage from '@/features/errors/app-error'
import { ErrorBoundary } from 'react-error-boundary'
import { TooltipProvider } from '@/components/ui/tooltip'
import { initializeDatabase } from '@/api/db'
import { initTheme } from '@/lib/theme'
import { ToastProvider } from '@/components/ui/toast'
import { Spinner } from '@/components/ui/spinner'
import { isTauriEnvironment } from '@/lib/environment'

export function Providers({ children }: { children: ReactNode }) {
    useEffect(() => {
        // Only initialize database in Tauri environment
        if (isTauriEnvironment()) {
            initializeDatabase().catch((error) => {
                console.error('Failed to initialize database:', error)
            })
        } else {
            console.log(
                'Running in web environment - database initialization skipped'
            )
        }

        initTheme().catch((error) => {
            console.error('Failed to initialize theme:', error)
        })
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
