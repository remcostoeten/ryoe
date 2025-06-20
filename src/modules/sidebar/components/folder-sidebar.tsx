import React, { useState, useRef, useEffect, useOptimistic, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { NoteItem } from './note-item'
import { useFolderNotes } from '../hooks/use-folder-notes'
import { useMoveFolder, useDeleteFolder } from '@/api/services/folders-service'
import { useUpdateNote, useDeleteNote } from '@/api/services/notes-service'
import { useToggleFolderFavorite } from '@/api/services/folders-service'
import { useToggleNoteFavorite } from '@/api/services/notes-service'
import { cn } from '@/shared/utils'
import type { TNote } from '@/domain/entities/workspace'
import { useFolderContext } from '@/contexts/folder-context'
import { SidebarGroup, SidebarGroupContent } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@radix-ui/react-collapsible'
import {
	FileText,
	FolderPlus,
	Edit,
	Star,
	Trash2,
	FolderOpen,
	Folder,
	ChevronDown,
	ChevronRight,
	Plus,
} from 'lucide-react'

type TFolderSidebarProps = {
	searchFilter: string
	enableDragDrop?: boolean
	showNotes?: boolean
	onNoteSelect?: (note: TNote) => void
	selectedNoteId?: number | null
}

type ContextMenuState = {
	visible: boolean
	x: number
	y: number
	folder: any | null
}

type OptimisticFolderAction =
	| {
		type: 'CREATE_FOLDER'
		parentId: number | null
		tempId: string
		name: string
	}
	| { type: 'DELETE_FOLDER'; folderId: number }
	| { type: 'RENAME_FOLDER'; folderId: number; newName: string }
	| {
		type: 'MOVE_FOLDER'
		folderId: number
		newParentId: number | null
		newPosition: number
	}
	| { type: 'CREATE_NOTE'; folderId: number; tempId: string; note: TNote }
	| { type: 'DELETE_NOTE'; noteId: number; folderId: number }
	| {
		type: 'UPDATE_NOTE'
		noteId: number
		folderId: number
		updates: Partial<TNote>
	}

// Enhanced Context Menu with smooth animations
const CustomContextMenu = ({
	contextMenu,
	onClose,
	onEdit,
	onCreateChild,
	onCreateNote,
	onDelete,
	onMove,
	onToggleFavorite,
	showNotes,
}: {
	contextMenu: ContextMenuState
	onClose: () => void
	onEdit: (folder: any) => void
	onCreateChild: (folderId: number) => void
	onCreateNote?: (folderId: number) => void
	onDelete: (folder: any) => void
	onMove: (folder: any) => void
	onToggleFavorite: (folder: any) => void
	showNotes: boolean
}) => {
	const menuRef = useRef<HTMLDivElement>(null)
	const [isVisible, setIsVisible] = useState(false)

	useEffect(() => {
		if (contextMenu.visible) {
			// Small delay for smooth animation
			setTimeout(() => setIsVisible(true), 10)
		} else {
			setIsVisible(false)
		}
	}, [contextMenu.visible])

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				onClose()
			}
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (!contextMenu.visible) return

			switch (event.key) {
				case 'n':
					if (showNotes && onCreateNote) {
						onCreateNote(contextMenu.folder.id)
						onClose()
					}
					break
				case 'f':
					onCreateChild(contextMenu.folder.id)
					onClose()
					break
				case 'r':
					onEdit(contextMenu.folder)
					onClose()
					break
				case 's':
					onToggleFavorite(contextMenu.folder)
					onClose()
					break
				case 'Escape':
					onClose()
					break
			}
		}

		if (contextMenu.visible) {
			document.addEventListener('mousedown', handleClickOutside)
			document.addEventListener('keydown', handleKeyDown)
			menuRef.current?.focus()
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [
		contextMenu.visible,
		onClose,
		onEdit,
		onCreateChild,
		onCreateNote,
		onToggleFavorite,
		showNotes,
	])

	if (!contextMenu.visible || !contextMenu.folder) return null

	const menuItems = [
		{
			icon: FileText,
			label: 'New note',
			shortcut: 'N',
			action: () => onCreateNote?.(contextMenu.folder.id),
			show: showNotes && onCreateNote,
		},
		{
			icon: FolderPlus,
			label: 'New folder',
			shortcut: 'F',
			action: () => onCreateChild(contextMenu.folder.id),
			show: true,
		},
		{
			icon: Edit,
			label: 'Rename',
			shortcut: 'R',
			action: () => onEdit(contextMenu.folder),
			show: true,
		},
		{
			icon: Star,
			label: contextMenu.folder?.isFavorite ? 'Remove from favorites' : 'Add to favorites',
			shortcut: 'S',
			action: () => onToggleFavorite(contextMenu.folder),
			show: true,
		},
		{
			icon: Trash2,
			label: 'Delete',
			shortcut: '⌫',
			action: () => onDelete(contextMenu.folder),
			show: true,
			isDanger: true,
			separator: true,
		},
	]

	return (
		<div
			ref={menuRef}
			className={cn(
				'fixed z-50 min-w-[200px] overflow-hidden rounded-xl border border-border/40 bg-card/95 backdrop-blur-md p-1.5 text-card-foreground shadow-2xl transition-all duration-200 ease-out',
				isVisible
					? 'opacity-100 scale-100 translate-y-0'
					: 'opacity-0 scale-95 -translate-y-2'
			)}
			style={{
				left: contextMenu.x,
				top: contextMenu.y,
			}}
			tabIndex={-1}
		>
			{menuItems.map((item, index) => {
				if (!item.show) return null

				return (
					<React.Fragment key={index}>
						{item.separator && <div className='h-px my-1.5 bg-border/40' />}
						<div
							className={cn(
								'flex cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2.5 text-sm outline-none transition-all duration-150 ease-out',
								item.isDanger
									? 'hover:bg-destructive/15 hover:text-destructive text-destructive/90'
									: 'hover:bg-accent/60 hover:text-accent-foreground hover:scale-[1.02]'
							)}
							onClick={() => {
								item.action()
								onClose()
							}}
						>
							<div className='flex items-center'>
								<item.icon className='mr-3 h-4 w-4' />
								<span className='font-medium'>{item.label}</span>
							</div>
							{item.shortcut && (
								<span className='text-xs text-muted-foreground/70 font-mono bg-muted/40 px-1.5 py-0.5 rounded'>
									{item.shortcut}
								</span>
							)}
						</div>
					</React.Fragment>
				)
			})}
		</div>
	)
}

export function FolderSidebar({
	searchFilter,
	enableDragDrop = true,
	showNotes = true,
	onNoteSelect,
	selectedNoteId,
}: TFolderSidebarProps) {
	const navigate = useNavigate()

	const {
		treeData,
		toggleFolder,
		expandedFolderIds,
		selectedFolderId,
		selectFolder,
		filteredTreeData,
		startEditing,
		stopEditing,
		editingFolderId,
		renameFolder,
		createFolder: createFolderFromContext,
		refreshFolders,
	} = useFolderContext()

	// Optimistic state management for instant UI updates
	const [optimisticActions, addOptimisticAction] = useOptimistic<
		OptimisticFolderAction[],
		OptimisticFolderAction
	>([], (state, action) => [...state, action])

	// Mutations
	const moveFolderMutation = useMoveFolder()
	const deleteFolderMutation = useDeleteFolder()
	const updateNoteMutation = useUpdateNote()
	const deleteNoteMutation = useDeleteNote()
	const toggleFolderFavoriteMutation = useToggleFolderFavorite()
	const toggleNoteFavoriteMutation = useToggleNoteFavorite()

	const [editingName, setEditingName] = useState('')
	const [editingNoteId, setEditingNoteId] = useState<number | null>(null)
	const [contextMenu, setContextMenu] = useState<ContextMenuState>({
		visible: false,
		x: 0,
		y: 0,
		folder: null,
	})
	const [dragState, setDragState] = useState({
		draggedFolder: null as any,
		dragOverFolder: null as number | null,
		isDragging: false,
	})

	const displayFolders = searchFilter ? filteredTreeData : treeData

	const allFolderIds = useMemo(() => {
		const collectFolderIds = (folders: any[]): number[] => {
			const ids: number[] = []
			if (!folders || !Array.isArray(folders)) {
				return ids
			}
			folders.forEach(folder => {
				ids.push(folder.id)
				if (folder.children) {
					ids.push(...collectFolderIds(folder.children))
				}
			})
			return ids
		}
		return collectFolderIds(displayFolders || [])
	}, [displayFolders])

	const { getNotesForFolder, addNoteToFolder, updateNoteInFolder, removeNoteFromFolder } =
		useFolderNotes(showNotes ? allFolderIds : [])

	function addToParentFolder(folders: any[], parentId: number, newFolder: any): any[] {
		return folders.map(folder => {
			if (folder.id === parentId) {
				return {
					...folder,
					children: [...(folder.children || []), newFolder],
				}
			}
			if (folder.children) {
				return {
					...folder,
					children: addToParentFolder(folder.children, parentId, newFolder),
				}
			}
			return folder
		})
	}

	const optimisticFolders = useMemo(() => {
		let folders = [...(displayFolders || [])]

		optimisticActions.forEach(action => {
			switch (action.type) {
				case 'CREATE_FOLDER':
					const tempFolder = {
						id: parseInt(action.tempId) || -Math.floor(Math.random() * 1000000),
						name: action.name,
						parentId: action.parentId,
						children: [],
						position: 0,
						isPublic: false,
						isFavorite: false,
						isTemp: true,
						depth: action.parentId === null ? 0 : 1,
						hasChildren: false,
						createdAt: new Date(),
						updatedAt: new Date(),
					}
					if (action.parentId === null) {
						folders.push(tempFolder)
					} else {
						folders = addToParentFolder(folders, action.parentId, tempFolder)
					}
					break
				case 'DELETE_FOLDER':
					folders = removeFolderById(folders, action.folderId)
					break
				case 'RENAME_FOLDER':
					folders = updateFolderName(folders, action.folderId, action.newName)
					break
			}
		})

		return folders
	}, [displayFolders, optimisticActions])

	function removeFolderById(folders: any[], folderId: number): any[] {
		return folders
			.filter(folder => folder.id !== folderId)
			.map(folder => ({
				...folder,
				children: folder.children ? removeFolderById(folder.children, folderId) : [],
			}))
	}

	function updateFolderName(folders: any[], folderId: number, newName: string): any[] {
		return folders.map(folder => {
			if (folder.id === folderId) {
				return { ...folder, name: newName }
			}
			if (folder.children) {
				return {
					...folder,
					children: updateFolderName(folder.children, folderId, newName),
				}
			}
			return folder
		})
	}

	// Enhanced handlers with optimistic updates
	const handleCreateFolder = useCallback(
		async (parentId: number) => {
			const tempId = `temp-${Date.now()}`
			const folderName = 'New Folder'

			// Optimistic update
			addOptimisticAction({
				type: 'CREATE_FOLDER',
				parentId,
				tempId,
				name: folderName,
			})

			// Expand parent folder if needed
			if (!expandedFolderIds.has(parentId)) {
				toggleFolder(parentId)
			}

			try {
				const result = await createFolderFromContext({
					name: folderName,
					parentId: parentId === -1 ? undefined : parentId,
				})

				if (result) {
					// Start editing the new folder immediately
					setTimeout(() => {
						startEditing(result.id)
						setEditingName(folderName)
					}, 100)
				}
			} catch (error) {
				console.error('Failed to create folder:', error)
				// Optimistic update will be reverted automatically on re-render
			}
		},
		[
			createFolderFromContext,
			expandedFolderIds,
			toggleFolder,
			startEditing,
			addOptimisticAction,
		]
	)

	const handleCreateNote = useCallback(
		async (folderId: number) => {
			const tempId = `temp-note-${Date.now()}`
			const tempNote: TNote = {
				id: tempId as any,
				title: 'Untitled',
				content: JSON.stringify([
					{
						id: 'initial-block',
						type: 'paragraph',
						content: [],
					},
				]),
				folderId,
				position: 0,
				isPublic: false,
				isFavorite: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			}

			// Optimistic update
			addOptimisticAction({
				type: 'CREATE_NOTE',
				folderId,
				tempId,
				note: tempNote,
			})

			// Expand folder if needed
			if (!expandedFolderIds.has(folderId)) {
				toggleFolder(folderId)
			}

			// Add to local state immediately
			addNoteToFolder(folderId, tempNote)

			try {
				const { createNoteWithValidation } = await import('@/services/note-service')
				const response = await createNoteWithValidation({
					title: 'Untitled',
					content: tempNote.content,
					folderId,
				})

				if (response.success && response.data) {
					const realNote: TNote = {
						id: response.data.id,
						title: response.data.title,
						content: response.data.content,
						folderId: response.data.folderId || null,
						position: response.data.position,
						isPublic: false,
						isFavorite: false,
						createdAt: new Date(response.data.createdAt),
						updatedAt: new Date(response.data.updatedAt),
					}

					// Replace temp note with real note
					removeNoteFromFolder(folderId, tempId as any)
					addNoteToFolder(folderId, realNote)

					// Navigate to the note and focus title
					navigate(`/notes/${realNote.id}`)
					onNoteSelect?.(realNote)

					// Start editing the title after navigation
					setTimeout(() => {
						setEditingNoteId(realNote.id)
					}, 200)
				}
			} catch (error) {
				console.error('Failed to create note:', error)
				removeNoteFromFolder(folderId, tempId as any)
			}
		},
		[
			addOptimisticAction,
			expandedFolderIds,
			toggleFolder,
			addNoteToFolder,
			removeNoteFromFolder,
			navigate,
			onNoteSelect,
		]
	)

	const handleDeleteFolder = useCallback(
		async (folder: any) => {
			// Optimistic update
			addOptimisticAction({
				type: 'DELETE_FOLDER',
				folderId: folder.id,
			})

			try {
				await deleteFolderMutation.mutateAsync({
					id: folder.id,
					force: true,
				})
				await refreshFolders()
			} catch (error) {
				console.error('Failed to delete folder:', error)
				// Error handling - optimistic update will be reverted
			}
		},
		[deleteFolderMutation, refreshFolders, addOptimisticAction]
	)

	const handleDeleteNote = useCallback(
		async (note: TNote) => {
			if (!note.folderId) return

			// Optimistic update
			addOptimisticAction({
				type: 'DELETE_NOTE',
				noteId: note.id,
				folderId: note.folderId,
			})

			// Remove from local state immediately
			removeNoteFromFolder(note.folderId, note.id)

			// Clear selection if needed
			if (selectedNoteId === note.id) {
				navigate('/notes')
			}

			try {
				await deleteNoteMutation.mutateAsync(note.id)
			} catch (error) {
				console.error('Failed to delete note:', error)
				// Re-add the note on error
				addNoteToFolder(note.folderId, note)
			}
		},
		[
			deleteNoteMutation,
			removeNoteFromFolder,
			addNoteToFolder,
			selectedNoteId,
			navigate,
			addOptimisticAction,
		]
	)

	const handleRenameFolder = useCallback(
		async (folderId: number, newName: string) => {
			const trimmedName = newName.trim()
			if (!trimmedName) return

			// Optimistic update
			addOptimisticAction({
				type: 'RENAME_FOLDER',
				folderId,
				newName: trimmedName,
			})

			try {
				await renameFolder(folderId, trimmedName)
			} catch (error) {
				console.error('Failed to rename folder:', error)
			} finally {
				stopEditing()
				setEditingName('')
			}
		},
		[renameFolder, stopEditing, addOptimisticAction]
	)

	const handleUpdateNote = useCallback(
		async (note: TNote, newTitle: string) => {
			const trimmedTitle = newTitle.trim()
			if (!trimmedTitle || !note.folderId) return

			// Optimistic update
			addOptimisticAction({
				type: 'UPDATE_NOTE',
				noteId: note.id,
				folderId: note.folderId,
				updates: { title: trimmedTitle, updatedAt: new Date() },
			})

			const updatedNote = {
				...note,
				title: trimmedTitle,
				updatedAt: new Date(),
			}
			updateNoteInFolder(note.folderId, updatedNote)

			try {
				await updateNoteMutation.mutateAsync({
					id: note.id,
					data: { title: trimmedTitle },
				})
			} catch (error) {
				console.error('Failed to update note:', error)
				// Revert on error
				updateNoteInFolder(note.folderId, note)
			} finally {
				setEditingNoteId(null)
			}
		},
		[updateNoteMutation, updateNoteInFolder, addOptimisticAction]
	)

	// Enhanced drag and drop with smooth animations
	const handleDragStart = useCallback(
		(e: React.DragEvent, folder: any) => {
			if (!enableDragDrop) return

			setDragState(prev => ({
				...prev,
				draggedFolder: folder,
				isDragging: true,
			}))

			e.dataTransfer.effectAllowed = 'move'
			e.dataTransfer.setData('text/plain', folder.id.toString())

			// Add drag image for better visual feedback
			const dragImage = document.createElement('div')
			dragImage.textContent = folder.name
			dragImage.className =
				'bg-card border border-border rounded-lg px-3 py-2 text-sm shadow-lg'
			dragImage.style.position = 'absolute'
			dragImage.style.top = '-1000px'
			document.body.appendChild(dragImage)
			e.dataTransfer.setDragImage(dragImage, 0, 0)
			setTimeout(() => document.body.removeChild(dragImage), 0)
		},
		[enableDragDrop]
	)

	const handleDragOver = useCallback(
		(e: React.DragEvent, targetFolder: any) => {
			if (!dragState.isDragging) return

			e.preventDefault()
			e.dataTransfer.dropEffect = 'move'

			setDragState(prev => ({
				...prev,
				dragOverFolder: targetFolder.id,
			}))
		},
		[dragState.isDragging]
	)

	const handleDragLeave = useCallback(() => {
		setDragState(prev => ({
			...prev,
			dragOverFolder: null,
		}))
	}, [])

	const handleDrop = useCallback(
		async (e: React.DragEvent, targetFolder: any) => {
			e.preventDefault()

			const { draggedFolder } = dragState
			if (!draggedFolder || draggedFolder.id === targetFolder.id) {
				setDragState(prev => ({
					...prev,
					dragOverFolder: null,
					isDragging: false,
				}))
				return
			}

			addOptimisticAction({
				type: 'MOVE_FOLDER',
				folderId: draggedFolder.id,
				newParentId: targetFolder.id,
				newPosition: 0,
			})

			setDragState({
				draggedFolder: null,
				dragOverFolder: null,
				isDragging: false,
			})

			try {
				await moveFolderMutation.mutateAsync({
					id: draggedFolder.id,
					newParentId: targetFolder.id,
					newPosition: 0,
				})
			} catch (error) {
				console.error('Failed to move folder:', error)
			}
		},
		[dragState, moveFolderMutation, addOptimisticAction]
	)

	const handleDragEnd = useCallback(() => {
		setDragState({
			draggedFolder: null,
			dragOverFolder: null,
			isDragging: false,
		})
	}, [])

	const handleRightClick = useCallback((e: React.MouseEvent, folder: any) => {
		e.preventDefault()
		e.stopPropagation()

		const menuWidth = 220
		const menuHeight = 280
		const viewportWidth = window.innerWidth
		const viewportHeight = window.innerHeight

		let x = e.clientX
		let y = e.clientY

		if (x + menuWidth > viewportWidth) {
			x = viewportWidth - menuWidth - 10
		}

		if (y + menuHeight > viewportHeight) {
			y = viewportHeight - menuHeight - 10
		}

		setContextMenu({
			visible: true,
			x,
			y,
			folder,
		})
	}, [])

	const handleCloseContextMenu = useCallback(() => {
		setContextMenu({
			visible: false,
			x: 0,
			y: 0,
			folder: null,
		})
	}, [])

	const renderFolder = useCallback(
		(folder: any, level = 0) => {
			const isExpanded = expandedFolderIds.has(folder.id)
			const isSelected = selectedFolderId === folder.id
			const isEditing = editingFolderId === folder.id
			const hasChildren = folder.children && folder.children.length > 0
			const indentLevel = level * 16
			const isDraggedOver = dragState.dragOverFolder === folder.id
			const isDragged = dragState.draggedFolder?.id === folder.id

			const FolderIcon = isExpanded ? FolderOpen : Folder

			return (
				<div key={folder.id || folder.tempId}>
					<Collapsible open={isExpanded} onOpenChange={() => toggleFolder(folder.id)}>
						<div
							className={cn(
								'group relative transition-all duration-200 ease-out rounded-lg mx-1',
								isDraggedOver && 'bg-accent/30 scale-[1.02] shadow-sm',
								isDragged && 'opacity-40 scale-95',
								folder.isTemp && 'animate-pulse'
							)}
							onDragOver={e => handleDragOver(e, folder)}
							onDragLeave={handleDragLeave}
							onDrop={e => handleDrop(e, folder)}
						>
							<CollapsibleTrigger asChild>
								<Button
									variant='ghost'
									onClick={() => {
										selectFolder(folder.id)
										toggleFolder(folder.id)
									}}
									onDoubleClick={e => {
										e.stopPropagation()
										if (!folder.isTemp) {
											startEditing(folder.id)
											setEditingName(folder.name)
										}
									}}
									onContextMenu={e => handleRightClick(e, folder)}
									draggable={enableDragDrop && !folder.isTemp}
									onDragStart={e => handleDragStart(e, folder)}
									onDragEnd={handleDragEnd}
									className={cn(
										'w-full justify-between h-8 px-2 text-sm font-normal overflow-hidden transition-all duration-200 ease-out hover:scale-[1.01]',
										isSelected
											? 'bg-accent/70 text-accent-foreground shadow-sm border border-border/30'
											: 'text-foreground/80 hover:bg-accent/40 hover:text-accent-foreground'
									)}
									style={{
										paddingLeft: `${indentLevel + 8}px`,
									}}
								>
									<div className='flex items-center gap-2 min-w-0 flex-1 overflow-hidden'>
										<button
											onClick={e => {
												e.stopPropagation()
												if (!folder.isTemp) {
													toggleFolder(folder.id)
												}
											}}
											className='flex items-center justify-center h-4 w-4 hover:bg-accent rounded-sm transition-all duration-150'
										>
											{hasChildren ? (
												isExpanded ? (
													<ChevronDown className='h-3.5 w-3.5 transition-transform duration-200' />
												) : (
													<ChevronRight className='h-3.5 w-3.5 transition-transform duration-200' />
												)
											) : (
												<div className='w-3.5' />
											)}
										</button>

										<FolderIcon
											className={cn(
												'h-4 w-4 flex-shrink-0 transition-colors duration-200',
												isSelected
													? 'text-accent-foreground/80'
													: 'text-muted-foreground/70'
											)}
										/>

										{folder.isFavorite && (
											<Star className='h-3.5 w-3.5 text-amber-500 fill-current flex-shrink-0' />
										)}

										{isEditing ? (
											<input
												key={`edit-${folder.id}`}
												type='text'
												value={editingName}
												onChange={e => setEditingName(e.target.value)}
												onBlur={() =>
													handleRenameFolder(folder.id, editingName)
												}
												onKeyDown={e => {
													if (e.key === 'Enter') {
														handleRenameFolder(folder.id, editingName)
													} else if (e.key === 'Escape') {
														stopEditing()
														setEditingName('')
													}
												}}
												onFocus={e => {
													const input = e.target as HTMLInputElement
													if (editingName === 'New Folder') {
														input.select()
													} else {
														setTimeout(() => {
															input.setSelectionRange(
																input.value.length,
																input.value.length
															)
														}, 0)
													}
												}}
												className='bg-transparent border-none outline-none text-sm flex-1 min-w-0 font-medium'
												autoFocus
												onClick={e => e.stopPropagation()}
											/>
										) : (
											<span
												className={cn(
													'truncate text-sm font-medium transition-colors duration-200',
													isSelected
														? 'text-accent-foreground'
														: 'text-foreground/90'
												)}
											>
												{folder.name}
											</span>
										)}
									</div>

									<div className='flex items-center gap-1'>
										<span
											className={cn(
												'text-xs transition-colors duration-200',
												isSelected
													? 'text-accent-foreground/60'
													: 'text-muted-foreground/60'
											)}
										>
											{(folder.children?.length || 0) +
												(showNotes
													? getNotesForFolder(folder.id).length
													: 0)}
										</span>
									</div>
								</Button>
							</CollapsibleTrigger>
						</div>

						{hasChildren && (
							<CollapsibleContent className='space-y-1 overflow-hidden'>
								<div className='animate-in slide-in-from-top-2 duration-200'>
									{folder.children.map((childFolder: any) =>
										renderFolder(childFolder, level + 1)
									)}
								</div>
							</CollapsibleContent>
						)}
					</Collapsible>

					{showNotes &&
						isExpanded &&
						(() => {
							const folderNotes = getNotesForFolder(folder.id)
							return (
								folderNotes.length > 0 && (
									<div
										className='space-y-1 animate-in slide-in-from-top-2 duration-200'
										style={{
											paddingLeft: `${indentLevel + 24}px`,
										}}
									>
										{folderNotes.map(note => (
											<NoteItem
												key={`note-${note.id}`}
												note={note}
												isSelected={selectedNoteId === note.id}
												isEditing={editingNoteId === note.id}
												onSelect={note => {
													navigate(`/notes/${note.id}`)
													onNoteSelect?.(note)
												}}
												onEdit={note => setEditingNoteId(note.id)}
												onUpdate={handleUpdateNote}
												onCancelEdit={() => setEditingNoteId(null)}
												onDelete={handleDeleteNote}
												onDuplicate={async note => {
													// Handle note duplication with optimistic updates
													if (!note.folderId) return

													const duplicatedNote = {
														...note,
														id: `temp-${Date.now()}` as any,
														title: `${note.title} (Copy)`,
														createdAt: new Date(),
														updatedAt: new Date(),
													}

													addNoteToFolder(note.folderId, duplicatedNote)

													try {
														const { createNoteWithValidation } =
															await import('@/services/note-service')
														const response =
															await createNoteWithValidation({
																title: duplicatedNote.title,
																content: note.content,
																folderId: note.folderId,
															})

														if (response.success && response.data) {
															removeNoteFromFolder(
																note.folderId,
																duplicatedNote.id
															)
															addNoteToFolder(note.folderId, {
																id: response.data.id,
																title: response.data.title,
																content: response.data.content,
																folderId:
																	response.data.folderId || null,
																position: response.data.position,
																isPublic: note.isPublic,
																isFavorite: false,
																createdAt: new Date(
																	response.data.createdAt
																),
																updatedAt: new Date(
																	response.data.updatedAt
																),
															})
														}
													} catch (error) {
														removeNoteFromFolder(
															note.folderId,
															duplicatedNote.id
														)
													}
												}}
												onMove={() => { }}
												onToggleVisibility={() => { }}
												onToggleFavorite={async note => {
													try {
														await toggleNoteFavoriteMutation.mutateAsync(
															note.id
														)
													} catch (error) {
														console.error(
															'Failed to toggle note favorite:',
															error
														)
													}
												}}
												enableDragDrop={enableDragDrop}
											/>
										))}
									</div>
								)
							)
						})()}
				</div>
			)
		},
		[
			expandedFolderIds,
			selectedFolderId,
			editingFolderId,
			dragState,
			showNotes,
			getNotesForFolder,
			selectedNoteId,
			editingNoteId,
			editingName,
			toggleFolder,
			selectFolder,
			startEditing,
			handleRightClick,
			handleDragStart,
			handleDragEnd,
			handleDragOver,
			handleDragLeave,
			handleDrop,
			handleRenameFolder,
			stopEditing,
			navigate,
			onNoteSelect,
			handleUpdateNote,
			handleDeleteNote,
			addNoteToFolder,
			removeNoteFromFolder,
			toggleNoteFavoriteMutation,
			enableDragDrop,
		]
	)

	return (
		<>
			<SidebarGroup className='px-0 py-0'>
				<SidebarGroupContent>
					<div className='space-y-1 min-h-[200px] p-2'>
						{optimisticFolders.length === 0 ? (
							<div className='text-center py-12 text-muted-foreground/60'>
								<Folder className='h-12 w-12 mx-auto mb-4 opacity-40' />
								<p className='text-sm font-medium mb-2'>No folders yet</p>
								<p className='text-xs text-muted-foreground/40'>
									Right-click to create your first folder
								</p>
							</div>
						) : (
							optimisticFolders.map(folder => renderFolder(folder, 0))
						)}

						<div className='pt-4 border-t border-border/30 mt-6'>
							<Button
								variant='ghost'
								size='sm'
								onClick={() => handleCreateFolder(-1)}
								className='w-full justify-start text-sm text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-all duration-200'
							>
								<Plus className='h-4 w-4 mr-2' />
								Create folder
							</Button>
						</div>
					</div>
				</SidebarGroupContent>
			</SidebarGroup>

			{/* Enhanced Context Menu */}
			<CustomContextMenu
				contextMenu={contextMenu}
				onClose={handleCloseContextMenu}
				onEdit={folder => {
					startEditing(folder.id)
					setEditingName(folder.name)
				}}
				onCreateChild={handleCreateFolder}
				onCreateNote={showNotes ? handleCreateNote : undefined}
				onDelete={handleDeleteFolder}
				onMove={() => { }}
				onToggleFavorite={async folder => {
					try {
						await toggleFolderFavoriteMutation.mutateAsync(folder.id)
					} catch (error) {
						console.error('Failed to toggle folder favorite:', error)
					}
				}}
				showNotes={showNotes}
			/>
		</>
	)
}
