#!/usr/bin/env bun
// Script to safely clean up old duplicate files after migration

import { rm, access } from 'fs/promises'

const OLD_DIRECTORIES_TO_REMOVE = [
    // Old modules that have been replaced
    'src/modules/folder-management',
    'src/modules/notes',

    // Old type files (now consolidated in domain)
    'src/types/notes.ts',
    'src/types/tags.ts',
    'src/repositories/types.ts',
    'src/services/types.ts',
    'src/mutations/types.ts',

    // Duplicate routes
    'src/app/routes/notesv2',

    // Test files
    'src/test-folder-creation.ts',

    // Old utilities (moved to shared)
    'src/utilities'
]

async function fileExists(path: string): Promise<boolean> {
    try {
        await access(path)
        return true
    } catch {
        return false
    }
}

async function safeRemove(path: string): Promise<void> {
    try {
        const exists = await fileExists(path)
        if (exists) {
            await rm(path, { recursive: true, force: true })
            console.log(`✅ Removed: ${path}`)
        } else {
            console.log(`⚠️ Not found (already removed): ${path}`)
        }
    } catch (error) {
        console.error(`❌ Failed to remove ${path}:`, error)
    }
}

async function cleanupOldFiles() {
    console.log('🧹 Starting cleanup of old duplicate files...\n')

    console.log('📁 Removing old directories and files:')
    for (const path of OLD_DIRECTORIES_TO_REMOVE) {
        await safeRemove(path)
    }

    console.log(`
✅ Cleanup complete!

📊 Summary:
- ${OLD_DIRECTORIES_TO_REMOVE.length} items processed
- Old scattered modules removed
- Duplicate type files removed 
- Test files cleaned up

🎯 Benefits:
✅ Eliminated duplicate code
✅ Single source of truth established
✅ Clean directory structure
✅ Reduced cognitive overhead
✅ Consistent patterns across codebase

⚠️ Next Steps:
1. Test the application to ensure everything works
2. Update any remaining imports if needed
3. Remove any unused dependencies
4. Update documentation to reflect new architecture
`)
}

// Run the cleanup
cleanupOldFiles().catch(console.error) 