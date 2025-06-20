import type { TUser } from '@/types'

interface UserPreferences {
    theme?: 'light' | 'dark' | 'system'
    storageType?: 'local' | 'turso'
    mdxStoragePath?: string
}

export async function updateUserPreferences(preferences: UserPreferences): Promise<TUser> {
    // TODO: Implement actual API call
    console.log('Updating user preferences:', preferences)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Return mock updated user
    return {
        id: 1,
        email: 'user@example.com',
        name: 'Demo User',
        preferences: {
            theme: preferences.theme || 'dark',
            storageType: preferences.storageType || 'local',
            mdxStoragePath: preferences.mdxStoragePath,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
} 