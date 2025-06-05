import { getTursoClient } from '@/core/database/clients/turso-client'
import { getAppStorage } from '@/core/storage'
import type { UserPreferences, OnboardingData } from '../types/onboarding'

export async function checkOnboardingStatus(): Promise<boolean> {
  try {
    const storage = getAppStorage()

    // First check if we have any stored completion flag in localStorage
    const storedCompletion = await storage.get('onboarding.completed')
    if (storedCompletion) {
      return true
    }

    const client = getTursoClient()
    const result = await client.execute({
      sql: 'SELECT COUNT(*) as count FROM users WHERE is_setup_complete = 1'
    })

    const count = Number(result.rows[0]?.count) || 0
    const isComplete = count > 0

    // Store the result for faster future checks
    if (isComplete) {
      await storage.set('onboarding.completed', true)
    }

    return isComplete
  } catch (error) {
    console.error('Failed to check onboarding status:', error)
    // If database fails, check localStorage as fallback
    const storage = getAppStorage()
    const storedCompletion = await storage.get('onboarding.completed')
    return Boolean(storedCompletion)
  }
}

export async function completeOnboarding(data: OnboardingData): Promise<number> {
  try {
    const client = getTursoClient()
    const now = Math.floor(Date.now() / 1000)

    const result = await client.execute({
      sql: `INSERT INTO users (name, snippets_path, is_setup_complete, storage_type, preferences, created_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        data.username,
        data.preferences.mdxStoragePath,
        1, // is_setup_complete = true
        data.preferences.storageType,
        JSON.stringify(data.preferences),
        now
      ]
    })

    if (result.lastInsertRowid) {
      const userId = Number(result.lastInsertRowid)
      const storage = getAppStorage()

      // Store user preferences in local storage as well
      await storage.set('user.preferences', data.preferences)
      await storage.set('user.id', userId)
      await storage.set('user.name', data.username)
      await storage.set('onboarding.completed', true)

      console.log('Onboarding completed for user:', userId)
      return userId
    } else {
      throw new Error('Failed to complete onboarding')
    }
  } catch (error) {
    console.error('Failed to complete onboarding:', error)

    // Fallback: store in localStorage even if database fails
    const userId = Date.now() // Use timestamp as fallback ID
    const storage = getAppStorage()
    await storage.set('user.preferences', data.preferences)
    await storage.set('user.id', userId)
    await storage.set('user.name', data.username)
    await storage.set('onboarding.completed', true)

    console.log('Onboarding completed with localStorage fallback:', userId)
    return userId
  }
}

export async function getCurrentUser(): Promise<{ id: number; name: string; preferences: UserPreferences } | null> {
  try {
    const client = getTursoClient()
    const result = await client.execute({
      sql: 'SELECT * FROM users WHERE is_setup_complete = 1 LIMIT 1'
    })
    
    if (result.rows.length > 0) {
      const user = result.rows[0]
      return {
        id: Number(user.id),
        name: String(user.name),
        preferences: JSON.parse(String(user.preferences || '{}'))
      }
    }
    
    return null
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
    
    const updatedPreferences = { ...currentUser.preferences, ...preferences }
    
    const client = getTursoClient()
    await client.execute({
      sql: 'UPDATE users SET preferences = ?, storage_type = ? WHERE id = ?',
      args: [
        JSON.stringify(updatedPreferences),
        updatedPreferences.storageType,
        currentUser.id
      ]
    })
    
    // Update local storage
    const storage = getAppStorage()
    await storage.set('user.preferences', updatedPreferences)
    
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
