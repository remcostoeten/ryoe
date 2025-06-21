/**
 * API layer exports
 * Centralized exports for all API functionality
 */

export {
    type CRUDQueryFactory,
    createQueryFactory,
    createQueryHooks,
} from './query-factory'

export {
    type CRUDMutationFactory,
    createMutationFactory,
    createMutationHooks,
} from './mutation-factory'


export type { TServiceResult } from '@/types'

export { initializeDatabase, checkDatabaseHealth, executeQuery } from './db'
