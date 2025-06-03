import { useState, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter,
  CollisionDetection
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable'
import type { FolderTreeNode, Folder } from '@/types/notes'
import { useFolderOperations } from './use-folder-operations'

export interface DraggedFolder {
  id: number
  name: string
  parentId: number | null
  position: number
  depth: number
}

export interface DropZone {
  parentId: number | null
  position: number
  depth: number
}

export interface UseFolderDragDropProps {
  folders: FolderTreeNode[]
  onFoldersReorder: (folders: FolderTreeNode[]) => void
  onFolderMove?: (folderId: number, newParentId: number | null, newPosition: number) => Promise<void>
}

export interface UseFolderDragDropReturn {
  draggedFolder: DraggedFolder | null
  dropZone: DropZone | null
  isDragging: boolean
  sensors: any
  handleDragStart: (event: DragStartEvent) => void
  handleDragOver: (event: DragOverEvent) => void
  handleDragEnd: (event: DragEndEvent) => void
  DndContextComponent: typeof DndContext
  SortableContextComponent: typeof SortableContext
  DragOverlayComponent: typeof DragOverlay
}

export function useFolderDragDrop({
  folders,
  onFoldersReorder,
  onFolderMove
}: UseFolderDragDropProps): UseFolderDragDropReturn {
  const [draggedFolder, setDraggedFolder] = useState<DraggedFolder | null>(null)
  const [dropZone, setDropZone] = useState<DropZone | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  
  const { moveFolder, reorderFolders } = useFolderOperations()

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    })
  )

  // Find folder by ID in the tree
  const findFolderById = useCallback((folders: FolderTreeNode[], id: number): FolderTreeNode | null => {
    for (const folder of folders) {
      if (folder.id === id) return folder
      if (folder.children) {
        const found = findFolderById(folder.children, id)
        if (found) return found
      }
    }
    return null
  }, [])

  // Get all folder IDs in order for sortable context
  const getFolderIds = useCallback((folders: FolderTreeNode[]): string[] => {
    const ids: string[] = []
    const traverse = (items: FolderTreeNode[]) => {
      for (const item of items) {
        ids.push(item.id.toString())
        if (item.children) {
          traverse(item.children)
        }
      }
    }
    traverse(folders)
    return ids
  }, [])

  // Calculate drop position based on drag over event
  const calculateDropPosition = useCallback((
    overId: string,
    folders: FolderTreeNode[]
  ): DropZone | null => {
    const overFolder = findFolderById(folders, parseInt(overId))
    if (!overFolder) return null

    return {
      parentId: overFolder.parentId,
      position: overFolder.position,
      depth: overFolder.depth
    }
  }, [findFolderById])

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    const folderId = parseInt(active.id.toString())
    const folder = findFolderById(folders, folderId)
    
    if (folder) {
      setDraggedFolder({
        id: folder.id,
        name: folder.name,
        parentId: folder.parentId,
        position: folder.position,
        depth: folder.depth
      })
      setIsDragging(true)
    }
  }, [folders, findFolderById])

  // Handle drag over
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event
    if (!over || !draggedFolder) return

    const dropZone = calculateDropPosition(over.id.toString(), folders)
    setDropZone(dropZone)
  }, [draggedFolder, folders, calculateDropPosition])

  // Handle drag end
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event

    setIsDragging(false)
    setDraggedFolder(null)
    setDropZone(null)

    if (!over || !draggedFolder) return

    const activeId = parseInt(active.id.toString())
    const overId = parseInt(over.id.toString())

    if (activeId === overId) return

    const activeFolder = findFolderById(folders, activeId)
    const overFolder = findFolderById(folders, overId)

    if (!activeFolder || !overFolder) return

    try {
      // Check if we're moving to a different parent or just reordering
      if (activeFolder.parentId === overFolder.parentId) {
        // Same parent - just reorder
        const getAllSiblings = (folders: FolderTreeNode[], parentId: number | null): FolderTreeNode[] => {
          const result: FolderTreeNode[] = []
          const traverse = (items: FolderTreeNode[]) => {
            for (const item of items) {
              if (item.parentId === parentId) {
                result.push(item)
              }
              if (item.children) {
                traverse(item.children)
              }
            }
          }
          traverse(folders)
          return result.sort((a, b) => a.position - b.position)
        }

        const siblings = getAllSiblings(folders, activeFolder.parentId)
        const oldIndex = siblings.findIndex(f => f.id === activeId)
        const newIndex = siblings.findIndex(f => f.id === overId)

        if (oldIndex !== -1 && newIndex !== -1) {
          const reorderedSiblings = arrayMove(siblings, oldIndex, newIndex)
          const folderIds = reorderedSiblings.map(f => f.id)

          await reorderFolders(activeFolder.parentId, folderIds)

          // Update local state
          const updatedFolders = [...folders]
          // Update positions in the tree
          reorderedSiblings.forEach((folder, index) => {
            const folderInTree = findFolderById(updatedFolders, folder.id)
            if (folderInTree) {
              folderInTree.position = index
            }
          })

          onFoldersReorder(updatedFolders)
        }
      } else {
        // Different parent - move folder
        const newPosition = overFolder.position

        if (onFolderMove) {
          await onFolderMove(activeId, overFolder.parentId, newPosition)
        } else {
          await moveFolder(activeId, overFolder.parentId, newPosition)
        }

        // The parent component should handle refreshing the folder tree
      }
    } catch (error) {
      console.error('Failed to reorder folders:', error)
    }
  }, [
    draggedFolder,
    folders,
    findFolderById,
    reorderFolders,
    moveFolder,
    onFolderMove,
    onFoldersReorder
  ])

  return {
    draggedFolder,
    dropZone,
    isDragging,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    DndContextComponent: DndContext,
    SortableContextComponent: SortableContext,
    DragOverlayComponent: DragOverlay
  }
}

// Custom collision detection for better drop zone detection
export const customCollisionDetection: CollisionDetection = (args) => {
  // Use closest center as base, but add custom logic for folder hierarchy
  const closestCenterCollisions = closestCenter(args)
  return closestCenterCollisions
}

// Helper function to check if a folder can be dropped on another
export function canDropFolder(
  draggedFolder: DraggedFolder,
  targetFolder: FolderTreeNode
): boolean {
  // Can't drop on itself
  if (draggedFolder.id === targetFolder.id) return false
  
  // Can't drop on a descendant (would create circular reference)
  const isDescendant = (folder: FolderTreeNode, ancestorId: number): boolean => {
    if (folder.parentId === ancestorId) return true
    if (folder.parentId === null) return false
    
    // This would require traversing up the tree, which we'd need the full tree for
    // For now, we'll rely on the backend validation
    return false
  }
  
  return !isDescendant(targetFolder, draggedFolder.id)
}
