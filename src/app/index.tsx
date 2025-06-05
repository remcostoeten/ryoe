import { Providers } from '@/components/provider'
import { AppGuard } from '@/components/AppGuard'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import './global.css'

import AppRouter from '@/app/router'

export default function App() {
    return (
        <ErrorBoundary>
            <Providers>
                <AppGuard>
                    <AppRouter />
                </AppGuard>
            </Providers>
        </ErrorBoundary>
    )
}
