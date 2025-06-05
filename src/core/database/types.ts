import type { Client } from '@libsql/client'

export type DatabaseClient = Client

export type DatabaseConfig = {
  url: string
  authToken?: string
}

export type DatabaseHealthStatus = 'checking' | 'healthy' | 'error' | 'disconnected'

export type DatabaseHealth = {
  status: DatabaseHealthStatus
  message: string
  lastChecked: Date
  responseTime?: number
}

export type QueryResult = {
  rows: any[]
  lastInsertRowid?: number | bigint
  changes?: number
}

export type ExecuteOptions = {
  sql: string
  args?: any[]
}
