import {
	initializeTursoDatabase,
	checkTursoDatabaseHealth,
	executeTursoQuery,
} from '@/api/db/clients/turso-client'

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

export type DatabaseHealthStatus = 'checking' | 'healthy' | 'error' | 'disconnected'

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
			message: error instanceof Error ? error.message : 'Failed to check database health',
			lastChecked: new Date(),
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
		// TODO: Implement using the new API services
		console.log('Creating user:', { name, snippetsPath })
		throw new Error('createUser function needs to be implemented using new API services')
	} catch (error) {
		console.error('Failed to create user:', error)
		throw error
	}
}
