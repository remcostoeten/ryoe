// Unified Workspace Sidebar - Clean Architecture Implementation
import React, { useState, useCallback, useMemo } from "react"
import { Button } from "./ui/button"
import {
    SidebarGroup,
    SidebarGroupContent
} from "./ui/sidebar"
import {
    ChevronDown,
    ChevronRight,
    Folder,
    FolderOpen,
    FileText,
    Plus,
    Star,
    Edit,
    Trash2
} from "lucide-react"
import { useNavigate } from "react-router"
import { cn } from "@/shared/utils"

// Import from domain layer - single source of truth
import type {
    TFolder,
    TNote,
    TWorkspaceItem
} from "@/domain/entities/workspace"

// Import from application layer
import { useWorkspaceFeature } from "@/application/features/workspace/workspace-feature"

// Component props
type TWorkspaceSidebarProps = {
    searchFilter: string
    enableDragDrop?: boolean
    showNotes?: boolean
    onNoteSelect?: (note: TNote) => void
    selectedNoteId?: number | null
    folderRepository: any // TODO: Replace with proper repository interface
    noteRepository: any
    workspaceRepository: any
}

// Context menu state
type TContextMenuState = {
    visible: boolean
    x: number
    y: number
    item: TWorkspaceItem | null
}

// Simple context menu component
const ContextMenu = ({
    contextMenu,
    onClose,
    onCreateFolder,
    onCreateNote,
    onEdit,
    onDelete,
    onToggleFavorite
}: {
    contextMenu: TContextMenuState
    onClose: () => void
    onCreateFolder: (parentId?: number) => void
    onCreateNote?: (folderId: number) => void
    onEdit: (item: TWorkspaceItem) => void
    onDelete: (item: TWorkspaceItem) => void
    onToggleFavorite: (item: TWorkspaceItem) => void
}) => {
    if (!contextMenu.visible || !contextMenu.item) return null

    const isFolder = contextMenu.item.type === 'folder'

    return (
        <div
            className="fixed z-50 min-w-[200px] bg-card border border-border rounded-lg shadow-lg p-2"
            style={{
                left: contextMenu.x,
                top: contextMenu.y,
            }}
        >
            {isFolder && onCreateNote && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                        onCreateNote(contextMenu.item!.id)
                        onClose()
                    }}
                >
                    <FileText className="mr-2 h-4 w-4" />
                    New Note
                </Button>
            )}

            {isFolder && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                        onCreateFolder(contextMenu.item!.id)
                        onClose()
                    }}
                >
                    <Folder className="mr-2 h-4 w-4" />
                    New Folder
                </Button>
            )}

            <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                    onEdit(contextMenu.item!)
                    onClose()
                }}
            >
                <Edit className="mr-2 h-4 w-4" />
                Rename
            </Button>

            <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                    onToggleFavorite(contextMenu.item!)
                    onClose()
                }}
            >
                <Star className="mr-2 h-4 w-4" />
                {contextMenu.item?.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </Button>

            <div className="border-t border-border my-1" />

            <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={() => {
                    onDelete(contextMenu.item!)
                    onClose()
                }}
            >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
            </Button>
        </div>
    )
}

export function WorkspaceSidebar({
    searchFilter,
    enableDragDrop = true,
    showNotes = true,
    onNoteSelect,
    selectedNoteId,
    folderRepository,
    noteRepository,
    workspaceRepository
}: TWorkspaceSidebarProps) {
    const navigate = useNavigate()

    // Use the workspace feature hook from application layer
    const { state, commands, queries } = useWorkspaceFeature(
        folderRepository,
        noteRepository,
        workspaceRepository
    )

    const [contextMenu, setContextMenu] = useState<TContextMenuState>({
        visible: false,
        x: 0,
        y: 0,
        item: null
    })

    // Filter folders based on search
    const filteredFolders = useMemo(() => {
        if (!searchFilter) return queries.getFolderTree()

        const filterTree = (folders: TFolder[]): TFolder[] => {
            return folders
                .filter(folder =>
                    folder.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                    (folder.children && filterTree(folder.children).length > 0)
                )
                .map(folder => ({
                    ...folder,
                    children: folder.children ? filterTree(folder.children) : []
                }))
        }

        return filterTree(queries.getFolderTree())
    }, [queries, searchFilter])

    // Event handlers
    const handleRightClick = useCallback((e: React.MouseEvent, item: TWorkspaceItem) => {
        e.preventDefault()
        e.stopPropagation()

        const rect = (e.target as Element).getBoundingClientRect()
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            item
        })
    }, [])

    const handleCloseContextMenu = useCallback(() => {
        setContextMenu({
            visible: false,
            x: 0,
            y: 0,
            item: null
        })
    }, [])

    const handleCreateFolder = useCallback(async (parentId?: number) => {
        try {
            const result = await commands.createFolder({
                name: "New Folder",
                parentId: parentId || null
            })

            if (result && parentId) {
                commands.expandFolder(parentId)
            }

            // Start editing the new folder
            commands.selectFolder(result.id)
        } catch (error) {
            console.error('Failed to create folder:', error)
        }
    }, [commands])

    const handleCreateNote = useCallback(async (folderId: number) => {
        try {
            const result = await commands.createNote({
                title: "Untitled",
                content: "",
                folderId
            })

            if (result) {
                navigate(`/notes/${result.id}`)
                onNoteSelect?.(result)
                commands.expandFolder(folderId)
            }
        } catch (error) {
            console.error('Failed to create note:', error)
        }
    }, [commands, navigate, onNoteSelect])

    const handleEdit = useCallback((item: TWorkspaceItem) => {
        if (item.type === 'folder') {
            commands.folderOps.startEditing(item.id, item.name)
        } else {
            commands.noteOps.startEditing(item.id, item.title)
        }
    }, [commands])

    const handleDelete = useCallback(async (item: TWorkspaceItem) => {
        try {
            if (item.type === 'folder') {
                await commands.deleteFolder(item.id)
            } else {
                await commands.deleteNote(item.id)
            }
        } catch (error) {
            console.error('Failed to delete item:', error)
        }
    }, [commands])

    const handleToggleFavorite = useCallback(async (item: TWorkspaceItem) => {
        try {
            if (item.type === 'folder') {
                await commands.updateFolder(item.id, { isFavorite: !item.isFavorite })
            } else {
                await commands.updateNote(item.id, { isFavorite: !item.isFavorite })
            }
        } catch (error) {
            console.error('Failed to toggle favorite:', error)
        }
    }, [commands])

    // Render folder item
    const renderFolder = useCallback((folder: TFolder, level = 0) => {
        const isExpanded = queries.isExpanded(folder.id)
        const isSelected = queries.isSelected(folder.id, 'folder')
        const isEditing = commands.folderOps.isEditing(folder.id)
        const hasChildren = folder.hasChildren || false
        const indentLevel = level * 16

        const FolderIcon = isExpanded ? FolderOpen : Folder

        return (
            <div key={folder.id}>
                <div
                    className={cn(
                        "group flex items-center gap-2 px-2 py-1.5 rounded-lg mx-1 transition-colors cursor-pointer",
                        isSelected ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                    )}
                    style={{ paddingLeft: `${indentLevel + 8}px` }}
                    onClick={() => {
                        commands.selectFolder(folder.id)
                        commands.toggleFolder(folder.id)
                    }}
                    onContextMenu={(e) => handleRightClick(e, folder)}
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            commands.toggleFolder(folder.id)
                        }}
                        className="flex items-center justify-center h-4 w-4"
                    >
                        {hasChildren ? (
                            isExpanded ? (
                                <ChevronDown className="h-3.5 w-3.5" />
                            ) : (
                                <ChevronRight className="h-3.5 w-3.5" />
                            )
                        ) : (
                            <div className="w-3.5" />
                        )}
                    </button>

                    <FolderIcon className="h-4 w-4 text-muted-foreground" />

                    {folder.isFavorite && (
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-current" />
                    )}

                    {isEditing ? (
                        <input
                            type="text"
                            value={commands.folderOps.editingValue}
                            onChange={(e) => commands.folderOps.setEditingValue(e.target.value)}
                            onBlur={() => commands.folderOps.commitEdit(folder.id, 'name')}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    commands.folderOps.commitEdit(folder.id, 'name')
                                } else if (e.key === 'Escape') {
                                    commands.folderOps.cancelEditing()
                                }
                            }}
                            className="flex-1 bg-transparent border-none outline-none text-sm"
                            autoFocus
                        />
                    ) : (
                        <span className="flex-1 text-sm font-medium truncate">
                            {folder.name}
                        </span>
                    )}

                    <span className="text-xs text-muted-foreground">
                        {(folder.children?.length || 0) + (showNotes ? queries.getNotesForFolder(folder.id).length : 0)}
                    </span>
                </div>

                {/* Render children */}
                {isExpanded && folder.children && (
                    <div className="ml-4">
                        {folder.children.map(childFolder => renderFolder(childFolder, level + 1))}
                    </div>
                )}

                {/* Render notes */}
                {showNotes && isExpanded && (() => {
                    const folderNotes = queries.getNotesForFolder(folder.id)
                    return folderNotes.map(note => (
                        <div
                            key={note.id}
                            className={cn(
                                "flex items-center gap-2 px-2 py-1.5 rounded-lg mx-1 ml-8 transition-colors cursor-pointer text-sm",
                                selectedNoteId === note.id ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                            )}
                            style={{ paddingLeft: `${indentLevel + 32}px` }}
                            onClick={() => {
                                navigate(`/notes/${note.id}`)
                                onNoteSelect?.(note)
                                commands.selectNote(note.id)
                            }}
                            onContextMenu={(e) => handleRightClick(e, note)}
                        >
                            <FileText className="h-4 w-4 text-muted-foreground" />

                            {note.isFavorite && (
                                <Star className="h-3.5 w-3.5 text-amber-500 fill-current" />
                            )}

                            <span className="flex-1 truncate">{note.title}</span>
                        </div>
                    ))
                })()}
            </div>
        )
    }, [
        queries, commands, selectedNoteId, showNotes, handleRightClick, navigate, onNoteSelect
    ])

    // Loading and error states
    if (state.isLoading) {
        return (
            <SidebarGroup>
                <SidebarGroupContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="text-sm text-muted-foreground">Loading workspace...</div>
                    </div>
                </SidebarGroupContent>
            </SidebarGroup>
        )
    }

    if (state.error) {
        return (
            <SidebarGroup>
                <SidebarGroupContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="text-sm text-destructive mb-2">Error loading workspace</div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={commands.refreshData}
                        >
                            Retry
                        </Button>
                    </div>
                </SidebarGroupContent>
            </SidebarGroup>
        )
    }

    return (
        <>
            <SidebarGroup className="px-0 py-0">
                <SidebarGroupContent>
                    <div className="space-y-1 min-h-[200px] p-2">
                        {filteredFolders.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground/60">
                                <Folder className="h-12 w-12 mx-auto mb-4 opacity-40" />
                                <p className="text-sm font-medium mb-2">No folders yet</p>
                                <p className="text-xs text-muted-foreground/40">
                                    Click the button below to create your first folder
                                </p>
                            </div>
                        ) : (
                            filteredFolders.map(folder => renderFolder(folder, 0))
                        )}

                        <div className="pt-4 border-t border-border/30 mt-6">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCreateFolder()}
                                className="w-full justify-start text-sm text-muted-foreground hover:text-foreground hover:bg-accent/40"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create folder
                            </Button>
                        </div>
                    </div>
                </SidebarGroupContent>
            </SidebarGroup>

            {/* Context Menu */}
            <ContextMenu
                contextMenu={contextMenu}
                onClose={handleCloseContextMenu}
                onCreateFolder={handleCreateFolder}
                onCreateNote={showNotes ? handleCreateNote : undefined}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleFavorite={handleToggleFavorite}
            />

            {/* Click outside to close context menu */}
            {contextMenu.visible && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={handleCloseContextMenu}
                />
            )}
        </>
    )
} 