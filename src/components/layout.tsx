import { Outlet, useLocation } from 'react-router'
import { Navigation } from './navigation'
import { AppGuard } from './AppGuard'
import { useCurrentUser } from '@/features/onboarding/hooks/useOnboarding'
import { FolderProvider } from '@/contexts/folder-context'
import { AppSidebar } from '@/modules/sidebar/components/app-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

export function RootLayout() {
    const location = useLocation()
    const { user, isLoading } = useCurrentUser()
    const isOnboarding = location.pathname === '/onboarding'
    const isSignIn = location.pathname === '/sign-in'

    // Show sidebar for authenticated users (not on onboarding or sign-in pages)
    const showSidebar = user && !isOnboarding && !isSignIn && !isLoading

    return (
        <AppGuard>
            {showSidebar ? (
                // Authenticated layout with sidebar
                <FolderProvider parentId={null}>
                    <SidebarProvider>
                        <div className="min-h-screen flex">
                            <AppSidebar />
                            <SidebarInset className="flex-1">
                                <div className="min-h-screen">
                                    <Navigation />
                                    <main className="min-h-screen">
                                        <Outlet />
                                    </main>
                                </div>
                            </SidebarInset>
                        </div>
                    </SidebarProvider>
                </FolderProvider>
            ) : (
                // Non-authenticated layout without sidebar
                <div className="min-h-screen">
                    {!isOnboarding && <Navigation />}
                    <main className="min-h-screen">
                        <Outlet />
                    </main>
                </div>
            )}
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
