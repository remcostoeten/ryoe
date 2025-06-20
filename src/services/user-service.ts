import type { TServiceResult, TUserProfile } from '@/types'
import type { TRegisterUserVariables, TUpdateUserPreferencesVariables, TSwitchStorageTypeVariables } from '@/api/mutations/types'
import {
    createUser as createUserInDb,
    updateUser as updateUserInDb,
    findUserById,
    markUserSetupComplete as markSetupCompleteInDb,
    getUserCount,
    deleteUser as deleteUserFromDb
} from '@/repositories/user-repository'
import type { TCreateUserData, TUpdateUserData } from '@/repositories/types'

// For backwards compatibility, map old interfaces to new ones
function mapRegisterVariablesToCreateData(data: TRegisterUserVariables): TCreateUserData {
    return {
        name: data.name,
        snippetsPath: `${process.env.HOME || '~'}/.config/ryoe`,
        storageType: 'local',
        preferences: {
            theme: 'system',
            sidebarCollapsed: false,
            autoSave: true,
            showLineNumbers: true,
            fontSize: 14,
            editorTheme: 'default',
        },
    }
}

function mapUpdateVariablesToUpdateData(data: TUpdateUserPreferencesVariables): TUpdateUserData {
    return {
        preferences: {
            theme: data.theme,
            ...(data.mdxStoragePath && {}),
        },
        ...(data.storageType && { storageType: data.storageType }),
    }
}

function mapDbUserToProfile(dbUser: any): TUserProfile {
    return {
        id: dbUser.id,
        email: '', // Not stored in local database
        name: dbUser.name,
        preferences: {
            theme: dbUser.preferences?.theme || 'system',
            storageType: dbUser.storageType,
            mdxStoragePath: dbUser.snippetsPath,
        },
        snippetsPath: dbUser.snippetsPath,
        isSetupComplete: dbUser.isSetupComplete,
        storageType: dbUser.storageType,
        createdAt: new Date(dbUser.createdAt).toISOString(),
        updatedAt: new Date(dbUser.updatedAt || dbUser.createdAt).toISOString(),
    }
}

class UserService {
    private currentUserId: number | null = null

    async getCurrentUserId(): Promise<number | null> {
        if (this.currentUserId) return this.currentUserId

        // For local app, check if we have any users and use the first one
        // or create a default user if none exists
        const userCountResult = await getUserCount()
        if (userCountResult.success && userCountResult.data! > 0) {
            // For simplicity, use user ID 1 as the default user
            this.currentUserId = 1
            return 1
        }

        return null
    }

    async register(data: TRegisterUserVariables): Promise<TServiceResult<TUserProfile>> {
        try {
            const createData = mapRegisterVariablesToCreateData(data)
            const result = await createUserInDb(createData)

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

    async updatePreferences(data: TUpdateUserPreferencesVariables): Promise<TServiceResult<TUserProfile>> {
        try {
            const userId = await this.getCurrentUserId()
            if (!userId) {
                return {
                    success: false,
                    error: 'No user found',
                }
            }

            const updateData = mapUpdateVariablesToUpdateData(data)
            const result = await updateUserInDb(userId, updateData)

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

    async switchStorageType(data: TSwitchStorageTypeVariables): Promise<TServiceResult<void>> {
        try {
            const userId = await this.getCurrentUserId()
            if (!userId) {
                return {
                    success: false,
                    error: 'No user found',
                }
            }

            const result = await updateUserInDb(userId, {
                storageType: data.type || 'local'
            })

            if (!result.success) {
                return {
                    success: false,
                    error: result.error || 'Failed to switch storage type',
                }
            }

            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to switch storage type',
            }
        }
    }

    async getCurrentUser(): Promise<TServiceResult<TUserProfile>> {
        try {
            const userId = await this.getCurrentUserId()
            if (!userId) {
                return {
                    success: false,
                    error: 'No user found',
                }
            }

            const result = await findUserById(userId)
            if (!result.success || !result.data) {
                return {
                    success: false,
                    error: result.error || 'User not found',
                }
            }

            return {
                success: true,
                data: mapDbUserToProfile(result.data)
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get current user',
            }
        }
    }

    async getUserProfile(userId: number): Promise<TServiceResult<TUserProfile>> {
        try {
            const result = await findUserById(userId)
            if (!result.success || !result.data) {
                return {
                    success: false,
                    error: result.error || 'User not found',
                }
            }

            return {
                success: true,
                data: mapDbUserToProfile(result.data)
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get user profile',
            }
        }
    }

    async checkOnboardingStatus(): Promise<TServiceResult<{ isComplete: boolean }>> {
        try {
            const userId = await this.getCurrentUserId()
            if (!userId) {
                return { success: true, data: { isComplete: false } }
            }

            const result = await findUserById(userId)
            if (!result.success || !result.data) {
                return { success: true, data: { isComplete: false } }
            }

            return {
                success: true,
                data: { isComplete: result.data.isSetupComplete }
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to check onboarding status',
            }
        }
    }

    async markOnboardingComplete(userId: number): Promise<TServiceResult<TUserProfile>> {
        try {
            const result = await markSetupCompleteInDb(userId)
            if (!result.success || !result.data) {
                return {
                    success: false,
                    error: result.error || 'Failed to mark onboarding complete',
                }
            }

            this.currentUserId = userId
            return {
                success: true,
                data: mapDbUserToProfile(result.data)
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to mark onboarding complete',
            }
        }
    }

    async logout(): Promise<TServiceResult<void>> {
        try {
            const userId = await this.getCurrentUserId()
            if (!userId) {
                return {
                    success: false,
                    error: 'No user to logout',
                }
            }

            // Delete the user from database
            const deleteResult = await deleteUserFromDb(userId)
            if (!deleteResult.success) {
                return {
                    success: false,
                    error: deleteResult.error || 'Failed to delete user',
                }
            }

            // Clear current user state
            this.currentUserId = null

            // Clear any cached data
            if (typeof window !== 'undefined') {
                // Clear localStorage if any
                localStorage.clear()

                // Clear sessionStorage
                sessionStorage.clear()
            }

            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to logout',
            }
        }
    }

    async removeUserAndRestartOnboarding(): Promise<TServiceResult<void>> {
        try {
            const logoutResult = await this.logout()
            if (!logoutResult.success) {
                return logoutResult
            }

            // Force reload to restart onboarding
            if (typeof window !== 'undefined') {
                window.location.reload()
            }

            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to restart onboarding',
            }
        }
    }

    // Legacy methods for compatibility - these now use database instead of localStorage
    async getOnboardingStep(): Promise<TServiceResult<number>> {
        try {
            const status = await this.checkOnboardingStatus()
            if (!status.success) {
                return { success: false, error: status.error }
            }

            // If onboarding is complete, return 0, otherwise return 1
            return {
                success: true,
                data: status.data!.isComplete ? 0 : 1
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get onboarding step',
            }
        }
    }

    async setOnboardingStep(step: number): Promise<TServiceResult<void>> {
        // For database storage, we don't track individual steps
        // Step completion is handled by the actual database operations
        return { success: true }
    }

    async resetDemoUser(): Promise<TServiceResult<void>> {
        // Use the new logout functionality instead
        return this.logout()
    }
}

export const userService = new UserService()

// Export individual functions for compatibility
export const registerUser = (data: TRegisterUserVariables) => userService.register(data)
export const updateUserPreferences = (data: TUpdateUserPreferencesVariables) => userService.updatePreferences(data)
export const switchStorageType = (data: TSwitchStorageTypeVariables) => userService.switchStorageType(data)
export const getCurrentUser = () => userService.getCurrentUser()
export const getUserProfile = (userId: number) => userService.getUserProfile(userId)
export const checkOnboardingStatus = () => userService.checkOnboardingStatus()
export const markOnboardingComplete = (userId: number) => userService.markOnboardingComplete(userId)
export const getOnboardingStep = () => userService.getOnboardingStep()
export const setOnboardingStep = (step: number) => userService.setOnboardingStep(step)
export const resetDemoUser = () => userService.resetDemoUser()

// New logout functions
export const logout = () => userService.logout()
export const removeUserAndRestartOnboarding = () => userService.removeUserAndRestartOnboarding() 