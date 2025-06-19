import { useState, useCallback, useMemo } from 'react'
import { createFolderCrud, createNoteCrud } from '@/entities/workspace/crud'
import type { TMutationHandlers } from "@/factories/crud-types"
import type {
    TFolder,
    TNote,
    TWorkspaceItem,
    TCreateFolderInput,
    TCreateNoteInput,
    TUpdateFolderInput,
    TUpdateNoteInput
} from '@/entities/workspace/types'

export function useWorkspace(
    folderMutations: TMutationHandlers<TFolder>,
    noteMutations: TMutationHandlers<TNote>
) {
    const [folders, setFolders] = useState<TFolder[]>([])
    const [notes, setNotes] = useState<TNote[]>([])
    const [expandedFolderIds, setExpandedFolderIds] = useState<Set<number>>(new Set())
    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null)
    const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null)

    // Initialize CRUD operations
    const folderCrud = useMemo(() => createFolderCrud(folderMutations), [folderMutations])
    const noteCrud = useMemo(() => createNoteCrud(noteMutations), [noteMutations])

    const folderOps = folderCrud(folders, setFolders)
    const noteOps = noteCrud(notes, setNotes)

    // Unified operations
    const createFolder = useCallback(async (input: TCreateFolderInput) => {
        const result = await folderOps.handleCreate(input, input.parentId || undefined)
        if (result && input.parentId && !expandedFolderIds.has(input.parentId)) {
            setExpandedFolderIds(prev => new Set([...prev, input.parentId!]))
        }
        return result
    }, [folderOps, expandedFolderIds])

    const createNote = useCallback(async (input: TCreateNoteInput) => {
        const result = await noteOps.handleCreate(input)
        if (result && input.folderId && !expandedFolderIds.has(input.folderId)) {
            setExpandedFolderIds(prev => new Set([...prev, input.folderId!]))
        }
        return result
    }, [noteOps, expandedFolderIds])

    const updateFolder = useCallback(async (input: TUpdateFolderInput) => {
        return await folderOps.handleUpdate(input.id, input)
    }, [folderOps])

    const updateNote = useCallback(async (input: TUpdateNoteInput) => {
        return await noteOps.handleUpdate(input.id, input)
    }, [noteOps])

    const deleteFolder = useCallback(async (id: number) => {
        return await folderOps.handleDelete(id)
    }, [folderOps])

    const deleteNote = useCallback(async (id: number) => {
        return await noteOps.handleDelete(id)
    }, [noteOps])

    const moveFolder = useCallback(async (id: number, targetId: number, position: number) => {
        return await folderOps.handleMove(id, targetId, position)
    }, [folderOps])

    // Folder navigation
    const toggleFolder = useCallback((id: number) => {
        setExpandedFolderIds(prev => {
            const newSet = new Set(prev)
            if (newSet.has(id)) {
                newSet.delete(id)
            } else {
                newSet.add(id)
            }
            return newSet
        })
    }, [])

    const selectFolder = useCallback((id: number | null) => {
        setSelectedFolderId(id)
    }, [])

    const selectNote = useCallback((id: number | null) => {
        setSelectedNoteId(id)
    }, [])

    // Get notes for a specific folder
    const getNotesForFolder = useCallback((folderId: number) => {
        return notes.filter(note => note.folderId === folderId)
    }, [notes])

    // Build folder tree
    const folderTree = useMemo(() => {
        const buildTree = (parentId: number | null = null, depth = 0): TFolder[] => {
            return folders
                .filter(folder => folder.parentId === parentId)
                .map(folder => ({
                    ...folder,
                    depth,
                    hasChildren: folders.some(f => f.parentId === folder.id),
                    children: buildTree(folder.id, depth + 1)
                }))
        }
        return buildTree()
    }, [folders])

    return {
        // State
        folders: folderTree,
        notes,
        expandedFolderIds,
        selectedFolderId,
        selectedNoteId,

        // CRUD operations
        createFolder,
        createNote,
        updateFolder,
        updateNote,
        deleteFolder,
        deleteNote,
        moveFolder,

        // Navigation
        toggleFolder,
        selectFolder,
        selectNote,

        // Utilities
        getNotesForFolder,

        // Editing state from CRUD operations
        folderOps: {
            isEditing: folderOps.isEditing,
            editingValue: folderOps.editingValue,
            setEditingValue: folderOps.setEditingValue,
            startEditing: folderOps.startEditing,
            cancelEditing: folderOps.cancelEditing,
            commitEdit: folderOps.commitEdit,
        },
        noteOps: {
            isEditing: noteOps.isEditing,
            editingValue: noteOps.editingValue,
            setEditingValue: noteOps.setEditingValue,
            startEditing: noteOps.startEditing,
            cancelEditing: noteOps.cancelEditing,
            commitEdit: noteOps.commitEdit,
        }
    }
} 