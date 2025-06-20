'use client'

import { useState, useEffect } from 'react'
import {
	FileText,
	MoreHorizontal,
	Edit2,
	Trash2,
	Copy,
	Move,
	Eye,
	EyeOff,
	Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { cn } from '@/shared/utils'
import type { TNote } from '@/domain/entities/workspace'

type TNoteItemProps = {
	note: TNote
	isSelected?: boolean
	isEditing?: boolean
	onSelect?: (note: TNote) => void
	onEdit?: (note: TNote) => void
	onUpdate?: (note: TNote, newTitle: string) => void
	onCancelEdit?: () => void
	onDelete?: (note: TNote) => void
	onDuplicate?: (note: TNote) => void
	onMove?: (note: TNote) => void
	onToggleVisibility?: (note: TNote) => void
	onToggleFavorite?: (note: TNote) => void
	enableDragDrop?: boolean
	onDragStart?: (note: TNote) => void
	onDragEnd?: () => void
	className?: string
}

// Note Context Menu Component
function NoteContextMenu({
	note,
	onEdit,
	onDelete,
	onDuplicate,
	onMove,
	onToggleVisibility,
	onToggleFavorite,
	children,
}: {
	note: TNote
	onEdit?: (note: TNote) => void
	onDelete?: (note: TNote) => void
	onDuplicate?: (note: TNote) => void
	onMove?: (note: TNote) => void
	onToggleVisibility?: (note: TNote) => void
	onToggleFavorite?: (note: TNote) => void
	children: React.ReactNode
}) {
	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
			<ContextMenuContent className='w-48 bg-card border-border/40 shadow-lg rounded-lg'>
				<ContextMenuItem
					onClick={() => onEdit?.(note)}
					disabled={!onEdit}
					className='hover:bg-accent/50 focus:bg-accent/50 transition-colors'
				>
					<Edit2 className='h-4 w-4 mr-2' />
					Rename
				</ContextMenuItem>

				<ContextMenuSeparator className='bg-border/40' />

				<ContextMenuItem
					onClick={() => onDuplicate?.(note)}
					disabled={!onDuplicate}
					className='hover:bg-accent/50 focus:bg-accent/50 transition-colors'
				>
					<Copy className='h-4 w-4 mr-2' />
					Duplicate
				</ContextMenuItem>

				<ContextMenuItem
					onClick={() => onMove?.(note)}
					disabled={!onMove}
					className='hover:bg-accent/50 focus:bg-accent/50 transition-colors'
				>
					<Move className='h-4 w-4 mr-2' />
					Move
				</ContextMenuItem>

				<ContextMenuItem
					onClick={() => onToggleFavorite?.(note)}
					disabled={!onToggleFavorite}
					className='hover:bg-accent/50 focus:bg-accent/50 transition-colors'
				>
					<Star className='h-4 w-4 mr-2' />
					{note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
				</ContextMenuItem>

				<ContextMenuItem
					onClick={() => onToggleVisibility?.(note)}
					disabled={!onToggleVisibility}
					className='hover:bg-accent/50 focus:bg-accent/50 transition-colors'
				>
					{note.isPublic ? (
						<EyeOff className='h-4 w-4 mr-2' />
					) : (
						<Eye className='h-4 w-4 mr-2' />
					)}
					{note.isPublic ? 'Make Private' : 'Make Public'}
				</ContextMenuItem>

				<ContextMenuSeparator className='bg-border/40' />

				<ContextMenuItem
					onClick={() => onDelete?.(note)}
					disabled={!onDelete}
					className='text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10 transition-colors'
				>
					<Trash2 className='h-4 w-4 mr-2' />
					Delete
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	)
}

// Main Note Item Component
export function NoteItem({
	note,
	isSelected = false,
	isEditing = false,
	onSelect,
	onEdit,
	onUpdate,
	onCancelEdit,
	onDelete,
	onDuplicate,
	onMove,
	onToggleVisibility,
	onToggleFavorite,
	enableDragDrop = false,
	onDragStart,
	onDragEnd,
	className,
}: TNoteItemProps) {
	const [editingTitle, setEditingTitle] = useState(note.title)
	const [isDragging, setIsDragging] = useState(false)

	// Sync editingTitle with note.title when note changes
	useEffect(() => {
		setEditingTitle(note.title)
	}, [note.title])

	const handleDragStart = (e: React.DragEvent) => {
		if (!enableDragDrop) {
			e.preventDefault()
			return
		}

		setIsDragging(true)
		e.dataTransfer.setData('text/plain', `note:${note.id}`)
		e.dataTransfer.effectAllowed = 'move'
		onDragStart?.(note)
	}

	const handleDragEnd = () => {
		setIsDragging(false)
		onDragEnd?.()
	}

	const handleTitleSubmit = () => {
		const trimmedTitle = editingTitle.trim()
		if (trimmedTitle && (trimmedTitle !== note.title || note.title === 'Untitled')) {
			onUpdate?.(note, trimmedTitle)
		} else {
			onCancelEdit?.()
		}
	}

	const handleTitleCancel = () => {
		setEditingTitle(note.title)
		onCancelEdit?.()
	}

	return (
		<div
			className={cn(
				'group relative transition-all duration-200 ease-out',
				isDragging && 'opacity-50 scale-95',
				className
			)}
			draggable={enableDragDrop}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<NoteContextMenu
				note={note}
				onEdit={onEdit}
				onDelete={onDelete}
				onDuplicate={onDuplicate}
				onMove={onMove}
				onToggleVisibility={onToggleVisibility}
				onToggleFavorite={onToggleFavorite}
			>
				<Button
					variant='ghost'
					onClick={() => onSelect?.(note)}
					className={cn(
						'w-full justify-between h-auto px-3 py-2.5 text-sm font-normal overflow-hidden transition-all duration-200 ease-out rounded-lg group-hover:shadow-sm',
						isSelected
							? 'bg-accent/80 text-accent-foreground border border-border/40 shadow-sm'
							: 'text-muted-foreground hover:bg-accent/40 hover:text-accent-foreground border border-transparent'
					)}
				>
					<div className='flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden'>
						<div className='flex-shrink-0'>
							<FileText
								className={cn(
									'h-4 w-4 transition-colors duration-200',
									isSelected
										? 'text-accent-foreground/80'
										: 'text-muted-foreground/60'
								)}
							/>
						</div>

						{note.isFavorite && (
							<div className='flex-shrink-0'>
								<Star className='h-3.5 w-3.5 text-amber-500 fill-current' />
							</div>
						)}

						<div className='flex-1 min-w-0'>
							{isEditing ? (
								<input
									type='text'
									value={editingTitle}
									onChange={e => setEditingTitle(e.target.value)}
									onBlur={handleTitleSubmit}
									onKeyDown={e => {
										if (e.key === 'Enter') {
											handleTitleSubmit()
										} else if (e.key === 'Escape') {
											handleTitleCancel()
										}
									}}
									onFocus={e => {
										const input = e.target as HTMLInputElement
										// Select all text for easy replacement when creating new notes
										if (editingTitle === 'Untitled') {
											input.select()
										} else {
											// For existing notes, position cursor at the end
											setTimeout(() => {
												input.setSelectionRange(
													input.value.length,
													input.value.length
												)
											}, 0)
										}
									}}
									className={cn(
										'bg-transparent border-none outline-none text-sm flex-1 min-w-0 font-medium',
										'placeholder:text-muted-foreground/50 focus:ring-0 focus:outline-none'
									)}
									autoFocus
									onClick={e => e.stopPropagation()}
								/>
							) : (
								<div className='flex flex-col gap-0.5'>
									<span
										className={cn(
											'truncate text-sm font-medium leading-tight transition-colors duration-200',
											isSelected
												? 'text-accent-foreground'
												: 'text-foreground/90'
										)}
										title={note.title}
									>
										{note.title}
									</span>
									<span
										className={cn(
											'text-xs leading-tight transition-colors duration-200',
											isSelected
												? 'text-accent-foreground/60'
												: 'text-muted-foreground/70'
										)}
									>
										{new Date(note.updatedAt).toLocaleDateString('en-US', {
											month: 'short',
											day: 'numeric',
										})}
									</span>
								</div>
							)}
						</div>
					</div>

					{/* Three dots menu for hover/click access */}
					<div
						className={cn(
							'flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out ml-2',
							isSelected && 'opacity-60'
						)}
					>
						<div
							className={cn(
								'p-1 rounded-md hover:bg-accent/60 transition-colors duration-200',
								isSelected ? 'hover:bg-background/20' : 'hover:bg-accent/80'
							)}
						>
							<MoreHorizontal className='h-3.5 w-3.5' />
						</div>
					</div>
				</Button>
			</NoteContextMenu>
		</div>
	)
}
