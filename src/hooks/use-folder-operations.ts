import { useMutation } from '@tanstack/react-query'
import type { TFolder } from '@/types'

interface TCreateFolderData {
    name: string
    parentId?: number
}

interface TUpdateFolderData {
    id: number
    name: string
}

export function useFolderOperations() {
    const createFolder = useMutation({
        mutationFn: async (data: TCreateFolderData) => {
            console.log('Creating folder:', data)
            return null
        }
    })

    const updateFolder = (id: number, data: Partial<TFolder>) => {
        console.log('Updating folder:', id, data)
        return null
    }

    const deleteFolder = useMutation({
        mutationFn: async (id: number) => {
            console.log('Deleting folder:', id)
            return null
        }
    })

    return {
        createFolder: createFolder.mutate,
        updateFolder,
        deleteFolder: deleteFolder.mutate,
        isCreating: createFolder.isPending,
        isUpdating: false,
        isDeleting: deleteFolder.isPending,
    }
} 