"use client"

import type React from "react"

import { useState, useCallback, useMemo } from "react"
import { Button } from '@/presentation/components/ui/components/ui/button'
import { SidebarGroup, SidebarGroupContent } from '@/presentation/components/ui/components/ui/sidebar'
import { Folder, Plus } from "lucide-react"
import { useNavigate } from "react-router"
import { cn } from '@/shared/utils'

import { useFolderCrud } from '@/application/features/workspace/modules/folder-management/hooks/use-folder-crud'
import { useNoteCrud } from '@/application/features/workspace/modules/notes/hooks/use-note-crud'
import { ContextMenu } from '@/presentation/components/ui/components/ui/context-menu'
import { FolderItem } from '@/presentation/components/ui/components/ui/folder-item'

import type { TFolderSidebarProps, TFolder, TNote, TContextMenuState, TDragState } from '@/domain/entities/workspace'
import type { TMutationHandlers } from "@/factories/crud-types"

export function FolderSidebar({
    searchFilter,
    enableDragDrop = true,
    showNotes = true,
    onNoteSelect,
    selectedNoteId,
}: TFolderSidebarProps) {
    const navigate = useNavigate()

    const [folders, setFolders] = useState<TFolder[]>([])
    const [notes, setNotes] = useState<TNote[]>([])
    const [expandedFolderIds, setExpandedFolderIds] = useState<Set<number>>(new Set())
    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null)
    const [contextMenu, setContextMenu] = useState<TContextMenuState>({
        visible: false,
        x: 0,
        y: 0,
        folder: null,
    })
    const [dragState, setDragState] = useState<TDragState>({
        draggedFolder: null,
        dragOverFolder: null,
        isDragging: false,
    })

    const folderMutations: TMutationHandlers<TFolder> = useMemo(
        () => ({
            create: async (data) => {
                const response = await fetch("/api/folders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                })
                return response.json()
            },
            update: async (id, data) => {
                const response = await fetch(`/api/folders/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                })
                return response.json()
            },
            delete: async (id) => {
                await fetch(`/api/folders/${id}`, { method: "DELETE" })
            },
            move: async (id, targetId, position) => {
                const response = await fetch(`/api/folders/${id}/move`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ targetId, position }),
                })
                return response.json()
            },
        }),
        [],
    )

    const noteMutations: TMutationHandlers<TNote> = useMemo(
        () => ({
            create: async (data) => {
                const response = await fetch("/api/notes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                })
                return response.json()
            },
            update: async (id, data) => {
                const response = await fetch(`/api/notes/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                })
                return response.json()
            },
            delete: async (id) => {
                await fetch(`/api/notes/${id}`, { method: "DELETE" })
            },
        }),
        [],
    )

    const folderCrud = useFolderCrud(folders, setFolders, folderMutations)
    const noteCrud = useNoteCrud(notes, setNotes, noteMutations)

    const filteredFolders = useMemo(() => {
        if (!searchFilter) return folderCrud.entities

        function filterFolders(folders: TFolder[]): TFolder[] {
            return folders
                .filter((folder) => folder.name.toLowerCase().includes(searchFilter.toLowerCase()))
                .map((folder) => ({
                    ...folder,
                    children: folder.children ? filterFolders(folder.children) : [],
                }))
        }

        return filterFolders(folderCrud.entities)
    }, [folderCrud.entities, searchFilter])

    const getNotesForFolder = useCallback(
        (folderId: number): TNote[] => {
            return noteCrud.entities.filter((note) => note.folderId === folderId)
        },
        [noteCrud.entities],
    )

    const toggleFolder = useCallback((id: number) => {
        setExpandedFolderIds((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(id)) {
                newSet.delete(id)
            } else {
                newSet.add(id)
            }
            return newSet
        })
    }, [])

    const selectFolder = useCallback((id: number) => {
        setSelectedFolderId(id)
    }, [])

    const handleCreateFolder = useCallback(
        async (parentId?: number) => {
            const result = await folderCrud.handleCreate({ name: "New Folder" }, parentId)

            if (result && parentId && !expandedFolderIds.has(parentId)) {
                toggleFolder(parentId)
            }

            if (result) {
                setTimeout(() => {
                    folderCrud.startEditing(result.id, result.name)
                }, 100)
            }
        },
        [folderCrud, expandedFolderIds, toggleFolder],
    )

    const handleCreateNote = useCallback(
        async (folderId: number) => {
            const result = await noteCrud.handleCreate({
                title: "Untitled",
                content: "",
                folderId,
            })

            if (result) {
                navigate(`/notes/${result.id}`)
                onNoteSelect?.(result)
            }
        },
        [noteCrud, navigate, onNoteSelect],
    )

    const handleRightClick = useCallback((e: React.MouseEvent, folder: TFolder) => {
        e.preventDefault()
        e.stopPropagation()

        const menuWidth = 220
        const menuHeight = 280
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        let x = e.clientX
        let y = e.clientY

        if (x + menuWidth > viewportWidth) {
            x = viewportWidth - menuWidth - 10
        }

        if (y + menuHeight > viewportHeight) {
            y = viewportHeight - menuHeight - 10
        }

        setContextMenu({
            visible: true,
            x,
            y,
            folder,
        })
    }, [])

    const handleCloseContextMenu = useCallback(() => {
        setContextMenu({
            visible: false,
            x: 0,
            y: 0,
            folder: null,
        })
    }, [])

    const handleDragStart = useCallback(
        (e: React.DragEvent, folder: TFolder) => {
            if (!enableDragDrop) return

            setDragState((prev) => ({
                ...prev,
                draggedFolder: folder,
                isDragging: true,
            }))

            e.dataTransfer.effectAllowed = "move"
            e.dataTransfer.setData("text/plain", folder.id.toString())
        },
        [enableDragDrop],
    )

    const handleDragOver = useCallback(
        (e: React.DragEvent, targetFolder: TFolder) => {
            if (!dragState.isDragging) return

            e.preventDefault()
            e.dataTransfer.dropEffect = "move"

            setDragState((prev) => ({
                ...prev,
                dragOverFolder: targetFolder.id as number,
            }))
        },
        [dragState.isDragging],
    )

    const handleDragLeave = useCallback(() => {
        setDragState((prev) => ({
            ...prev,
            dragOverFolder: null,
        }))
    }, [])

    const handleDrop = useCallback(
        async (e: React.DragEvent, targetFolder: TFolder) => {
            e.preventDefault()

            const { draggedFolder } = dragState
            if (!draggedFolder || draggedFolder.id === targetFolder.id) {
                setDragState((prev) => ({ ...prev, dragOverFolder: null, isDragging: false }))
                return
            }

            await folderCrud.handleMove(draggedFolder.id, targetFolder.id, 0)

            setDragState({
                draggedFolder: null,
                dragOverFolder: null,
                isDragging: false,
            })
        },
        [dragState, folderCrud],
    )

    const handleDragEnd = useCallback(() => {
        setDragState({
            draggedFolder: null,
            dragOverFolder: null,
            isDragging: false,
        })
    }, [])

    const renderFolder = useCallback(
        (folder: TFolder, level = 0) => {
            const folderNotes = getNotesForFolder(folder.id as number)

            return (
                <FolderItem
                    key={folder.id}
                    folder={folder}
                    level={level}
                    isExpanded={expandedFolderIds.has(folder.id as number)}
                    isSelected={selectedFolderId === folder.id}
                    isEditing={folderCrud.isEditing(folder.id)}
                    editingValue={folderCrud.editingValue}
                    dragState={dragState}
                    notes={folderNotes}
                    selectedNoteId={selectedNoteId}
                    onToggle={toggleFolder}
                    onSelect={selectFolder}
                    onStartEdit={folderCrud.startEditing}
                    onCommitEdit={(id) => folderCrud.commitEdit(id, "name")}
                    onCancelEdit={folderCrud.cancelEditing}
                    onSetEditingValue={folderCrud.setEditingValue}
                    onRightClick={handleRightClick}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    onNoteSelect={onNoteSelect}
                    enableDragDrop={enableDragDrop}
                    showNotes={showNotes}
                    renderNote={(note) => (
                        <div
                            key={note.id}
                            className={cn(
                                "px-2 py-1 rounded text-sm cursor-pointer transition-colors",
                                selectedNoteId === note.id ? "bg-accent text-accent-foreground" : "hover:bg-accent/50",
                            )}
                            onClick={() => {
                                navigate(`/notes/${note.id}`)
                                onNoteSelect?.(note)
                            }}
                        >
                            {note.title}
                        </div>
                    )}
                />
            )
        },
        [
            getNotesForFolder,
            expandedFolderIds,
            selectedFolderId,
            folderCrud,
            dragState,
            selectedNoteId,
            toggleFolder,
            selectFolder,
            handleRightClick,
            handleDragStart,
            handleDragOver,
            handleDragLeave,
            handleDrop,
            handleDragEnd,
            onNoteSelect,
            enableDragDrop,
            showNotes,
            navigate,
        ],
    )

    return (
        <>
            <SidebarGroup className="px-0 py-0">
                <SidebarGroupContent>
                    <div className="space-y-1 min-h-[200px] p-2">
                        {filteredFolders.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground/60">
                                <Folder className="h-12 w-12 mx-auto mb-4 opacity-40" />
                                <p className="text-sm font-medium mb-2">No folders yet</p>
                                <p className="text-xs text-muted-foreground/40">Right-click to create your first folder</p>
                            </div>
                        ) : (
                            filteredFolders.map((folder) => renderFolder(folder, 0))
                        )}

                        <div className="pt-4 border-t border-border/30 mt-6">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCreateFolder()}
                                className="w-full justify-start text-sm text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-all duration-200"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create folder
                            </Button>
                        </div>
                    </div>
                </SidebarGroupContent>
            </SidebarGroup>

            <ContextMenu
                contextMenu={contextMenu}
                onClose={handleCloseContextMenu}
                onEdit={(folder) => folderCrud.startEditing(folder.id, folder.name)}
                onCreateChild={handleCreateFolder}
                onCreateNote={showNotes ? handleCreateNote : undefined}
                onDelete={(folder) => folderCrud.handleDelete(folder.id)}
                onToggleFavorite={async (folder) => {
                    await folderCrud.handleUpdate(folder.id, {
                        isFavorite: !folder.isFavorite,
                    })
                }}
                showNotes={showNotes}
            />
        </>
    )
}
