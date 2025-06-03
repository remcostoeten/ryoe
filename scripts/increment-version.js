#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Colors for console output
const colors = {
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
}

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`)
}

function incrementVersion(version) {
    // Parse version like "0.01" to increment by 0.01
    const num = parseFloat(version)
    const newVersion = (num + 0.01).toFixed(2)
    return newVersion
}

function toSemanticVersion(version) {
    // Convert "0.03" to "0.3.0" for Tauri compatibility
    const num = parseFloat(version);
    const major = 0;
    const minor = Math.round(num * 100);
    const patch = 0;
    return `${major}.${minor}.0`;
}

function updateFile(filePath, searchPattern, replacePattern) {
    try {
        const content = fs.readFileSync(filePath, 'utf8')
        const updatedContent = content.replace(searchPattern, replacePattern)
        fs.writeFileSync(filePath, updatedContent)
        return true
    } catch (error) {
        log(`Error updating ${filePath}: ${error.message}`, 'red')
        return false
    }
}

function main() {
    log('🚀 Incrementing version...', 'cyan')

    // Read current version from package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    const currentVersion = packageJson.version
    const newVersion = incrementVersion(currentVersion)

    log(`📦 Current version: ${currentVersion}`, 'yellow')
    log(`📦 New version: ${newVersion}`, 'green')

    const semanticVersion = toSemanticVersion(newVersion)
    log(`📦 Semantic version: ${semanticVersion}`, 'green')

    // Files to update with their patterns
    const filesToUpdate = [
        {
            path: 'package.json',
            search: /"version":\s*"[^"]+"/,
            replace: `"version": "${newVersion}"`
        },
        {
            path: 'src/app/config.ts',
            search: /export const APP_VERSION = '[^']+'/,
            replace: `export const APP_VERSION = '${newVersion}'`
        },
        {
            path: 'src-tauri/Cargo.toml',
            search: /version = "[^"]+"/,
            replace: `version = "${semanticVersion}"`
        },
        {
            path: 'src-tauri/tauri.conf.json',
            search: /"version":\s*"[^"]+"/,
            replace: `"version": "${semanticVersion}"`
        }
    ]

    let allUpdated = true

    // Update all files
    filesToUpdate.forEach((file) => {
        const fullPath = path.join(process.cwd(), file.path)
        log(`📝 Updating ${file.path}...`, 'cyan')

        if (updateFile(fullPath, file.search, file.replace)) {
            log(`✅ Updated ${file.path}`, 'green')
        } else {
            allUpdated = false
        }
    })

    if (allUpdated) {
        log(`🎉 All files updated to version ${newVersion}!`, 'green')
        process.exit(0)
    } else {
        log('❌ Some files failed to update', 'red')
        process.exit(1)
    }
}

main()
