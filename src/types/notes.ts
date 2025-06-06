// Base entity types - using T prefix as per enterprise architecture
export type TBaseEntity = {
  id: number
  createdAt: Date
  updatedAt: Date
}

// Privacy levels
export type TPrivacyLevel = 'public' | 'private'

// Folder types - using T prefix
export type TFolder = TBaseEntity & {
  name: string
  parentId: number | null
  position: number
  isPublic: boolean
}

export type TFolderWithChildren = TFolder & {
  children: TFolderWithChildren[]
  notes: TNote[]
}

export type TFolderTreeNode = TFolder & {
  children: TFolderTreeNode[]
  depth: number
  hasChildren: boolean
  isExpanded?: boolean
}

// Note types - using T prefix
export type TNote = TBaseEntity & {
  title: string
  content: string // MDX content
  folderId: number | null
  position: number
  isPublic: boolean
}

export type TNoteWithFolder = TNote & {
  folder: TFolder | null
}

// CRUD operation types - using T prefix
export type TCreateFolderInput = {
  name: string
  parentId?: number | null
  position?: number
  isPublic?: boolean
}

export type TUpdateFolderInput = {
  id: number
  name?: string
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

export type TUpdateNoteInput = {
  id: number
  title?: string
  content?: string
  folderId?: number | null
  position?: number
  isPublic?: boolean
}

// API response types - using T prefix
export type TApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export type TPaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Folder operation specific types - using T prefix
export type TMoveFolderInput = {
  folderId: number
  newParentId: number | null
  newPosition: number
}

export type TReorderFoldersInput = {
  parentId: number | null
  folderIds: number[] // Array of folder IDs in new order
}

export type TDeleteFolderOptions = {
  folderId: number
  deleteChildren?: boolean // If false, move children to parent
}

// Search and filter types - using T prefix
export type TFolderSearchParams = {
  query?: string
  parentId?: number | null
  isPublic?: boolean
  includeNotes?: boolean
}

export type TNoteSearchParams = {
  query?: string
  folderId?: number | null
  isPublic?: boolean
}

// Drag and drop types - using T prefix
export type TDragItem = {
  type: 'folder' | 'note'
  id: number
  name: string
  parentId: number | null
}

export type TDropTarget = {
  type: 'folder' | 'root'
  id: number | null
  position: number
}

// Tree operations - using T prefix
export type TTreeOperationResult = {
  success: boolean
  updatedItems: (TFolder | TNote)[]
  error?: string
}

// Validation types - using T prefix
export type TValidationError = {
  field: string
  message: string
}

export type TValidationResult = {
  isValid: boolean
  errors: TValidationError[]
}
