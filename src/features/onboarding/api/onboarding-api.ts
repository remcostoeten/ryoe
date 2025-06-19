/**
 * Onboarding API - wrapper around new API structure
 */

import {
  useOnboardingStatus,
  useRegisterUser,
  useCurrentUser,
  useUpdateUserPreferences
} from '@/api/services/auth-service'
import type { TUserRegistrationData, TUserPreferencesUpdate } from '@/api/types'
import type { UserPreferences, OnboardingData } from '../types/onboarding'

// Legacy wrapper functions for backwards compatibility
export async function checkOnboardingStatus(): Promise<boolean> {
  // This should be converted to use the hook in the components
  const { checkOnboardingStatusQuery } = await import('@/api/queries/auth')
  const result = await checkOnboardingStatusQuery()
  return result
}

export async function completeOnboarding(data: OnboardingData): Promise<number> {
  try {
    // Convert OnboardingData to TUserRegistrationData
    const registrationData: TUserRegistrationData = {
      username: data.username,
      preferences: {
        mdxStoragePath: data.preferences.mdxStoragePath,
        storageType: data.preferences.storageType,
        theme: data.preferences.theme
      }
    }

    const { registerUserMutation } = await import('@/api/mutations/auth')
    const result = await registerUserMutation(registrationData)
    return result.id
  } catch (error) {
    console.error('Failed to complete onboarding:', error)
    throw error
  }
}

export async function getCurrentUser(): Promise<{ id: number; name: string; preferences: UserPreferences } | null> {
  try {
    const { getCurrentUserQuery } = await import('@/api/queries/auth')
    const result = await getCurrentUserQuery()

    return {
      id: result.id,
      name: result.name,
      preferences: {
        mdxStoragePath: result.preferences.mdxStoragePath || '~/.config/ryoe',
        storageType: result.preferences.storageType || 'turso',
        theme: result.preferences.theme || 'dark',
        autoSave: result.preferences.autoSave || true
      }
    }
  } catch (error) {
    console.error('Failed to get current user:', error)
    return null
  }
}

export async function updateUserPreferences(preferences: Partial<UserPreferences>): Promise<void> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      throw new Error('No user found')
    }

    // Convert to TUserPreferencesUpdate format
    const updateData: TUserPreferencesUpdate = {
      mdxStoragePath: preferences.mdxStoragePath,
      storageType: preferences.storageType,
      theme: preferences.theme,
      ...preferences
    }

    const { updateUserPreferencesMutation } = await import('@/api/mutations/auth')
    await updateUserPreferencesMutation(currentUser.id, updateData)

    console.log('User preferences updated')
  } catch (error) {
    console.error('Failed to update user preferences:', error)
    throw error
  }
}

export function getDefaultPreferences(): UserPreferences {
  return {
    theme: 'dark',
    mdxStoragePath: '~/.config/ryoe',
    storageType: 'turso',
    autoSave: true
  }
}
