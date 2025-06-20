import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFolder, updateFolder, deleteFolder, type TCreateFolderData, type TUpdateFolderData } from '@/services/folder-service'

export function useFolderOperations() {
    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: (data: TCreateFolderData) => createFolder(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['folders'] })
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: TUpdateFolderData }) => updateFolder(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['folders'] })
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteFolder(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['folders'] })
        }
    })

    return {
        createFolder: createMutation.mutate,
        updateFolder: (id: number, data: TUpdateFolderData) => updateMutation.mutate({ id, data }),
        deleteFolder: deleteMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending
    }
} 