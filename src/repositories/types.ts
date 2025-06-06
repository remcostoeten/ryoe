/**
 * Repository layer types
 * All types use T prefix as requested
 */

export type TUser = {
  id: number
  name: string
  snippetsPath: string
  isSetupComplete: boolean
  storageType: 'turso' | 'local'
  preferences: string // JSON string
  createdAt: number
  updatedAt?: number
}

export type TCreateUserData = {
  name: string
  snippetsPath: string
  storageType: 'turso' | 'local'
  preferences: Record<string, any>
}

export type TUpdateUserData = Partial<Omit<TCreateUserData, 'name'>>

export type TNote = {
  id: number
  title: string
  content: string
  folderId?: number
  position: number
  createdAt: number
  updatedAt: number
}

export type TCreateNoteData = {
  title: string
  content: string
  folderId?: number
  position?: number
}

export type TUpdateNoteData = Partial<TCreateNoteData>

export type TFolder = {
  id: number
  name: string
  parentId?: number
  position: number
  createdAt: number
  updatedAt: number
}

export type TCreateFolderData = {
  name: string
  parentId?: number
  position?: number
}

export type TUpdateFolderData = Partial<TCreateFolderData>

export type TSnippet = {
  id: number
  title: string
  content: string
  filePath: string
  createdAt: number
  updatedAt: number
}

export type TCreateSnippetData = {
  title: string
  content: string
  filePath: string
}

export type TUpdateSnippetData = Partial<TCreateSnippetData>

export type TRepositoryResult<T> = {
  success: boolean
  data?: T
  error?: string
}

export type TRepositoryListResult<T> = {
  success: boolean
  data?: T[]
  total?: number
  error?: string
}

export type TPaginationOptions = {
  page?: number
  limit?: number
  offset?: number
}

export type TSortOptions = {
  field: string
  direction: 'asc' | 'desc'
}

export type TFilterOptions = {
  [key: string]: any
}
