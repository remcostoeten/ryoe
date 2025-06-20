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
	LogOut,
} from 'lucide-react'
import * as React from 'react'
import { useLocation, Link } from 'react-router'
import { useFolderContext } from '@/contexts/folder-context'
import { useCurrentUser } from '@/hooks/useOnboarding'
import { logout } from '@/services/user-service'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { SidebarContentResolver } from './sidebar-content-resolver'
import { ActionBarResolver } from './action-bar-resolver'
import { useState } from 'react'

// Navigation items configuration
const navigationItems = [
	{ href: '/', icon: Home, label: 'Home' },
	{ href: '/notes', icon: FileText, label: 'Notes' },
	{ href: '/folders', icon: Folder, label: 'Folders' },
	{ href: '/docs', icon: BookOpen, label: 'Docs' },
]

const authenticatedItems = [{ href: '/profile', icon: User, label: 'Profile' }]

const unauthenticatedItems = [{ href: '/sign-in', icon: LogIn, label: 'Sign In' }]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const location = useLocation()
	const { user, isLoading } = useCurrentUser()
	const queryClient = useQueryClient()
	const navigate = useNavigate()
	const pathname = location.pathname
	const [isLoggingOut, setIsLoggingOut] = useState(false)
	const [searchFilter, setSearchFilter] = useState('')

	const handleLogout = async () => {
		setIsLoggingOut(true)
		try {
			const result = await logout()
			if (!result.success) {
				throw new Error(result.error || 'Failed to logout')
			}

			// Clear query cache
			queryClient.clear()

			// Navigate to onboarding
			navigate('/onboarding')
		} catch (error) {
			console.error('Failed to logout:', error)
			alert('Failed to logout. Please try again.')
		} finally {
			setIsLoggingOut(false)
		}
	}

	const handleSearch = (query: string) => {
		setSearchFilter(query)
	}

	const handleCancelSearch = () => {
		setSearchFilter('')
	}

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

					{/* Logout button for authenticated users */}
					{!isLoading && user && (
						<Button
							variant='ghost'
							size='sm'
							onClick={handleLogout}
							disabled={isLoggingOut}
							className='h-8 w-8 p-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground disabled:opacity-50'
							title={isLoggingOut ? 'Logging out...' : 'Logout'}
						>
							<LogOut className='h-4 w-4' />
						</Button>
					)}

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
					<SidebarContentResolver searchFilter={searchFilter} />
				</SidebarContent>
			</Sidebar>
		</Sidebar>
	)
}
