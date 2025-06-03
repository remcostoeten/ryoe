import {
    initializeTursoDatabase,
    checkTursoDatabaseHealth,
    createUserInTurso,
    executeQueryInTurso
} from '@/lib/database/turso-client'

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

export async function createUser(
    name: string,
    snippetsPath: string
): Promise<number> {
    console.debug('Create user attempt:', { name, snippetsPath })

    try {
        const userId = await createUserInTurso(name, snippetsPath)
        console.log('User created with ID:', userId)
        return userId
    } catch (error) {
        console.error('Failed to create user:', error)
        throw error
    }
}

export async function executeQuery(query: string) {
    try {
        console.debug('Executing query:', query)
        const result = await executeQueryInTurso(query)
        return result
    } catch (error) {
        console.error('Failed to execute query:', error)
        throw error
    }
}
