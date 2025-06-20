'use client'

import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { SidebarGroup, SidebarGroupContent } from '@/components/ui/sidebar'
import {
	ChevronDown,
	ChevronRight,
	Database,
	HardDrive,
	Code2,
	Monitor,
	Package,
	Building,
	Home,
} from 'lucide-react'
import * as React from 'react'
import { useLocation, Link } from 'react-router'
import { useState, useMemo } from 'react'

type TDocSection = {
	id: string
	title: string
	path: string
	icon: React.ComponentType<{ className?: string }>
	children?: TDocSection[]
}

const docsNavigation: TDocSection[] = [
	{
		id: 'docs-home',
		title: 'Documentation Home',
		path: '/docs',
		icon: Home,
	},
	{
		id: 'storage',
		title: 'Storage & File System',
		path: '/docs/storage',
		icon: HardDrive,
	},
	{
		id: 'database',
		title: 'Database Operations',
		path: '/docs/db-operations',
		icon: Database,
	},
	{
		id: 'storage-api',
		title: 'Storage API Reference',
		path: '/docs/storage-api',
		icon: Code2,
	},
	{
		id: 'window-management',
		title: 'Window Management',
		path: '/docs/window-management',
		icon: Monitor,
	},
	{
		id: 'tech-stack',
		title: 'Technology Stack',
		path: '/docs/tech-stack',
		icon: Package,
	},
	{
		id: 'architecture',
		title: 'Architecture',
		path: '/docs/architecture',
		icon: Building,
	},
]

type TDocsSidebarProps = {
	searchFilter: string
}

export function DocsSidebar({ searchFilter }: TDocsSidebarProps) {
	const location = useLocation()
	const pathname = location.pathname
	const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

	// Filter docs based on search
	const filteredDocs = useMemo(() => {
		if (!searchFilter.trim()) return docsNavigation

		const query = searchFilter.toLowerCase()
		return docsNavigation.filter(
			doc => doc.title.toLowerCase().includes(query) || doc.path.toLowerCase().includes(query)
		)
	}, [searchFilter])

	// Helper function to check if a route is active
	const isActiveRoute = (href: string) => {
		if (href === '/docs') {
			return pathname === '/docs'
		}
		return pathname.startsWith(href)
	}

	const toggleSection = (sectionId: string) => {
		const newExpanded = new Set(expandedSections)
		if (newExpanded.has(sectionId)) {
			newExpanded.delete(sectionId)
		} else {
			newExpanded.add(sectionId)
		}
		setExpandedSections(newExpanded)
	}

	return (
		<SidebarGroup className='px-0 py-0'>
			<SidebarGroupContent>
				<div className='space-y-1'>
					{filteredDocs.map(doc => {
						const Icon = doc.icon
						const isActive = isActiveRoute(doc.path)

						return (
							<div key={doc.id}>
								{doc.children ? (
									<Collapsible
										open={expandedSections.has(doc.id)}
										onOpenChange={() => toggleSection(doc.id)}
									>
										<CollapsibleTrigger asChild>
											<Button
												variant='ghost'
												className={`w-full justify-start gap-1 h-7 px-1 mx-0 text-xs font-normal overflow-hidden ${
													isActive
														? 'bg-background AAA-accent text-sidebar-accent-foreground'
														: 'text-sidebar-foreground hover:bg-background AAA-accent hover:text-sidebar-accent-foreground'
												}`}
											>
												{expandedSections.has(doc.id) ? (
													<ChevronDown className='h-3 w-3 text-sidebar-foreground flex-shrink-0' />
												) : (
													<ChevronRight className='h-3 w-3 text-sidebar-foreground flex-shrink-0' />
												)}
												<Icon className='h-3 w-3 text-sidebar-foreground flex-shrink-0' />
												<span className='truncate text-xs'>
													{doc.title}
												</span>
											</Button>
										</CollapsibleTrigger>
										<CollapsibleContent className='ml-4 mt-1 space-y-1'>
											{doc.children.map(child => {
												const ChildIcon = child.icon
												const isChildActive = isActiveRoute(child.path)

												return (
													<Link key={child.id} to={child.path}>
														<Button
															variant='ghost'
															className={`w-full justify-start h-6 px-1 text-xs font-normal overflow-hidden ${
																isChildActive
																	? 'bg-background AAA-accent text-sidebar-accent-foreground'
																	: 'text-sidebar-foreground hover:bg-background AAA-accent hover:text-sidebar-accent-foreground'
															}`}
														>
															<div className='flex items-center gap-1 min-w-0 flex-1 overflow-hidden'>
																<ChildIcon className='h-3 w-3 flex-shrink-0' />
																<span className='truncate text-xs'>
																	{child.title}
																</span>
															</div>
														</Button>
													</Link>
												)
											})}
										</CollapsibleContent>
									</Collapsible>
								) : (
									<Link to={doc.path}>
										<Button
											variant='ghost'
											className={`w-full justify-start gap-1 h-7 px-1 mx-0 text-xs font-normal overflow-hidden ${
												isActive
													? 'bg-background AAA-accent text-sidebar-accent-foreground'
													: 'text-sidebar-foreground hover:bg-background AAA-accent hover:text-sidebar-accent-foreground'
											}`}
										>
											<Icon className='h-3 w-3 text-sidebar-foreground flex-shrink-0' />
											<span className='truncate text-xs'>{doc.title}</span>
										</Button>
									</Link>
								)}
							</div>
						)
					})}
				</div>
			</SidebarGroupContent>
		</SidebarGroup>
	)
}
