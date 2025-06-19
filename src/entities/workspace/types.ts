// Unified workspace entity types - Single source of truth
export type TBaseWorkspaceEntity = {
    id: number
    createdAt: Date
    updatedAt: Date
    position: number
    isFavorite: boolean
    isPublic: boolean
}

// Folder entity
export type TFolder = TBaseWorkspaceEntity & {
    type: 'folder'
    name: string
    parentId: number | null
    children?: TFolder[]
    depth?: number
    hasChildren?: boolean
    isTemp?: boolean
}

// Note entity  
export type TNote = TBaseWorkspaceEntity & {
    type: 'note'
    title: string
    content: string
    folderId: number | null
}

// Union type for workspace items
export type TWorkspaceItem = TFolder | TNote

// Component props
export type TWorkspaceSidebarProps = {
    searchFilter: string
    enableDragDrop?: boolean
    showNotes?: boolean
    onNoteSelect?: (note: TNote) => void
    selectedNoteId?: number | null
}

// UI state types
export type TContextMenuState = {
    visible: boolean
    x: number
    y: number
    item: TWorkspaceItem | null
}

export type TDragState = {
    draggedItem: TWorkspaceItem | null
    dragOverItem: number | null
    isDragging: boolean
}

// CRUD operation types
export type TCreateFolderInput = {
    name: string
    parentId?: number | null
    position?: number
    isPublic?: boolean
}

export type TCreateNoteInput = {
    title: string
    content: string
    folderId?: number | null
    position?: number
    isPublic?: boolean
}

export type TUpdateFolderInput = {
    id: number
    name?: string
    parentId?: number | null
    position?: number
    isPublic?: boolean
    isFavorite?: boolean
}

export type TUpdateNoteInput = {
    id: number
    title?: string
    content?: string
    folderId?: number | null
    position?: number
    isPublic?: boolean
    isFavorite?: boolean
}

// Search and filter types
export type TWorkspaceSearchParams = {
    query?: string
    type?: 'folder' | 'note' | 'all'
    parentId?: number | null
    isPublic?: boolean
} 