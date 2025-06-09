/**
 * Service layer types
 * All types use T prefix as requested
 */

export type TServiceResult<T> = {
  success: boolean
  data?: T
  error?: string
  code?: string
}

export type TServiceListResult<T> = {
  success: boolean
  data?: T[]
  total?: number
  error?: string
  code?: string
}

export type TUserRegistrationData = {
  username: string
  preferences: {
    mdxStoragePath: string
    storageType: 'turso' | 'local'
    theme?: 'light' | 'dark' | 'system'
  }
}

export type TUserProfile = {
  id: number
  name: string
  preferences: Record<string, any>
  storageType: 'turso' | 'local'
  isSetupComplete: boolean
  createdAt: number
}

export type TUserPreferencesUpdate = {
  mdxStoragePath?: string
  storageType?: 'turso' | 'local'
  theme?: 'light' | 'dark' | 'system'
  [key: string]: any
}

export type TNoteCreationData = {
  title: string
  content: string
  folderId?: number
  tags?: string[]
}

export type TNoteUpdateData = {
  title?: string
  content?: string
  folderId?: number
  tags?: string[]
}

export type TNoteWithMetadata = {
  id: number
  title: string
  content: string
  folderId?: number
  position: number
  isFavorite: boolean
  wordCount: number
  characterCount: number
  readingTime: number // in minutes
  lastModified: string
  createdAt: number
  updatedAt: number
}

export type TFolderCreationData = {
  name: string
  parentId?: number
  description?: string
}

export type TFolderUpdateData = {
  name?: string
  parentId?: number
  description?: string
}

export type TFolderWithStats = {
  id: number
  name: string
  parentId?: number
  position: number
  isFavorite: boolean
  noteCount: number
  subfolderCount: number
  totalSize: number // in bytes
  createdAt: number
  updatedAt: number
}

export type TSearchOptions = {
  query: string
  includeContent?: boolean
  folderId?: number
  limit?: number
}

export type TSearchResult = {
  notes: TNoteWithMetadata[]
  folders: TFolderWithStats[]
  total: number
}

export type TExportOptions = {
  format: 'json' | 'markdown' | 'html'
  includeSubfolders?: boolean
  folderId?: number
}

export type TImportOptions = {
  format: 'json' | 'markdown'
  targetFolderId?: number
  overwriteExisting?: boolean
}

export type TBackupData = {
  version: string
  timestamp: number
  users: any[]
  folders: any[]
  notes: any[]
  metadata: {
    totalNotes: number
    totalFolders: number
    totalUsers: number
  }
}
