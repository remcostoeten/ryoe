// Service result type
export interface TServiceResult<T = unknown> {
    success: boolean
    data?: T
    error?: string
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