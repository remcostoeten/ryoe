// Core API types
export interface ServiceResult<T> {
	success: boolean
	data?: T
	error?: string
	message?: string
	code?: string
}

export interface ServiceListResult<T> extends ServiceResult<T[]> {
	total?: number
}

// Legacy compatibility
export type TServiceResult<T = any> = ServiceResult<T>
export type TApiResponse<T = any> = ServiceResult<T>

// Query Keys for React Query
export const QUERY_KEYS = {
	// Auth
	AUTH: ['auth'] as const,
	CURRENT_USER: ['auth', 'current'] as const,
	USER_PROFILE: (id: number) => ['auth', 'profile', id] as const,
	ONBOARDING_STATUS: ['auth', 'onboarding'] as const,

	// Notes
	NOTES: ['notes'] as const,
	NOTE: (id: number) => ['notes', id] as const,
	NOTES_BY_FOLDER: (folderId: number | null) => ['notes', 'folder', folderId] as const,
	NOTES_SEARCH: (query: string) => ['notes', 'search', query] as const,
	FAVORITE_NOTES: ['notes', 'favorites'] as const,

	// Folders
	FOLDERS: ['folders'] as const,
	FOLDER: (id: number) => ['folders', id] as const,
	ROOT_FOLDERS: ['folders', 'root'] as const,
	CHILD_FOLDERS: (parentId: number) => ['folders', 'children', parentId] as const,
	FOLDER_HIERARCHY: (id: number) => ['folders', 'hierarchy', id] as const,
	FOLDER_PATH: (id: number) => ['folders', 'path', id] as const,
	FAVORITE_FOLDERS: ['folders', 'favorites'] as const,

	// Tags
	TAGS: ['tags'] as const,
	TAG: (id: number) => ['tags', id] as const,
	TAGS_BY_NOTE: (noteId: number) => ['tags', 'note', noteId] as const,

	// Database
	DATABASE_HEALTH: ['database', 'health'] as const,
} as const

// Mutation Options Type
import type { TMutationOptions } from '@/types/mutations'

// Re-export the mutation options type
export { TMutationOptions }

// Re-export types from services
export type { TUserProfile, TUserRegistrationData, TUserPreferencesUpdate } from '@/types'

export type {
	TNoteWithMetadata,
	TNoteCreationData,
	TNoteUpdateData,
	TSearchResult,
} from '@/types'

export type { TFolderWithStats, TFolderCreationData, TFolderUpdateData } from '@/types'
