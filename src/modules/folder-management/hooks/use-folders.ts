import { useState, useEffect, useCallback } from 'react'
import {
  createFolderWithValidation,
  updateFolderWithValidation,
  deleteFolderById,
  getRootFolders,
  getChildFolders
} from '@/services/folder-service'
import type {
  TFolder,
  TCreateFolderInput,
  TUpdateFolderInput
} from '@/types/notes'
import type { TFolderWithStats } from '@/services/types'
import type { UseFoldersReturn } from '../types'

export function useFolders(parentId?: number | null): UseFoldersReturn {
  const [folders, setFolders] = useState<TFolder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadFolders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Use the new pure functions instead of the old service class
      const response = parentId
        ? await getChildFolders(parentId)
        : await getRootFolders()

      if (response.success && response.data) {
        // Convert TFolderWithStats to TFolder for compatibility
        const folderData = response.data.map((folder: TFolderWithStats): TFolder => ({
          id: folder.id,
          name: folder.name,
          parentId: folder.parentId ?? null,
          position: folder.position,
          isPublic: true, // Default value - should be added to TFolderWithStats later
          createdAt: new Date(folder.createdAt),
          updatedAt: new Date(folder.updatedAt)
        }))
        setFolders(folderData)
      } else {
        setError(response.error || 'Failed to load folders')
        setFolders([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setFolders([])
    } finally {
      setLoading(false)
    }
  }, [parentId])

  const createFolder = useCallback(async (input: TCreateFolderInput): Promise<TFolder | null> => {
    try {
      setError(null)

      const response = await createFolderWithValidation({
        name: input.name,
        parentId: input.parentId ?? undefined
      })

      if (response.success && response.data) {
        // Convert TFolderWithStats to TFolder for compatibility
        const folderData: TFolder = {
          id: response.data.id,
          name: response.data.name,
          parentId: response.data.parentId ?? null,
          position: response.data.position,
          isPublic: true, // Default value - should be added to TFolderWithStats later
          createdAt: new Date(response.data.createdAt),
          updatedAt: new Date(response.data.updatedAt)
        }

        // Add to local state if it belongs to current parent
        if (input.parentId === parentId) {
          setFolders(prev => [...prev, folderData])
        }
        return folderData
      } else {
        setError(response.error || 'Failed to create folder')
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      return null
    }
  }, [parentId])

  const updateFolder = useCallback(async (input: TUpdateFolderInput): Promise<TFolder | null> => {
    try {
      setError(null)

      const response = await updateFolderWithValidation(input.id, {
        name: input.name,
        parentId: input.parentId ?? undefined
      })

      if (response.success && response.data) {
        // Convert TFolderWithStats to TFolder for compatibility
        const folderData: TFolder = {
          id: response.data.id,
          name: response.data.name,
          parentId: response.data.parentId ?? null,
          position: response.data.position,
          isPublic: true, // Default value - should be added to TFolderWithStats later
          createdAt: new Date(response.data.createdAt),
          updatedAt: new Date(response.data.updatedAt)
        }

        // Update local state
        setFolders(prev => prev.map(folder =>
          folder.id === input.id ? folderData : folder
        ))
        return folderData
      } else {
        setError(response.error || 'Failed to update folder')
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      return null
    }
  }, [])

  const deleteFolder = useCallback(async (
    id: number,
    _deleteChildren: boolean = false
  ): Promise<boolean> => {
    try {
      setError(null)

      // Note: The new deleteFolderById function doesn't support deleteChildren option yet
      // It only deletes empty folders (no children or notes)
      const response = await deleteFolderById(id)

      if (response.success) {
        // Remove from local state
        setFolders(prev => prev.filter(folder => folder.id !== id))
        return true
      } else {
        setError(response.error || 'Failed to delete folder')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      return false
    }
  }, [])

  const refreshFolders = useCallback(async () => {
    await loadFolders()
  }, [loadFolders])

  // Load folders on mount and when parentId changes
  useEffect(() => {
    loadFolders()
  }, [loadFolders])

  return {
    folders,
    loading,
    error,
    createFolder,
    updateFolder,
    deleteFolder,
    refreshFolders
  }
}
