import { createClient } from '@libsql/client'
import type { DatabaseClient, DatabaseConfig, DatabaseHealth, ExecuteOptions } from '../types'

let client: DatabaseClient | null = null

function createTursoClient(config: DatabaseConfig): DatabaseClient {
  return createClient({
    url: config.url,
    authToken: config.authToken,
  })
}

function getEnvironmentConfig(): DatabaseConfig {
  const url = import.meta.env.VITE_TURSO_DATABASE_URL
  const authToken = import.meta.env.VITE_TURSO_AUTH_TOKEN

  if (!url) {
    throw new Error('VITE_TURSO_DATABASE_URL environment variable is required')
  }

  if (!authToken) {
    throw new Error('VITE_TURSO_AUTH_TOKEN environment variable is required')
  }

  return { url, authToken }
}

export function getTursoClient(): DatabaseClient {
  if (!client) {
    const config = getEnvironmentConfig()
    client = createTursoClient(config)
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
        is_setup_complete INTEGER DEFAULT 0,
        storage_type TEXT DEFAULT 'turso',
        preferences TEXT,
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

    await client.execute(`
      CREATE TABLE IF NOT EXISTS folders (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        parent_id INTEGER,
        position INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
      )
    `)

    await client.execute(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        folder_id INTEGER,
        position INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
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

    // Create tags table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        color TEXT NOT NULL DEFAULT '#6b7280',
        description TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `)

    // Create note_tags junction table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS note_tags (
        id INTEGER PRIMARY KEY,
        note_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
        UNIQUE(note_id, tag_id)
      )
    `)

    // Create indexes for tags
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_note_tags_note_id ON note_tags(note_id)
    `)

    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_note_tags_tag_id ON note_tags(tag_id)
    `)

    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name)
    `)

    console.log('Turso database tables initialized successfully')
    return 'Turso database initialized successfully'
  } catch (error) {
    console.error('Failed to initialize Turso database:', error)
    throw error
  }
}

export async function checkTursoDatabaseHealth(): Promise<DatabaseHealth> {
  const startTime = Date.now()
  
  try {
    const client = getTursoClient()
    
    // Simple health check query
    await client.execute('SELECT 1')
    
    const responseTime = Date.now() - startTime
    
    return {
      status: 'healthy',
      message: `Turso database is healthy (${responseTime}ms)`,
      lastChecked: new Date(),
      responseTime
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    return {
      status: 'error',
      message: `Turso database error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastChecked: new Date(),
      responseTime
    }
  }
}

export async function executeTursoQuery(options: ExecuteOptions) {
  const startTime = Date.now()
  
  try {
    const client = getTursoClient()
    const result = await client.execute(options)
    const responseTime = Date.now() - startTime
    
    // Format the result for display
    let formattedResult = ''
    
    if (result.rows && result.rows.length > 0) {
      // Get column names from the first row
      const columns = Object.keys(result.rows[0])
      
      // Create header
      formattedResult += columns.join(' | ') + '\n'
      formattedResult += columns.map(() => '---').join(' | ') + '\n'
      
      // Add rows
      result.rows.forEach(row => {
        const values = columns.map(col => String(row[col] ?? ''))
        formattedResult += values.join(' | ') + '\n'
      })
    } else {
      formattedResult = 'Query executed successfully (no results)'
    }
    
    return {
      success: true,
      result: formattedResult,
      responseTime,
      rowCount: result.rows?.length || 0,
      lastInsertRowid: result.lastInsertRowid,
      changes: result.rowsAffected || 0
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime
    }
  }
}
