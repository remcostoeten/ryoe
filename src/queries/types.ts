/**
 * Query layer types
 * All types use T prefix as requested
 */

import type { TMutationOptions } from '@/types/mutations'

export type TQueryKey = readonly unknown[]

export type TQueryOptions<T> = {
	enabled?: boolean
	staleTime?: number
	cacheTime?: number
	refetchOnWindowFocus?: boolean
	refetchOnMount?: boolean
	retry?: boolean | number
	onSuccess?: (data: T) => void
	onError?: (error: Error) => void
}

export { TMutationOptions }

export type TInvalidateOptions = {
	exact?: boolean
	refetchType?: 'active' | 'inactive' | 'all'
}

// Query Keys - centralized for consistency
export const QUERY_KEYS = {
	// User queries
	USER: ['user'] as const,
	USER_PROFILE: (id: number) => ['user', 'profile', id] as const,
	CURRENT_USER: ['user', 'current'] as const,
	ONBOARDING_STATUS: ['user', 'onboarding'] as const,

	// Note queries
	NOTES: ['notes'] as const,
	NOTE: (id: number) => ['notes', id] as const,
	NOTES_BY_FOLDER: (folderId: number | null) => ['notes', 'folder', folderId] as const,
	SEARCH_NOTES: (query: string) => ['notes', 'search', query] as const,

	// Folder queries
	FOLDERS: ['folders'] as const,
	FOLDER: (id: number) => ['folders', id] as const,
	ROOT_FOLDERS: ['folders', 'root'] as const,
	CHILD_FOLDERS: (parentId: number) => ['folders', 'children', parentId] as const,
	FOLDER_HIERARCHY: ['folders', 'hierarchy'] as const,
	FOLDER_PATH: (id: number) => ['folders', 'path', id] as const,

	// System queries
	DATABASE_HEALTH: ['system', 'database', 'health'] as const,
	APP_CONFIG: ['system', 'config'] as const,
} as const

// Cache times in milliseconds
export const CACHE_TIMES = {
	SHORT: 1000 * 60 * 5, // 5 minutes
	MEDIUM: 1000 * 60 * 15, // 15 minutes
	LONG: 1000 * 60 * 60, // 1 hour
	VERY_LONG: 1000 * 60 * 60 * 24, // 24 hours
} as const

// Stale times in milliseconds
export const STALE_TIMES = {
	IMMEDIATE: 0,
	SHORT: 1000 * 30, // 30 seconds
	MEDIUM: 1000 * 60 * 2, // 2 minutes
	LONG: 1000 * 60 * 10, // 10 minutes
	VERY_LONG: 1000 * 60 * 30, // 30 minutes
} as const
