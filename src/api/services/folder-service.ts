import { getTursoClient } from '@/lib/database/turso-client'
import { BaseHierarchicalService } from '@/api/base/crud-interfaces'
import type { 
  Folder, 
  CreateFolderInput, 
  UpdateFolderInput, 
  MoveFolderInput,
  ReorderFoldersInput,
  DeleteFolderOptions,
  ApiResponse,
  FolderWithChildren,
  FolderTreeNode
} from '@/types/notes'

export class FolderService extends BaseHierarchicalService<Folder> {
  
  async create(input: CreateFolderInput): Promise<ApiResponse<Folder>> {
    try {
      this.validateRequired(input.name, 'name')
      
      const client = getTursoClient()
      const now = Math.floor(Date.now() / 1000)
      
      // Get next position if not provided
      const position = input.position ?? await this.getNextPositionValue(input.parentId)
      
      const result = await client.execute({
        sql: `INSERT INTO folders (name, parent_id, position, is_public, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          input.name,
          input.parentId ?? null,
          position,
          input.isPublic ? 1 : 0,
          now,
          now
        ]
      })

      if (!result.lastInsertRowid) {
        throw new Error('Failed to create folder')
      }

      const folderId = Number(result.lastInsertRowid)
      const folder = await this.getById(folderId)
      
      return folder
    } catch (error) {
      return this.handleError(error, 'Create folder')
    }
  }

  async getById(id: number): Promise<ApiResponse<Folder>> {
    try {
      this.validateId(id)
      
      const client = getTursoClient()
      const result = await client.execute({
        sql: 'SELECT * FROM folders WHERE id = ?',
        args: [id]
      })

      if (!result.rows.length) {
        return {
          success: false,
          error: 'Folder not found'
        }
      }

      const row = result.rows[0]
      const folder = this.mapRowToFolder(row)
      
      return this.createSuccessResponse(folder)
    } catch (error) {
      return this.handleError(error, 'Get folder by ID')
    }
  }

  async update(input: UpdateFolderInput): Promise<ApiResponse<Folder>> {
    try {
      this.validateId(input.id)
      
      // Validate hierarchy if parentId is being changed
      if (input.parentId !== undefined) {
        const isValidHierarchy = await this.validateHierarchy(input.id, input.parentId)
        if (!isValidHierarchy) {
          return {
            success: false,
            error: 'Invalid hierarchy: would create circular reference'
          }
        }
      }

      const client = getTursoClient()
      const now = Math.floor(Date.now() / 1000)
      
      // Build dynamic update query
      const updates: string[] = []
      const args: any[] = []
      
      if (input.name !== undefined) {
        updates.push('name = ?')
        args.push(input.name)
      }
      
      if (input.parentId !== undefined) {
        updates.push('parent_id = ?')
        args.push(input.parentId)
      }
      
      if (input.position !== undefined) {
        updates.push('position = ?')
        args.push(input.position)
      }
      
      if (input.isPublic !== undefined) {
        updates.push('is_public = ?')
        args.push(input.isPublic ? 1 : 0)
      }
      
      updates.push('updated_at = ?')
      args.push(now)
      args.push(input.id)

      await client.execute({
        sql: `UPDATE folders SET ${updates.join(', ')} WHERE id = ?`,
        args
      })

      return await this.getById(input.id)
    } catch (error) {
      return this.handleError(error, 'Update folder')
    }
  }

  async delete(id: number, options?: DeleteFolderOptions): Promise<ApiResponse<boolean>> {
    try {
      this.validateId(id)
      
      const client = getTursoClient()
      
      // Check if folder has children
      const children = await this.getChildren(id)
      if (children.success && children.data && children.data.length > 0) {
        if (options?.deleteChildren) {
          // Recursively delete all children
          for (const child of children.data) {
            await this.delete(child.id, { deleteChildren: true })
          }
        } else {
          // Move children to parent
          const folder = await this.getById(id)
          if (folder.success && folder.data) {
            for (const child of children.data) {
              await this.update({
                id: child.id,
                parentId: folder.data.parentId
              })
            }
          }
        }
      }

      // Delete the folder
      await client.execute({
        sql: 'DELETE FROM folders WHERE id = ?',
        args: [id]
      })

      return this.createSuccessResponse(true, 'Folder deleted successfully')
    } catch (error) {
      return this.handleError(error, 'Delete folder')
    }
  }

  async list(params?: { parentId?: number | null; isPublic?: boolean }): Promise<ApiResponse<Folder[]>> {
    try {
      const client = getTursoClient()
      
      let sql = 'SELECT * FROM folders'
      const args: any[] = []
      const conditions: string[] = []
      
      if (params?.parentId !== undefined) {
        if (params.parentId === null) {
          conditions.push('parent_id IS NULL')
        } else {
          conditions.push('parent_id = ?')
          args.push(params.parentId)
        }
      }
      
      if (params?.isPublic !== undefined) {
        conditions.push('is_public = ?')
        args.push(params.isPublic ? 1 : 0)
      }
      
      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ')
      }
      
      sql += ' ORDER BY position ASC, name ASC'

      const result = await client.execute({ sql, args })
      const folders = result.rows.map(row => this.mapRowToFolder(row))
      
      return this.createSuccessResponse(folders)
    } catch (error) {
      return this.handleError(error, 'List folders')
    }
  }

  async getChildren(parentId: number | null): Promise<ApiResponse<Folder[]>> {
    return this.list({ parentId })
  }

  async getAncestors(id: number): Promise<ApiResponse<Folder[]>> {
    try {
      this.validateId(id)
      
      const ancestors: Folder[] = []
      let currentId: number | null = id
      
      while (currentId !== null) {
        const folder = await this.getById(currentId)
        if (!folder.success || !folder.data) break
        
        ancestors.unshift(folder.data)
        currentId = folder.data.parentId
      }
      
      // Remove the original folder from ancestors
      ancestors.pop()
      
      return this.createSuccessResponse(ancestors)
    } catch (error) {
      return this.handleError(error, 'Get ancestors')
    }
  }

  async getDescendants(id: number): Promise<ApiResponse<Folder[]>> {
    try {
      this.validateId(id)
      
      const descendants: Folder[] = []
      
      const collectDescendants = async (parentId: number) => {
        const children = await this.getChildren(parentId)
        if (children.success && children.data) {
          for (const child of children.data) {
            descendants.push(child)
            await collectDescendants(child.id)
          }
        }
      }
      
      await collectDescendants(id)
      
      return this.createSuccessResponse(descendants)
    } catch (error) {
      return this.handleError(error, 'Get descendants')
    }
  }

  async move(id: number, newParentId: number | null, newPosition: number): Promise<ApiResponse<Folder>> {
    try {
      const isValidHierarchy = await this.validateHierarchy(id, newParentId)
      if (!isValidHierarchy) {
        return {
          success: false,
          error: 'Invalid move: would create circular reference'
        }
      }

      return await this.update({
        id,
        parentId: newParentId,
        position: newPosition
      })
    } catch (error) {
      return this.handleError(error, 'Move folder')
    }
  }

  async reorder(parentId: number | null, itemIds: number[]): Promise<ApiResponse<Folder[]>> {
    try {
      const client = getTursoClient()
      const now = Math.floor(Date.now() / 1000)
      
      // Update positions for all folders
      for (let i = 0; i < itemIds.length; i++) {
        await client.execute({
          sql: 'UPDATE folders SET position = ?, updated_at = ? WHERE id = ?',
          args: [i, now, itemIds[i]]
        })
      }
      
      // Return updated folders
      return await this.list({ parentId })
    } catch (error) {
      return this.handleError(error, 'Reorder folders')
    }
  }

  // Helper methods
  private async getNextPositionValue(parentId: number | null): Promise<number> {
    try {
      const client = getTursoClient()
      const result = await client.execute({
        sql: parentId === null 
          ? 'SELECT COALESCE(MAX(position), -1) + 1 as next_position FROM folders WHERE parent_id IS NULL'
          : 'SELECT COALESCE(MAX(position), -1) + 1 as next_position FROM folders WHERE parent_id = ?',
        args: parentId === null ? [] : [parentId]
      })
      
      return Number(result.rows[0]?.next_position) || 0
    } catch {
      return 0
    }
  }

  private mapRowToFolder(row: any): Folder {
    return {
      id: Number(row.id),
      name: String(row.name),
      parentId: row.parent_id ? Number(row.parent_id) : null,
      position: Number(row.position),
      isPublic: Boolean(row.is_public),
      createdAt: new Date(Number(row.created_at) * 1000),
      updatedAt: new Date(Number(row.updated_at) * 1000)
    }
  }
}
