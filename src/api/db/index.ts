import { initializeTursoDatabase, checkTursoDatabaseHealth, executeTursoQuery } from "@/core/database/clients/turso-client"
import { TCreateUserData } from "@/repositories"

export async function initializeDatabase() {
    try {
        console.log('Database initialization started...')
        const result = await initializeTursoDatabase()
        console.log('Database initialized:', result)
        return result
    } catch (error) {
        console.error('Failed to initialize database:', error)
        throw error
    }
}

export type DatabaseHealthStatus =
    | 'checking'
    | 'healthy'
    | 'error'
    | 'disconnected'

export interface DatabaseHealth {
    status: DatabaseHealthStatus
    message: string
    lastChecked: Date
    responseTime?: number
}

export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
    try {
        console.debug('Database health check: Checking Turso database...')
        const result = await checkTursoDatabaseHealth()
        return result
    } catch (error) {
        return {
            status: 'error',
            message:
                error instanceof Error
                    ? error.message
                    : 'Failed to check database health',
            lastChecked: new Date()
        }
    }
}

export async function executeQuery(query: string) {
    try {
        console.debug('Executing query:', query)
        const result = await executeTursoQuery({ sql: query })
        return result
    } catch (error) {
        console.error('Failed to execute query:', error)
        throw error
    }
}

/**
 * Simplified createUser function for compatibility with existing components
 * @param name - User name
 * @param snippetsPath - Path for storing user snippets
 * @returns User ID
 */
export async function createUser(name: string, snippetsPath: string): Promise<number> {
    try {
        const userData: TCreateUserData = {
            name,
            snippetsPath,
            storageType: 'turso',
            preferences: {}
        }

        const result = await createUserRepository(userData)
        if (!result.success || !result.data) {
            throw new Error(result.error || 'Failed to create user')
        }

        return result.data.id
    } catch (error) {
        console.error('Failed to create user:', error)
        throw error
    }
}
