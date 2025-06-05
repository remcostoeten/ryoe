/**
 * User service - business logic for user operations
 * Pure functions only, no classes
 */

import { 
  findUserById, 
  findUserByName, 
  createUser, 
  updateUser, 
  getSetupCompleteUserCount 
} from '@/repositories/user-repository'
import { getAppStorage } from '@/core/storage'
import { STORAGE_KEYS, DEFAULT_MDX_STORAGE_PATH } from '@/core/config/constants'
import { isValidUsername, isValidPath } from '@/utilities'
import type { 
  TServiceResult, 
  TUserRegistrationData, 
  TUserProfile, 
  TUserPreferencesUpdate 
} from './types'
import type { TCreateUserData, TUpdateUserData } from '@/repositories/types'

function validateUserRegistration(data: TUserRegistrationData): TServiceResult<null> {
  if (!data.username || !isValidUsername(data.username)) {
    return {
      success: false,
      error: 'Username must be 3-20 characters, alphanumeric and underscores only',
      code: 'INVALID_USERNAME'
    }
  }

  if (!data.preferences.mdxStoragePath || !isValidPath(data.preferences.mdxStoragePath)) {
    return {
      success: false,
      error: 'Invalid storage path provided',
      code: 'INVALID_STORAGE_PATH'
    }
  }

  if (!['turso', 'local'].includes(data.preferences.storageType)) {
    return {
      success: false,
      error: 'Storage type must be either "turso" or "local"',
      code: 'INVALID_STORAGE_TYPE'
    }
  }

  return { success: true }
}

function mapUserToProfile(user: any): TUserProfile {
  let preferences = {}
  try {
    preferences = JSON.parse(user.preferences || '{}')
  } catch {
    preferences = {}
  }

  return {
    id: user.id,
    name: user.name,
    preferences,
    storageType: user.storageType,
    isSetupComplete: user.isSetupComplete,
    createdAt: user.createdAt
  }
}

export async function registerUser(data: TUserRegistrationData): Promise<TServiceResult<TUserProfile>> {
  try {
    // Validate input data
    const validation = validateUserRegistration(data)
    if (!validation.success) {
      return validation
    }

    // Check if user already exists
    const existingUser = await findUserByName(data.username)
    if (existingUser.success && existingUser.data) {
      return {
        success: false,
        error: 'A user with this username already exists',
        code: 'USER_EXISTS'
      }
    }

    // Create user data
    const createUserData: TCreateUserData = {
      name: data.username,
      snippetsPath: data.preferences.mdxStoragePath,
      storageType: data.preferences.storageType,
      preferences: data.preferences
    }

    // Create user in database
    const result = await createUser(createUserData)
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to create user',
        code: 'CREATE_USER_FAILED'
      }
    }

    // Store user data in local storage
    const storage = getAppStorage()
    await storage.set(STORAGE_KEYS.USER_ID, result.data.id)
    await storage.set(STORAGE_KEYS.USER_NAME, result.data.name)
    await storage.set(STORAGE_KEYS.USER_PREFERENCES, data.preferences)
    await storage.set(STORAGE_KEYS.ONBOARDING_COMPLETED, true)

    const profile = mapUserToProfile(result.data)
    return { success: true, data: profile }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'REGISTRATION_ERROR'
    }
  }
}

export async function getUserProfile(id: number): Promise<TServiceResult<TUserProfile>> {
  try {
    const result = await findUserById(id)
    if (!result.success) {
      return {
        success: false,
        error: result.error,
        code: 'FETCH_USER_FAILED'
      }
    }

    if (!result.data) {
      return {
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      }
    }

    const profile = mapUserToProfile(result.data)
    return { success: true, data: profile }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'GET_PROFILE_ERROR'
    }
  }
}

export async function updateUserPreferences(
  id: number, 
  preferences: TUserPreferencesUpdate
): Promise<TServiceResult<TUserProfile>> {
  try {
    // Get current user
    const currentUser = await findUserById(id)
    if (!currentUser.success || !currentUser.data) {
      return {
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      }
    }

    // Parse current preferences
    let currentPreferences = {}
    try {
      currentPreferences = JSON.parse(currentUser.data.preferences)
    } catch {
      currentPreferences = {}
    }

    // Merge preferences
    const updatedPreferences = { ...currentPreferences, ...preferences }

    // Validate storage path if provided
    if (preferences.mdxStoragePath && !isValidPath(preferences.mdxStoragePath)) {
      return {
        success: false,
        error: 'Invalid storage path provided',
        code: 'INVALID_STORAGE_PATH'
      }
    }

    // Update user data
    const updateData: TUpdateUserData = {
      preferences: updatedPreferences
    }

    if (preferences.storageType) {
      updateData.storageType = preferences.storageType
    }

    if (preferences.mdxStoragePath) {
      updateData.snippetsPath = preferences.mdxStoragePath
    }

    const result = await updateUser(id, updateData)
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to update user preferences',
        code: 'UPDATE_PREFERENCES_FAILED'
      }
    }

    // Update local storage
    const storage = getAppStorage()
    await storage.set(STORAGE_KEYS.USER_PREFERENCES, updatedPreferences)

    const profile = mapUserToProfile(result.data)
    return { success: true, data: profile }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'UPDATE_PREFERENCES_ERROR'
    }
  }
}

export async function checkOnboardingStatus(): Promise<TServiceResult<boolean>> {
  try {
    const storage = getAppStorage()
    
    // Check local storage first
    const localCompletion = await storage.get(STORAGE_KEYS.ONBOARDING_COMPLETED)
    if (localCompletion) {
      return { success: true, data: true }
    }

    // Check database
    const result = await getSetupCompleteUserCount()
    if (!result.success) {
      return {
        success: false,
        error: result.error,
        code: 'CHECK_ONBOARDING_FAILED'
      }
    }

    const isComplete = (result.data || 0) > 0
    
    // Cache result in local storage
    if (isComplete) {
      await storage.set(STORAGE_KEYS.ONBOARDING_COMPLETED, true)
    }

    return { success: true, data: isComplete }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'CHECK_ONBOARDING_ERROR'
    }
  }
}

export async function getCurrentUser(): Promise<TServiceResult<TUserProfile>> {
  try {
    const storage = getAppStorage()
    const userId = await storage.get<number>(STORAGE_KEYS.USER_ID)

    if (!userId) {
      return {
        success: false,
        error: 'No current user found',
        code: 'NO_CURRENT_USER'
      }
    }

    return getUserProfile(userId)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'GET_CURRENT_USER_ERROR'
    }
  }
}

export async function switchStorageType(storageType: 'turso' | 'local'): Promise<TServiceResult<TUserProfile>> {
  try {
    const currentUserResult = await getCurrentUser()
    if (!currentUserResult.success || !currentUserResult.data) {
      return currentUserResult
    }

    return updateUserPreferences(currentUserResult.data.id, { storageType })
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'SWITCH_STORAGE_ERROR'
    }
  }
}

export function getDefaultMdxPath(): string {
  return DEFAULT_MDX_STORAGE_PATH
}
