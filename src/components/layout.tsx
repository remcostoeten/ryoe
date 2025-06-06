import { Outlet } from 'react-router'
import { Navigation } from './navigation'

export function RootLayout() {
    return (
        <div className="min-h-screen">
            <Navigation />
            <main className="min-h-screen">
                <Outlet />
            </main>
        </div>
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
