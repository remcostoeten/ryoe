'use client'

import { Search, BookOpen, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SearchInput } from './search-input'
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut'

type TDocsActionBarProps = {
	onSearch: (query: string) => void
	onCancelSearch: () => void
}

export function DocsActionBar({ onSearch, onCancelSearch }: TDocsActionBarProps) {
	const [isSearching, setIsSearching] = useState(false)

	function handleSearch(searchQuery: string) {
		onSearch(searchQuery)
		setIsSearching(false)
	}

	function handleCancelSearch() {
		onCancelSearch()
		setIsSearching(false)
	}

	// Keyboard shortcuts
	useKeyboardShortcut({ key: '/' }, () => {
		setIsSearching(true)
	})

	useKeyboardShortcut(
		{ key: 'Escape' },
		() => {
			if (isSearching) {
				handleCancelSearch()
			}
		},
		{ enabled: isSearching }
	)

	const bezierCurve = [0.42, 0, 0.38, 1]

	return (
		<TooltipProvider>
			<div className='flex items-center border-b border-sidebar-border bg-background AAA p-2 min-h-[48px] overflow-hidden max-h-[48px]'>
				<AnimatePresence mode='wait'>
					{isSearching ? (
						<motion.div
							key='searchInput'
							initial={{ y: '100%', opacity: 0 }}
							animate={{ y: '0%', opacity: 1 }}
							exit={{ y: '100%', opacity: 0 }}
							transition={{ duration: 0.3, ease: bezierCurve }}
							className='w-full'
						>
							<SearchInput
								isVisible={isSearching}
								onSearch={handleSearch}
								onCancel={handleCancelSearch}
								placeholder='Search documentation...'
								onQueryChange={onSearch}
							/>
						</motion.div>
					) : (
						<motion.div
							key='actionBar'
							initial={{ y: '0%', opacity: 1 }}
							animate={{ y: '0%', opacity: 1 }}
							exit={{ y: '-100%', opacity: 0 }}
							transition={{ duration: 0.15, ease: bezierCurve }}
							className='flex items-center gap-2 w-full'
						>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant='ghost'
										size='sm'
										className='h-8 w-8 p-0 text-sidebar-foreground hover:bg-background AAA-accent hover:text-sidebar-accent-foreground'
									>
										<BookOpen className='h-4 w-4' />
									</Button>
								</TooltipTrigger>
								<TooltipContent
									side='bottom'
									className='bg-background AAA-primary border-sidebar-border text-sidebar-foreground'
								>
									<p>Documentation</p>
								</TooltipContent>
							</Tooltip>

							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant='ghost'
										size='sm'
										className='h-8 w-8 p-0 text-sidebar-foreground hover:bg-background AAA-accent hover:text-sidebar-accent-foreground'
									>
										<Home className='h-4 w-4' />
									</Button>
								</TooltipTrigger>
								<TooltipContent
									side='bottom'
									className='bg-background AAA-primary border-sidebar-border text-sidebar-foreground'
								>
									<p>Docs Home</p>
								</TooltipContent>
							</Tooltip>

							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant='ghost'
										size='sm'
										className='h-8 w-8 p-0 text-sidebar-foreground hover:bg-background AAA-accent hover:text-sidebar-accent-foreground ml-auto'
										onClick={() => setIsSearching(true)}
									>
										<Search className='h-4 w-4' />
									</Button>
								</TooltipTrigger>
								<TooltipContent
									side='bottom'
									className='bg-background AAA-primary border-sidebar-border text-sidebar-foreground'
								>
									<p>Search docs</p>
									<kbd className='ml-2 text-xs opacity-70'>/</kbd>
								</TooltipContent>
							</Tooltip>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</TooltipProvider>
	)
}
