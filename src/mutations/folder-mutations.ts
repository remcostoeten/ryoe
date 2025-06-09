/**
 * Folder mutations - React Query mutations for folder operations
 * Pure functions only, no classes
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  createFolderWithValidation, 
  updateFolderWithValidation, 
  deleteFolderById,
  moveFolderToParent,
  reorderFoldersInParent
} from '@/services/folder-service'
import { 
  invalidateFolderQueries,
  setFolderCache,
  addFolderToParentCache,
  updateFolderInParentCache,
  removeFolderFromParentCache,
  moveFolderBetweenParentsCache,
  getFolderFromCache,
  getRootFoldersFromCache,
  getChildFoldersFromCache
} from '@/queries/folder-queries'
import type { 
  TMutationOptions,
  TCreateFolderVariables,
  TUpdateFolderVariables,
  TDeleteFolderVariables,
  TMoveFolderVariables,
  TReorderFoldersVariables
} from './types'
import type { TFolderWithStats } from '@/services/types'

export function useCreateFolder(
  options?: TMutationOptions<TFolderWithStats, TCreateFolderVariables>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: TCreateFolderVariables) => {
      const result = await createFolderWithValidation(variables)
      if (!result.success) {
        throw new Error(result.error || 'Failed to create folder')
      }
      return result.data!
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      const queryKey = variables.parentId 
        ? ['folders', 'children', variables.parentId]
        : ['folders', 'root']
      await queryClient.cancelQueries({ queryKey })

      // Snapshot previous value
      const previousFolders = variables.parentId
        ? getChildFoldersFromCache(queryClient, variables.parentId)
        : getRootFoldersFromCache(queryClient)

      // Optimistically add folder
      const optimisticFolder: TFolderWithStats = {
        id: Date.now(), // Temporary ID
        name: variables.name,
        parentId: variables.parentId,
        position: previousFolders?.length || 0,
        isFavorite: false,
        noteCount: 0,
        subfolderCount: 0,
        totalSize: 0,
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000)
      }

      addFolderToParentCache(queryClient, variables.parentId || null, optimisticFolder)

      options?.onMutate?.(variables)

      return { previousFolders, optimisticFolder }
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousFolders) {
        const queryKey = variables.parentId 
          ? ['folders', 'children', variables.parentId]
          : ['folders', 'root']
        queryClient.setQueryData(queryKey, context.previousFolders)
      }

      console.error('Failed to create folder:', error)
      options?.onError?.(error, variables)
    },
    onSuccess: (data, variables, context) => {
      // Replace optimistic folder with real data
      if (context?.optimisticFolder) {
        removeFolderFromParentCache(queryClient, variables.parentId || null, context.optimisticFolder.id)
      }
      addFolderToParentCache(queryClient, variables.parentId || null, data)
      setFolderCache(queryClient, data.id, data)
      
      options?.onSuccess?.(data, variables)
    },
    onSettled: (data, error, variables) => {
      // Invalidate queries to ensure consistency
      invalidateFolderQueries(queryClient, data?.id, variables.parentId)
      
      options?.onSettled?.(data, error, variables)
    }
  })
}

export function useUpdateFolder(
  options?: TMutationOptions<TFolderWithStats, TUpdateFolderVariables>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: TUpdateFolderVariables) => {
      const result = await updateFolderWithValidation(variables.id, variables)
      if (!result.success) {
        throw new Error(result.error || 'Failed to update folder')
      }
      return result.data!
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['folders', variables.id] })

      // Snapshot previous value
      const previousFolder = getFolderFromCache(queryClient, variables.id)

      // Optimistically update folder
      if (previousFolder) {
        const optimisticFolder = {
          ...previousFolder,
          ...variables,
          updatedAt: Math.floor(Date.now() / 1000)
        }

        setFolderCache(queryClient, variables.id, optimisticFolder)
        updateFolderInParentCache(queryClient, previousFolder.parentId || null, variables.id, () => optimisticFolder)
      }

      options?.onMutate?.(variables)

      return { previousFolder }
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousFolder) {
        setFolderCache(queryClient, variables.id, context.previousFolder)
        updateFolderInParentCache(queryClient, context.previousFolder.parentId ?? null, variables.id, () => context.previousFolder!)
      }

      console.error('Failed to update folder:', error)
      options?.onError?.(error, variables)
    },
    onSuccess: (data, variables) => {
      // Update cache with server response
      setFolderCache(queryClient, variables.id, data)
      updateFolderInParentCache(queryClient, data.parentId ?? null, variables.id, () => data)
      
      options?.onSuccess?.(data, variables)
    },
    onSettled: (data, error, variables) => {
      // Invalidate queries to ensure consistency
      invalidateFolderQueries(queryClient, variables.id, data?.parentId)
      
      options?.onSettled?.(data, error, variables)
    }
  })
}

export function useDeleteFolder(
  options?: TMutationOptions<boolean, TDeleteFolderVariables>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: TDeleteFolderVariables) => {
      const result = await deleteFolderById(variables.id, { force: variables.force })
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete folder')
      }
      return result.data!
    },
    onMutate: async (variables) => {
      // Get folder before deletion for rollback
      const folderToDelete = getFolderFromCache(queryClient, variables.id)

      // Optimistically remove folder
      if (folderToDelete) {
        removeFolderFromParentCache(queryClient, folderToDelete.parentId || null, variables.id)
        queryClient.removeQueries({ queryKey: ['folders', variables.id] })
      }

      options?.onMutate?.(variables)

      return { folderToDelete }
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.folderToDelete) {
        addFolderToParentCache(queryClient, context.folderToDelete.parentId ?? null, context.folderToDelete)
        setFolderCache(queryClient, variables.id, context.folderToDelete)
      }

      console.error('Failed to delete folder:', error)
      options?.onError?.(error, variables)
    },
    onSuccess: (data, variables, context) => {
      // Ensure folder is removed from all caches
      queryClient.removeQueries({ queryKey: ['folders', variables.id] })
      
      if (context?.folderToDelete) {
        removeFolderFromParentCache(queryClient, context.folderToDelete.parentId ?? null, variables.id)
      }
      
      options?.onSuccess?.(data, variables)
    },
    onSettled: (data, error, variables, context) => {
      // Invalidate queries to ensure consistency
      invalidateFolderQueries(queryClient, variables.id, context?.folderToDelete?.parentId)
      
      options?.onSettled?.(data, error, variables)
    }
  })
}

export function useMoveFolder(
  options?: TMutationOptions<TFolderWithStats, TMoveFolderVariables>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: TMoveFolderVariables) => {
      const result = await moveFolderToParent(variables.id, variables.newParentId, variables.newPosition)
      if (!result.success) {
        throw new Error(result.error || 'Failed to move folder')
      }
      return result.data!
    },
    onMutate: async (variables) => {
      // Get current folder
      const currentFolder = getFolderFromCache(queryClient, variables.id)
      
      if (currentFolder) {
        // Optimistically move folder between parents
        moveFolderBetweenParentsCache(
          queryClient,
          currentFolder,
          currentFolder.parentId || null,
          variables.newParentId
        )
      }

      options?.onMutate?.(variables)

      return { currentFolder }
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.currentFolder) {
        moveFolderBetweenParentsCache(
          queryClient,
          context.currentFolder,
          variables.newParentId,
          context.currentFolder.parentId ?? null
        )
      }

      console.error('Failed to move folder:', error)
      options?.onError?.(error, variables)
    },
    onSuccess: (data, variables, _context) => {
      // Update cache with server response
      setFolderCache(queryClient, variables.id, data)
      
      options?.onSuccess?.(data, variables)
    },
    onSettled: (data, error, variables, context) => {
      // Invalidate queries to ensure consistency
      invalidateFolderQueries(queryClient, variables.id, variables.newParentId ?? undefined)
      if (context?.currentFolder?.parentId !== variables.newParentId) {
        invalidateFolderQueries(queryClient, undefined, context?.currentFolder?.parentId)
      }
      
      options?.onSettled?.(data, error, variables)
    }
  })
}

export function useReorderFolders(
  options?: TMutationOptions<boolean, TReorderFoldersVariables>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: TReorderFoldersVariables) => {
      const result = await reorderFoldersInParent(variables.parentId, variables.folderIds)
      if (!result.success) {
        throw new Error(result.error || 'Failed to reorder folders')
      }
      return result.data!
    },
    onMutate: async (variables) => {
      // Get current folders
      const currentFolders = variables.parentId
        ? getChildFoldersFromCache(queryClient, variables.parentId)
        : getRootFoldersFromCache(queryClient)
      
      if (currentFolders) {
        // Optimistically reorder folders
        const reorderedFolders = variables.folderIds.map((folderId, index) => {
          const folder = currentFolders.find(f => f.id === folderId)
          return folder ? { ...folder, position: index } : null
        }).filter(Boolean) as TFolderWithStats[]
        
        const queryKey = variables.parentId 
          ? ['folders', 'children', variables.parentId]
          : ['folders', 'root']
        queryClient.setQueryData(queryKey, reorderedFolders)
      }

      options?.onMutate?.(variables)

      return { currentFolders }
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.currentFolders) {
        const queryKey = variables.parentId 
          ? ['folders', 'children', variables.parentId]
          : ['folders', 'root']
        queryClient.setQueryData(queryKey, context.currentFolders)
      }

      console.error('Failed to reorder folders:', error)
      options?.onError?.(error, variables)
    },
    onSuccess: (data, variables) => {
      options?.onSuccess?.(data, variables)
    },
    onSettled: (data, error, variables) => {
      // Invalidate queries to ensure consistency
      invalidateFolderQueries(queryClient, undefined, variables.parentId ?? undefined)
      
      options?.onSettled?.(data, error, variables)
    }
  })
}
