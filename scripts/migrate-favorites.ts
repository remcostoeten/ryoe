import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { config } from 'dotenv'

config()

async function migrateFavorites() {
  const client = createClient({
    url: process.env.VITE_TURSO_DATABASE_URL!,
    authToken: process.env.VITE_TURSO_AUTH_TOKEN!,
  })

  const db = drizzle(client)

  try {
    console.log('Starting favorites migration...')

    // Add is_favorite column to folders table if it doesn't exist
    try {
      await client.execute(`
        ALTER TABLE folders ADD COLUMN is_favorite INTEGER DEFAULT 0 NOT NULL;
      `)
      console.log('✓ Added is_favorite column to folders table')
    } catch (error: any) {
      if (error.message.includes('duplicate column name')) {
        console.log('✓ is_favorite column already exists in folders table')
      } else {
        throw error
      }
    }

    // Add is_favorite column to notes table if it doesn't exist
    try {
      await client.execute(`
        ALTER TABLE notes ADD COLUMN is_favorite INTEGER DEFAULT 0 NOT NULL;
      `)
      console.log('✓ Added is_favorite column to notes table')
    } catch (error: any) {
      if (error.message.includes('duplicate column name')) {
        console.log('✓ is_favorite column already exists in notes table')
      } else {
        throw error
      }
    }

    // Update existing records to have is_favorite = 0 (false)
    await client.execute(`
      UPDATE folders SET is_favorite = 0 WHERE is_favorite IS NULL;
    `)
    
    await client.execute(`
      UPDATE notes SET is_favorite = 0 WHERE is_favorite IS NULL;
    `)

    console.log('✓ Migration completed successfully!')
    
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    client.close()
  }
}

migrateFavorites().catch(console.error)
