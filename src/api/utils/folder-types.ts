import { useQueryClient } from '@tanstack/react-query'
import type { TFolderWithStats, TFolder, TBaseEntity } from '@/types'
import { getFolderFromCache, setFolderCache } from '@/api/services/folders-service'

// Type guard to ensure folder is valid
export function isValidFolder(folder: any): folder is TFolderWithStats {
    return folder &&
        typeof folder === 'object' &&
        'id' in folder &&
        'type' in folder &&
        folder.type === 'folder' &&
        'children' in folder
}

// Convert string dates to Date objects
export function ensureDateFields(folder: Partial<TFolderWithStats>): Partial<TFolderWithStats> {
    return {
        ...folder,
        createdAt: folder.createdAt ? new Date(folder.createdAt) : new Date(),
        updatedAt: folder.updatedAt ? new Date(folder.updatedAt) : new Date(),
    }
}

// Helper to ensure children are valid folders
export function ensureValidChildren(children: (TFolderWithStats | undefined)[] | undefined): TFolderWithStats[] {
    return (children || []).filter(isValidFolder).map(folder => ({
        ...folder,
        children: ensureValidChildren(folder.children),
    }))
}

// Helper to create a valid folder
export function createValidFolder(folder: Partial<TFolderWithStats>): TFolderWithStats {
    const now = new Date()
    return {
        id: folder.id || Date.now(),
        name: folder.name || '',
        parentId: folder.parentId || null,
        position: folder.position || 0,
        isFavorite: folder.isFavorite || false,
        isPublic: folder.isPublic || false,
        type: 'folder',
        createdAt: folder.createdAt ? new Date(folder.createdAt) : now,
        updatedAt: folder.updatedAt ? new Date(folder.updatedAt) : now,
        children: ensureValidChildren(folder.children),
        depth: folder.depth || 0,
        hasChildren: folder.hasChildren || false,
        isTemp: folder.isTemp || false,
        noteCount: folder.noteCount || 0,
        childCount: folder.childCount || 0,
        path: folder.path || [],
        isExpanded: folder.isExpanded || false,
    }
}

// Helper to safely handle folder updates
export function handleFolderUpdate(
    queryClient: ReturnType<typeof useQueryClient>,
    folder: TFolderWithStats | undefined,
    updateFn: (folder: TFolderWithStats) => Partial<TFolderWithStats>
): void {
    if (folder) {
        const updatedFolder = createValidFolder({
            ...folder,
            ...updateFn(folder),
        })
        setFolderCache(queryClient, updatedFolder)
    }
}

// Helper to handle move folder operations
export function handleMoveFolder(
    queryClient: ReturnType<typeof useQueryClient>,
    currentFolder: TFolderWithStats,
    oldParentId: number | null,
    newParentId: number | null
): void {
    // Remove from old parent
    if (oldParentId) {
        handleFolderUpdate(
            queryClient,
            getFolderFromCache(queryClient, oldParentId),
            (parent) => ({
                ...parent,
                children: ensureValidChildren(parent.children?.filter(f => f?.id !== currentFolder.id)),
            })
        )
    }

    // Add to new parent
    if (newParentId) {
        handleFolderUpdate(
            queryClient,
            getFolderFromCache(queryClient, newParentId),
            (parent) => ({
                ...parent,
                children: ensureValidChildren([...parent.children || [], createValidFolder({ ...currentFolder, parentId: newParentId })]),
            })
        )
    }
} 