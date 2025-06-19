/**
 * Folder queries - React Query hooks for folder operations
 * Pure functions only, no classes
 */

import { useQuery } from '@tanstack/react-query'
import { 
  getFolderById, 
  getRootFolders,
  getChildFolders,
  getFolderHierarchyWithStats,
  getFolderPathWithStats
} from '@/api/services/folders-service'
import { QUERY_KEYS, CACHE_TIMES, STALE_TIMES } from './types'
import type { TQueryOptions } from './types'
import type { TFolderWithStats } from '@/domain/entities/workspace'

export function useFolder(
  id: number, 
  options?: TQueryOptions<TFolderWithStats>
) {
  return useQuery({
    queryKey: QUERY_KEYS.FOLDER(id),
    queryFn: async () => {
      const result = await getFolderById(id)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch folder')
      }
      return result.data!
    },
    enabled: !!id && (options?.enabled !== false),
    staleTime: options?.staleTime ?? STALE_TIMES.MEDIUM,
    gcTime: options?.cacheTime ?? CACHE_TIMES.LONG,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: options?.refetchOnMount ?? true,
    retry: options?.retry ?? 3,
  })
}

export function useRootFolders(options?: TQueryOptions<TFolderWithStats[]>) {
  return useQuery({
    queryKey: QUERY_KEYS.ROOT_FOLDERS,
    queryFn: async () => {
      const result = await getRootFolders()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch root folders')
      }
      return result.data || []
    },
    enabled: options?.enabled !== false,
    staleTime: options?.staleTime ?? STALE_TIMES.MEDIUM,
    gcTime: options?.cacheTime ?? CACHE_TIMES.LONG,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: options?.refetchOnMount ?? true,
    retry: options?.retry ?? 3,
  })
}

export function useChildFolders(
  parentId: number, 
  options?: TQueryOptions<TFolderWithStats[]>
) {
  return useQuery({
    queryKey: QUERY_KEYS.CHILD_FOLDERS(parentId),
    queryFn: async () => {
      const result = await getChildFolders(parentId)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch child folders')
      }
      return result.data || []
    },
    enabled: !!parentId && (options?.enabled !== false),
    staleTime: options?.staleTime ?? STALE_TIMES.MEDIUM,
    gcTime: options?.cacheTime ?? CACHE_TIMES.LONG,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: options?.refetchOnMount ?? true,
    retry: options?.retry ?? 3,
  })
}

export function useFolderHierarchy(options?: TQueryOptions<TFolderWithStats[]>) {
  return useQuery({
    queryKey: QUERY_KEYS.FOLDER_HIERARCHY,
    queryFn: async () => {
      const result = await getFolderHierarchyWithStats()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch folder hierarchy')
      }
      return result.data || []
    },
    enabled: options?.enabled !== false,
    staleTime: options?.staleTime ?? STALE_TIMES.LONG,
    gcTime: options?.cacheTime ?? CACHE_TIMES.VERY_LONG,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: options?.refetchOnMount ?? true,
    retry: options?.retry ?? 3,
  })
}

export function useFolderPath(
  id: number, 
  options?: TQueryOptions<TFolderWithStats[]>
) {
  return useQuery({
    queryKey: QUERY_KEYS.FOLDER_PATH(id),
    queryFn: async () => {
      const result = await getFolderPathWithStats(id)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch folder path')
      }
      return result.data || []
    },
    enabled: !!id && (options?.enabled !== false),
    staleTime: options?.staleTime ?? STALE_TIMES.LONG,
    gcTime: options?.cacheTime ?? CACHE_TIMES.LONG,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: options?.refetchOnMount ?? false,
    retry: options?.retry ?? 3,
  })
}

// Prefetch functions for performance optimization
export function prefetchFolder(queryClient: any, id: number) {
  return queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.FOLDER(id),
    queryFn: async () => {
      const result = await getFolderById(id)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch folder')
      }
      return result.data!
    },
    staleTime: STALE_TIMES.MEDIUM,
  })
}

export function prefetchRootFolders(queryClient: any) {
  return queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.ROOT_FOLDERS,
    queryFn: async () => {
      const result = await getRootFolders()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch root folders')
      }
      return result.data || []
    },
    staleTime: STALE_TIMES.MEDIUM,
  })
}

export function prefetchChildFolders(queryClient: any, parentId: number) {
  return queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.CHILD_FOLDERS(parentId),
    queryFn: async () => {
      const result = await getChildFolders(parentId)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch child folders')
      }
      return result.data || []
    },
    staleTime: STALE_TIMES.MEDIUM,
  })
}

// Utility functions for cache management
export function invalidateFolderQueries(queryClient: any, folderId?: number, parentId?: number) {
  if (folderId) {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FOLDER(folderId) })
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FOLDER_PATH(folderId) })
  }
  if (parentId) {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHILD_FOLDERS(parentId) })
  }
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROOT_FOLDERS })
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FOLDER_HIERARCHY })
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FOLDERS })
}

export function setFolderCache(queryClient: any, folderId: number, data: TFolderWithStats) {
  queryClient.setQueryData(QUERY_KEYS.FOLDER(folderId), data)
}

export function setRootFoldersCache(queryClient: any, data: TFolderWithStats[]) {
  queryClient.setQueryData(QUERY_KEYS.ROOT_FOLDERS, data)
}

export function setChildFoldersCache(queryClient: any, parentId: number, data: TFolderWithStats[]) {
  queryClient.setQueryData(QUERY_KEYS.CHILD_FOLDERS(parentId), data)
}

export function getFolderFromCache(queryClient: any, folderId: number): TFolderWithStats | undefined {
  return queryClient.getQueryData(QUERY_KEYS.FOLDER(folderId))
}

export function getRootFoldersFromCache(queryClient: any): TFolderWithStats[] | undefined {
  return queryClient.getQueryData(QUERY_KEYS.ROOT_FOLDERS)
}

export function getChildFoldersFromCache(queryClient: any, parentId: number): TFolderWithStats[] | undefined {
  return queryClient.getQueryData(QUERY_KEYS.CHILD_FOLDERS(parentId))
}

// Optimistic update helpers
export function updateFolderInParentCache(
  queryClient: any, 
  parentId: number | null, 
  folderId: number, 
  updater: (folder: TFolderWithStats) => TFolderWithStats
) {
  const folders = parentId 
    ? getChildFoldersFromCache(queryClient, parentId)
    : getRootFoldersFromCache(queryClient)
    
  if (folders) {
    const updatedFolders = folders.map(folder => 
      folder.id === folderId ? updater(folder) : folder
    )
    
    if (parentId) {
      setChildFoldersCache(queryClient, parentId, updatedFolders)
    } else {
      setRootFoldersCache(queryClient, updatedFolders)
    }
  }
}

export function addFolderToParentCache(
  queryClient: any, 
  parentId: number | null, 
  folder: TFolderWithStats
) {
  const folders = parentId 
    ? getChildFoldersFromCache(queryClient, parentId) || []
    : getRootFoldersFromCache(queryClient) || []
    
  const updatedFolders = [...folders, folder].sort((a, b) => a.position - b.position)
  
  if (parentId) {
    setChildFoldersCache(queryClient, parentId, updatedFolders)
  } else {
    setRootFoldersCache(queryClient, updatedFolders)
  }
}

export function removeFolderFromParentCache(
  queryClient: any, 
  parentId: number | null, 
  folderId: number
) {
  const folders = parentId 
    ? getChildFoldersFromCache(queryClient, parentId)
    : getRootFoldersFromCache(queryClient)
    
  if (folders) {
    const updatedFolders = folders.filter(folder => folder.id !== folderId)
    
    if (parentId) {
      setChildFoldersCache(queryClient, parentId, updatedFolders)
    } else {
      setRootFoldersCache(queryClient, updatedFolders)
    }
  }
}

export function moveFolderBetweenParentsCache(
  queryClient: any,
  folder: TFolderWithStats,
  oldParentId: number | null,
  newParentId: number | null
) {
  // Remove from old parent
  removeFolderFromParentCache(queryClient, oldParentId, folder.id)
  
  // Add to new parent
  const updatedFolder = { ...folder, parentId: newParentId }
  addFolderToParentCache(queryClient, newParentId, { ...updatedFolder, parentId: updatedFolder.parentId || undefined })
  
  // Update individual folder cache
  setFolderCache(queryClient, folder.id, { ...updatedFolder, parentId: updatedFolder.parentId || undefined })
}
