import type React from "react"
import { useState } from "react"
import { Outlet, useLocation } from "react-router"
import { AppGuard } from "./AppGuard"
import { useCurrentUser } from "@/features/onboarding/hooks/useOnboarding"
import { FolderProvider } from "@/contexts/folder-context"
import { AppSidebar } from "@/modules/sidebar/components/app-sidebar"
import { SidebarProvider, SidebarInset, useSidebar } from "@/components/ui/sidebar"
import { DocumentHeader } from "@/modules/sidebar/document-header"

// Component that uses the sidebar context
function SidebarLayout() {
  const { toggleSidebar, open } = useSidebar()
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)

  const handleToggleRightSidebar = () => {
    setIsRightSidebarOpen((prev) => !prev)
  }

  return (
    <div className="min-h-screen flex">
      <AppSidebar />
      <SidebarInset className="flex-1">
        <div className="min-h-screen flex flex-col">
          <DocumentHeader
            documentTitle="README.md"
            onNavigatePrevious={() => console.log("Navigate previous")}
            onNavigateNext={() => console.log("Navigate next")}
            onToggleRightSidebar={handleToggleRightSidebar}
            onToggleSidebar={toggleSidebar}
            showSidebarToggle={true}
            isSidebarOpen={open}
          />
          <main className="flex-1 bg-main">
            <Outlet />
          </main>
        </div>
      </SidebarInset>
      {/* Right sidebar */}
      {isRightSidebarOpen && (
        <div className="w-64 border-l border-border bg-background">{/* Right sidebar content */}</div>
      )}
    </div>
  )
}

export function RootLayout() {
  const location = useLocation()
  const { user, isLoading } = useCurrentUser()
  const isOnboarding = location.pathname === "/onboarding"
  const isSignIn = location.pathname === "/sign-in"

  // Show sidebar for authenticated users (not on onboarding or sign-in pages)
  const showSidebar = user && !isOnboarding && !isSignIn && !isLoading

  return (
    <AppGuard>
      {showSidebar ? (
        <FolderProvider parentId={null}>
          <SidebarProvider>
            <SidebarLayout />
          </SidebarProvider>
        </FolderProvider>
      ) : (
        <div className="min-h-screen">
          <main className="min-h-screen bg-main">
            <Outlet />
          </main>
        </div>
      )}
    </AppGuard>
  )
}

// Keep the original Layout component for backward compatibility
import { Footer } from "./footer"

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
