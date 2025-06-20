export interface UserPreferences {
    theme: 'light' | 'dark' | 'system'
    storageType: 'local' | 'turso'
    mdxStoragePath?: string
} 