'use client'

import type React from 'react'

import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight, Folder, FolderOpen, Star } from 'lucide-react'
import type { TFolder, TNote, TDragState } from '@/types'
import { cn } from '@/shared/utils'

type TProps = {
	folder: TFolder
	level: number
	isExpanded: boolean
	isSelected: boolean
	isEditing: boolean
	editingValue: string
	dragState: TDragState
	notes: TNote[]
	selectedNoteId?: number | null
	onToggle: (id: number) => void
	onSelect: (id: number) => void
	onStartEdit: (id: number, name: string) => void
	onCommitEdit: (id: number) => void
	onCancelEdit: () => void
	onSetEditingValue: (value: string) => void
	onRightClick: (e: React.MouseEvent, folder: TFolder) => void
	onDragStart: (e: React.DragEvent, folder: TFolder) => void
	onDragOver: (e: React.DragEvent, folder: TFolder) => void
	onDragLeave: () => void
	onDrop: (e: React.DragEvent, folder: TFolder) => void
	onDragEnd: () => void
	onNoteSelect?: (note: TNote) => void
	enableDragDrop: boolean
	showNotes: boolean
	renderNote?: (note: TNote) => React.ReactNode
}

export function FolderItem({
	folder,
	level,
	isExpanded,
	isSelected,
	isEditing,
	editingValue,
	dragState,
	notes,
	selectedNoteId,
	onToggle,
	onSelect,
	onStartEdit,
	onCommitEdit,
	onCancelEdit,
	onSetEditingValue,
	onRightClick,
	onDragStart,
	onDragOver,
	onDragLeave,
	onDrop,
	onDragEnd,
	onNoteSelect,
	enableDragDrop,
	showNotes,
	renderNote,
}: TProps) {
	const hasChildren = folder.children && folder.children.length > 0
	const indentLevel = level * 16
	const isDraggedOver = dragState.dragOverFolder === folder.id
	const isDragged = dragState.draggedFolder?.id === folder.id

	const FolderIcon = isExpanded ? FolderOpen : Folder

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Enter') {
				onCommitEdit(folder.id as number)
			} else if (e.key === 'Escape') {
				onCancelEdit()
			}
		},
		[folder.id, onCommitEdit, onCancelEdit]
	)

	const handleInputFocus = useCallback(
		(e: React.FocusEvent<HTMLInputElement>) => {
			const input = e.target
			if (editingValue === 'New Folder') {
				input.select()
			} else {
				setTimeout(() => {
					input.setSelectionRange(input.value.length, input.value.length)
				}, 0)
			}
		},
		[editingValue]
	)

	return (
		<div>
			<Collapsible open={isExpanded} onOpenChange={() => onToggle(folder.id as number)}>
				<div
					className={cn(
						'group relative transition-all duration-200 ease-out rounded-lg mx-1',
						isDraggedOver && 'bg-accent/30 scale-[1.02] shadow-sm',
						isDragged && 'opacity-40 scale-95',
						folder.isTemp && 'animate-pulse'
					)}
					onDragOver={e => onDragOver(e, folder)}
					onDragLeave={onDragLeave}
					onDrop={e => onDrop(e, folder)}
				>
					<CollapsibleTrigger asChild>
						<Button
							variant='ghost'
							onClick={() => {
								onSelect(folder.id as number)
								onToggle(folder.id as number)
							}}
							onDoubleClick={e => {
								e.stopPropagation()
								if (!folder.isTemp) {
									onStartEdit(folder.id as number, folder.name)
								}
							}}
							onContextMenu={e => onRightClick(e, folder)}
							draggable={enableDragDrop && !folder.isTemp}
							onDragStart={e => onDragStart(e, folder)}
							onDragEnd={onDragEnd}
							className={cn(
								'w-full justify-between h-8 px-2 text-sm font-normal overflow-hidden transition-all duration-200 ease-out hover:scale-[1.01]',
								isSelected
									? 'bg-accent/70 text-accent-foreground shadow-sm border border-border/30'
									: 'text-foreground/80 hover:bg-accent/40 hover:text-accent-foreground'
							)}
							style={{ paddingLeft: `${indentLevel + 8}px` }}
						>
							<div className='flex items-center gap-2 min-w-0 flex-1 overflow-hidden'>
								<button
									onClick={e => {
										e.stopPropagation()
										if (!folder.isTemp) {
											onToggle(folder.id as number)
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
										type='text'
										value={editingValue}
										onChange={e => onSetEditingValue(e.target.value)}
										onBlur={() => onCommitEdit(folder.id as number)}
										onKeyDown={handleKeyDown}
										onFocus={handleInputFocus}
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
										(showNotes ? notes.length : 0)}
								</span>
							</div>
						</Button>
					</CollapsibleTrigger>
				</div>

				{hasChildren && (
					<CollapsibleContent className='space-y-1 overflow-hidden'>
						<div className='animate-in slide-in-from-top-2 duration-200'>
							{folder.children!.map(childFolder => (
								<FolderItem
									key={childFolder.id}
									folder={childFolder}
									level={level + 1}
									isExpanded={isExpanded}
									isSelected={isSelected}
									isEditing={isEditing}
									editingValue={editingValue}
									dragState={dragState}
									notes={[]}
									selectedNoteId={selectedNoteId}
									onToggle={onToggle}
									onSelect={onSelect}
									onStartEdit={onStartEdit}
									onCommitEdit={onCommitEdit}
									onCancelEdit={onCancelEdit}
									onSetEditingValue={onSetEditingValue}
									onRightClick={onRightClick}
									onDragStart={onDragStart}
									onDragOver={onDragOver}
									onDragLeave={onDragLeave}
									onDrop={onDrop}
									onDragEnd={onDragEnd}
									onNoteSelect={onNoteSelect}
									enableDragDrop={enableDragDrop}
									showNotes={showNotes}
									renderNote={renderNote}
								/>
							))}
						</div>
					</CollapsibleContent>
				)}
			</Collapsible>

			{showNotes && isExpanded && notes.length > 0 && (
				<div
					className='space-y-1 animate-in slide-in-from-top-2 duration-200'
					style={{ paddingLeft: `${indentLevel + 24}px` }}
				>
					{notes.map(note => renderNote?.(note))}
				</div>
			)}
		</div>
	)
}
