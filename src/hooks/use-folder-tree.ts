import { useMemo } from 'react'
import { useFolders } from './use-folders'
import type { TFolder, TFolderTreeNode } from '@/types'

function buildFolderTree(folders: TFolder[], parentId: number | null = null, level: number = 0): TFolderTreeNode[] {
    const children = folders
        .filter(folder => folder.parentId === parentId)
        .sort((a, b) => a.position - b.position)
        .map(folder => ({
            ...folder,
            children: buildFolderTree(folders, folder.id, level + 1),
            level,
            isExpanded: false,
            isSelected: false
        }))

    return children
}

export function useFolderTree() {
    const { folders, isLoading } = useFolders()

    const tree = useMemo(() => {
        if (!folders) return []
        return buildFolderTree(folders)
    }, [folders])

    return { tree, isLoading }
} 