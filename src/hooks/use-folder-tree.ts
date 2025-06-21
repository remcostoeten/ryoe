import { useMemo } from 'react'
import { useFolderHierarchy } from '@/api/services/folders-service'
import type { TFolder } from '@/types'
import type { TFolderTreeNode } from '@/services/types'

function buildFolderTree(folders: TFolder[], parentId: number | null = null, level: number = 0): TFolderTreeNode[] {
    const children = folders
        .filter(folder => folder.parentId === parentId)
        .sort((a, b) => a.position - b.position)
        .map(folder => ({
            ...folder,
            createdAt: folder.createdAt instanceof Date ? folder.createdAt.toISOString() : folder.createdAt,
            updatedAt: folder.updatedAt instanceof Date ? folder.updatedAt.toISOString() : folder.updatedAt,
            children: buildFolderTree(folders, folder.id, level + 1),
            level,
            isExpanded: false,
            isSelected: false
        }))

    return children
}

export function useFolderTree() {
    const { data: folders, isLoading } = useFolderHierarchy()

    const tree = useMemo(() => {
        if (!folders) return []
        return buildFolderTree(folders)
    }, [folders])

    return { tree, isLoading }
} 