// Public API exports for folder management module

// Services
export { FolderService } from '@/api/services/folder-service'

// Hooks
export { useFolders } from './hooks/use-folders'
export { useFolderTree } from './hooks/use-folder-tree'
export { useFolderOperations } from './hooks/use-folder-operations'

// Components
export { FolderTree } from './components/folder-tree'
export { FolderCreateForm } from './components/folder-create-form'
// TODO: Add these components later
// export { FolderEditForm } from './components/folder-edit-form'
// export { FolderContextMenu } from './components/folder-context-menu'

// Types (re-export from main types)
export type {
  Folder,
  FolderWithChildren,
  FolderTreeNode,
  CreateFolderInput,
  UpdateFolderInput,
  MoveFolderInput,
  ReorderFoldersInput,
  DeleteFolderOptions
} from '@/types/notes'

// Module-specific types
export type {
  FolderTreeProps,
  FolderCreateFormProps
  // TODO: Add these types later
  // FolderEditFormProps,
  // FolderContextMenuProps
} from './types'
