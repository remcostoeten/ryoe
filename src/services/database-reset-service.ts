import {
	initializeTursoDatabase,
	checkTursoDatabaseHealth,
	executeTursoQuery,
} from '@/api/db/clients/turso-client'
import type { TServiceResult } from '@/types'

export type DatabaseHealth = {
	status: 'checking' | 'healthy' | 'error' | 'disconnected'
	message: string
	lastChecked: Date
	responseTime?: number
}

export async function resetAllData(): Promise<TServiceResult<void>> {
	try {
		// TODO: Implement actual database reset
		console.log('Resetting all data...')
		return { success: true }
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to reset database'
		}
	}
}

export async function validateReset(): Promise<TServiceResult<boolean>> {
	try {
		// TODO: Implement actual validation
		console.log('Validating database reset...')
		return { success: true, data: true }
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to validate reset'
		}
	}
}

export async function hardResetDatabase(): Promise<TServiceResult<void>> {
	try {
		// TODO: Implement actual hard reset
		console.log('Hard resetting database...')
		return { success: true }
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to hard reset database'
		}
	}
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
