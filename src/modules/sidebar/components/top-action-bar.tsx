'use client'

import { Plus, Search, MoreHorizontal, FolderPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut'
import { useFolderContext } from '@/contexts/folder-context'
import { FolderCreationInput } from './folder-creation-input'
import { SearchInput } from './search-input'

export function TopActionBar() {
	const [isCreatingFolder, setIsCreatingFolder] = useState(false)
	// const [showDebugger, setShowDebugger] = useState(false); // Temporarily disabled
	const [isSearching, setIsSearching] = useState(false)
	const [searchFilter, setSearchFilter] = useState('')
	const { createFolder, selectedFolderId, folders, expandFolder } =
		useFolderContext()

	// Get the selected folder name for tooltip context
	const selectedFolder = folders.find(f => f.id === selectedFolderId)
	const selectedFolderName = selectedFolder?.name

	async function handleCreateFolder(folderName: string) {
		try {
			await createFolder({
				name: folderName,
				parentId: selectedFolderId || undefined, // Create as child of selected folder, or root if none selected
			})

			// If we created a child folder, expand the parent to show it
			if (selectedFolderId) {
				expandFolder(selectedFolderId)
			}

			setTimeout(() => setIsCreatingFolder(false), 50)
		} catch (error) {
			console.error('Failed to create folder:', error)
		}
	}

	function handleSearch(searchQuery: string) {
		setSearchFilter(searchQuery)
		setIsSearching(false)
	}

	function handleCancelSearch() {
		setSearchFilter('')
		setIsSearching(false)
	}

	function handleCancelCreation() {
		setIsCreatingFolder(false)
	}

	useKeyboardShortcut({ key: '/', metaKey: true }, () => {
		setIsSearching(true)
	})

	// useKeyboardShortcut(
	//   { key: "d", metaKey: true },
	//   () => {
	//     setShowDebugger(!showDebugger);
	//   },
	//   { debug: false },
	// );

	// useKeyboardShortcut(
	//   { key: "Enter" },
	//   () => {
	//     // Handle enter key if needed
	//   },
	//   { debug: showDebugger, enabled: isCreatingFolder },
	// );

	useKeyboardShortcut(
		{ key: 'Escape' },
		() => {
			if (isCreatingFolder) {
				handleCancelCreation()
			} else if (isSearching) {
				handleCancelSearch()
			}
		},
		{ enabled: isCreatingFolder || isSearching }
	)

	const bezierCurve = [0.42, 0, 0.38, 1]

	return (
		<>
			<TooltipProvider>
				<div className='flex items-center border-b border-sidebar-border bg-background AAA  h-12 p-2 min-h-[48px] overflow-hidden max-h-[48px]'>
					<AnimatePresence mode='wait'>
						{isSearching ? (
							<motion.div
								key='searchInput'
								initial={{ y: '100%', opacity: 0 }}
								animate={{ y: '0%', opacity: 1 }}
								exit={{ y: '100%', opacity: 0 }}
								transition={{
									duration: 0.3,
									ease: bezierCurve,
								}}
								className='w-full'
							>
								<SearchInput
									isVisible={isSearching}
									onSearch={handleSearch}
									onCancel={handleCancelSearch}
									placeholder='Search folders...'
									onQueryChange={setSearchFilter}
								/>
							</motion.div>
						) : isCreatingFolder ? (
							<motion.div
								key='folderInput'
								initial={{ y: '100%', opacity: 0 }}
								animate={{ y: '0%', opacity: 1 }}
								exit={{ y: '100%', opacity: 0 }}
								transition={{
									duration: 0.3,
									ease: bezierCurve,
								}}
								className='w-full'
							>
								<FolderCreationInput
									isVisible={isCreatingFolder}
									onCreateFolder={handleCreateFolder}
									onCancel={handleCancelCreation}
								/>
							</motion.div>
						) : (
							<motion.div
								key='actionBar'
								initial={{ y: '0%', opacity: 1 }}
								animate={{ y: '0%', opacity: 1 }}
								exit={{ y: '-100%', opacity: 0 }}
								transition={{
									duration: 0.15,
									ease: bezierCurve,
								}}
								className='flex items-center gap-2 w-full'
							>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant='ghost'
											size='sm'
											className='h-8 w-8 p-0 text-sidebar-foreground hover:bg-background AAA-accent hover:text-sidebar-accent-foreground'
											onClick={() => setIsCreatingFolder(true)}
										>
											<FolderPlus className='h-4 w-4' />
										</Button>
									</TooltipTrigger>
									<TooltipContent
										side='bottom'
										className='bg-background AAA-primary border-sidebar-border text-sidebar-foreground'
									>
										<div className='flex flex-col'>
											<p>New folder</p>
											{selectedFolderName && (
												<p className='text-xs opacity-70'>
													in "{selectedFolderName}"
												</p>
											)}
											<kbd className='ml-auto text-xs opacity-70 mt-1'>
												⌘N
											</kbd>
										</div>
									</TooltipContent>
								</Tooltip>

								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant='ghost'
											size='sm'
											className='h-8 w-8 p-0 text-sidebar-foreground hover:bg-background AAA-accent hover:text-sidebar-accent-foreground'
											onClick={() => setIsSearching(true)}
										>
											<Search className='h-4 w-4' />
										</Button>
									</TooltipTrigger>
									<TooltipContent
										side='bottom'
										className='bg-background AAA-primary border-sidebar-border text-sidebar-foreground'
									>
										<div className='flex flex-col'>
											<p>Search folders</p>
											<kbd className='ml-auto text-xs opacity-70 mt-1'>
												⌘/
											</kbd>
										</div>
									</TooltipContent>
								</Tooltip>

								<div className='flex-1' />

								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant='ghost'
											size='sm'
											className='h-8 w-8 p-0 text-sidebar-foreground hover:bg-background AAA-accent hover:text-sidebar-accent-foreground'
										>
											<MoreHorizontal className='h-4 w-4' />
										</Button>
									</TooltipTrigger>
									<TooltipContent
										side='bottom'
										className='bg-background AAA-primary border-sidebar-border text-sidebar-foreground'
									>
										More options
									</TooltipContent>
								</Tooltip>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</TooltipProvider>
		</>
	)
}
