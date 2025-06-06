// Public API exports for folder management module

// Services - export individual functions instead of class
export {
  createFolderWithValidation,
  updateFolderWithValidation,
  deleteFolderById,
  moveFolderToParent,
  reorderFoldersInParent,
  getRootFolders,
  getChildFolders,
  getFolderById
} from '@/services/folder-service'

// Hooks
export { useFolders } from './hooks/use-folders'
export { useFolderTree } from './hooks/use-folder-tree'
export { useFolderOperations } from './hooks/use-folder-operations'
export { useInlineEditing, validateFolderName } from './hooks/use-inline-editing'

// Components
export { FolderTree } from './components/folder-tree'
export { FolderCreateForm } from './components/folder-create-form'
export { SortableFolderItem } from './components/sortable-folder-item'
// TODO: Add these components later
// export { FolderEditForm } from './components/folder-edit-form'
// export { FolderContextMenu } from './components/folder-context-menu'

// Types (re-export from main types)
export type {
  TFolder,
  TFolderWithChildren,
  TFolderTreeNode,
  TCreateFolderInput,
  TUpdateFolderInput,
  TMoveFolderInput,
  TReorderFoldersInput,
  TDeleteFolderOptions
} from '@/types/notes'

// Module-specific types
export type {
  FolderTreeProps,
  FolderCreateFormProps,
  FolderTreeNode
  // TODO: Add these types later
  // FolderEditFormProps,
  // FolderContextMenuProps
} from './types'
