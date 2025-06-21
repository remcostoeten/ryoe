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
} from './folder-service'

export {
    getNoteById,
    getNotesByFolder,
} from './note-service' 