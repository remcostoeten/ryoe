import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import {
    createFolder,
    updateFolder,
    deleteFolder,
    moveFolder,
    reorderFolders,
} from '@/services/folder-service'
import {
    invalidateFolderQueries,
    setFolderCache,
    getFolderFromCache,
    useRootFolders,
} from '@/api/services/folders-service'
import {
    isValidFolder,
    ensureValidChildren,
    createValidFolder,
    handleFolderUpdate,
    handleMoveFolder,
} from '@/api/utils/folder-types'
import type {
    TMutationOptions,
    TCreateFolderVariables,
    TUpdateFolderVariables,
    TDeleteFolderVariables,
    TMoveFolderVariables,
    TReorderFoldersVariables,
} from '../types'
import type { TFolderWithStats } from '@/types'

function useCreateFolder(
    options?: TMutationOptions<TFolderWithStats, Error, TCreateFolderVariables>
): UseMutationResult<TFolderWithStats, Error, TCreateFolderVariables> {
    const queryClient = useQueryClient()
    const { data: rootFolders = [] } = useRootFolders()

    return useMutation({
        mutationFn: async (variables: TCreateFolderVariables) => {
            const result = await createFolder(variables)
            if (!result.success) {
                throw new Error(result.error || 'Failed to create folder')
            }
            return createValidFolder(result.data!)
        },
        onMutate: async variables => {
            await queryClient.cancelQueries({ queryKey: ['folders'] })
            const previousFolders = variables.parentId
                ? getFolderFromCache(queryClient, variables.parentId)?.children || []
                : rootFolders

            const optimisticFolder = createValidFolder({
                name: variables.name,
                parentId: variables.parentId || null,
                position: previousFolders.length || 0,
                isFavorite: false,
                isPublic: false,
                type: 'folder',
                children: [],
                depth: 0,
                hasChildren: false,
                isTemp: true,
            })

            // Add to parent's children
            if (variables.parentId) {
                handleFolderUpdate(
                    queryClient,
                    getFolderFromCache(queryClient, variables.parentId),
                    parent => ({
                        ...parent,
                        children: ensureValidChildren([...parent.children || [], optimisticFolder]),
                    })
                )
            } else {
                queryClient.setQueryData(['folders', 'root'], [...rootFolders, optimisticFolder])
            }

            options?.onMutate?.(variables)
            return { previousFolders, optimisticFolder }
        },
        onError: (error, variables, context) => {
            if (context?.previousFolders) {
                const queryKey = variables.parentId
                    ? ['folders', 'children', variables.parentId]
                    : ['folders', 'root']
                queryClient.setQueryData(queryKey, context.previousFolders)
            }
            options?.onError?.(error, variables)
        },
        onSuccess: (data, variables, context) => {
            if (context?.optimisticFolder) {
                // Remove optimistic folder and add real one
                if (variables.parentId) {
                    handleFolderUpdate(
                        queryClient,
                        getFolderFromCache(queryClient, variables.parentId),
                        parent => ({
                            ...parent,
                            children: ensureValidChildren(parent.children?.filter(f => f?.id !== context.optimisticFolder.id)),
                        })
                    )
                }
            }

            // Add real folder
            const validFolder = createValidFolder(data)
            setFolderCache(queryClient, validFolder)
            if (variables.parentId) {
                handleFolderUpdate(
                    queryClient,
                    getFolderFromCache(queryClient, variables.parentId),
                    parent => ({
                        ...parent,
                        children: ensureValidChildren([...parent.children || [], validFolder]),
                    })
                )
            }

            options?.onSuccess?.(validFolder, variables)
        },
        onSettled: (data, error, variables) => {
            invalidateFolderQueries(queryClient, variables.parentId || null)
            options?.onSettled?.(data, error, variables)
        },
    })
}

function useUpdateFolder(
    options?: TMutationOptions<TFolderWithStats, Error, TUpdateFolderVariables>
): UseMutationResult<TFolderWithStats, Error, TUpdateFolderVariables> {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (variables: TUpdateFolderVariables) => {
            const result = await updateFolder(variables.id, variables)
            if (!result.success) {
                throw new Error(result.error || 'Failed to update folder')
            }
            return result.data!
        },
        onMutate: async variables => {
            await queryClient.cancelQueries({ queryKey: ['folders', variables.id] })
            const previousFolder = getFolderFromCache(queryClient, variables.id)

            if (previousFolder) {
                const optimisticFolder = {
                    ...previousFolder,
                    ...variables,
                    updatedAt: new Date(),
                }
                setFolderCache(queryClient, optimisticFolder)

                // Update in parent's children
                if (previousFolder.parentId) {
                    const parent = getFolderFromCache(queryClient, previousFolder.parentId)
                    if (parent) {
                        const updatedParent = {
                            ...parent,
                            children: parent.children?.map(f =>
                                f.id === variables.id ? optimisticFolder : f
                            ) || [],
                        }
                        setFolderCache(queryClient, updatedParent)
                    }
                }
            }

            options?.onMutate?.(variables)
            return { previousFolder }
        },
        onError: (error, variables, context) => {
            if (context?.previousFolder) {
                setFolderCache(queryClient, context.previousFolder)
                if (context.previousFolder.parentId) {
                    const parent = getFolderFromCache(queryClient, context.previousFolder.parentId)
                    if (parent) {
                        const updatedParent = {
                            ...parent,
                            children: parent.children?.map(f =>
                                f.id === variables.id ? context.previousFolder : f
                            ) || [],
                        }
                        setFolderCache(queryClient, updatedParent)
                    }
                }
            }
            options?.onError?.(error, variables)
        },
        onSuccess: (data, variables) => {
            setFolderCache(queryClient, data)
            if (data.parentId) {
                const parent = getFolderFromCache(queryClient, data.parentId)
                if (parent) {
                    const updatedParent = {
                        ...parent,
                        children: parent.children?.map(f =>
                            f.id === variables.id ? data : f
                        ) || [],
                    }
                    setFolderCache(queryClient, updatedParent)
                }
            }
            options?.onSuccess?.(data, variables)
        },
        onSettled: (data, error, variables) => {
            invalidateFolderQueries(queryClient, data?.parentId || null)
            options?.onSettled?.(data, error, variables)
        },
    })
}

function useDeleteFolder(
    options?: TMutationOptions<boolean, Error, TDeleteFolderVariables>
): UseMutationResult<boolean, Error, TDeleteFolderVariables> {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (variables: TDeleteFolderVariables) => {
            const result = await deleteFolder(variables.id, { force: variables.force })
            if (!result.success) {
                throw new Error(result.error || 'Failed to delete folder')
            }
            return result.data!
        },
        onMutate: async variables => {
            const folderToDelete = getFolderFromCache(queryClient, variables.id)
            if (folderToDelete) {
                // Remove from parent's children
                if (folderToDelete.parentId) {
                    const parent = getFolderFromCache(queryClient, folderToDelete.parentId)
                    if (parent) {
                        const updatedParent = {
                            ...parent,
                            children: parent.children?.filter(f => f.id !== variables.id) || [],
                        }
                        setFolderCache(queryClient, updatedParent)
                    }
                }
                queryClient.removeQueries({ queryKey: ['folders', variables.id] })
            }
            options?.onMutate?.(variables)
            return { folderToDelete }
        },
        onError: (error, variables, context) => {
            if (context?.folderToDelete) {
                setFolderCache(queryClient, context.folderToDelete)
                if (context.folderToDelete.parentId) {
                    const parent = getFolderFromCache(queryClient, context.folderToDelete.parentId)
                    if (parent) {
                        const updatedParent = {
                            ...parent,
                            children: [...(parent.children || []), context.folderToDelete],
                        }
                        setFolderCache(queryClient, updatedParent)
                    }
                }
            }
            options?.onError?.(error, variables)
        },
        onSuccess: (data, variables, context) => {
            queryClient.removeQueries({ queryKey: ['folders', variables.id] })
            if (context?.folderToDelete?.parentId) {
                const parent = getFolderFromCache(queryClient, context.folderToDelete.parentId)
                if (parent) {
                    const updatedParent = {
                        ...parent,
                        children: parent.children?.filter(f => f.id !== variables.id) || [],
                    }
                    setFolderCache(queryClient, updatedParent)
                }
            }
            options?.onSuccess?.(data, variables)
        },
        onSettled: (data, error, variables, context) => {
            invalidateFolderQueries(queryClient, context?.folderToDelete?.parentId || null)
            options?.onSettled?.(data, error, variables)
        },
    })
}

function useMoveFolder(
    options?: TMutationOptions<TFolderWithStats, Error, TMoveFolderVariables>
): UseMutationResult<TFolderWithStats, Error, TMoveFolderVariables> {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (variables: TMoveFolderVariables) => {
            const result = await moveFolder(variables.id, variables.parentId)
            if (!result.success) {
                throw new Error(result.error || 'Failed to move folder')
            }
            return result.data!
        },
        onMutate: async variables => {
            const currentFolder = getFolderFromCache(queryClient, variables.id)
            if (currentFolder) {
                handleMoveFolder(
                    queryClient,
                    currentFolder,
                    currentFolder.parentId,
                    variables.parentId
                )
            }
            options?.onMutate?.(variables)
            return { currentFolder }
        },
        onError: (error, variables, context) => {
            if (context?.currentFolder) {
                handleMoveFolder(
                    queryClient,
                    context.currentFolder,
                    variables.parentId,
                    context.currentFolder.parentId
                )
            }
            options?.onError?.(error, variables)
        },
        onSuccess: (data, variables) => {
            setFolderCache(queryClient, data)
            options?.onSuccess?.(data, variables)
        },
        onSettled: (data, error, variables, context) => {
            invalidateFolderQueries(queryClient, variables.parentId || null)
            if (context?.currentFolder?.parentId !== variables.parentId) {
                invalidateFolderQueries(queryClient, context?.currentFolder?.parentId || null)
            }
            options?.onSettled?.(data, error, variables)
        },
    })
}

function useReorderFolders(
    options?: TMutationOptions<boolean, Error, TReorderFoldersVariables>
): UseMutationResult<boolean, Error, TReorderFoldersVariables> {
    const queryClient = useQueryClient()
    const { data: rootFolders = [] } = useRootFolders()

    return useMutation({
        mutationFn: async (variables: TReorderFoldersVariables) => {
            const result = await reorderFolders(variables.parentId, variables.folderIds)
            if (!result.success) {
                throw new Error(result.error || 'Failed to reorder folders')
            }
            return result.data!
        },
        onMutate: async variables => {
            const currentFolders = variables.parentId
                ? getFolderFromCache(queryClient, variables.parentId)?.children || []
                : rootFolders

            if (currentFolders) {
                const reorderedFolders = variables.folderIds
                    .map((folderId, index) => {
                        const folder = currentFolders.find(f => f.id === folderId)
                        return folder ? { ...folder, position: index } : null
                    })
                    .filter((f): f is TFolderWithStats => f !== null)
                    .map(f => ({
                        ...f,
                        children: (f.children || []).filter((c): c is TFolder => c !== undefined),
                        updatedAt: new Date(),
                    })) as TFolderWithStats[]

                const queryKey = variables.parentId
                    ? ['folders', 'children', variables.parentId]
                    : ['folders', 'root']
                queryClient.setQueryData(queryKey, reorderedFolders)

                // Update parent's children order
                if (variables.parentId) {
                    const parent = getFolderFromCache(queryClient, variables.parentId)
                    if (parent) {
                        const updatedParent = {
                            ...parent,
                            children: reorderedFolders,
                            updatedAt: new Date(),
                        }
                        setFolderCache(queryClient, updatedParent)
                    }
                }
            }

            options?.onMutate?.(variables)
            return { currentFolders }
        },
        onError: (error, variables, context) => {
            if (context?.currentFolders) {
                const queryKey = variables.parentId
                    ? ['folders', 'children', variables.parentId]
                    : ['folders', 'root']
                queryClient.setQueryData(queryKey, context.currentFolders)

                // Restore parent's children order
                if (variables.parentId) {
                    const parent = getFolderFromCache(queryClient, variables.parentId)
                    if (parent) {
                        const updatedParent = {
                            ...parent,
                            children: context.currentFolders,
                        }
                        setFolderCache(queryClient, updatedParent)
                    }
                }
            }
            options?.onError?.(error, variables)
        },
        onSuccess: (data, variables) => {
            options?.onSuccess?.(data, variables)
        },
        onSettled: (data, error, variables) => {
            invalidateFolderQueries(queryClient, variables.parentId || null)
            options?.onSettled?.(data, error, variables)
        },
    })
}

export {
    useCreateFolder,
    useUpdateFolder,
    useDeleteFolder,
    useMoveFolder,
    useReorderFolders,
}
