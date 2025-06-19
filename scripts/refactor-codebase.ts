#!/usr/bin/env bun
// Comprehensive codebase refactoring script

import { mkdir, writeFile, readdir, rm } from 'fs/promises'
import { join } from 'path'

const CLEANUP_PLAN = {
    // Files/directories to remove
    toRemove: [
        'src/modules/folder-management',
        'src/modules/notes',
        'src/types/notes.ts',
        'src/types/tags.ts',
        'src/repositories/types.ts',
        'src/services/types.ts',
        'src/mutations/types.ts',
        'src/app/routes/notesv2',
        'src/test-folder-creation.ts',
        'src/utilities' // Will be moved to shared/utils
    ],

    // Directory structure to create
    toCreate: [
        'src/domain/entities/auth',
        'src/domain/entities/common',
        'src/domain/services',
        'src/infrastructure/api',
        'src/infrastructure/database',
        'src/infrastructure/storage',
        'src/infrastructure/config',
        'src/infrastructure/utils',
        'src/application/features/auth',
        'src/application/features/onboarding',
        'src/application/hooks',
        'src/application/stores',
        'src/application/router',
        'src/presentation/views/workspace',
        'src/presentation/views/auth',
        'src/presentation/components/forms',
        'src/presentation/components/navigation',
        'src/presentation/components/feedback',
        'src/presentation/layouts',
        'src/shared/types',
        'src/shared/constants',
        'src/shared/utils'
    ],

    // Files to move/consolidate
    toMove: [
        {
            from: 'src/utilities',
            to: 'src/shared/utils'
        },
        {
            from: 'src/core/config',
            to: 'src/infrastructure/config'
        },
        {
            from: 'src/core/database',
            to: 'src/infrastructure/database'
        },
        {
            from: 'src/core/storage',
            to: 'src/infrastructure/storage'
        },
        {
            from: 'src/components/layout',
            to: 'src/presentation/layouts'
        },
        {
            from: 'src/components/ui',
            to: 'src/presentation/components/ui'
        },
        {
            from: 'src/app/routes',
            to: 'src/presentation/views'
        },
        {
            from: 'src/hooks',
            to: 'src/application/hooks'
        },
        {
            from: 'src/contexts',
            to: 'src/application/stores'
        }
    ]
}

async function createDirectories() {
    console.log('📁 Creating new directory structure...')

    for (const dir of CLEANUP_PLAN.toCreate) {
        try {
            await mkdir(dir, { recursive: true })
            console.log(`✅ Created: ${dir}`)
        } catch (error) {
            console.log(`⚠️ Directory already exists: ${dir}`)
        }
    }
}

async function createIndexFiles() {
    console.log('📝 Creating index files...')

    const indexFiles = [
        {
            path: 'src/domain/index.ts',
            content: `// Domain layer exports
export * from './entities/workspace'
export * from './entities/auth'
export * from './repositories/workspace-repository'
export * from './services/workspace-service'`
        },
        {
            path: 'src/infrastructure/index.ts',
            content: `// Infrastructure layer exports
export * from './api'
export * from './database'
export * from './storage'
export * from './config'`
        },
        {
            path: 'src/application/index.ts',
            content: `// Application layer exports
export * from './features/workspace/workspace-feature'
export * from './features/auth/auth-feature'
export * from './hooks'
export * from './stores'`
        },
        {
            path: 'src/presentation/index.ts',
            content: `// Presentation layer exports
export * from './components/ui'
export * from './layouts'
// Views are imported directly in router`
        }
    ]

    for (const file of indexFiles) {
        await writeFile(file.path, file.content)
        console.log(`✅ Created: ${file.path}`)
    }
}

async function createMigrationGuide() {
    const guide = `# 🔄 Migration Guide

## Import Changes

### Before (Multiple Sources)
\`\`\`typescript
import { TNote } from '@/types/notes'
import { TFolder } from '@/modules/folder-management/types'  
import { TNote as RepoNote } from '@/repositories/types'
\`\`\`

### After (Single Source)
\`\`\`typescript
import { TNote, TFolder } from '@/domain/entities/workspace'
\`\`\`

## File Relocations

| Old Location | New Location |
|-------------|-------------|
| \`src/modules/folder-management\` | \`src/application/features/workspace\` |
| \`src/modules/notes\` | \`src/application/features/workspace\` |
| \`src/components/ui\` | \`src/presentation/components/ui\` |
| \`src/app/routes\` | \`src/presentation/views\` |
| \`src/utilities\` | \`src/shared/utils\` |
| \`src/core\` | \`src/infrastructure\` |

## Architecture Benefits

1. **Single Source of Truth** - All types in domain layer
2. **Clear Boundaries** - Each layer has specific responsibilities  
3. **Consistent Patterns** - Unified approach across features
4. **Better Testing** - Clean dependencies enable mocking
5. **Scalability** - New features follow established patterns

## Next Steps

1. Update imports throughout codebase
2. Move files to new locations
3. Remove duplicate/unused files
4. Test all functionality
5. Update documentation
`

    await writeFile('MIGRATION_GUIDE.md', guide)
    console.log('✅ Created: MIGRATION_GUIDE.md')
}

async function showSummary() {
    console.log(`
🎉 Refactoring Plan Complete!

📊 Summary:
- ${CLEANUP_PLAN.toRemove.length} items marked for removal
- ${CLEANUP_PLAN.toCreate.length} new directories created
- ${CLEANUP_PLAN.toMove.length} relocations planned

⚠️  Manual Steps Required:
1. Review and update imports in all files
2. Move files according to CLEANUP_PLAN.toMove
3. Remove duplicate type definitions
4. Test all functionality after migration

📋 Architecture Benefits:
✅ Clean separation of concerns
✅ Single source of truth for entities
✅ Consistent patterns across modules
✅ Better testability and maintainability
✅ Scalable architecture for new features

📖 See MIGRATION_GUIDE.md for detailed steps
`)
}

// Execute refactoring
async function main() {
    try {
        console.log('🏗️ Starting comprehensive codebase refactoring...\n')

        await createDirectories()
        await createIndexFiles()
        await createMigrationGuide()
        await showSummary()

    } catch (error) {
        console.error('❌ Refactoring failed:', error)
        process.exit(1)
    }
}

// Run the script
main() 