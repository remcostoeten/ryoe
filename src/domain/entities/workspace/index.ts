// Domain entities for workspace - Single source of truth
export type TBaseEntity = {
    id: number
    createdAt: Date
    updatedAt: Date
    position: number
    isFavorite: boolean
    isPublic: boolean
}

// Folder domain entity
export type TFolder = TBaseEntity & {
    type: 'folder'
    name: string
    parentId: number | null
    children?: TFolder[]
    depth?: number
    hasChildren?: boolean
    isTemp?: boolean
}

// Note domain entity
export type TNote = TBaseEntity & {
    type: 'note'
    title: string
    content: string
    folderId: number | null
}

// Workspace item union
export type TWorkspaceItem = TFolder | TNote

// Value objects
export type TWorkspaceStats = {
    totalFolders: number
    totalNotes: number
    totalItems: number
    favoriteItems: number
    publicItems: number
}

// Domain events
export type TWorkspaceEvent =
    | { type: 'FOLDER_CREATED'; payload: TFolder }
    | { type: 'FOLDER_UPDATED'; payload: TFolder }
    | { type: 'FOLDER_DELETED'; payload: { id: number } }
    | { type: 'NOTE_CREATED'; payload: TNote }
    | { type: 'NOTE_UPDATED'; payload: TNote }
    | { type: 'NOTE_DELETED'; payload: { id: number } } 