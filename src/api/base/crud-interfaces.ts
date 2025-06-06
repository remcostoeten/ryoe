import type { TApiResponse, TPaginatedResponse } from '@/types/notes'

// Generic CRUD operations - using T prefix for enterprise architecture
export type TCrudOperations<T, CreateInput, UpdateInput> = {
  create(input: CreateInput): Promise<TApiResponse<T>>
  getById(id: number): Promise<TApiResponse<T>>
  update(input: UpdateInput): Promise<TApiResponse<T>>
  delete(id: number): Promise<TApiResponse<boolean>>
  list(params?: Record<string, any>): Promise<TApiResponse<T[]>>
}

// Paginated CRUD operations - using T prefix
export type TPaginatedCrudOperations<T, CreateInput, UpdateInput> =
  TCrudOperations<T, CreateInput, UpdateInput> & {
  listPaginated(
    page: number,
    pageSize: number,
    params?: Record<string, any>
  ): Promise<TApiResponse<TPaginatedResponse<T>>>
}

// Hierarchical operations - using T prefix for enterprise architecture
export type THierarchicalOperations<T> = {
  getChildren(parentId: number | null): Promise<TApiResponse<T[]>>
  getAncestors(id: number): Promise<TApiResponse<T[]>>
  getDescendants(id: number): Promise<TApiResponse<T[]>>
  move(id: number, newParentId: number | null, newPosition: number): Promise<TApiResponse<T>>
  reorder(parentId: number | null, itemIds: number[]): Promise<TApiResponse<T[]>>
}

// Search operations - using T prefix
export type TSearchOperations<T> = {
  search(query: string, params?: Record<string, any>): Promise<TApiResponse<T[]>>
  searchPaginated(
    query: string,
    page: number,
    pageSize: number,
    params?: Record<string, any>
  ): Promise<TApiResponse<TPaginatedResponse<T>>>
}

// Bulk operations - using T prefix
export type TBulkOperations<T> = {
  bulkCreate(items: any[]): Promise<TApiResponse<T[]>>
  bulkUpdate(items: any[]): Promise<TApiResponse<T[]>>
  bulkDelete(ids: number[]): Promise<TApiResponse<boolean>>
}

// Position management - using T prefix
export type TPositionOperations<T> = {
  updatePosition(id: number, newPosition: number): Promise<TApiResponse<T>>
  getNextPosition(parentId?: number | null): Promise<TApiResponse<number>>
  reorderItems(parentId: number | null, itemIds: number[]): Promise<TApiResponse<T[]>>
}

// Pure function helpers for CRUD operations - enterprise architecture
export function handleError(error: unknown, operation: string): TApiResponse<never> {
  console.error(`${operation} failed:`, error)
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error occurred'
  }
}

export function createSuccessResponse<U>(data: U, message?: string): TApiResponse<U> {
  return {
    success: true,
    data,
    message
  }
}

export function validateRequired(value: any, fieldName: string): void {
  if (value === null || value === undefined || value === '') {
    throw new Error(`${fieldName} is required`)
  }
}

export function validateId(id: number): void {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('Invalid ID provided')
  }
}

// Pure function helper for hierarchical operations - enterprise architecture
export async function validateHierarchy<T extends { id: number }>(
  itemId: number,
  newParentId: number | null,
  getDescendants: (id: number) => Promise<TApiResponse<T[]>>
): Promise<boolean> {
  if (newParentId === null) return true
  if (itemId === newParentId) return false

  try {
    const descendants = await getDescendants(itemId)
    if (!descendants.success || !descendants.data) return true

    return !descendants.data.some((item: T) => item.id === newParentId)
  } catch {
    return false
  }
}

// Database transaction operations - using T prefix
export type TDatabaseTransaction = {
  execute<T>(operation: () => Promise<T>): Promise<T>
  rollback(): Promise<void>
  commit(): Promise<void>
}

// Cache operations for performance optimization - using T prefix
export type TCacheOperations<T> = {
  get(key: string): Promise<T | null>
  set(key: string, value: T, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
}
