// Unified workspace module - replaces folder-management and notes modules
export * from './hooks/use-workspace'
export * from './components/workspace-sidebar'
export * from './services/workspace-service'

// Re-export types from entities
export type {
	TFolder,
	TNote,
	TWorkspaceItem,
	TWorkspaceSidebarProps,
	TCreateFolderInput,
	TCreateNoteInput,
	TUpdateFolderInput,
	TUpdateNoteInput,
	TWorkspaceSearchParams,
	TContextMenuState,
	TDragState,
} from '@/entities/workspace/types'
