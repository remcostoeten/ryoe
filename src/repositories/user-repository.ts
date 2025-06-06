/**
 * User repository - pure functions for user data access
 */

import { findById, findMany, create, update, deleteById } from './base-repository'
import { getTursoClient } from '@/core/database/clients/turso-client'
import type { 
  TUser, 
  TCreateUserData, 
  TUpdateUserData, 
  TRepositoryResult, 
  TRepositoryListResult,
  TPaginationOptions,
  TSortOptions,
  TFilterOptions
} from './types'

const TABLE_NAME = 'users'

function mapRowToUser(row: any): TUser {
  return {
    id: Number(row.id),
    name: String(row.name),
    snippetsPath: String(row.snippets_path),
    isSetupComplete: Boolean(row.is_setup_complete),
    storageType: String(row.storage_type) as 'turso' | 'local',
    preferences: String(row.preferences || '{}'),
    createdAt: Number(row.created_at),
    updatedAt: row.updated_at ? Number(row.updated_at) : undefined
  }
}

function mapUserDataToRow(data: TCreateUserData | TUpdateUserData): Record<string, any> {
  const row: Record<string, any> = {}
  
  if ('name' in data && data.name !== undefined) {
    row.name = data.name
  }
  if ('snippetsPath' in data && data.snippetsPath !== undefined) {
    row.snippets_path = data.snippetsPath
  }
  if ('storageType' in data && data.storageType !== undefined) {
    row.storage_type = data.storageType
  }
  if ('preferences' in data && data.preferences !== undefined) {
    row.preferences = JSON.stringify(data.preferences)
  }
  
  return row
}

export async function findUserById(id: number): Promise<TRepositoryResult<TUser>> {
  return findById(TABLE_NAME, id, mapRowToUser)
}

export async function findUsers(options?: {
  filters?: TFilterOptions
  sort?: TSortOptions
  pagination?: TPaginationOptions
}): Promise<TRepositoryListResult<TUser>> {
  return findMany(TABLE_NAME, mapRowToUser, options)
}

export async function findUserByName(name: string): Promise<TRepositoryResult<TUser>> {
  const result = await findUsers({
    filters: { name },
    pagination: { limit: 1 }
  })
  
  if (!result.success) {
    return { success: false, error: result.error }
  }
  
  const user = result.data?.[0]
  return { success: true, data: user }
}

export async function findSetupCompleteUsers(): Promise<TRepositoryListResult<TUser>> {
  return findUsers({
    filters: { is_setup_complete: 1 },
    sort: { field: 'created_at', direction: 'desc' }
  })
}

export async function createUser(data: TCreateUserData): Promise<TRepositoryResult<TUser>> {
  const rowData = {
    ...mapUserDataToRow(data),
    is_setup_complete: 1 // Mark as setup complete when creating through onboarding
  }

  return create(TABLE_NAME, rowData, mapRowToUser)
}

export async function updateUser(id: number, data: TUpdateUserData): Promise<TRepositoryResult<TUser>> {
  const rowData = mapUserDataToRow(data)
  return update(TABLE_NAME, id, rowData, mapRowToUser)
}

export async function markUserSetupComplete(id: number): Promise<TRepositoryResult<TUser>> {
  try {
    const client = getTursoClient()
    await client.execute({
      sql: 'UPDATE users SET is_setup_complete = 1 WHERE id = ?',
      args: [id]
    })

    // Return the updated user
    return findUserById(id)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark user setup complete'
    }
  }
}

export async function markAllUsersSetupComplete(): Promise<TRepositoryResult<boolean>> {
  try {
    const client = getTursoClient()
    await client.execute('UPDATE users SET is_setup_complete = 1 WHERE is_setup_complete = 0')

    return { success: true, data: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark all users setup complete'
    }
  }
}

export async function deleteUser(id: number): Promise<TRepositoryResult<boolean>> {
  return deleteById(TABLE_NAME, id)
}

export async function getUserCount(): Promise<TRepositoryResult<number>> {
  try {
    const result = await findUsers()
    if (!result.success) {
      return { success: false, error: result.error }
    }
    
    return { success: true, data: result.data?.length || 0 }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function getSetupCompleteUserCount(): Promise<TRepositoryResult<number>> {
  try {
    const result = await findSetupCompleteUsers()
    if (!result.success) {
      return { success: false, error: result.error }
    }
    
    return { success: true, data: result.data?.length || 0 }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
