/**
 * Environment configuration that works in both web and Tauri contexts
 */

interface EnvironmentConfig {
    TURSO_DATABASE_URL: string
    TURSO_AUTH_TOKEN: string
}

let cachedConfig: EnvironmentConfig | null = null

export function getEnvironmentConfig(): EnvironmentConfig {
    if (cachedConfig) {
        return cachedConfig
    }

    // Try different sources for environment variables
    let url: string | undefined
    let authToken: string | undefined

    // Method 1: Vite environment variables (works in web context)
    if (import.meta.env) {
        url = import.meta.env.VITE_TURSO_DATABASE_URL
        authToken = import.meta.env.VITE_TURSO_AUTH_TOKEN
    }

    // Method 2: Process environment (may work in some Tauri setups)
    if (!url && typeof process !== 'undefined' && process.env) {
        url = process.env.VITE_TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL
        authToken = process.env.VITE_TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN
    }

    // Method 3: Hardcoded fallback (for development)
    if (!url) {
        url = 'libsql://supreme-shadow-remcostoeten.aws-eu-west-1.turso.io'
    }

    if (!authToken) {
        authToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NTAyODMxNDgsImlkIjoiMmFhMzZjMTgtYjA3Ny00MzVkLWI5Y2QtM2EyNTIxMzZjNTY3IiwicmlkIjoiNjhhMDQ0NjQtMTc1ZC00ODgzLWJiOGItNWY4OGE4MDNlN2M5In0.3BY8McvaxvbbKkPA8J4Cq8MnyPKN_dCV9d1_yWSjFcD2Zeuojz8Ba9p8AV5xtTZbsWumpZB213NrLwLY49_5Aw'
    }

    // Debug logging
    console.log('Environment configuration loaded:', {
        url: url ? 'SET' : 'MISSING',
        authToken: authToken ? 'SET' : 'MISSING',
        source: import.meta.env ? 'import.meta.env' : 'fallback'
    })

    if (!url) {
        throw new Error('TURSO_DATABASE_URL not found in any environment source')
    }

    if (!authToken) {
        throw new Error('TURSO_AUTH_TOKEN not found in any environment source')
    }

    cachedConfig = {
        TURSO_DATABASE_URL: url,
        TURSO_AUTH_TOKEN: authToken
    }

    return cachedConfig
} 