import { getTursoClient } from '@/core/database/clients/turso-client'

async function seedFolders() {
  try {
    const client = getTursoClient()
    const now = Math.floor(Date.now() / 1000)

    // Check if folders already exist
    const existingFolders = await client.execute({
      sql: 'SELECT COUNT(*) as count FROM folders'
    })

    const count = Number(existingFolders.rows[0]?.count) || 0
    
    if (count > 0) {
      console.log('Folders already exist, skipping seed')
      return
    }

    // Create default folders
    const defaultFolders = [
      { name: 'Personal Notes', parentId: null, position: 0, isPublic: false },
      { name: 'Work', parentId: null, position: 1, isPublic: false },
      { name: 'Ideas', parentId: null, position: 2, isPublic: false },
      { name: 'Projects', parentId: null, position: 3, isPublic: false },
    ]

    console.log('Creating default folders...')

    for (const folder of defaultFolders) {
      await client.execute({
        sql: `INSERT INTO folders (name, parent_id, position, is_public, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          folder.name,
          folder.parentId,
          folder.position,
          folder.isPublic ? 1 : 0,
          now,
          now
        ]
      })
      console.log(`Created folder: ${folder.name}`)
    }

    // Create a sample note in the first folder
    const foldersResult = await client.execute({
      sql: 'SELECT id FROM folders WHERE name = ? LIMIT 1',
      args: ['Personal Notes']
    })

    if (foldersResult.rows.length > 0) {
      const folderId = Number(foldersResult.rows[0].id)
      
      const sampleContent = JSON.stringify([
        {
          id: 'welcome-block',
          type: 'paragraph',
          content: [
            { 
              type: 'text', 
              text: 'Welcome to your notes app! This is your first note created with BlockNote.js editor.' 
            }
          ]
        },
        {
          id: 'features-block',
          type: 'paragraph',
          content: [
            { 
              type: 'text', 
              text: 'You can create rich text notes with formatting, lists, and more. Try editing this note!' 
            }
          ]
        }
      ])

      await client.execute({
        sql: `INSERT INTO notes (title, content, folder_id, position, is_public, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          'Welcome Note',
          sampleContent,
          folderId,
          0,
          0,
          now,
          now
        ]
      })
      console.log('Created sample note')
    }

    console.log('Seed completed successfully!')
  } catch (error) {
    console.error('Seed failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedFolders()
}
