/**
 * Folder service - business logic for folder operations
 * Pure functions only, no classes
 */

import { 
  findFolderById, 
  findRootFolders,
  findChildFolders,
  createFolder, 
  updateFolder, 
  deleteFolder,
  moveFolder,
  reorderFolders,
  getFolderHierarchy,
  getFolderPath
} from '@/repositories'
import { findNotesByFolderId } from '@/repositories'
import { validateFolderName } from '@/utilities'
import type { 
  TServiceResult, 
  TServiceListResult,
  TFolderCreationData, 
  TFolderUpdateData, 
  TFolderWithStats
} from './types'
import type { TCreateFolderData, TUpdateFolderData, TFolder } from '@/repositories/types'

function validateFolderCreation(data: TFolderCreationData): TServiceResult<null> {
  if (!data.name || !validateFolderName(data.name)) {
    return {
      success: false,
      error: 'Folder name must be 1-50 characters long and contain only valid characters',
      code: 'INVALID_FOLDER_NAME'
    }
  }

  return { success: true }
}

async function mapFolderToStats(folder: TFolder): Promise<TFolderWithStats> {
  // Get notes count for this folder
  const notesResult = await findNotesByFolderId(folder.id)
  const noteCount = notesResult.success ? (notesResult.data?.length || 0) : 0

  // Get subfolders count
  const subfoldersResult = await findChildFolders(folder.id)
  const subfolderCount = subfoldersResult.success ? (subfoldersResult.data?.length || 0) : 0

  // Calculate total size (simplified - just character count of all notes)
  let totalSize = 0
  if (notesResult.success && notesResult.data) {
    totalSize = notesResult.data.reduce((sum, note) => sum + note.content.length, 0)
  }

  return {
    id: folder.id,
    name: folder.name,
    parentId: folder.parentId,
    position: folder.position,
    noteCount,
    subfolderCount,
    totalSize,
    createdAt: folder.createdAt,
    updatedAt: folder.updatedAt
  }
}

export async function createFolderWithValidation(data: TFolderCreationData): Promise<TServiceResult<TFolderWithStats>> {
  try {
    const validation = validateFolderCreation(data)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
        code: validation.code
      }
    }

    const createData: TCreateFolderData = {
      name: data.name.trim(),
      parentId: data.parentId
    }

    const result = await createFolder(createData)
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to create folder',
        code: 'CREATE_FOLDER_FAILED'
      }
    }

    const folderWithStats = await mapFolderToStats(result.data)
    return { success: true, data: folderWithStats }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'CREATE_FOLDER_ERROR'
    }
  }
}

export async function updateFolderWithValidation(
  id: number, 
  data: TFolderUpdateData
): Promise<TServiceResult<TFolderWithStats>> {
  try {
    if (data.name !== undefined && !validateFolderName(data.name)) {
      return {
        success: false,
        error: 'Folder name must be 1-50 characters long and contain only valid characters',
        code: 'INVALID_FOLDER_NAME'
      }
    }

    const updateData: TUpdateFolderData = {}
    if (data.name !== undefined) updateData.name = data.name.trim()
    if (data.parentId !== undefined) updateData.parentId = data.parentId

    const result = await updateFolder(id, updateData)
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to update folder',
        code: 'UPDATE_FOLDER_FAILED'
      }
    }

    const folderWithStats = await mapFolderToStats(result.data)
    return { success: true, data: folderWithStats }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'UPDATE_FOLDER_ERROR'
    }
  }
}

export async function getFolderById(id: number): Promise<TServiceResult<TFolderWithStats>> {
  try {
    const result = await findFolderById(id)
    if (!result.success) {
      return {
        success: false,
        error: result.error,
        code: 'FETCH_FOLDER_FAILED'
      }
    }

    if (!result.data) {
      return {
        success: false,
        error: 'Folder not found',
        code: 'FOLDER_NOT_FOUND'
      }
    }

    const folderWithStats = await mapFolderToStats(result.data)
    return { success: true, data: folderWithStats }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'GET_FOLDER_ERROR'
    }
  }
}

export async function getRootFolders(): Promise<TServiceListResult<TFolderWithStats>> {
  try {
    const result = await findRootFolders()
    if (!result.success) {
      return {
        success: false,
        error: result.error,
        code: 'FETCH_ROOT_FOLDERS_FAILED'
      }
    }

    const foldersWithStats = await Promise.all(
      (result.data || []).map(mapFolderToStats)
    )

    return { 
      success: true, 
      data: foldersWithStats,
      total: foldersWithStats.length
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'GET_ROOT_FOLDERS_ERROR'
    }
  }
}

export async function getChildFolders(parentId: number): Promise<TServiceListResult<TFolderWithStats>> {
  try {
    const result = await findChildFolders(parentId)
    if (!result.success) {
      return {
        success: false,
        error: result.error,
        code: 'FETCH_CHILD_FOLDERS_FAILED'
      }
    }

    const foldersWithStats = await Promise.all(
      (result.data || []).map(mapFolderToStats)
    )

    return { 
      success: true, 
      data: foldersWithStats,
      total: foldersWithStats.length
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'GET_CHILD_FOLDERS_ERROR'
    }
  }
}

export async function deleteFolderById(id: number): Promise<TServiceResult<boolean>> {
  try {
    // Check if folder has children
    const childFolders = await findChildFolders(id)
    if (childFolders.success && childFolders.data && childFolders.data.length > 0) {
      return {
        success: false,
        error: 'Cannot delete folder that contains subfolders',
        code: 'FOLDER_HAS_CHILDREN'
      }
    }

    // Check if folder has notes
    const notes = await findNotesByFolderId(id)
    if (notes.success && notes.data && notes.data.length > 0) {
      return {
        success: false,
        error: 'Cannot delete folder that contains notes',
        code: 'FOLDER_HAS_NOTES'
      }
    }

    const result = await deleteFolder(id)
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to delete folder',
        code: 'DELETE_FOLDER_FAILED'
      }
    }

    return { success: true, data: result.data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'DELETE_FOLDER_ERROR'
    }
  }
}

export async function moveFolderToParent(
  id: number, 
  newParentId: number | null, 
  newPosition?: number
): Promise<TServiceResult<TFolderWithStats>> {
  try {
    // Prevent moving folder into itself or its descendants
    if (newParentId === id) {
      return {
        success: false,
        error: 'Cannot move folder into itself',
        code: 'INVALID_MOVE_TARGET'
      }
    }

    // TODO: Add check for circular references (moving into descendant)

    const result = await moveFolder(id, newParentId, newPosition)
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to move folder',
        code: 'MOVE_FOLDER_FAILED'
      }
    }

    const folderWithStats = await mapFolderToStats(result.data)
    return { success: true, data: folderWithStats }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'MOVE_FOLDER_ERROR'
    }
  }
}

export async function reorderFoldersInParent(
  parentId: number | null, 
  folderIds: number[]
): Promise<TServiceResult<boolean>> {
  try {
    const result = await reorderFolders(parentId, folderIds)
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to reorder folders',
        code: 'REORDER_FOLDERS_FAILED'
      }
    }

    return { success: true, data: result.data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'REORDER_FOLDERS_ERROR'
    }
  }
}

export async function getFolderHierarchyWithStats(): Promise<TServiceResult<TFolderWithStats[]>> {
  try {
    const result = await getFolderHierarchy()
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to get folder hierarchy',
        code: 'GET_HIERARCHY_FAILED'
      }
    }

    const foldersWithStats = await Promise.all(
      (result.data || []).map(mapFolderToStats)
    )

    return { success: true, data: foldersWithStats }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'GET_HIERARCHY_ERROR'
    }
  }
}

export async function getFolderPathWithStats(id: number): Promise<TServiceResult<TFolderWithStats[]>> {
  try {
    const result = await getFolderPath(id)
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to get folder path',
        code: 'GET_PATH_FAILED'
      }
    }

    const foldersWithStats = await Promise.all(
      (result.data || []).map(mapFolderToStats)
    )

    return { success: true, data: foldersWithStats }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'GET_PATH_ERROR'
    }
  }
}
