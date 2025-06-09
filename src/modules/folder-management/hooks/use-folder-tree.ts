import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  updateFolderWithValidation,
  getFolderHierarchyWithStats
} from '@/services/folder-service'
import { toast } from '@/components/ui/toast'
import type { TFolder } from '@/types/notes'
import type { TFolderWithStats } from '@/services/types'
import type { UseFolderTreeReturn, TreeBuildOptions, FolderTreeNode } from '../types'

// Remove the old service instantiation - we use pure functions now

export function useFolderTree(options?: TreeBuildOptions): UseFolderTreeReturn {
  const [allFolders, setAllFolders] = useState<TFolder[]>([])
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Build tree data from flat folder list
  const treeData = useMemo(() => {
    return buildFolderTree(allFolders, expandedIds, options)
  }, [allFolders, expandedIds, options])

  const loadAllFolders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Use the new getFolderHierarchyWithStats function to get all folders
      const response = await getFolderHierarchyWithStats()

      if (response.success && response.data) {
        // Convert TFolderWithStats to TFolder for compatibility
        const folderData = response.data.map((folder: TFolderWithStats): TFolder => ({
          id: folder.id,
          name: folder.name,
          parentId: folder.parentId ?? null,
          position: folder.position,
          isPublic: true, // Default value - should be added to TFolderWithStats later
          isFavorite: folder.isFavorite,
          createdAt: new Date(folder.createdAt),
          updatedAt: new Date(folder.updatedAt)
        }))
        setAllFolders(folderData)
      } else {
        setError(response.error || 'Failed to load folders')
        setAllFolders([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setAllFolders([])
    } finally {
      setLoading(false)
    }
  }, [])

  const expandFolder = useCallback((folderId: number) => {
    setExpandedIds(prev => new Set([...prev, folderId]))
  }, [])

  const collapseFolder = useCallback((folderId: number) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev)
      newSet.delete(folderId)
      return newSet
    })
  }, [])

  const toggleFolder = useCallback((folderId: number) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }, [])

  const selectFolder = useCallback((folderId: number | null) => {
    setSelectedId(folderId)
  }, [])

  const startEditing = useCallback((folderId: number) => {
    setEditingId(folderId)
  }, [])

  const stopEditing = useCallback(() => {
    setEditingId(null)
  }, [])

  const renameFolder = useCallback(async (folderId: number, newName: string): Promise<boolean> => {
    try {
      const response = await updateFolderWithValidation(folderId, {
        name: newName
      })

      if (response.success && response.data) {
        // Update the folder in our local state
        setAllFolders(prev => prev.map(folder =>
          folder.id === folderId
            ? { ...folder, name: newName, updatedAt: new Date(response.data!.updatedAt) }
            : folder
        ))
        toast.success(`Folder renamed to "${newName}"`)
        return true
      } else {
        toast.error(response.error || 'Failed to rename folder')
        return false
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to rename folder')
      return false
    }
  }, [])

  const refreshTree = useCallback(async () => {
    await loadAllFolders()
  }, [loadAllFolders])

  // Load folders on mount
  useEffect(() => {
    loadAllFolders()
  }, [loadAllFolders])

  return {
    treeData,
    expandedIds,
    selectedId,
    editingId,
    loading,
    error,
    expandFolder,
    collapseFolder,
    toggleFolder,
    selectFolder,
    startEditing,
    stopEditing,
    renameFolder,
    refreshTree
  }
}

// Helper function to build tree structure
function buildFolderTree(
  folders: TFolder[],
  expandedIds: Set<number>,
  options?: TreeBuildOptions
): FolderTreeNode[] {
  // Apply filters if provided
  let filteredFolders = folders
  if (options?.filterFn) {
    filteredFolders = folders.filter(options.filterFn)
  }

  // Sort folders
  const sortedFolders = sortFolders(filteredFolders, options)

  // Build tree structure
  const folderMap = new Map<number, FolderTreeNode>()
  const rootFolders: FolderTreeNode[] = []

  // First pass: create tree nodes
  sortedFolders.forEach(folder => {
    const hasChildren = sortedFolders.some(f => f.parentId === folder.id)
    
    const treeNode: FolderTreeNode = {
      ...folder,
      children: [],
      depth: 0,
      hasChildren,
      isExpanded: expandedIds.has(folder.id)
    }
    
    folderMap.set(folder.id, treeNode)
  })

  // Second pass: build hierarchy and calculate depth
  sortedFolders.forEach(folder => {
    const node = folderMap.get(folder.id)!
    
    if (folder.parentId === null) {
      // Root folder
      rootFolders.push(node)
    } else {
      // Child folder
      const parent = folderMap.get(folder.parentId)
      if (parent) {
        parent.children.push(node)
        node.depth = parent.depth + 1
      } else {
        // Parent not found, treat as root
        rootFolders.push(node)
      }
    }
  })

  // Third pass: recursively calculate depths and apply max depth limit
  const calculateDepths = (nodes: FolderTreeNode[], currentDepth: number = 0): FolderTreeNode[] => {
    if (options?.maxDepth && currentDepth >= options.maxDepth) {
      return []
    }

    return nodes.map(node => ({
      ...node,
      depth: currentDepth,
      children: calculateDepths(node.children, currentDepth + 1)
    }))
  }

  return calculateDepths(rootFolders)
}

// Helper function to sort folders
function sortFolders(folders: TFolder[], options?: TreeBuildOptions): TFolder[] {
  const sortBy = options?.sortBy || 'position'
  const sortOrder = options?.sortOrder || 'asc'
  
  return [...folders].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'position':
        comparison = a.position - b.position
        break
      case 'createdAt':
        comparison = a.createdAt.getTime() - b.createdAt.getTime()
        break
      case 'updatedAt':
        comparison = a.updatedAt.getTime() - b.updatedAt.getTime()
        break
      default:
        comparison = a.position - b.position
    }
    
    return sortOrder === 'desc' ? -comparison : comparison
  })
}

// Hook for managing expanded state persistence
export function useExpandedState(storageKey: string = 'folder-tree-expanded') {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const ids = JSON.parse(stored) as number[]
        return new Set(ids)
      }
    } catch {
      // Ignore errors
    }
    return new Set()
  })

  // Save to localStorage when expanded state changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify([...expandedIds]))
    } catch {
      // Ignore errors
    }
  }, [expandedIds, storageKey])

  return [expandedIds, setExpandedIds] as const
}
