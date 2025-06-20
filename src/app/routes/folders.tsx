import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/toast'
import { Plus, RefreshCw } from 'lucide-react'
import { useFolderContext } from '@/contexts/folder-context'
import type { TFolder } from '@/types'

type Folder = TFolder

// Placeholder components - TODO: Import from correct modules
const FolderTree = ({ folders, selectedFolderId, expandedFolderIds, editingFolderId, onFolderSelect, onFolderExpand, onFolderCreate, onFolderRename, onFolderDelete, onFolderMove, onStartEditing, onStopEditing, enableDragDrop, enableKeyboardNavigation, showContextMenu }: any) => {
	return (
		<div className="p-4 text-center text-muted-foreground">
			<p>Folder Tree Component</p>
			<p className="text-sm">TODO: Implement folder tree display</p>
			{folders?.length === 0 && (
				<Button onClick={() => onFolderCreate()} className="mt-4">
					<Plus className="h-4 w-4 mr-2" />
					Create First Folder
				</Button>
			)}
		</div>
	)
}

const FolderCreateForm = ({ parentId, onSuccess, onCancel }: any) => {
	const [name, setName] = useState('')

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (name.trim()) {
			// TODO: Implement actual folder creation
			const newFolder: TFolder = {
				id: Date.now(),
				name: name.trim(),
				parentId: parentId || null,
				position: 0,
				isPublic: false,
				isFavorite: false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}
			onSuccess(newFolder)
			setName('')
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Create New Folder</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label htmlFor="folder-name" className="text-sm font-medium">
							Folder Name
						</label>
						<input
							id="folder-name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="w-full mt-1 px-3 py-2 border border-input rounded-md"
							placeholder="Enter folder name..."
							autoFocus
						/>
					</div>
					<div className="flex justify-end gap-2">
						<Button type="button" variant="outline" onClick={onCancel}>
							Cancel
						</Button>
						<Button type="submit" disabled={!name.trim()}>
							Create
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	)
}

// Helper function to get all folders from tree structure
function getAllFolders(folder: any): any[] {
	const result = [folder]
	if (folder.children) {
		folder.children.forEach((child: any) => {
			result.push(...getAllFolders(child))
		})
	}
	return result
}

export default function FoldersPage() {
	const [showCreateForm, setShowCreateForm] = useState(false)
	const [selectedParentId, setSelectedParentId] = useState<number | null>(null)

	const {
		tree: treeData,
		expandedFolderIds,
		selectedFolderId,
		isLoading: loading,
		expandFolder,
		collapseFolder,
		selectFolder,
		updateFolder,
		deleteFolder,
	} = useFolderContext()

	// Mock properties not available in context
	const editingFolderId = null
	const error = null
	const startEditing = () => { }
	const stopEditing = () => { }
	const renameFolder = updateFolder
	const refreshFolders = async () => { }

	const handleFolderSelect = (folder: Folder) => {
		selectFolder(folder.id)
	}

	const handleFolderMove = async (
		folderId: number,
		newParentId: number | null,
		newPosition: number
	) => {
		try {
			// Note: moveFolder is not available in useFolderContext, we'll need to implement this
			// For now, just show a message
			toast.error('Move functionality needs to be implemented in context')
			console.error('Move folder not implemented in context:', {
				folderId,
				newParentId,
				newPosition,
			})
		} catch (error) {
			toast.error('Failed to move folder')
			console.error('Move folder error:', error)
		}
	}

	const handleFolderExpand = (folderId: number, isExpanded: boolean) => {
		if (isExpanded) {
			expandFolder(folderId)
		} else {
			collapseFolder(folderId)
		}
	}

	const handleCreateFolder = (parentId: number | null = null) => {
		setSelectedParentId(parentId)
		setShowCreateForm(true)
	}

	const handleCreateSuccess = (folder: Folder) => {
		setShowCreateForm(false)
		setSelectedParentId(null)
		// No need to manually refresh - the context handles this automatically
		selectFolder(folder.id)
	}

	const handleCreateCancel = () => {
		setShowCreateForm(false)
		setSelectedParentId(null)
	}

	const handleRefresh = async () => {
		try {
			await refreshFolders()
			toast.success('Folder tree refreshed')
		} catch (error) {
			toast.error('Failed to refresh folder tree')
		}
	}

	const handleFolderDelete = async (folder: Folder) => {
		try {
			await deleteFolder(folder.id)
			toast.success(`Folder "${folder.name}" deleted successfully`)
			// No need to manually refresh - the context handles this automatically
			// Clear selection if deleted folder was selected
			if (selectedFolderId === folder.id) {
				selectFolder(null)
			}
		} catch (error) {
			toast.error('Failed to delete folder')
			console.error('Delete folder error:', error)
		}
	}

	if (loading) {
		return (
			<div className='container mx-auto p-6'>
				<div className='flex items-center justify-center h-64'>
					<div className='text-center'>
						<RefreshCw className='mx-auto h-8 w-8 animate-spin text-muted-foreground' />
						<p className='mt-2 text-sm text-muted-foreground'>Loading folders...</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className='container mx-auto p-6 space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold'>Folder Management</h1>
					<p className='text-muted-foreground'>
						Organize your notes with folders and subfolders
					</p>
				</div>
				<div className='flex items-center gap-2'>
					<Button variant='outline' size='sm' onClick={handleRefresh} disabled={loading}>
						<RefreshCw className='h-4 w-4 mr-2' />
						Refresh
					</Button>
					<Button onClick={() => handleCreateFolder()} disabled={showCreateForm}>
						<Plus className='h-4 w-4 mr-2' />
						New Folder
					</Button>
				</div>
			</div>

			{error && (
				<div className='rounded-md bg-destructive/10 p-4 text-destructive'>
					<p className='font-medium'>Error loading folders</p>
					<p className='text-sm'>{error}</p>
				</div>
			)}

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Folder Tree */}
				<div className='lg:col-span-2'>
					<Card>
						<CardHeader>
							<CardTitle>Folder Tree</CardTitle>
						</CardHeader>
						<CardContent>
							<FolderTree
								folders={treeData}
								selectedFolderId={selectedFolderId}
								expandedFolderIds={expandedFolderIds}
								editingFolderId={editingFolderId}
								onFolderSelect={handleFolderSelect}
								onFolderExpand={handleFolderExpand}
								onFolderCreate={handleCreateFolder}
								onFolderRename={renameFolder}
								onFolderDelete={handleFolderDelete}
								onFolderMove={async (folderId, newParentId, newPosition) => {
									// Handle folder move without immediate refresh to prevent DOM reload
									try {
										await handleFolderMove(folderId, newParentId, newPosition)
										// Context will handle refresh automatically
									} catch (error) {
										console.error('Failed to move folder:', error)
									}
								}}
								onStartEditing={startEditing}
								onStopEditing={stopEditing}
								enableDragDrop={true}
								enableKeyboardNavigation={true}
								showContextMenu={true}
							/>
						</CardContent>
					</Card>
				</div>

				{/* Sidebar */}
				<div className='space-y-6'>
					{/* Create Form */}
					{showCreateForm && (
						<Card>
							<CardHeader>
								<CardTitle>
									{selectedParentId ? 'Create Subfolder' : 'Create New Folder'}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<FolderCreateForm
									parentId={selectedParentId}
									onSuccess={handleCreateSuccess}
									onCancel={handleCreateCancel}
								/>
							</CardContent>
						</Card>
					)}

					{/* Selected Folder Info */}
					{selectedFolderId &&
						(() => {
							const selectedFolder =
								treeData.find(f => f.id === selectedFolderId) ||
								treeData
									.flatMap(f => getAllFolders(f))
									.find(f => f.id === selectedFolderId)

							if (!selectedFolder) return null

							const siblings = treeData.filter(
								f =>
									f.parentId === selectedFolder.parentId &&
									f.id !== selectedFolder.id
							)
							const parent = selectedFolder.parentId
								? treeData
									.flatMap(f => getAllFolders(f))
									.find(f => f.id === selectedFolder.parentId)
								: null

							return (
								<Card>
									<CardHeader>
										<CardTitle>Folder Details</CardTitle>
									</CardHeader>
									<CardContent>
										<div className='space-y-3 text-sm'>
											<div>
												<span className='font-medium'>Name:</span>{' '}
												{selectedFolder.name}
											</div>
											<div>
												<span className='font-medium'>ID:</span>{' '}
												{selectedFolder.id}
											</div>
											<div>
												<span className='font-medium'>Privacy:</span>{' '}
												<span
													className={
														selectedFolder.isPublic
															? 'text-green-600'
															: 'text-orange-600'
													}
												>
													{selectedFolder.isPublic ? 'Public' : 'Private'}
												</span>
											</div>
											<div>
												<span className='font-medium'>Parent:</span>{' '}
												{parent ? parent.name : 'Root'}
											</div>
											<div>
												<span className='font-medium'>Children:</span>{' '}
												{selectedFolder.children?.length || 0}
											</div>
											<div>
												<span className='font-medium'>Siblings:</span>{' '}
												{siblings.length}
												{siblings.length > 0 && (
													<div className='mt-1 ml-2 text-xs text-muted-foreground'>
														{siblings
															.map(sibling => sibling.name)
															.join(', ')}
													</div>
												)}
											</div>
											<div>
												<span className='font-medium'>Depth:</span>{' '}
												{selectedFolder.depth}
											</div>
										</div>
									</CardContent>
								</Card>
							)
						})()}

					{/* Statistics */}
					<Card>
						<CardHeader>
							<CardTitle>Statistics</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='space-y-2 text-sm'>
								<div className='flex justify-between'>
									<span>Total Folders:</span>
									<span className='font-medium'>{treeData.length}</span>
								</div>
								<div className='flex justify-between'>
									<span>Expanded:</span>
									<span className='font-medium'>{expandedFolderIds.size}</span>
								</div>
								<div className='flex justify-between'>
									<span>Selected:</span>
									<span className='font-medium'>
										{selectedFolderId ? 'Yes' : 'None'}
									</span>
								</div>
								<div className='flex justify-between'>
									<span>Editing:</span>
									<span className='font-medium'>
										{editingFolderId ? 'Yes' : 'None'}
									</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Keyboard Shortcuts */}
					<Card>
						<CardHeader>
							<CardTitle>Keyboard Shortcuts</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='space-y-2 text-xs'>
								<div className='grid grid-cols-2 gap-2'>
									<span className='font-mono'>↑↓</span>
									<span>Navigate</span>
								</div>
								<div className='grid grid-cols-2 gap-2'>
									<span className='font-mono'>→</span>
									<span>Expand</span>
								</div>
								<div className='grid grid-cols-2 gap-2'>
									<span className='font-mono'>←</span>
									<span>Collapse</span>
								</div>
								<div className='grid grid-cols-2 gap-2'>
									<span className='font-mono'>Enter</span>
									<span>Select</span>
								</div>
								<div className='grid grid-cols-2 gap-2'>
									<span className='font-mono'>F2</span>
									<span>Rename</span>
								</div>
								<div className='grid grid-cols-2 gap-2'>
									<span className='font-mono'>Insert</span>
									<span>New Child</span>
								</div>
								<div className='grid grid-cols-2 gap-2'>
									<span className='font-mono'>Delete</span>
									<span>Delete</span>
								</div>
								<div className='grid grid-cols-2 gap-2'>
									<span className='font-mono'>*</span>
									<span>Expand All</span>
								</div>
								<div className='grid grid-cols-2 gap-2'>
									<span className='font-mono'>Double-click</span>
									<span>Rename</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}
