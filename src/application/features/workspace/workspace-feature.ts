// Workspace feature - Application layer business logic
import { useState, useCallback, useMemo } from 'react'
import type {
    TFolder,
    TNote,
    TWorkspaceItem,
    TWorkspaceStats
} from '@/domain/entities/workspace'
import type {
    IFolderRepository,
    INoteRepository,
    IWorkspaceRepository
} from '@/domain/repositories/workspace-repository'

// Feature state
export type TWorkspaceState = {
    folders: TFolder[]
    notes: TNote[]
    selectedFolderId: number | null
    selectedNoteId: number | null
    expandedFolderIds: Set<number>
    isLoading: boolean
    error: string | null
    stats: TWorkspaceStats | null
}

// Feature commands
export type TWorkspaceCommands = {
    // Folder commands
    createFolder: (input: { name: string; parentId?: number | null }) => Promise<TFolder>
    updateFolder: (id: number, updates: Partial<TFolder>) => Promise<TFolder>
    deleteFolder: (id: number) => Promise<void>
    moveFolder: (id: number, newParentId: number | null, position: number) => Promise<TFolder>

    // Note commands
    createNote: (input: { title: string; content: string; folderId?: number | null }) => Promise<TNote>
    updateNote: (id: number, updates: Partial<TNote>) => Promise<TNote>
    deleteNote: (id: number) => Promise<void>
    moveNote: (id: number, folderId: number | null) => Promise<TNote>

    // Navigation commands
    selectFolder: (id: number | null) => void
    selectNote: (id: number | null) => void
    toggleFolder: (id: number) => void
    expandFolder: (id: number) => void
    collapseFolder: (id: number) => void

    // Data commands
    refreshData: () => Promise<void>
    search: (query: string, type?: 'folder' | 'note' | 'all') => Promise<TWorkspaceItem[]>
}

// Feature queries
export type TWorkspaceQueries = {
    getFolderTree: () => TFolder[]
    getNotesForFolder: (folderId: number) => TNote[]
    getFavorites: () => TWorkspaceItem[]
    getPublicItems: () => TWorkspaceItem[]
    getStats: () => TWorkspaceStats | null
    isExpanded: (folderId: number) => boolean
    isSelected: (itemId: number, type: 'folder' | 'note') => boolean
}

// Workspace feature hook
export function useWorkspaceFeature(
    folderRepo: IFolderRepository,
    noteRepo: INoteRepository,
    workspaceRepo: IWorkspaceRepository
) {
    const [state, setState] = useState<TWorkspaceState>({
        folders: [],
        notes: [],
        selectedFolderId: null,
        selectedNoteId: null,
        expandedFolderIds: new Set(),
        isLoading: false,
        error: null,
        stats: null
    })

    // Helper to update state
    const updateState = useCallback((updates: Partial<TWorkspaceState>) => {
        setState(prev => ({ ...prev, ...updates }))
    }, [])

    // Commands implementation
    const commands: TWorkspaceCommands = useMemo(() => ({
        createFolder: async (input) => {
            updateState({ isLoading: true, error: null })
            try {
                const folderData = {
                    type: 'folder' as const,
                    name: input.name,
                    parentId: input.parentId || null,
                    position: 0,
                    isFavorite: false,
                    isPublic: false
                }
                const folder = await folderRepo.create(folderData)
                updateState({
                    folders: [...state.folders, folder],
                    isLoading: false
                })
                return folder
            } catch (error) {
                updateState({
                    error: error instanceof Error ? error.message : 'Failed to create folder',
                    isLoading: false
                })
                throw error
            }
        },

        updateFolder: async (id, updates) => {
            try {
                const folder = await folderRepo.update(id, updates)
                updateState({
                    folders: state.folders.map(f => f.id === id ? folder : f)
                })
                return folder
            } catch (error) {
                updateState({ error: error instanceof Error ? error.message : 'Failed to update folder' })
                throw error
            }
        },

        deleteFolder: async (id) => {
            try {
                await folderRepo.delete(id)
                updateState({
                    folders: state.folders.filter(f => f.id !== id),
                    selectedFolderId: state.selectedFolderId === id ? null : state.selectedFolderId
                })
            } catch (error) {
                updateState({ error: error instanceof Error ? error.message : 'Failed to delete folder' })
                throw error
            }
        },

        moveFolder: async (id, newParentId, position) => {
            try {
                const folder = await folderRepo.move(id, newParentId, position)
                updateState({
                    folders: state.folders.map(f => f.id === id ? folder : f)
                })
                return folder
            } catch (error) {
                updateState({ error: error instanceof Error ? error.message : 'Failed to move folder' })
                throw error
            }
        },

        createNote: async (input) => {
            updateState({ isLoading: true, error: null })
            try {
                const noteData = {
                    type: 'note' as const,
                    title: input.title,
                    content: input.content,
                    folderId: input.folderId || null,
                    position: 0,
                    isFavorite: false,
                    isPublic: false
                }
                const note = await noteRepo.create(noteData)
                updateState({
                    notes: [...state.notes, note],
                    isLoading: false
                })
                return note
            } catch (error) {
                updateState({
                    error: error instanceof Error ? error.message : 'Failed to create note',
                    isLoading: false
                })
                throw error
            }
        },

        updateNote: async (id, updates) => {
            try {
                const note = await noteRepo.update(id, updates)
                updateState({
                    notes: state.notes.map(n => n.id === id ? note : n)
                })
                return note
            } catch (error) {
                updateState({ error: error instanceof Error ? error.message : 'Failed to update note' })
                throw error
            }
        },

        deleteNote: async (id) => {
            try {
                await noteRepo.delete(id)
                updateState({
                    notes: state.notes.filter(n => n.id !== id),
                    selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId
                })
            } catch (error) {
                updateState({ error: error instanceof Error ? error.message : 'Failed to delete note' })
                throw error
            }
        },

        moveNote: async (id, folderId) => {
            try {
                const note = await noteRepo.move(id, folderId)
                updateState({
                    notes: state.notes.map(n => n.id === id ? note : n)
                })
                return note
            } catch (error) {
                updateState({ error: error instanceof Error ? error.message : 'Failed to move note' })
                throw error
            }
        },

        selectFolder: (id) => updateState({ selectedFolderId: id }),
        selectNote: (id) => updateState({ selectedNoteId: id }),

        toggleFolder: (id) => {
            const newExpanded = new Set(state.expandedFolderIds)
            if (newExpanded.has(id)) {
                newExpanded.delete(id)
            } else {
                newExpanded.add(id)
            }
            updateState({ expandedFolderIds: newExpanded })
        },

        expandFolder: (id) => {
            updateState({
                expandedFolderIds: new Set([...state.expandedFolderIds, id])
            })
        },

        collapseFolder: (id) => {
            const newExpanded = new Set(state.expandedFolderIds)
            newExpanded.delete(id)
            updateState({ expandedFolderIds: newExpanded })
        },

        refreshData: async () => {
            updateState({ isLoading: true, error: null })
            try {
                const [folders, notes, stats] = await Promise.all([
                    folderRepo.findAll(),
                    noteRepo.findAll(),
                    workspaceRepo.getStats()
                ])
                updateState({
                    folders,
                    notes,
                    stats,
                    isLoading: false
                })
            } catch (error) {
                updateState({
                    error: error instanceof Error ? error.message : 'Failed to refresh data',
                    isLoading: false
                })
            }
        },

        search: async (query, type) => {
            try {
                return await workspaceRepo.search(query, type)
            } catch (error) {
                updateState({ error: error instanceof Error ? error.message : 'Search failed' })
                return []
            }
        }
    }), [state, folderRepo, noteRepo, workspaceRepo, updateState])

    // Queries implementation
    const queries: TWorkspaceQueries = useMemo(() => ({
        getFolderTree: () => {
            // Build hierarchical tree structure
            const buildTree = (parentId: number | null = null): TFolder[] => {
                return state.folders
                    .filter(f => f.parentId === parentId)
                    .map(folder => ({
                        ...folder,
                        children: buildTree(folder.id),
                        hasChildren: state.folders.some(f => f.parentId === folder.id)
                    }))
            }
            return buildTree()
        },

        getNotesForFolder: (folderId) =>
            state.notes.filter(note => note.folderId === folderId),

        getFavorites: () =>
            [...state.folders, ...state.notes].filter(item => item.isFavorite),

        getPublicItems: () =>
            [...state.folders, ...state.notes].filter(item => item.isPublic),

        getStats: () => state.stats,

        isExpanded: (folderId) => state.expandedFolderIds.has(folderId),

        isSelected: (itemId, type) => {
            if (type === 'folder') return state.selectedFolderId === itemId
            if (type === 'note') return state.selectedNoteId === itemId
            return false
        }
    }), [state])

    return {
        state,
        commands,
        queries
    }
} 