// Core API types
export interface ServiceResult<T> {
    success: boolean
    data?: T
    error?: string
    code?: string
}

export interface ServiceListResult<T> extends ServiceResult<T[]> {
    total?: number
}

// Re-export types from services
export type {
    TUserProfile,
    TUserRegistrationData,
    TUserPreferencesUpdate
} from '@/services/types'

export type {
    TNoteWithMetadata,
    TNoteCreationData,
    TNoteUpdateData,
    TSearchResult
} from '@/services/types'

export type {
    TFolderWithStats,
    TFolderCreationData,
    TFolderUpdateData
} from '@/services/types' 