import { invoke } from '@tauri-apps/api/core'

export async function initializeDatabase() {
    try {
        console.log('Database initialization started...')
        const result = await invoke<string>('initialize_database')
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
        const result = await invoke<{
            status: string
            message: string
            last_checked: string
            response_time?: number
        }>('check_database_health')

        return {
            status: result.status as DatabaseHealthStatus,
            message: result.message,
            lastChecked: new Date(result.last_checked),
            responseTime: result.response_time
        }
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
