/**
 * Database Reset Service - Completely wipes all data and resets the application
 * Uses the enterprise architecture pattern
 */

import { getTursoClient } from '@/core/database/clients/turso-client'
import { getAppStorage } from '@/core/storage'
import { DATABASE_TABLES, STORAGE_KEYS } from '@/core/config/constants'
import type { TServiceResult } from './types'

export interface TDatabaseResetResult {
  tablesCleared: string[]
  localStorageCleared: boolean
  message: string
}

/**
 * Completely wipes all database tables and local storage
 * This will force the onboarding flow to restart on next app launch
 */
export async function resetAllData(): Promise<TServiceResult<TDatabaseResetResult>> {
  try {
    console.log('Starting complete database and storage reset...')
    
    const client = getTursoClient()
    const storage = getAppStorage()
    const clearedTables: string[] = []

    // Get all table names from our schema
    const tablesToClear = [
      DATABASE_TABLES.USERS,
      DATABASE_TABLES.SNIPPETS, 
      DATABASE_TABLES.FOLDERS,
      DATABASE_TABLES.NOTES
    ]

    // Clear all database tables
    for (const tableName of tablesToClear) {
      try {
        // Use DELETE instead of DROP to preserve table structure
        await client.execute(`DELETE FROM ${tableName}`)
        
        // Reset auto-increment counter for SQLite
        await client.execute(`DELETE FROM sqlite_sequence WHERE name='${tableName}'`)
        
        clearedTables.push(tableName)
        console.log(`Cleared table: ${tableName}`)
      } catch (error) {
        console.warn(`Failed to clear table ${tableName}:`, error)
        // Continue with other tables even if one fails
      }
    }

    // Clear all local storage keys
    const storageKeysToClear = Object.values(STORAGE_KEYS)
    for (const key of storageKeysToClear) {
      try {
        await storage.remove(key)
        console.log(`Cleared storage key: ${key}`)
      } catch (error) {
        console.warn(`Failed to clear storage key ${key}:`, error)
      }
    }

    // Also clear any additional browser localStorage items
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear()
      console.log('Cleared browser localStorage')
    }

    const result: TDatabaseResetResult = {
      tablesCleared: clearedTables,
      localStorageCleared: true,
      message: `Successfully reset ${clearedTables.length} database tables and cleared all local storage`
    }

    console.log('Database and storage reset completed successfully:', result)
    
    return {
      success: true,
      data: result
    }
  } catch (error) {
    console.error('Failed to reset database and storage:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during reset',
      code: 'DATABASE_RESET_FAILED'
    }
  }
}

/**
 * Drops and recreates all database tables (more aggressive reset)
 * Use with extreme caution - this will completely destroy all data
 */
export async function hardResetDatabase(): Promise<TServiceResult<TDatabaseResetResult>> {
  try {
    console.log('Starting hard database reset (DROP TABLES)...')
    
    const client = getTursoClient()
    const storage = getAppStorage()
    const droppedTables: string[] = []

    // Drop tables in reverse order to handle foreign key constraints
    const tablesToDrop = [
      DATABASE_TABLES.NOTES,     // Has FK to folders
      DATABASE_TABLES.FOLDERS,   // Has self-referencing FK
      DATABASE_TABLES.SNIPPETS,  // No FK dependencies
      DATABASE_TABLES.USERS      // No FK dependencies
    ]

    // Drop all tables
    for (const tableName of tablesToDrop) {
      try {
        await client.execute(`DROP TABLE IF EXISTS ${tableName}`)
        droppedTables.push(tableName)
        console.log(`Dropped table: ${tableName}`)
      } catch (error) {
        console.warn(`Failed to drop table ${tableName}:`, error)
      }
    }

    // Clear all local storage
    const storageKeysToClear = Object.values(STORAGE_KEYS)
    for (const key of storageKeysToClear) {
      try {
        await storage.remove(key)
      } catch (error) {
        console.warn(`Failed to clear storage key ${key}:`, error)
      }
    }

    // Clear browser localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear()
    }

    const result: TDatabaseResetResult = {
      tablesCleared: droppedTables,
      localStorageCleared: true,
      message: `Hard reset completed: dropped ${droppedTables.length} tables and cleared all storage`
    }

    console.log('Hard database reset completed:', result)
    
    return {
      success: true,
      data: result
    }
  } catch (error) {
    console.error('Failed to perform hard database reset:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during hard reset',
      code: 'HARD_RESET_FAILED'
    }
  }
}

/**
 * Validates that the reset was successful by checking if tables are empty
 */
export async function validateReset(): Promise<TServiceResult<boolean>> {
  try {
    const client = getTursoClient()
    
    // Check if users table is empty (main indicator of successful reset)
    const result = await client.execute('SELECT COUNT(*) as count FROM users')
    const userCount = result.rows[0]?.count as number
    
    const isEmpty = userCount === 0
    
    return {
      success: true,
      data: isEmpty
    }
  } catch (error) {
    // If table doesn't exist, that's also a successful reset
    if (error instanceof Error && error.message.includes('no such table')) {
      return {
        success: true,
        data: true
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to validate reset',
      code: 'VALIDATION_FAILED'
    }
  }
}
