/**
 * Service layer exports
 * Centralized exports for all service functions
 */

export type { TServiceResult } from './types'

export {
    createFolder,
    updateFolder,
    deleteFolder,
    getFolderById,
    getRootFolders,
    getChildFolders,
    moveFolder,
    reorderFolders,
    getFolderHierarchy,
    getFolderPath,
    toggleFolderFavoriteStatus,
} from './folder-service'

export {
    getNoteById,
    getNotesByFolder,
    toggleNoteFavoriteStatus,
} from './note-service' 