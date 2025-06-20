'use client'

import { Button } from '@/components/ui/button'
import { Sidebar, SidebarContent, SidebarFooter } from '@/components/ui/sidebar'
import {
	Archive,
	Command,
	FileText,
	Folder,
	Star,
	Home,
	BookOpen,
	User,
	LogIn,
	Network,
} from 'lucide-react'
import * as React from 'react'
import { useLocation, Link } from 'react-router'
import { useFolderContext } from '@/contexts/folder-context'
import { useCurrentUser } from '@/hooks/useOnboarding'
import { SidebarContentResolver } from './sidebar-content-resolver'
import { ActionBarResolver } from './action-bar-resolver'
import { useState } from 'react'

// Navigation items configuration
const navigationItems = [
	{ href: '/', icon: Home, label: 'Home' },
	{ href: '/notes', icon: FileText, label: 'Notes' },
	{ href: '/folders', icon: Folder, label: 'Folders' },
	{ href: '/port-manager', icon: Network, label: 'Port Manager' },
	{ href: '/docs', icon: BookOpen, label: 'Docs' },
]

const authenticatedItems = [{ href: '/profile', icon: User, label: 'Profile' }]

const unauthenticatedItems = [{ href: '/sign-in', icon: LogIn, label: 'Sign In' }]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { searchFilter: folderSearchFilter, setSearchFilter: setFolderSearchFilter } =
		useFolderContext()
	const location = useLocation()
	const { user, isLoading } = useCurrentUser()
	const pathname = location.pathname
	const [docsSearchFilter, setDocsSearchFilter] = useState('')

	// Determine which search filter to use based on current route
	const isDocsPage = pathname.startsWith('/docs')
	const currentSearchFilter = isDocsPage ? docsSearchFilter : folderSearchFilter

	const handleSearch = (query: string) => {
		if (isDocsPage) {
			setDocsSearchFilter(query)
		} else {
			setFolderSearchFilter(query)
		}
	}

	const handleCancelSearch = () => {
		if (isDocsPage) {
			setDocsSearchFilter('')
		} else {
			setFolderSearchFilter('')
		}
	}

	// Helper function to check if a route is active
	const isActiveRoute = (href: string) => {
		if (href === '/') {
			return pathname === '/'
		}
		return pathname.startsWith(href)
	}

	return (
		<Sidebar
			collapsible='icon'
			className='overflow-hidden border-r border-sidebar-border'
			style={{ maxWidth: 'var(--sidebar-width)' }}
			{...props}
		>
			<Sidebar
				collapsible='none'
				className='!w-[48px] border-r border-sidebar-border bg-background AAA'
			>
				<SidebarContent className='p-2 space-y-1'>
					{/* Main navigation items */}
					{navigationItems.map(item => {
						const Icon = item.icon
						const isActive = isActiveRoute(item.href)
						return (
							<Button
								key={item.href}
								variant='ghost'
								size='sm'
								asChild
								className={`h-8 w-8 p-0 ${isActive
										? 'bg-sidebar-accent text-sidebar-accent-foreground'
										: 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
									}`}
							>
								<Link to={item.href}>
									<Icon className='h-4 w-4' />
								</Link>
							</Button>
						)
					})}

					{/* Separator */}
					<div className='h-px bg-sidebar-border my-2' />

					{/* Additional utility buttons */}
					<Button
						variant='ghost'
						size='sm'
						className='h-8 w-8 p-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
					>
						<Star className='h-4 w-4' />
					</Button>
					<Button
						variant='ghost'
						size='sm'
						className='h-8 w-8 p-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
					>
						<Archive className='h-4 w-4' />
					</Button>
				</SidebarContent>

				<SidebarFooter className='p-2 space-y-1'>
					{/* Authentication-based items */}
					{!isLoading &&
						user &&
						authenticatedItems.map(item => {
							const Icon = item.icon
							const isActive = isActiveRoute(item.href)
							return (
								<Button
									key={item.href}
									variant='ghost'
									size='sm'
									asChild
									className={`h-8 w-8 p-0 ${isActive
											? 'bg-sidebar-accent text-sidebar-accent-foreground'
											: 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
										}`}
								>
									<Link to={item.href}>
										<Icon className='h-4 w-4' />
									</Link>
								</Button>
							)
						})}

					{/* Sign in button for unauthenticated users */}
					{!isLoading &&
						!user &&
						unauthenticatedItems.map(item => {
							const Icon = item.icon
							const isActive = isActiveRoute(item.href)
							return (
								<Button
									key={item.href}
									variant='ghost'
									size='sm'
									asChild
									className={`h-8 w-8 p-0 ${isActive
											? 'bg-sidebar-accent text-sidebar-accent-foreground'
											: 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
										}`}
								>
									<Link to={item.href}>
										<Icon className='h-4 w-4' />
									</Link>
								</Button>
							)
						})}

					{/* Settings/Command button */}
					<Button
						variant='ghost'
						size='sm'
						className='h-8 w-8 p-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
					>
						<Command className='h-4 w-4' />
					</Button>
				</SidebarFooter>
			</Sidebar>

			<Sidebar
				collapsible='none'
				className='hidden md:flex bg-background AAA'
				style={{
					width: 'calc(var(--sidebar-width) - 48px)',
					maxWidth: 'calc(var(--sidebar-width) - 48px)',
					minWidth: 'calc(var(--sidebar-width) - 48px)',
				}}
			>
				<ActionBarResolver onSearch={handleSearch} onCancelSearch={handleCancelSearch} />

				<SidebarContent className='p-2'>
					<SidebarContentResolver searchFilter={currentSearchFilter} />
				</SidebarContent>
			</Sidebar>
		</Sidebar>
	)
}
