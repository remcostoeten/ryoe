// Services (main API layer)
export * from './services/auth-service'
export * from './services/notes-service'
export * from './services/folders-service'
export * from './services/database-service'
export * from './services/git-service'

// Types
export type { TServiceResult, TServiceListResult } from '@/services/types'

// Database connection
export { initializeDatabase, checkDatabaseHealth, executeQuery } from './db' 