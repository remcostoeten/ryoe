import { Outlet, useLocation } from 'react-router'
import { Navigation } from './navigation'
import { AppGuard } from './AppGuard'

export function RootLayout() {
    const location = useLocation()
    const isOnboarding = location.pathname === '/onboarding'

    return (
        <AppGuard>
            <div className="min-h-screen">
                {!isOnboarding && <Navigation />}
                <main className="min-h-screen">
                    <Outlet />
                </main>
            </div>
        </AppGuard>
    )
}

// Keep the original Layout component for backward compatibility
import { Footer } from './footer'

type TProps = {
    children: React.ReactNode
}

export function Layout({ children }: TProps) {
    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1 pb-12">{children}</main>
            <Footer />
        </div>
    )
}
