import { createContext, useContext, ReactNode, useState, useCallback, useMemo } from 'react'
import { useFolderHierarchy } from '@/api/services/folders-service'
import { useFolderTree } from '@/hooks/use-folder-tree'
import { useFolderOperations } from '@/hooks/use-folder-operations'
import type { TFolder } from '@/types'
import type { TFolderTreeNode } from '@/services/types'

interface TCreateFolderData {
	name: string
	parentId?: number
}

interface TUpdateFolderData {
	id: number
	name: string
}

interface FolderContextValue {
	folders: TFolder[]
	tree: TFolderTreeNode[]
	selectedFolderId: number | null
	expandedFolderIds: Set<number>
	isLoading: boolean
	selectFolder: (id: number | null) => void
	expandFolder: (id: number) => void
	collapseFolder: (id: number) => void
	createFolder: (data: TCreateFolderData) => void
	updateFolder: (id: number, data: TUpdateFolderData) => void
	deleteFolder: (id: number) => void
	isCreating: boolean
	isUpdating: boolean
	isDeleting: boolean
}

const FolderContext = createContext<FolderContextValue | null>(null)

export function FolderProvider({ children }: { children: ReactNode }) {
	const { data: folders, isLoading: isFoldersLoading } = useFolderHierarchy()
	const { tree, isLoading: isTreeLoading } = useFolderTree()
	const {
		createFolder,
		updateFolder,
		deleteFolder,
		isCreating,
		isUpdating,
		isDeleting
	} = useFolderOperations()

	const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null)
	const [expandedFolderIds, setExpandedFolderIds] = useState<Set<number>>(new Set())

	const selectFolder = useCallback((id: number | null) => {
		setSelectedFolderId(id)
	}, [])

	const expandFolder = useCallback((id: number) => {
		setExpandedFolderIds(prev => new Set([...prev, id]))
	}, [])

	const collapseFolder = useCallback((id: number) => {
		setExpandedFolderIds(prev => {
			const next = new Set(prev)
			next.delete(id)
			return next
		})
	}, [])

	const value = useMemo(
		() => ({
			folders: folders || [],
			tree: tree || [],
			selectedFolderId,
			expandedFolderIds,
			isLoading: isFoldersLoading || isTreeLoading,
			selectFolder,
			expandFolder,
			collapseFolder,
			createFolder,
			updateFolder,
			deleteFolder,
			isCreating,
			isUpdating,
			isDeleting
		}),
		[
			folders,
			tree,
			selectedFolderId,
			expandedFolderIds,
			isFoldersLoading,
			isTreeLoading,
			selectFolder,
			expandFolder,
			collapseFolder,
			createFolder,
			updateFolder,
			deleteFolder,
			isCreating,
			isUpdating,
			isDeleting
		]
	)

	return <FolderContext.Provider value={value}>{children}</FolderContext.Provider>
}

export function useFolderContext() {
	const context = useContext(FolderContext)
	if (!context) {
		throw new Error('useFolderContext must be used within a FolderProvider')
	}
	return context
}

export type { TCreateFolderData, TUpdateFolderData }
