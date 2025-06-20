// Service result types
export interface TServiceResult<T = any> {
    success: boolean
    data?: T
    error?: string
    message?: string
    code?: string // Error/success codes for better error handling
}

// User types
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

export interface TUserRegistrationData {
    name: string
    snippetsPath: string
    storageType: 'local' | 'turso'
    preferences?: Partial<TUserPreferences>
}

export interface TUserPreferencesUpdate {
    theme?: 'light' | 'dark' | 'system'
    sidebarCollapsed?: boolean
    autoSave?: boolean
    showLineNumbers?: boolean
    fontSize?: number
    editorTheme?: string
}

export interface TCreateUserData extends TUserRegistrationData { }
export interface TUpdateUserData extends Partial<TUserRegistrationData> { }

// Note types
export interface TNote {
    id: number
    title: string
    content: string
    folderId: number | null
    position: number
    isPublic: boolean
    isFavorite: boolean
    createdAt: string
    updatedAt: string
}

export interface TNoteWithMetadata extends TNote {
    wordCount: number
    readingTime: number
    lastModified: string
}

export interface TNoteCreationData {
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

// Folder types
export interface TFolder {
    id: number
    name: string
    parentId: number | null
    position: number
    isPublic: boolean
    isFavorite: boolean
    createdAt: string
    updatedAt: string
}

export interface TFolderTreeNode extends TFolder {
    children: TFolderTreeNode[]
    level: number
    isExpanded?: boolean
    isSelected?: boolean
}

export interface TFolderCreationData {
    name: string
    parentId?: number | null
    position?: number
}

export interface TFolderUpdateData {
    name?: string
    parentId?: number | null
    position?: number
    isExpanded?: boolean
    isFavorite?: boolean
}

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
    notes: TNote[]
    folders: TFolder[]
    query: string
    total: number
}

// Move operations
export interface TMoveNoteVariables {
    noteId: number
    targetFolderId: number | null
    position?: number
}

export interface TMoveFolderVariables {
    folderId: number
    targetParentId: number | null
    position?: number
}

// Export commonly used utility types
export type TQueryOptions<T = any> = {
    enabled?: boolean
    refetchOnWindowFocus?: boolean
    staleTime?: number
    cacheTime?: number
    retry?: boolean | number
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
} 