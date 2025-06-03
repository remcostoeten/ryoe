import { useState, useCallback, useEffect } from 'react'
import type { FolderTreeNode } from '@/types/notes'
import type { KeyboardNavigationState, KeyboardAction } from '../types'

interface UseKeyboardNavigationProps {
  folders: FolderTreeNode[]
  selectedId: number | null
  expandedIds: Set<number>
  onSelect: (folderId: number | null) => void
  onExpand: (folderId: number) => void
  onCollapse: (folderId: number) => void
  onStartEditing?: (folderId: number) => void
  onDelete?: (folderId: number) => void
  onCreateChild?: (parentId: number | null) => void
}

export function useKeyboardNavigation({
  folders,
  selectedId,
  expandedIds,
  onSelect,
  onExpand,
  onCollapse,
  onStartEditing,
  onDelete,
  onCreateChild
}: UseKeyboardNavigationProps) {
  const [focusedId, setFocusedId] = useState<number | null>(selectedId)

  // Flatten the tree for navigation
  const flattenedFolders = flattenTree(folders, expandedIds)

  // Update focused ID when selection changes
  useEffect(() => {
    if (selectedId !== null) {
      setFocusedId(selectedId)
    }
  }, [selectedId])

  const getCurrentIndex = useCallback(() => {
    if (focusedId === null) return -1
    return flattenedFolders.findIndex(folder => folder.id === focusedId)
  }, [focusedId, flattenedFolders])

  const moveFocus = useCallback((direction: 'up' | 'down') => {
    const currentIndex = getCurrentIndex()
    
    if (flattenedFolders.length === 0) return

    let newIndex: number
    if (direction === 'up') {
      newIndex = currentIndex <= 0 ? flattenedFolders.length - 1 : currentIndex - 1
    } else {
      newIndex = currentIndex >= flattenedFolders.length - 1 ? 0 : currentIndex + 1
    }

    const newFolder = flattenedFolders[newIndex]
    if (newFolder) {
      setFocusedId(newFolder.id)
    }
  }, [getCurrentIndex, flattenedFolders])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const currentFolder = flattenedFolders.find(f => f.id === focusedId)
    if (!currentFolder) return

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        moveFocus('up')
        break

      case 'ArrowDown':
        e.preventDefault()
        moveFocus('down')
        break

      case 'ArrowRight':
        e.preventDefault()
        if (currentFolder.hasChildren) {
          if (expandedIds.has(currentFolder.id)) {
            // Already expanded, move to first child
            const childIndex = flattenedFolders.findIndex(f => 
              f.parentId === currentFolder.id
            )
            if (childIndex !== -1) {
              setFocusedId(flattenedFolders[childIndex].id)
            }
          } else {
            // Expand the folder
            onExpand(currentFolder.id)
          }
        }
        break

      case 'ArrowLeft':
        e.preventDefault()
        if (expandedIds.has(currentFolder.id) && currentFolder.hasChildren) {
          // Collapse if expanded
          onCollapse(currentFolder.id)
        } else if (currentFolder.parentId !== null) {
          // Move to parent
          setFocusedId(currentFolder.parentId)
        }
        break

      case 'Enter':
      case ' ':
        e.preventDefault()
        onSelect(currentFolder.id)
        break

      case 'F2':
        e.preventDefault()
        if (onStartEditing) {
          onStartEditing(currentFolder.id)
        }
        break

      case 'Delete':
        e.preventDefault()
        if (onDelete && !e.shiftKey) {
          onDelete(currentFolder.id)
        }
        break

      case 'Insert':
        e.preventDefault()
        if (onCreateChild) {
          onCreateChild(currentFolder.id)
        }
        break

      case '+':
        e.preventDefault()
        if (currentFolder.hasChildren && !expandedIds.has(currentFolder.id)) {
          onExpand(currentFolder.id)
        }
        break

      case '-':
        e.preventDefault()
        if (currentFolder.hasChildren && expandedIds.has(currentFolder.id)) {
          onCollapse(currentFolder.id)
        }
        break

      case '*':
        e.preventDefault()
        // Expand all children recursively
        expandAllChildren(currentFolder.id, folders, onExpand)
        break

      case 'Home':
        e.preventDefault()
        if (flattenedFolders.length > 0) {
          setFocusedId(flattenedFolders[0].id)
        }
        break

      case 'End':
        e.preventDefault()
        if (flattenedFolders.length > 0) {
          setFocusedId(flattenedFolders[flattenedFolders.length - 1].id)
        }
        break
    }
  }, [
    focusedId,
    flattenedFolders,
    expandedIds,
    moveFocus,
    onSelect,
    onExpand,
    onCollapse,
    onStartEditing,
    onDelete,
    onCreateChild,
    folders
  ])

  const focusFolder = useCallback((folderId: number) => {
    setFocusedId(folderId)
  }, [])

  return {
    focusedId,
    handleKeyDown,
    focusFolder,
    flattenedFolders
  }
}

// Helper function to flatten tree for navigation
function flattenTree(
  folders: FolderTreeNode[], 
  expandedIds: Set<number>,
  result: FolderTreeNode[] = []
): FolderTreeNode[] {
  for (const folder of folders) {
    result.push(folder)
    
    if (folder.hasChildren && expandedIds.has(folder.id) && folder.children) {
      flattenTree(folder.children, expandedIds, result)
    }
  }
  
  return result
}

// Helper function to expand all children recursively
function expandAllChildren(
  folderId: number,
  folders: FolderTreeNode[],
  onExpand: (id: number) => void
) {
  const expandRecursively = (nodes: FolderTreeNode[]) => {
    for (const node of nodes) {
      if (node.id === folderId || node.parentId === folderId) {
        if (node.hasChildren) {
          onExpand(node.id)
          if (node.children) {
            expandRecursively(node.children)
          }
        }
      }
      if (node.children) {
        expandRecursively(node.children)
      }
    }
  }
  
  expandRecursively(folders)
}

// Reduce the visual indicator for keyboard navigation
const activeIndicatorStyle = {
  borderColor: 'var(--primary)',
  borderWidth: '1px', // Reduced from a larger value
  borderStyle: 'dashed',
  borderRadius: '4px',
  outline: 'none'
}
