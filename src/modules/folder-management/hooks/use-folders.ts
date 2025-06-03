import { useState, useEffect, useCallback } from 'react'
import { FolderService } from '@/api/services/folder-service'
import type { 
  Folder, 
  CreateFolderInput, 
  UpdateFolderInput 
} from '@/types/notes'
import type { UseFoldersReturn } from '../types'

const folderService = new FolderService()

export function useFolders(parentId?: number | null): UseFoldersReturn {
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadFolders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await folderService.list({ parentId })
      
      if (response.success && response.data) {
        setFolders(response.data)
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

  const createFolder = useCallback(async (input: CreateFolderInput): Promise<Folder | null> => {
    try {
      setError(null)
      
      const response = await folderService.create(input)
      
      if (response.success && response.data) {
        // Add to local state if it belongs to current parent
        if (input.parentId === parentId) {
          setFolders(prev => [...prev, response.data!])
        }
        return response.data
      } else {
        setError(response.error || 'Failed to create folder')
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      return null
    }
  }, [parentId])

  const updateFolder = useCallback(async (input: UpdateFolderInput): Promise<Folder | null> => {
    try {
      setError(null)
      
      const response = await folderService.update(input)
      
      if (response.success && response.data) {
        // Update local state
        setFolders(prev => prev.map(folder => 
          folder.id === input.id ? response.data! : folder
        ))
        return response.data
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
    deleteChildren: boolean = false
  ): Promise<boolean> => {
    try {
      setError(null)
      
      const response = await folderService.delete(id, { deleteChildren })
      
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
