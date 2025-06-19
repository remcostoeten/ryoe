#!/usr/bin/env node

/**
 * Import Migration Script
 * Updates all imports to use the new API structure
 */

const fs = require('fs')
const path = require('path')
const { glob } = require('glob')

const importMappings = {
    // Auth services
    "from '@/services/user-service'": "from '@/api/services/auth-service'",
    "from '@/queries/user-queries'": "from '@/api/services/auth-service'",
    "from '@/mutations/user-mutations'": "from '@/api/services/auth-service'",

    // Notes services
    "from '@/services/note-service'": "from '@/api/services/notes-service'",
    "from '@/queries/note-queries'": "from '@/api/services/notes-service'",
    "from '@/mutations/note-mutations'": "from '@/api/services/notes-service'",

    // Folders services
    "from '@/services/folder-service'": "from '@/api/services/folders-service'",
    "from '@/queries/folder-queries'": "from '@/api/services/folders-service'",
    "from '@/mutations/folder-mutations'": "from '@/api/services/folders-service'",

    // Database services
    "from '@/api/db'": "from '@/api'",

    // UI components - fix duplicate paths
    "from '@/presentation/components/ui/components/ui/": "from '@/components/ui/",
    "from '@/presentation/components/ui/": "from '@/components/ui/",
    "from '@/presentation/": "from '@/components/",

    // Types
    "from '@/services/types'": "from '@/api/types'",
    "from '@/queries/types'": "from '@/api/types'",
    "from '@/mutations/types'": "from '@/api/types'",
}

function migrateImports() {
    console.log('🚀 Starting import migration...')

    // Find all TypeScript and React files
    const files = glob.sync('src/**/*.{ts,tsx}', {
        ignore: ['src/scripts/**', 'src/api/**'] // Don't modify our new API files
    })

    let filesUpdated = 0

    files.forEach(filePath => {
        try {
            let content = fs.readFileSync(filePath, 'utf-8')
            let hasChanges = false

            // Apply all import mappings
            Object.entries(importMappings).forEach(([oldImport, newImport]) => {
                if (content.includes(oldImport)) {
                    const escapedOldImport = oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                    content = content.replace(new RegExp(escapedOldImport, 'g'), newImport)
                    hasChanges = true
                }
            })

            // Additional specific replacements
            if (content.includes('useUpdateNote') && content.includes('@/mutations/note-mutations')) {
                content = content.replace('@/mutations/note-mutations', '@/api/services/notes-service')
                hasChanges = true
            }

            if (content.includes('useFolderPath') && content.includes('@/queries/folder-queries')) {
                content = content.replace('@/queries/folder-queries', '@/api/services/folders-service')
                hasChanges = true
            }

            if (hasChanges) {
                fs.writeFileSync(filePath, content)
                filesUpdated++
                console.log(`✅ Updated: ${filePath}`)
            }
        } catch (error) {
            console.error(`❌ Error processing ${filePath}:`, error)
        }
    })

    console.log(`\n🎉 Migration complete! Updated ${filesUpdated} files.`)
}

// Run the migration
if (require.main === module) {
    migrateImports()
}