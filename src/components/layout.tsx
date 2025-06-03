import { Outlet } from 'react-router'
import { Header } from './header'

export function RootLayout() {
    return (
        <div className="min-h-screen">
            <Header />
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
            <Header />
            <main className="flex-1 pb-12">{children}</main>
            <Footer />
        </div>
    )
}
