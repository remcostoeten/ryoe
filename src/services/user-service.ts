import type { TServiceResult, TUserProfile, TCreateUserData, TUpdateUserData, TUpdateUserPreferencesVariables } from '@/types'
import type { TUserPreferences } from '@/types'
import { databaseService } from '@/services/database-service'
import { createFolder } from '@/services/folder-service'
import { createNoteWithValidation } from '@/services/note-service'

// Mock database operations - TODO: Implement with real database
async function createUserInDb(data: TCreateUserData): Promise<TServiceResult<any>> {
    console.log('Mock: Creating user:', data)
    return {
        success: true,
        data: {
            id: 1,
            name: data.name,
            snippetsPath: data.snippetsPath,
            isSetupComplete: false,
            storageType: data.storageType || 'local',
            preferences: data.preferences || {
                theme: 'system',
                sidebarCollapsed: false,
                autoSave: true,
                showLineNumbers: true,
                fontSize: 14,
                editorTheme: 'default'
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    }
}

async function updateUserInDb(userId: number, data: TUpdateUserData): Promise<TServiceResult<any>> {
    console.log('Mock: Updating user:', userId, data)
    return {
        success: true,
        data: {
            id: userId,
            name: data.name || 'User',
            snippetsPath: data.snippetsPath || '/snippets',
            isSetupComplete: true,
            storageType: data.storageType || 'local',
            preferences: data.preferences || {
                theme: 'system',
                sidebarCollapsed: false,
                autoSave: true,
                showLineNumbers: true,
                fontSize: 14,
                editorTheme: 'default'
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    }
}

async function getUserById(userId: number): Promise<TServiceResult<any>> {
    console.log('Mock: Getting user by ID:', userId)
    return {
        success: true,
        data: {
            id: userId,
            name: 'User',
            snippetsPath: '/snippets',
            isSetupComplete: true,
            storageType: 'local',
            preferences: {
                theme: 'system',
                sidebarCollapsed: false,
                autoSave: true,
                showLineNumbers: true,
                fontSize: 14,
                editorTheme: 'default'
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    }
}

async function getCurrentUserFromDb(): Promise<TServiceResult<any>> {
    console.log('Mock: Getting current user')
    return {
        success: true,
        data: {
            id: 1,
            name: 'User',
            snippetsPath: '/snippets',
            isSetupComplete: true,
            storageType: 'local',
            preferences: {
                theme: 'system',
                sidebarCollapsed: false,
                autoSave: true,
                showLineNumbers: true,
                fontSize: 14,
                editorTheme: 'default'
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    }
}

async function deleteUserFromDb(userId: number): Promise<TServiceResult<void>> {
    console.log('Mock: Deleting user:', userId)
    return { success: true }
}

async function softDeleteUserFromDb(userId: number): Promise<TServiceResult<void>> {
    console.log('Mock: Soft deleting user:', userId)
    return { success: true }
}

async function updateUserPreferencesInDb(userId: number, preferences: TUserPreferences): Promise<TServiceResult<any>> {
    console.log('Mock: Updating user preferences:', userId, preferences)
    return {
        success: true,
        data: {
            id: userId,
            name: 'User',
            snippetsPath: '/snippets',
            isSetupComplete: true,
            storageType: 'local',
            preferences,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    }
}

async function getUserCount(): Promise<TServiceResult<number>> {
    console.log('Mock: Getting user count')
    return { success: true, data: 1 }
}

async function findUserById(userId: number): Promise<TServiceResult<any>> {
    return getUserById(userId)
}

async function markSetupCompleteInDb(userId: number): Promise<TServiceResult<void>> {
    console.log('Mock: Marking setup complete for user:', userId)
    return { success: true }
}

// Map database user to user profile
function mapDbUserToProfile(dbUser: any): TUserProfile {
    return {
        id: dbUser.id,
        name: dbUser.name,
        snippetsPath: dbUser.snippetsPath,
        isSetupComplete: dbUser.isSetupComplete,
        storageType: dbUser.storageType,
        preferences: dbUser.preferences,
        createdAt: dbUser.createdAt,
        updatedAt: dbUser.updatedAt,
    }
}

// User Service - handles all user-related operations
class UserService {
    private currentUserId: number | null = null

    async getCurrentUserId(): Promise<number | null> {
        if (this.currentUserId) {
            return this.currentUserId
        }

        // Try to find any user in the database
        const count = await getUserCount()
        if (count.success && count.data! > 0) {
            // For this local desktop app, we assume the first user is the current user
            // In a real app, you'd have proper session management
            return 1 // Assuming first user has ID 1
        }

        return null
    }

    async register(data: TCreateUserData): Promise<TServiceResult<TUserProfile>> {
        try {
            const result = await createUserInDb(data)

            if (!result.success) {
                return {
                    success: false,
                    error: result.error || 'Failed to create user',
                }
            }

            this.currentUserId = result.data!.id
            return {
                success: true,
                data: mapDbUserToProfile(result.data!)
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to register user',
            }
        }
    }

    async updatePreferences(data: TUpdateUserData): Promise<TServiceResult<TUserProfile>> {
        try {
            const userId = await this.getCurrentUserId()
            if (!userId) {
                return {
                    success: false,
                    error: 'No user found',
                }
            }

            const result = await updateUserInDb(userId, data)

            if (!result.success) {
                return {
                    success: false,
                    error: result.error || 'Failed to update user preferences',
                }
            }

            return {
                success: true,
                data: mapDbUserToProfile(result.data!)
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update user preferences',
            }
        }
    }

    async getCurrentUser(): Promise<TServiceResult<TUserProfile | null>> {
        try {
            const userId = await this.getCurrentUserId()
            if (!userId) {
                return {
                    success: true,
                    data: null,
                }
            }

            const result = await findUserById(userId)
            if (!result.success) {
                return {
                    success: false,
                    error: result.error || 'Failed to fetch current user',
                }
            }

            return {
                success: true,
                data: result.data ? mapDbUserToProfile(result.data) : null,
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get current user',
            }
        }
    }

    async markSetupComplete(userId: number): Promise<TServiceResult<void>> {
        try {
            const result = await markSetupCompleteInDb(userId)
            if (!result.success) {
                return {
                    success: false,
                    error: result.error || 'Failed to mark setup complete',
                }
            }
            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to mark setup complete',
            }
        }
    }

    async getUserProfile(userId: number): Promise<TServiceResult<TUserProfile>> {
        try {
            const result = await findUserById(userId)
            if (!result.success) {
                return {
                    success: false,
                    error: result.error || 'Failed to fetch user profile',
                }
            }

            if (!result.data) {
                return {
                    success: false,
                    error: 'User not found',
                }
            }

            return {
                success: true,
                data: mapDbUserToProfile(result.data),
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get user profile',
            }
        }
    }

    async deleteUser(userId: number): Promise<TServiceResult<void>> {
        try {
            const result = await deleteUserFromDb(userId)
            if (result.success && this.currentUserId === userId) {
                this.currentUserId = null
            }
            return result
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete user',
            }
        }
    }

    async checkOnboardingStatus(): Promise<TServiceResult<boolean>> {
        try {
            const user = await this.getCurrentUser()
            if (!user.success || !user.data) {
                return {
                    success: true,
                    data: false, // No user means onboarding is not complete
                }
            }

            return {
                success: true,
                data: user.data.isSetupComplete,
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to check onboarding status',
            }
        }
    }

    async switchStorageType(storageType: 'local' | 'turso'): Promise<TServiceResult<TUserProfile>> {
        try {
            const userId = await this.getCurrentUserId()
            if (!userId) {
                return {
                    success: false,
                    error: 'No user found',
                }
            }

            const updateData: TUpdateUserData = {
                storageType,
            }

            return await this.updatePreferences(updateData)
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to switch storage type',
            }
        }
    }
}

// Singleton instance
export const userService = new UserService()

// Export individual functions for modern clean API
export const registerUser = (data: TCreateUserData) => userService.register(data)
export const updateUserPreferences = (data: TUpdateUserData) => userService.updatePreferences(data)
export const getCurrentUser = () => userService.getCurrentUser()
export const getUserProfile = (userId: number) => userService.getUserProfile(userId)
export const markUserSetupComplete = (userId: number) => userService.markSetupComplete(userId)
export const deleteUser = (userId: number) => userService.deleteUser(userId)
export const checkOnboardingStatus = () => userService.checkOnboardingStatus()
export const switchStorageType = (storageType: 'local' | 'turso') => userService.switchStorageType(storageType)

export async function resetDemoUser(): Promise<void> {
    // Reset demo user data to initial state
    const demoUser = {
        id: 1,
        name: 'Demo User',
        email: 'demo@example.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }

    // Reset user preferences
    const updateResult = await userService.updatePreferences({
        theme: 'system',
    })
    if (!updateResult.success) {
        throw new Error(updateResult.error || 'Failed to update user preferences')
    }

    // Clear all notes and folders
    const resetResult = await databaseService.resetAllData()
    if (!resetResult.success) {
        throw new Error(resetResult.error || 'Failed to reset data')
    }

    // Create initial demo data
    const folderResult = await createFolder({
        name: 'Getting Started',
        position: 0,
    })
    if (!folderResult.success || !folderResult.data) {
        throw new Error(folderResult.error || 'Failed to create demo folder')
    }

    const noteResult = await createNoteWithValidation({
        title: 'Welcome to Ryoe',
        content: '# Welcome to Ryoe\n\nThis is your first note. Feel free to edit it or create a new one.',
        folderId: folderResult.data.id,
        position: 0,
    })
    if (!noteResult.success) {
        throw new Error(noteResult.error || 'Failed to create demo note')
    }
} 