/**
 * API layer exports
 * Centralized exports for all API functionality
 */

// Query factories
export {
    type CRUDQueryFactory,
    createQueryFactory,
    createQueryHooks,
} from './query-factory'

// Mutation factories
export {
    type CRUDMutationFactory,
    createMutationFactory,
    createMutationHooks,
} from './mutation-factory'

// Mutation types and hooks
export * from './mutations'

// Types
export type { TServiceResult } from '@/types'

// Database connection
export { initializeDatabase, checkDatabaseHealth, executeQuery } from './db'
