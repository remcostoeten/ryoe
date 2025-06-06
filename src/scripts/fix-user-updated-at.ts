/**
 * Script to fix updated_at values for existing users
 */

import { config } from 'dotenv'
import { createClient } from '@libsql/client'

// Load environment variables
config()

function getTursoClient() {
  const url = process.env.VITE_TURSO_DATABASE_URL
  const authToken = process.env.VITE_TURSO_AUTH_TOKEN

  if (!url) {
    throw new Error('VITE_TURSO_DATABASE_URL environment variable is required')
  }

  if (!authToken) {
    throw new Error('VITE_TURSO_AUTH_TOKEN environment variable is required')
  }

  return createClient({
    url,
    authToken
  })
}

async function fixUserUpdatedAt() {
  try {
    const client = getTursoClient()
    
    console.log('Fixing updated_at values for existing users...')
    
    // Update all users where updated_at is 0 (default) to use their created_at value
    const result = await client.execute(`
      UPDATE users 
      SET updated_at = created_at 
      WHERE updated_at = 0
    `)
    
    console.log(`Updated ${result.rowsAffected} users with proper updated_at values`)
    
    // Verify the fix
    const users = await client.execute('SELECT id, name, created_at, updated_at FROM users')
    console.log('Current users:')
    users.rows.forEach(row => {
      console.log(`- User ${row.id}: ${row.name}, created: ${new Date(Number(row.created_at))}, updated: ${new Date(Number(row.updated_at))}`)
    })
    
  } catch (error) {
    console.error('Failed to fix user updated_at values:', error)
    process.exit(1)
  }
}

// Run the script
fixUserUpdatedAt()
  .then(() => {
    console.log('✅ User updated_at values fixed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Failed to fix user updated_at values:', error)
    process.exit(1)
  })
