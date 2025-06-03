import { createClient } from '@libsql/client'
import type { Client } from '@libsql/client'

let client: Client | null = null

export function getTursoClient(): Client {
    if (!client) {
        const databaseUrl = import.meta.env.VITE_TURSO_DATABASE_URL
        const authToken = import.meta.env.VITE_TURSO_AUTH_TOKEN

        if (!databaseUrl) {
            throw new Error('VITE_TURSO_DATABASE_URL environment variable is required')
        }

        if (!authToken) {
            throw new Error('VITE_TURSO_AUTH_TOKEN environment variable is required')
        }

        client = createClient({
            url: databaseUrl,
            authToken: authToken,
        })

        console.log('Turso client initialized successfully')
    }

    return client
}

export async function initializeTursoDatabase(): Promise<string> {
    try {
        const client = getTursoClient()
        
        // Create tables if they don't exist
        await client.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                snippets_path TEXT NOT NULL,
                created_at INTEGER NOT NULL
            )
        `)

        await client.execute(`
            CREATE TABLE IF NOT EXISTS snippets (
                id INTEGER PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                file_path TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )
        `)

        // Create folders table
        await client.execute(`
            CREATE TABLE IF NOT EXISTS folders (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                parent_id INTEGER REFERENCES folders(id),
                position INTEGER NOT NULL DEFAULT 0,
                is_public INTEGER NOT NULL DEFAULT 0,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )
        `)

        // Create notes table
        await client.execute(`
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                folder_id INTEGER REFERENCES folders(id),
                position INTEGER NOT NULL DEFAULT 0,
                is_public INTEGER NOT NULL DEFAULT 0,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )
        `)

        // Create indexes for better performance
        await client.execute(`
            CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id)
        `)

        await client.execute(`
            CREATE INDEX IF NOT EXISTS idx_folders_position ON folders(parent_id, position)
        `)

        await client.execute(`
            CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON notes(folder_id)
        `)

        await client.execute(`
            CREATE INDEX IF NOT EXISTS idx_notes_position ON notes(folder_id, position)
        `)

        console.log('Turso database tables initialized successfully')
        return 'Turso database initialized successfully'
    } catch (error) {
        console.error('Failed to initialize Turso database:', error)
        throw error
    }
}

export async function checkTursoDatabaseHealth() {
    const startTime = Date.now()
    
    try {
        const client = getTursoClient()
        
        // Simple health check query
        await client.execute('SELECT 1')
        
        const responseTime = Date.now() - startTime
        
        return {
            status: 'healthy' as const,
            message: `Turso database is healthy (${responseTime}ms)`,
            lastChecked: new Date(),
            responseTime
        }
    } catch (error) {
        const responseTime = Date.now() - startTime
        
        return {
            status: 'error' as const,
            message: `Turso database error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            lastChecked: new Date(),
            responseTime
        }
    }
}

export async function createUserInTurso(name: string, snippetsPath: string): Promise<number> {
    try {
        const client = getTursoClient()
        const now = Math.floor(Date.now() / 1000) // Unix timestamp
        
        const result = await client.execute({
            sql: 'INSERT INTO users (name, snippets_path, created_at) VALUES (?, ?, ?)',
            args: [name, snippetsPath, now]
        })
        
        if (result.lastInsertRowid) {
            const userId = Number(result.lastInsertRowid)
            console.log('User created in Turso with ID:', userId)
            return userId
        } else {
            throw new Error('Failed to get user ID after creation')
        }
    } catch (error) {
        console.error('Failed to create user in Turso:', error)
        throw error
    }
}

export async function executeQueryInTurso(query: string) {
    const startTime = Date.now()
    
    try {
        const client = getTursoClient()
        const result = await client.execute(query)
        const responseTime = Date.now() - startTime
        
        // Format the result for display
        let formattedResult = ''
        
        if (result.rows && result.rows.length > 0) {
            // Get column names
            const columns = result.columns || []
            
            // Create header
            if (columns.length > 0) {
                formattedResult += columns.join(' | ') + '\n'
                formattedResult += columns.map(() => '---').join(' | ') + '\n'
            }
            
            // Add rows
            result.rows.forEach(row => {
                const rowValues = columns.map(col => {
                    const value = row[col]
                    return value !== null && value !== undefined ? String(value) : 'NULL'
                })
                formattedResult += rowValues.join(' | ') + '\n'
            })
        } else {
            formattedResult = `Query executed successfully. Rows affected: ${result.rowsAffected || 0}`
        }
        
        return {
            status: 'success' as const,
            message: 'Query executed successfully',
            result: formattedResult,
            responseTime,
            lastExecuted: new Date().toISOString()
        }
    } catch (error) {
        const responseTime = Date.now() - startTime
        
        return {
            status: 'error' as const,
            message: `Query failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            result: null,
            responseTime,
            lastExecuted: new Date().toISOString()
        }
    }
}
