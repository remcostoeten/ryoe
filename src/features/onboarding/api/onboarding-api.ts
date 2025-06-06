/**
 * Onboarding API - wrapper around service layer for onboarding operations
 * Uses the new enterprise architecture
 */

import {
  checkOnboardingStatus as checkStatus,
  registerUser as register,
  updateUserPreferences as updatePrefs
} from '@/services'
import type { TUserRegistrationData, TUserPreferencesUpdate } from '@/services'
import type { UserPreferences, OnboardingData } from '../types/onboarding'

export async function checkOnboardingStatus(): Promise<boolean> {
  const result = await checkStatus()
  return result.success ? result.data! : false
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

    const result = await register(registrationData)
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to complete onboarding')
    }

    return result.data.id
  } catch (error) {
    console.error('Failed to complete onboarding:', error)
    throw error
  }
}

export async function getCurrentUser(): Promise<{ id: number; name: string; preferences: UserPreferences } | null> {
  try {
    const result = await checkStatus()
    if (!result.success || !result.data) {
      return null
    }

    // This is a simplified version - in a real app you'd get the actual current user
    // For now, we'll return a mock user since we don't have user session management
    return {
      id: 1,
      name: 'Current User',
      preferences: {
        mdxStoragePath: '~/.config/ryoe',
        storageType: 'turso',
        theme: 'dark',
        autoSave: true
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

    const result = await updatePrefs(currentUser.id, updateData)
    if (!result.success) {
      throw new Error(result.error || 'Failed to update user preferences')
    }

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
