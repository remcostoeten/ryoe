import type { ApiResponse, PaginatedResponse } from '@/types/notes'

// Generic CRUD interface
export interface CrudOperations<T, CreateInput, UpdateInput> {
  create(input: CreateInput): Promise<ApiResponse<T>>
  getById(id: number): Promise<ApiResponse<T>>
  update(input: UpdateInput): Promise<ApiResponse<T>>
  delete(id: number): Promise<ApiResponse<boolean>>
  list(params?: Record<string, any>): Promise<ApiResponse<T[]>>
}

// Paginated CRUD interface
export interface PaginatedCrudOperations<T, CreateInput, UpdateInput> 
  extends CrudOperations<T, CreateInput, UpdateInput> {
  listPaginated(
    page: number, 
    pageSize: number, 
    params?: Record<string, any>
  ): Promise<ApiResponse<PaginatedResponse<T>>>
}

// Hierarchical operations interface (for folders)
export interface HierarchicalOperations<T> {
  getChildren(parentId: number | null): Promise<ApiResponse<T[]>>
  getAncestors(id: number): Promise<ApiResponse<T[]>>
  getDescendants(id: number): Promise<ApiResponse<T[]>>
  move(id: number, newParentId: number | null, newPosition: number): Promise<ApiResponse<T>>
  reorder(parentId: number | null, itemIds: number[]): Promise<ApiResponse<T[]>>
}

// Search operations interface
export interface SearchOperations<T> {
  search(query: string, params?: Record<string, any>): Promise<ApiResponse<T[]>>
  searchPaginated(
    query: string, 
    page: number, 
    pageSize: number, 
    params?: Record<string, any>
  ): Promise<ApiResponse<PaginatedResponse<T>>>
}

// Bulk operations interface
export interface BulkOperations<T> {
  bulkCreate(items: any[]): Promise<ApiResponse<T[]>>
  bulkUpdate(items: any[]): Promise<ApiResponse<T[]>>
  bulkDelete(ids: number[]): Promise<ApiResponse<boolean>>
}

// Position management interface
export interface PositionOperations<T> {
  updatePosition(id: number, newPosition: number): Promise<ApiResponse<T>>
  getNextPosition(parentId?: number | null): Promise<ApiResponse<number>>
  reorderItems(parentId: number | null, itemIds: number[]): Promise<ApiResponse<T[]>>
}

// Abstract base class for CRUD operations
export abstract class BaseCrudService<T, CreateInput, UpdateInput> 
  implements CrudOperations<T, CreateInput, UpdateInput> {
  
  abstract create(input: CreateInput): Promise<ApiResponse<T>>
  abstract getById(id: number): Promise<ApiResponse<T>>
  abstract update(input: UpdateInput): Promise<ApiResponse<T>>
  abstract delete(id: number): Promise<ApiResponse<boolean>>
  abstract list(params?: Record<string, any>): Promise<ApiResponse<T[]>>

  // Helper method for error handling
  protected handleError(error: unknown, operation: string): ApiResponse<never> {
    console.error(`${operation} failed:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }

  // Helper method for success responses
  protected createSuccessResponse<U>(data: U, message?: string): ApiResponse<U> {
    return {
      success: true,
      data,
      message
    }
  }

  // Helper method for validation
  protected validateRequired(value: any, fieldName: string): void {
    if (value === null || value === undefined || value === '') {
      throw new Error(`${fieldName} is required`)
    }
  }

  // Helper method for ID validation
  protected validateId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid ID provided')
    }
  }
}

// Abstract base class for hierarchical operations
export abstract class BaseHierarchicalService<T> 
  extends BaseCrudService<T, any, any> 
  implements HierarchicalOperations<T> {
  
  abstract getChildren(parentId: number | null): Promise<ApiResponse<T[]>>
  abstract getAncestors(id: number): Promise<ApiResponse<T[]>>
  abstract getDescendants(id: number): Promise<ApiResponse<T[]>>
  abstract move(id: number, newParentId: number | null, newPosition: number): Promise<ApiResponse<T>>
  abstract reorder(parentId: number | null, itemIds: number[]): Promise<ApiResponse<T[]>>

  // Helper method to validate hierarchy (prevent circular references)
  protected async validateHierarchy(itemId: number, newParentId: number | null): Promise<boolean> {
    if (newParentId === null) return true
    if (itemId === newParentId) return false

    try {
      const descendants = await this.getDescendants(itemId)
      if (!descendants.success || !descendants.data) return true

      return !descendants.data.some((item: any) => item.id === newParentId)
    } catch {
      return false
    }
  }
}

// Database transaction interface
export interface DatabaseTransaction {
  execute<T>(operation: () => Promise<T>): Promise<T>
  rollback(): Promise<void>
  commit(): Promise<void>
}

// Cache interface for performance optimization
export interface CacheOperations<T> {
  get(key: string): Promise<T | null>
  set(key: string, value: T, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
}
