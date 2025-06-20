// Service result type
export interface TServiceResult<T = unknown> {
    success: boolean
    data?: T
    error?: string
}

// Database types
export type DatabaseHealthStatus = 'checking' | 'healthy' | 'error' | 'disconnected'

export interface DatabaseHealth {
    status: DatabaseHealthStatus
    message: string
    lastChecked: Date
    responseTime?: number
}

export interface DatabaseClient {
    execute: (sql: string, params?: unknown[]) => Promise<any>
    close: () => Promise<void>
}

export interface DatabaseConfig {
    url: string
    authToken?: string
}

export interface ExecuteOptions {
    sql: string
    args?: unknown[]
}

// User types
export interface TUser {
    id: number
    email: string
    name: string
    preferences: {
        theme: 'light' | 'dark' | 'system'
        storageType: 'local' | 'turso'
        mdxStoragePath?: string
    }
    createdAt: string
    updatedAt: string
}

// User profile (extended user type)
export interface TUserProfile extends TUser {
    snippetsPath: string
    isSetupComplete: boolean
    storageType: 'local' | 'turso'
}

// User registration data
export interface TUserRegistrationData {
    email: string
    name: string
    snippetsPath?: string
    storageType?: 'local' | 'turso'
}

// User preferences update
export interface TUserPreferencesUpdate {
    theme?: 'light' | 'dark' | 'system'
    storageType?: 'local' | 'turso'
    mdxStoragePath?: string
}

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

// Note with metadata
export interface TNoteWithMetadata extends TNote {
    wordCount: number
    readingTime: number
    tags: string[]
}

// Note creation data
export interface TNoteCreationData {
    title: string
    content: string
    folderId?: number | null
    position?: number
    isPublic?: boolean
}

// Note update data
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

// Folder with stats
export interface TFolderWithStats extends TFolder {
    noteCount: number
    childFolderCount: number
    totalNoteCount: number // includes notes in child folders
    lastModified: string
}

// Folder creation data
export interface TFolderCreationData {
    name: string
    parentId?: number | null
    position?: number
    isPublic?: boolean
    isFavorite?: boolean
}

// Folder update data
export interface TFolderUpdateData {
    name?: string
    parentId?: number | null
    position?: number
    isPublic?: boolean
    isFavorite?: boolean
}

// Tree node types
export interface TTreeNode<T> {
    id: number
    children: TTreeNode<T>[]
    data: T
    level: number
    parentId: number | null
}

export type TFolderTreeNode = TTreeNode<TFolder>
export type TNoteTreeNode = TTreeNode<TNote>

// Legacy alias for compatibility
export interface FolderTreeNode extends TFolder {
    children: FolderTreeNode[]
    depth: number
    hasChildren: boolean
}

// Search types
export interface TSearchResult {
    type: 'note' | 'folder'
    id: number
    title: string
    content?: string
    matchType: 'title' | 'content'
    snippet: string
}

// Entity types
export interface TEntity {
    id: number
    createdAt: string
    updatedAt: string
}

// Common types
export interface TPaginationParams {
    page?: number
    limit?: number
    offset?: number
}

export interface TSortParams {
    field: string
    order: 'asc' | 'desc'
}

export interface TFilterParams {
    field: string
    value: unknown
    operator?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'nin'
}

export interface TQueryParams {
    pagination?: TPaginationParams
    sort?: TSortParams[]
    filters?: TFilterParams[]
} 