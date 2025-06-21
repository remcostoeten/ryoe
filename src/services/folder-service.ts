import type { TServiceResult, TFolder, TFolderCreationData } from '@/services/types'
import type { TFolderWithStats } from '@/types'

class FolderService {
    private folders: Map<number, TFolderWithStats> = new Map()
    private nextId = 1

    async create(data: TFolderCreationData): Promise<TServiceResult<TFolderWithStats>> {
        try {
            const folder: TFolderWithStats = {
                id: this.nextId++,
                name: data.name,
                parentId: data.parentId || null,
                position: 0,
                isFavorite: false,
                isPublic: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                noteCount: 0,
                childFolderCount: 0,
                totalNoteCount: 0,
                lastModified: new Date().toISOString(),
            }
            this.folders.set(folder.id, folder)
            return { success: true, data: folder }
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to create folder' }
        }
    }

    async update(id: number, data: Partial<TFolder>): Promise<TServiceResult<TFolderWithStats>> {
        try {
            const folder = this.folders.get(id)
            if (!folder) {
                return { success: false, error: 'Folder not found' }
            }
            const updatedFolder = {
                ...folder,
                ...data,
                updatedAt: new Date().toISOString(),
            }
            this.folders.set(id, updatedFolder)
            return { success: true, data: updatedFolder }
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to update folder' }
        }
    }

    async delete(id: number, deleteChildren?: boolean, force?: boolean): Promise<TServiceResult<void>> {
        try {
            if (!this.folders.has(id)) {
                return { success: false, error: 'Folder not found' }
            }
            this.folders.delete(id)
            return { success: true }
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to delete folder' }
        }
    }

    async move(id: number, newParentId: number | null): Promise<TServiceResult<TFolderWithStats>> {
        try {
            const folder = this.folders.get(id)
            if (!folder) {
                return { success: false, error: 'Folder not found' }
            }
            const updatedFolder = {
                ...folder,
                parentId: newParentId,
                updatedAt: new Date().toISOString(),
            }
            this.folders.set(id, updatedFolder)
            return { success: true, data: updatedFolder }
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to move folder' }
        }
    }

    async reorder(parentId: number | null, folderIds: number[]): Promise<TServiceResult<void>> {
        try {
            folderIds.forEach((id, index) => {
                const folder = this.folders.get(id)
                if (folder) {
                    this.folders.set(id, { ...folder, position: index })
                }
            })
            return { success: true }
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to reorder folders' }
        }
    }

    async getById(id: number): Promise<TServiceResult<TFolderWithStats>> {
        try {
            const folder = this.folders.get(id)
            if (!folder) {
                return { success: false, error: 'Folder not found' }
            }
            return { success: true, data: folder }
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to get folder' }
        }
    }

    async getChildFolders(parentId: number | null): Promise<TServiceResult<TFolderWithStats[]>> {
        try {
            const children = Array.from(this.folders.values()).filter(f => f.parentId === parentId)
            return { success: true, data: children }
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to get child folders' }
        }
    }

    async getRootFolders(): Promise<TServiceResult<TFolderWithStats[]>> {
        try {
            const rootFolders = Array.from(this.folders.values()).filter(f => f.parentId === null)
            return { success: true, data: rootFolders }
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to get root folders' }
        }
    }

    async getFolderHierarchy(rootId?: number): Promise<TServiceResult<TFolderWithStats[]>> {
        try {
            const allFolders = Array.from(this.folders.values())
            return { success: true, data: allFolders }
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to get folder hierarchy' }
        }
    }

    async getFolderPath(id: number): Promise<TServiceResult<TFolderWithStats[]>> {
        try {
            const path: TFolderWithStats[] = []
            let currentId: number | null = id

            while (currentId) {
                const folder = this.folders.get(currentId)
                if (!folder) break
                path.unshift(folder)
                currentId = folder.parentId
            }

            return { success: true, data: path }
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Failed to get folder path' }
        }
    }
}

const folderService = new FolderService()

export const createFolder = (data: TFolderCreationData) => folderService.create(data)
export const updateFolder = (id: number, data: Partial<TFolder>) => folderService.update(id, data)
export const deleteFolder = (id: number, options?: { force?: boolean }) => folderService.delete(id, false, options?.force)
export const getFolderById = (id: number) => folderService.getById(id)
export const getRootFolders = () => folderService.getRootFolders()
export const getChildFolders = (parentId: number | null) => folderService.getChildFolders(parentId)
export const moveFolder = (id: number, newParentId: number | null) => folderService.move(id, newParentId)
export const reorderFolders = (parentId: number | null, folderIds: number[]) => folderService.reorder(parentId, folderIds)
export const getFolderHierarchy = (rootId?: number) => folderService.getFolderHierarchy(rootId)
export const getFolderPath = (id: number) => folderService.getFolderPath(id) 