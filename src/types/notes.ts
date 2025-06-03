// Base entity types
export interface BaseEntity {
  id: number
  createdAt: Date
  updatedAt: Date
}

// Privacy levels
export type PrivacyLevel = 'public' | 'private'

// Folder types
export interface Folder extends BaseEntity {
  name: string
  parentId: number | null
  position: number
  isPublic: boolean
}

export interface FolderWithChildren extends Folder {
  children: FolderWithChildren[]
  notes: Note[]
}

export interface FolderTreeNode extends Folder {
  children: FolderTreeNode[]
  depth: number
  hasChildren: boolean
  isExpanded?: boolean
}

// Note types
export interface Note extends BaseEntity {
  title: string
  content: string // MDX content
  folderId: number | null
  position: number
  isPublic: boolean
}

export interface NoteWithFolder extends Note {
  folder: Folder | null
}

// CRUD operation types
export interface CreateFolderInput {
  name: string
  parentId?: number | null
  position?: number
  isPublic?: boolean
}

export interface UpdateFolderInput {
  id: number
  name?: string
  parentId?: number | null
  position?: number
  isPublic?: boolean
}

export interface CreateNoteInput {
  title: string
  content: string
  folderId?: number | null
  position?: number
  isPublic?: boolean
}

export interface UpdateNoteInput {
  id: number
  title?: string
  content?: string
  folderId?: number | null
  position?: number
  isPublic?: boolean
}

// API response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Folder operation specific types
export interface MoveFolderInput {
  folderId: number
  newParentId: number | null
  newPosition: number
}

export interface ReorderFoldersInput {
  parentId: number | null
  folderIds: number[] // Array of folder IDs in new order
}

export interface DeleteFolderOptions {
  folderId: number
  deleteChildren?: boolean // If false, move children to parent
}

// Search and filter types
export interface FolderSearchParams {
  query?: string
  parentId?: number | null
  isPublic?: boolean
  includeNotes?: boolean
}

export interface NoteSearchParams {
  query?: string
  folderId?: number | null
  isPublic?: boolean
}

// Drag and drop types
export interface DragItem {
  type: 'folder' | 'note'
  id: number
  name: string
  parentId: number | null
}

export interface DropTarget {
  type: 'folder' | 'root'
  id: number | null
  position: number
}

// Tree operations
export interface TreeOperationResult {
  success: boolean
  updatedItems: (Folder | Note)[]
  error?: string
}

// Validation types
export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}
