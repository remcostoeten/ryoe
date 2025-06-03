import { useState, useCallback } from 'react'
import { FolderService } from '@/api/services/folder-service'
import type { 
  Folder, 
  CreateFolderInput, 
  UpdateFolderInput 
} from '@/types/notes'
import type { UseFolderOperationsReturn } from '../types'

const folderService = new FolderService()

export function useFolderOperations(): UseFolderOperationsReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createFolder = useCallback(async (input: CreateFolderInput): Promise<Folder | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await folderService.create(input)
      
      if (response.success && response.data) {
        return response.data
      } else {
        setError(response.error || 'Failed to create folder')
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const updateFolder = useCallback(async (input: UpdateFolderInput): Promise<Folder | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await folderService.update(input)
      
      if (response.success && response.data) {
        return response.data
      } else {
        setError(response.error || 'Failed to update folder')
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteFolder = useCallback(async (
    id: number, 
    options?: { deleteChildren?: boolean }
  ): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await folderService.delete(id, {
        folderId: id,
        deleteChildren: options?.deleteChildren
      })
      
      if (response.success) {
        return true
      } else {
        setError(response.error || 'Failed to delete folder')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const moveFolder = useCallback(async (
    folderId: number, 
    newParentId: number | null, 
    newPosition: number
  ): Promise<Folder | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await folderService.move(folderId, newParentId, newPosition)
      
      if (response.success && response.data) {
        return response.data
      } else {
        setError(response.error || 'Failed to move folder')
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const reorderFolders = useCallback(async (
    parentId: number | null, 
    folderIds: number[]
  ): Promise<Folder[]> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await folderService.reorder(parentId, folderIds)
      
      if (response.success && response.data) {
        return response.data
      } else {
        setError(response.error || 'Failed to reorder folders')
        return []
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    createFolder,
    updateFolder,
    deleteFolder,
    moveFolder,
    reorderFolders,
    loading,
    error
  }
}

// Hook for batch operations
export function useBatchFolderOperations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  const batchDelete = useCallback(async (
    folderIds: number[], 
    deleteChildren: boolean = false
  ): Promise<{ success: number; failed: number; errors: string[] }> => {
    try {
      setLoading(true)
      setError(null)
      setProgress({ current: 0, total: folderIds.length })
      
      const results = { success: 0, failed: 0, errors: [] as string[] }
      
      for (let i = 0; i < folderIds.length; i++) {
        try {
          const response = await folderService.delete(folderIds[i], {
            folderId: folderIds[i],
            deleteChildren
          })
          
          if (response.success) {
            results.success++
          } else {
            results.failed++
            results.errors.push(response.error || `Failed to delete folder ${folderIds[i]}`)
          }
        } catch (err) {
          results.failed++
          results.errors.push(
            err instanceof Error ? err.message : `Unknown error for folder ${folderIds[i]}`
          )
        }
        
        setProgress({ current: i + 1, total: folderIds.length })
      }
      
      return results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Batch operation failed'
      setError(errorMessage)
      return { success: 0, failed: folderIds.length, errors: [errorMessage] }
    } finally {
      setLoading(false)
      setProgress({ current: 0, total: 0 })
    }
  }, [])

  const batchMove = useCallback(async (
    folderIds: number[], 
    newParentId: number | null
  ): Promise<{ success: number; failed: number; errors: string[] }> => {
    try {
      setLoading(true)
      setError(null)
      setProgress({ current: 0, total: folderIds.length })
      
      const results = { success: 0, failed: 0, errors: [] as string[] }
      
      for (let i = 0; i < folderIds.length; i++) {
        try {
          const response = await folderService.move(folderIds[i], newParentId, i)
          
          if (response.success) {
            results.success++
          } else {
            results.failed++
            results.errors.push(response.error || `Failed to move folder ${folderIds[i]}`)
          }
        } catch (err) {
          results.failed++
          results.errors.push(
            err instanceof Error ? err.message : `Unknown error for folder ${folderIds[i]}`
          )
        }
        
        setProgress({ current: i + 1, total: folderIds.length })
      }
      
      return results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Batch move failed'
      setError(errorMessage)
      return { success: 0, failed: folderIds.length, errors: [errorMessage] }
    } finally {
      setLoading(false)
      setProgress({ current: 0, total: 0 })
    }
  }, [])

  const batchUpdatePrivacy = useCallback(async (
    folderIds: number[], 
    isPublic: boolean
  ): Promise<{ success: number; failed: number; errors: string[] }> => {
    try {
      setLoading(true)
      setError(null)
      setProgress({ current: 0, total: folderIds.length })
      
      const results = { success: 0, failed: 0, errors: [] as string[] }
      
      for (let i = 0; i < folderIds.length; i++) {
        try {
          const response = await folderService.update({
            id: folderIds[i],
            isPublic
          })
          
          if (response.success) {
            results.success++
          } else {
            results.failed++
            results.errors.push(response.error || `Failed to update folder ${folderIds[i]}`)
          }
        } catch (err) {
          results.failed++
          results.errors.push(
            err instanceof Error ? err.message : `Unknown error for folder ${folderIds[i]}`
          )
        }
        
        setProgress({ current: i + 1, total: folderIds.length })
      }
      
      return results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Batch privacy update failed'
      setError(errorMessage)
      return { success: 0, failed: folderIds.length, errors: [errorMessage] }
    } finally {
      setLoading(false)
      setProgress({ current: 0, total: 0 })
    }
  }, [])

  return {
    batchDelete,
    batchMove,
    batchUpdatePrivacy,
    loading,
    error,
    progress
  }
}
