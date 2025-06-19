import { createContext, useContext, ReactNode, useState, useCallback, useMemo } from "react"
import { useFolders } from '@/application/features/workspace/modules/folder-management/hooks/use-folders'
import { useFolderTree } from '@/application/features/workspace/modules/folder-management/hooks/use-folder-tree'
import { useFolderOperations } from '@/application/features/workspace/modules/folder-management/hooks/use-folder-operations'
import type {
  TFolder,
  TCreateFolderInput,
  TUpdateFolderInput,
  TFolderTreeNode
} from '@/domain/entities/workspace'

type TFolderContextValue = {
  // Folder data
  folders: TFolder[]
  treeData: TFolderTreeNode[]
  loading: boolean
  error: string | null
  
  // UI state
  selectedFolderId: number | null
  expandedFolderIds: Set<number>
  editingFolderId: number | null
  searchFilter: string
  
  // Folder operations
  createFolder: (input: TCreateFolderInput) => Promise<TFolder | null>
  updateFolder: (input: TUpdateFolderInput) => Promise<TFolder | null>
  deleteFolder: (id: number, options?: { deleteChildren?: boolean; force?: boolean }) => Promise<boolean>
  refreshFolders: () => Promise<void>
  
  // Tree operations
  selectFolder: (folderId: number | null) => void
  expandFolder: (folderId: number) => void
  collapseFolder: (folderId: number) => void
  toggleFolder: (folderId: number) => void
  startEditing: (folderId: number) => void
  stopEditing: () => void
  renameFolder: (folderId: number, newName: string) => Promise<boolean>
  
  // Search and filtering
  setSearchFilter: (query: string) => void
  filteredFolders: TFolder[]
  filteredTreeData: TFolderTreeNode[]
}

const FolderContext = createContext<TFolderContextValue | undefined>(undefined)

type TFolderProviderProps = {
  children: ReactNode
  parentId?: number | null
}

export function FolderProvider({ children, parentId = null }: TFolderProviderProps) {
  const [searchFilter, setSearchFilter] = useState("")
  
  // Use the enterprise-grade hooks
  const folderHook = useFolders(parentId)
  const treeHook = useFolderTree() // No options needed for basic tree functionality
  const operationsHook = useFolderOperations()

  // Filter folders based on search query
  const filteredFolders = useMemo(() => {
    if (!searchFilter.trim()) return folderHook.folders
    
    const query = searchFilter.toLowerCase()
    return folderHook.folders.filter(folder =>
      folder.name.toLowerCase().includes(query)
    )
  }, [folderHook.folders, searchFilter])

  // Filter tree data based on search query
  const filteredTreeData = useMemo(() => {
    if (!searchFilter.trim()) return treeHook.treeData
    
    const query = searchFilter.toLowerCase()
    const filterTreeNodes = (nodes: TFolderTreeNode[]): TFolderTreeNode[] => {
      return nodes.reduce((acc: TFolderTreeNode[], node) => {
        const matchesQuery = node.name.toLowerCase().includes(query)
        const filteredChildren = filterTreeNodes(node.children)
        
        if (matchesQuery || filteredChildren.length > 0) {
          acc.push({
            ...node,
            children: filteredChildren
          })
        }
        
        return acc
      }, [])
    }
    
    return filterTreeNodes(treeHook.treeData)
  }, [treeHook.treeData, searchFilter])

  // Enhanced operations that refresh tree data
  const createFolderWithRefresh = useCallback(async (input: TCreateFolderInput): Promise<TFolder | null> => {
    const result = await operationsHook.createFolder(input)
    if (result) {
      await folderHook.refreshFolders()
      await treeHook.refreshTree()
    }
    return result
  }, [operationsHook, folderHook, treeHook])

  const updateFolderWithRefresh = useCallback(async (input: TUpdateFolderInput): Promise<TFolder | null> => {
    const result = await operationsHook.updateFolder(input)
    if (result) {
      await folderHook.refreshFolders()
      await treeHook.refreshTree()
    }
    return result
  }, [operationsHook, folderHook, treeHook])

  const deleteFolderWithRefresh = useCallback(async (id: number, options?: { deleteChildren?: boolean; force?: boolean }): Promise<boolean> => {
    const result = await operationsHook.deleteFolder(id, options)
    if (result) {
      await folderHook.refreshFolders()
      await treeHook.refreshTree()
      // Clear selection if deleted folder was selected
      if (treeHook.selectedId === id) {
        treeHook.selectFolder(null)
      }
    }
    return result
  }, [operationsHook, folderHook, treeHook])

  const renameFolderWithRefresh = useCallback(async (folderId: number, newName: string): Promise<boolean> => {
    const result = await treeHook.renameFolder(folderId, newName)
    if (result) {
      await folderHook.refreshFolders()
    }
    return result
  }, [treeHook, folderHook])

  const refreshAll = useCallback(async () => {
    await Promise.all([
      folderHook.refreshFolders(),
      treeHook.refreshTree()
    ])
  }, [folderHook, treeHook])

  const contextValue: TFolderContextValue = {
    // Folder data
    folders: folderHook.folders,
    treeData: treeHook.treeData,
    loading: folderHook.loading || treeHook.loading || operationsHook.loading,
    error: folderHook.error || treeHook.error || operationsHook.error,
    
    // UI state
    selectedFolderId: treeHook.selectedId,
    expandedFolderIds: treeHook.expandedIds,
    editingFolderId: treeHook.editingId,
    searchFilter,
    
    // Folder operations
    createFolder: createFolderWithRefresh,
    updateFolder: updateFolderWithRefresh,
    deleteFolder: deleteFolderWithRefresh,
    refreshFolders: refreshAll,
    
    // Tree operations
    selectFolder: treeHook.selectFolder,
    expandFolder: treeHook.expandFolder,
    collapseFolder: treeHook.collapseFolder,
    toggleFolder: treeHook.toggleFolder,
    startEditing: treeHook.startEditing,
    stopEditing: treeHook.stopEditing,
    renameFolder: renameFolderWithRefresh,
    
    // Search and filtering
    setSearchFilter,
    filteredFolders,
    filteredTreeData
  }

  return (
    <FolderContext.Provider value={contextValue}>
      {children}
    </FolderContext.Provider>
  )
}

export function useFolderContext() {
  const context = useContext(FolderContext)
  if (context === undefined) {
    throw new Error("useFolderContext must be used within a FolderProvider")
  }
  return context
}

// Export types for convenience
export type { TFolder, TFolderTreeNode, TCreateFolderInput, TUpdateFolderInput }
export type { TFolderContextValue }
