import type {
  TFolder,
  TFolderTreeNode,
  TCreateFolderInput,
  TUpdateFolderInput,
  TDragItem,
  TDropTarget
} from '@/types/notes'

// Type aliases for backward compatibility within this module
export type Folder = TFolder
export type FolderTreeNode = TFolderTreeNode
export type CreateFolderInput = TCreateFolderInput
export type UpdateFolderInput = TUpdateFolderInput
export type DragItem = TDragItem
export type DropTarget = TDropTarget

// Component prop types
export interface FolderTreeProps {
  folders?: FolderTreeNode[]
  selectedFolderId?: number | null
  expandedFolderIds?: Set<number>
  editingFolderId?: number | null
  onFolderSelect?: (folder: Folder) => void
  onFolderExpand?: (folderId: number, isExpanded: boolean) => void
  onFolderCreate?: (parentId: number | null) => void
  onFolderEdit?: (folder: Folder) => void
  onFolderRename?: (folderId: number, newName: string) => Promise<boolean>
  onFolderDelete?: (folder: Folder) => void
  onFolderMove?: (folderId: number, newParentId: number | null, newPosition: number) => void
  onStartEditing?: (folderId: number) => void
  onStopEditing?: () => void
  enableDragDrop?: boolean
  enableKeyboardNavigation?: boolean
  showContextMenu?: boolean
  className?: string
}

export interface FolderCreateFormProps {
  parentId?: number | null
  onSuccess?: (folder: Folder) => void
  onCancel?: () => void
  className?: string
}

export interface FolderEditFormProps {
  folder: Folder
  onSuccess?: (folder: Folder) => void
  onCancel?: () => void
  className?: string
}

export interface FolderContextMenuProps {
  folder: Folder
  onEdit?: (folder: Folder) => void
  onDelete?: (folder: Folder) => void
  onCreateChild?: (parentId: number) => void
  onMove?: (folder: Folder) => void
  onTogglePrivacy?: (folder: Folder) => void
  className?: string
}

export interface FolderItemProps {
  folder: FolderTreeNode
  isSelected?: boolean
  isExpanded?: boolean
  isEditing?: boolean
  onSelect?: (folder: Folder) => void
  onExpand?: (folderId: number, isExpanded: boolean) => void
  onEdit?: (folder: Folder) => void
  onRename?: (folderId: number, newName: string) => Promise<boolean>
  onDelete?: (folder: Folder) => void
  onCreateChild?: (parentId: number) => void
  onMove?: (folderId: number, newParentId: number | null, newPosition: number) => void
  onStartEditing?: (folderId: number) => void
  onStopEditing?: () => void
  onKeyDown?: (e: React.KeyboardEvent, folder: FolderTreeNode) => void
  enableDragDrop?: boolean
  enableKeyboardNavigation?: boolean
  showContextMenu?: boolean
  className?: string
}

// Hook return types
export interface UseFoldersReturn {
  folders: Folder[]
  loading: boolean
  error: string | null
  createFolder: (input: CreateFolderInput) => Promise<Folder | null>
  updateFolder: (input: UpdateFolderInput) => Promise<Folder | null>
  deleteFolder: (id: number, options?: { deleteChildren?: boolean; force?: boolean }) => Promise<boolean>
  refreshFolders: () => Promise<void>
}

export interface UseFolderTreeReturn {
  treeData: FolderTreeNode[]
  expandedIds: Set<number>
  selectedId: number | null
  editingId: number | null
  loading: boolean
  error: string | null
  expandFolder: (folderId: number) => void
  collapseFolder: (folderId: number) => void
  toggleFolder: (folderId: number) => void
  selectFolder: (folderId: number | null) => void
  startEditing: (folderId: number) => void
  stopEditing: () => void
  renameFolder: (folderId: number, newName: string) => Promise<boolean>
  refreshTree: () => Promise<void>
}

export interface UseFolderOperationsReturn {
  createFolder: (input: CreateFolderInput) => Promise<Folder | null>
  updateFolder: (input: UpdateFolderInput) => Promise<Folder | null>
  deleteFolder: (id: number, options?: { deleteChildren?: boolean }) => Promise<boolean>
  moveFolder: (folderId: number, newParentId: number | null, newPosition: number) => Promise<Folder | null>
  reorderFolders: (parentId: number | null, folderIds: number[]) => Promise<Folder[]>
  loading: boolean
  error: string | null
}

// Drag and drop types
export interface FolderDragData extends DragItem {
  type: 'folder'
  folder: Folder
}

export interface FolderDropData extends DropTarget {
  folder?: Folder
  acceptsChildren: boolean
}

// Tree building types
export interface TreeBuildOptions {
  includeRoot?: boolean
  maxDepth?: number
  sortBy?: 'name' | 'position' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  filterFn?: (folder: Folder) => boolean
}

// Form validation types
export interface FolderFormErrors {
  name?: string
  parentId?: string
  general?: string
}

export interface FolderFormState {
  values: CreateFolderInput | UpdateFolderInput
  errors: FolderFormErrors
  isValid: boolean
  isDirty: boolean
  isSubmitting: boolean
}

// Context menu types
export interface ContextMenuItem {
  id: string
  label: string
  icon?: string
  disabled?: boolean
  dangerous?: boolean
  onClick: () => void
}

export interface ContextMenuSection {
  id: string
  items: ContextMenuItem[]
}

// Tree node state
export interface TreeNodeState {
  isExpanded: boolean
  isSelected: boolean
  isDragging: boolean
  isDropTarget: boolean
  hasChildren: boolean
  depth: number
}

// Search and filter types
export interface FolderSearchState {
  query: string
  filters: {
    isPublic?: boolean
    parentId?: number | null
    hasChildren?: boolean
  }
  results: Folder[]
  loading: boolean
}

// Bulk operations
export interface BulkFolderOperation {
  type: 'delete' | 'move' | 'privacy'
  folderIds: number[]
  targetParentId?: number | null
  newPrivacy?: boolean
}

export interface BulkOperationResult {
  success: boolean
  processedCount: number
  failedCount: number
  errors: string[]
}

// Keyboard navigation types
export interface KeyboardNavigationState {
  focusedId: number | null
  editingId: number | null
}

export interface KeyboardAction {
  type: 'select' | 'expand' | 'collapse' | 'edit' | 'delete' | 'create' | 'move'
  folderId: number
  payload?: any
}

// Inline editing types
export interface InlineEditState {
  isEditing: boolean
  originalValue: string
  currentValue: string
  isValid: boolean
  error?: string
}
