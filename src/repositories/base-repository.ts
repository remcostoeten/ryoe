/**
 * Base repository functions for common CRUD operations
 * Pure functions only, no classes
 */

import { getTursoClient } from '@/core/database/clients/turso-client'

import type { TRepositoryResult, TRepositoryListResult, TPaginationOptions, TSortOptions, TFilterOptions } from './types'

export type TBaseEntity = {
  id: number
  createdAt: number
  updatedAt?: number
}

export type TCreateEntityData = Record<string, any>
export type TUpdateEntityData = Record<string, any>

function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000)
}

function buildWhereClause(filters: TFilterOptions): { sql: string; args: any[] } {
  if (!filters || Object.keys(filters).length === 0) {
    return { sql: '', args: [] }
  }

  const conditions: string[] = []
  const args: any[] = []

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      conditions.push(`${key} = ?`)
      args.push(value)
    }
  })

  return {
    sql: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    args
  }
}

function buildOrderClause(sort?: TSortOptions): string {
  if (!sort) return 'ORDER BY created_at DESC'
  return `ORDER BY ${sort.field} ${sort.direction.toUpperCase()}`
}

function buildLimitClause(pagination?: TPaginationOptions): { sql: string; args: any[] } {
  if (!pagination) return { sql: '', args: [] }

  const { limit, offset } = pagination
  const args: any[] = []
  let sql = ''

  if (limit) {
    sql += ' LIMIT ?'
    args.push(limit)
  }

  if (offset) {
    sql += ' OFFSET ?'
    args.push(offset)
  }

  return { sql, args }
}

export async function findById<T extends TBaseEntity>(
  tableName: string,
  id: number,
  mapRowToEntity: (row: any) => T
): Promise<TRepositoryResult<T>> {
  try {
    const client = getTursoClient()
    const result = await client.execute({
      sql: `SELECT * FROM ${tableName} WHERE id = ?`,
      args: [id]
    })

    if (result.rows.length === 0) {
      return { success: true, data: undefined }
    }

    const entity = mapRowToEntity(result.rows[0])
    return { success: true, data: entity }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function findMany<T extends TBaseEntity>(
  tableName: string,
  mapRowToEntity: (row: any) => T,
  options?: {
    filters?: TFilterOptions
    sort?: TSortOptions
    pagination?: TPaginationOptions
  }
): Promise<TRepositoryListResult<T>> {
  try {
    const client = getTursoClient()

    const whereClause = buildWhereClause(options?.filters || {})
    const orderClause = buildOrderClause(options?.sort)
    const limitClause = buildLimitClause(options?.pagination)

    const sql = `SELECT * FROM ${tableName} ${whereClause.sql} ${orderClause} ${limitClause.sql}`
    const args = [...whereClause.args, ...limitClause.args]

    const result = await client.execute({ sql, args })
    const entities = result.rows.map(mapRowToEntity)

    // Get total count for pagination
    let total: number | undefined
    if (options?.pagination) {
      const countSql = `SELECT COUNT(*) as count FROM ${tableName} ${whereClause.sql}`
      const countResult = await client.execute({ sql: countSql, args: whereClause.args })
      total = Number(countResult.rows[0]?.count) || 0
    }

    return { success: true, data: entities, total }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function create<T extends TBaseEntity>(
  tableName: string,
  data: TCreateEntityData,
  mapRowToEntity: (row: any) => T
): Promise<TRepositoryResult<T>> {
  try {
    console.log(`Creating entity in table: ${tableName}`, data)

    const client = getTursoClient()
    const now = getCurrentTimestamp()

    const dataWithTimestamp = {
      ...data,
      created_at: now,
      updated_at: now
    }

    const columns = Object.keys(dataWithTimestamp)
    const placeholders = columns.map(() => '?').join(', ')
    const values = Object.values(dataWithTimestamp)

    const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`
    console.log('Executing SQL:', sql, 'with values:', values)

    const result = await client.execute({ sql, args: values })
    console.log('Insert result:', result)

    if (!result.lastInsertRowid) {
      console.error('No lastInsertRowid returned from database')
      return { success: false, error: 'Failed to create entity' }
    }

    // Fetch the created entity
    const createdEntity = await findById(tableName, Number(result.lastInsertRowid), mapRowToEntity)
    console.log('Created entity:', createdEntity)
    return createdEntity
  } catch (error) {
    console.error(`Error creating entity in ${tableName}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function update<T extends TBaseEntity>(
  tableName: string,
  id: number,
  data: TUpdateEntityData,
  mapRowToEntity: (row: any) => T
): Promise<TRepositoryResult<T>> {
  try {
    const client = getTursoClient()
    const now = getCurrentTimestamp()

    const dataWithTimestamp = {
      ...data,
      updated_at: now
    }

    const columns = Object.keys(dataWithTimestamp)
    const setClause = columns.map(col => `${col} = ?`).join(', ')
    const values = [...Object.values(dataWithTimestamp), id]

    const sql = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`
    await client.execute({ sql, args: values })

    // Fetch the updated entity
    const updatedEntity = await findById(tableName, id, mapRowToEntity)
    return updatedEntity
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function deleteById(tableName: string, id: number): Promise<TRepositoryResult<boolean>> {
  try {
    const client = getTursoClient()
    const result = await client.execute({
      sql: `DELETE FROM ${tableName} WHERE id = ?`,
      args: [id]
    })

    const success = (result.rowsAffected || 0) > 0
    return { success: true, data: success }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
