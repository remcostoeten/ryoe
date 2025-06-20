import type { TServiceResult } from '@/types'
import type { TUserProfile } from '@/domain/entities/workspace'
import {
    createUser as createUserInDb,
    updateUser as updateUserInDb,
    findUserById,
    markUserSetupComplete as markSetupCompleteInDb,
    getUserCount,
    deleteUser as deleteUserFromDb
} from '@/repositories/user-repository'
import type { TCreateUserData, TUpdateUserData } from '@/repositories/types'

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