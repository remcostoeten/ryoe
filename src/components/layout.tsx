import type React from 'react'
import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { AppGuard } from './AppGuard'
import { useCurrentUser } from '@/hooks/useOnboarding'
import { FolderProvider } from '@/contexts/folder-context'
import { AppSidebar } from '@/modules/sidebar/components/app-sidebar'
import { RightSidebar } from '@/modules/sidebar/components/right-sidebar'
import { SidebarProvider, SidebarInset, useSidebar } from '@/components/ui/sidebar'
import { DocumentHeader } from '@/modules/sidebar/document-header'
import { useMenuEvents } from '@/hooks/use-menu-events'

// Component that uses the sidebar context
function SidebarLayout() {
	const { toggleSidebar, open } = useSidebar()
	const location = useLocation()
	const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)

	// Listen for menu events from Tauri
	useMenuEvents()

	// Check if we're on a docs page or individual note page
	const isDocsPage = location.pathname.startsWith('/docs')
	const isNotePage = location.pathname.match(/^\/notes\/\d+$/)

	const handleToggleRightSidebar = () => {
		setIsRightSidebarOpen(prev => !prev)
	}

	function getDocumentTitle() {
		const pathname = location.pathname
		if (pathname === '/') return 'Home'
		if (pathname.startsWith('/docs')) return 'Documentation'
		if (pathname.startsWith('/notes')) return 'Notes'
		if (pathname.startsWith('/folders')) return 'Folders'
		if (pathname.startsWith('/profile')) return 'Profile'
		return pathname.split('/').pop() || 'Untitled Document'
	}

	// Add keyboard shortcut for right sidebar toggle (Cmd+Shift+B) - on docs and note pages
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (
				event.key === 'b' &&
				(event.metaKey || event.ctrlKey) &&
				event.shiftKey &&
				(isDocsPage || isNotePage) // Allow on docs and note pages
			) {
				event.preventDefault()
				handleToggleRightSidebar()
			}
		}

		// Listen for right sidebar toggle from menu - on docs and note pages
		const handleRightSidebarToggle = () => {
			if (isDocsPage || isNotePage) {
				handleToggleRightSidebar()
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		window.addEventListener('toggle-right-sidebar', handleRightSidebarToggle)

		return () => {
			window.removeEventListener('keydown', handleKeyDown)
			window.removeEventListener('toggle-right-sidebar', handleRightSidebarToggle)
		}
	}, [isDocsPage, isNotePage])

	return (
		<div className='min-h-screen flex flex-1'>
			<AppSidebar />
			<SidebarInset className='flex-1'>
				<div className='min-h-screen flex flex-col'>
					<DocumentHeader
						documentTitle={getDocumentTitle()}
						onNavigatePrevious={() => console.log('Navigate previous')}
						onNavigateNext={() => console.log('Navigate next')}
						onToggleRightSidebar={handleToggleRightSidebar}
						onToggleSidebar={toggleSidebar}
						showSidebarToggle={true}
						isSidebarOpen={open}
						showRightSidebarToggle={isDocsPage || !!isNotePage}
					/>
					<main className='flex-1 bg-main'>
						<Outlet />
					</main>
				</div>
			</SidebarInset>
			{/* Right sidebar with smooth animation - show on docs and note pages */}
			{(isDocsPage || isNotePage) && (
				<AnimatePresence mode='wait'>
					{isRightSidebarOpen && (
						<motion.div
							key='right-sidebar'
							initial={{ width: 0, opacity: 0 }}
							animate={{ width: 256, opacity: 1 }}
							exit={{ width: 0, opacity: 0 }}
							transition={{
								duration: 0.4,
								ease: [0.68, -0.55, 0.265, 1.55], // Bouncy poppy bezier curve
								width: {
									duration: 0.4,
									ease: [0.68, -0.55, 0.265, 1.55],
								},
								opacity: {
									duration: 0.25,
									ease: [0.25, 0.46, 0.45, 0.94],
								},
							}}
							className='overflow-hidden flex-shrink-0'
						>
							<RightSidebar documentTitle={getDocumentTitle()} />
						</motion.div>
					)}
				</AnimatePresence>
			)}
		</div>
	)
}

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
				<FolderProvider parentId={null}>
					<SidebarProvider>
						<SidebarLayout />
					</SidebarProvider>
				</FolderProvider>
			) : (
				<div className='min-h-screen'>
					<main className='min-h-screen bg-main'>
						<Outlet />
					</main>
				</div>
			)}
		</AppGuard>
	)
}

// Keep the original Layout component for backward compatibility
type TProps = {
	children: React.ReactNode
}

export function Layout({ children }: TProps) {
	return (
		<div className='min-h-screen flex flex-col'>
			<main className='flex-1 pb-12'>{children}</main>
		</div>
	)
}
