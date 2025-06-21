// Clean types for notes app
export type TBaseEntity = {
    id: number
    createdAt: Date
    updatedAt: Date
    position: number
    isFavorite: boolean
    isPublic: boolean
}

// Folder types
export type TFolder = TBaseEntity & {
    type: 'folder'
    name: string
    parentId: number | null
    children?: TFolder[]
    depth?: number
    hasChildren?: boolean
    isTemp?: boolean
}

export type TFolderWithStats = TFolder & {
    noteCount?: number
    childCount?: number
    path?: string[]
    isExpanded?: boolean
}

export interface TCreateFolderData {
    name: string
    parentId?: number | null
    position?: number
}

export interface TUpdateFolderData {
    name?: string
    parentId?: number | null
    position?: number
    isExpanded?: boolean
    isFavorite?: boolean
}

// Note types
export type TNote = TBaseEntity & {
    type: 'note'
    title: string
    content: string
    folderId: number | null
}

export type TNoteWithMetadata = TNote & {
    folderPath?: string
    wordCount?: number
    lastModified?: string
}

export interface TCreateNoteData {
    title: string
    content?: string
    folderId?: number | null
    position?: number
    isPublic?: boolean
}

export interface TNoteUpdateData {
    title?: string
    content?: string
    folderId?: number | null
    position?: number
    isPublic?: boolean
    isFavorite?: boolean
}

export interface TNoteCreationData extends TCreateNoteData { }

// User types
export interface TUser {
    id: number
    name: string
    email?: string
    createdAt: string
    updatedAt: string
}

export interface TUserProfile {
    id: number
    name: string
    snippetsPath: string
    isSetupComplete: boolean
    storageType: 'local' | 'turso'
    preferences: TUserPreferences
    createdAt: Date
    updatedAt: Date
}

export interface TUserPreferences {
    theme: 'light' | 'dark' | 'system'
    sidebarCollapsed: boolean
    autoSave: boolean
    showLineNumbers: boolean
    fontSize: number
    editorTheme: string
}

export interface TCreateUserData {
    name: string
    snippetsPath: string
    storageType: 'local' | 'turso'
    preferences?: Partial<TUserPreferences>
}

export interface TUpdateUserData extends Partial<TCreateUserData> { }

// Search types
export interface TSearchOptions {
    query: string
    folderId?: number | null
    includeContent?: boolean
    caseSensitive?: boolean
    limit?: number
    offset?: number
}

export interface TSearchResult {
    notes: TNoteWithMetadata[]
    total: number
    hasMore: boolean
}

// UI State types
export interface TDragState {
    isDragging: boolean
    draggedItem: TItem | null
    draggedOverItem: TItem | null
    dropPosition: 'above' | 'below' | 'inside' | null
}

export interface TContextMenuState {
    isOpen: boolean
    item: TItem | null
    position: { x: number; y: number }
}

// Service result type
export interface TServiceResult<T = any> {
    success: boolean
    data?: T
    error?: string
    message?: string
    code?: string
}

// Union types
export type TItem = TFolder | TNote

// Stats type
export type TStats = {
    totalFolders: number
    totalNotes: number
    totalItems: number
    favoriteItems: number
    publicItems: number
} 