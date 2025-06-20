import { useState, useEffect } from 'react'
import type { TFolder } from '@/types'

export function useFolders() {
    const [folders, setFolders] = useState<TFolder[] | undefined>(undefined)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // TODO: Implement actual folder fetching
        const mockFolders: TFolder[] = [
            {
                id: 1,
                name: 'Root Folder',
                parentId: null,
                position: 0,
                isFavorite: false,
                isPublic: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
        ]

        setTimeout(() => {
            setFolders(mockFolders)
            setIsLoading(false)
        }, 500)
    }, [])

    return { folders, isLoading }
} 