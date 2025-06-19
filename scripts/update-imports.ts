#!/usr/bin/env bun
// Script to update imports to use the new clean architecture

import { readFile, writeFile, readdir } from 'fs/promises'
import { join } from 'path'

const IMPORT_MAPPINGS = {
    // Utilities mapping
    "@/utilities": "@/shared/utils",
    "@/utilities/": "@/shared/utils/",
    "@/utilities/index": "@/shared/utils",
    "@/utilities/styling": "@/shared/utils/styling",
    "@/utilities/file-picker": "@/shared/utils/file-picker",

    // Types mapping - consolidate to domain layer
    "@/types/notes": "@/domain/entities/workspace",
    "@/modules/folder-management/types": "@/domain/entities/workspace",
    "@/repositories/types": "@/domain/entities/workspace",
    "@/services/types": "@/domain/entities/workspace",
    "@/mutations/types": "@/domain/entities/workspace",

    // Component mappings
    "@/components/ui": "@/presentation/components/ui",
    "@/components/layout": "@/presentation/layouts",

    // Feature mappings  
    "@/modules/folder-management": "@/application/features/workspace",
    "@/modules/notes": "@/application/features/workspace",

    // Infrastructure mappings
    "@/core/config": "@/infrastructure/config",
    "@/core/database": "@/infrastructure/database",
    "@/core/storage": "@/infrastructure/storage",
}

const TYPE_MAPPINGS = {
    // Consolidate scattered types to single source
    "TNote": "TNote",
    "TFolder": "TFolder",
    "TCreateNoteInput": "TCreateNoteInput",
    "TUpdateNoteInput": "TUpdateNoteInput",
    "TCreateFolderInput": "TCreateFolderInput",
    "TUpdateFolderInput": "TUpdateFolderInput",
    "TWorkspaceItem": "TWorkspaceItem"
}

async function findAllTSXFiles(): Promise<string[]> {
    const files: string[] = []

    async function walkDir(dir: string): Promise<void> {
        try {
            const entries = await readdir(dir, { withFileTypes: true })

            for (const entry of entries) {
                const fullPath = join(dir, entry.name)

                if (entry.isDirectory() && !entry.name.includes('node_modules')) {
                    await walkDir(fullPath)
                } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) && !entry.name.endsWith('.d.ts')) {
                    files.push(fullPath)
                }
            }
        } catch (error) {
            // Ignore errors for directories we can't read
        }
    }

    await walkDir('src')
    return files
}

async function updateFileImports(filePath: string): Promise<boolean> {
    try {
        const content = await readFile(filePath, 'utf-8')
        let updatedContent = content
        let hasChanges = false

        // Update import paths
        for (const [oldPath, newPath] of Object.entries(IMPORT_MAPPINGS)) {
            const oldImportRegex = new RegExp(`from ['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g')
            const newImportPath = `from '${newPath}'`

            if (oldImportRegex.test(updatedContent)) {
                updatedContent = updatedContent.replace(oldImportRegex, newImportPath)
                hasChanges = true
                console.log(`📝 ${filePath}: Updated ${oldPath} → ${newPath}`)
            }
        }

        // Update import statements that have paths with specific files
        for (const [oldPath, newPath] of Object.entries(IMPORT_MAPPINGS)) {
            if (oldPath.includes('/')) {
                const oldImportRegex = new RegExp(`from ['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(/[^'"]*)?['"]`, 'g')

                updatedContent = updatedContent.replace(oldImportRegex, (match) => {
                    const pathSuffix = match.match(/\/[^'"]*/) || ['']
                    return `from '${newPath}${pathSuffix[0]}'`
                })
            }
        }

        // Special case: Update scattered type imports to single domain import
        const scatteredTypeImports = [
            /@\/types\/notes/g,
            /@\/modules\/folder-management\/types/g,
            /@\/repositories\/types/g,
            /@\/services\/types/g
        ]

        for (const regex of scatteredTypeImports) {
            if (regex.test(updatedContent)) {
                updatedContent = updatedContent.replace(regex, '@/domain/entities/workspace')
                hasChanges = true
            }
        }

        if (hasChanges) {
            await writeFile(filePath, updatedContent, 'utf-8')
            return true
        }

        return false
    } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error)
        return false
    }
}

async function updateAllImports() {
    console.log('🔄 Finding all TypeScript files...')
    const files = await findAllTSXFiles()
    console.log(`📁 Found ${files.length} files to process`)

    let updatedCount = 0
    let errorCount = 0

    for (const file of files) {
        try {
            const wasUpdated = await updateFileImports(file)
            if (wasUpdated) {
                updatedCount++
            }
        } catch (error) {
            console.error(`❌ Failed to process ${file}:`, error)
            errorCount++
        }
    }

    console.log(`
✅ Import update complete!

📊 Summary:
- ${files.length} files scanned
- ${updatedCount} files updated  
- ${errorCount} errors encountered

🎯 Key Changes:
- @/utilities → @/shared/utils
- Scattered types → @/domain/entities/workspace
- @/components/ui → @/presentation/components/ui
- @/core/* → @/infrastructure/*
`)
}

// Run the script
updateAllImports().catch(console.error)

export { updateAllImports } 