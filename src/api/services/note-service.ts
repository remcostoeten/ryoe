import { getTursoClient } from '@/core/database/clients/turso-client'
import { BaseService } from '@/api/base/crud-interfaces'
import type { 
  Note, 
  CreateNoteInput, 
  UpdateNoteInput,
  ApiResponse
} from '@/types/notes'

export class NoteService extends BaseService<Note> {
  
  async create(input: CreateNoteInput): Promise<ApiResponse<Note>> {
    try {
      this.validateRequired(input.title, 'title')
      this.validateRequired(input.content, 'content')
      
      const client = getTursoClient()
      const now = Math.floor(Date.now() / 1000)
      
      // Get next position if not provided
      const position = input.position ?? await this.getNextPositionValue(input.folderId)
      
      const result = await client.execute({
        sql: `INSERT INTO notes (title, content, folder_id, position, is_public, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          input.title,
          input.content,
          input.folderId ?? null,
          position,
          input.isPublic ? 1 : 0,
          now,
          now
        ]
      })

      if (!result.lastInsertRowid) {
        throw new Error('Failed to create note')
      }

      const noteId = Number(result.lastInsertRowid)
      const note = await this.getById(noteId)
      
      return note
    } catch (error) {
      return this.handleError(error, 'Create note')
    }
  }

  async getById(id: number): Promise<ApiResponse<Note>> {
    try {
      this.validateId(id)
      
      const client = getTursoClient()
      const result = await client.execute({
        sql: 'SELECT * FROM notes WHERE id = ?',
        args: [id]
      })

      if (!result.rows.length) {
        return {
          success: false,
          error: 'Note not found'
        }
      }

      const row = result.rows[0]
      const note = this.mapRowToNote(row)
      
      return this.createSuccessResponse(note)
    } catch (error) {
      return this.handleError(error, 'Get note by ID')
    }
  }

  async update(input: UpdateNoteInput): Promise<ApiResponse<Note>> {
    try {
      this.validateId(input.id)
      
      const client = getTursoClient()
      const now = Math.floor(Date.now() / 1000)
      
      // Build dynamic update query
      const updates: string[] = []
      const args: any[] = []
      
      if (input.title !== undefined) {
        updates.push('title = ?')
        args.push(input.title)
      }
      
      if (input.content !== undefined) {
        updates.push('content = ?')
        args.push(input.content)
      }
      
      if (input.folderId !== undefined) {
        updates.push('folder_id = ?')
        args.push(input.folderId)
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
        sql: `UPDATE notes SET ${updates.join(', ')} WHERE id = ?`,
        args
      })

      return await this.getById(input.id)
    } catch (error) {
      return this.handleError(error, 'Update note')
    }
  }

  async delete(id: number): Promise<ApiResponse<boolean>> {
    try {
      this.validateId(id)
      
      const client = getTursoClient()
      
      await client.execute({
        sql: 'DELETE FROM notes WHERE id = ?',
        args: [id]
      })

      return this.createSuccessResponse(true, 'Note deleted successfully')
    } catch (error) {
      return this.handleError(error, 'Delete note')
    }
  }

  async list(params?: { folderId?: number | null; isPublic?: boolean }): Promise<ApiResponse<Note[]>> {
    try {
      const client = getTursoClient()
      
      let sql = 'SELECT * FROM notes'
      const args: any[] = []
      const conditions: string[] = []
      
      if (params?.folderId !== undefined) {
        if (params.folderId === null) {
          conditions.push('folder_id IS NULL')
        } else {
          conditions.push('folder_id = ?')
          args.push(params.folderId)
        }
      }
      
      if (params?.isPublic !== undefined) {
        conditions.push('is_public = ?')
        args.push(params.isPublic ? 1 : 0)
      }
      
      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ')
      }
      
      sql += ' ORDER BY position ASC, updated_at DESC'

      const result = await client.execute({ sql, args })
      const notes = result.rows.map(row => this.mapRowToNote(row))
      
      return this.createSuccessResponse(notes)
    } catch (error) {
      return this.handleError(error, 'List notes')
    }
  }

  async getByFolderId(folderId: number | null): Promise<ApiResponse<Note[]>> {
    return this.list({ folderId })
  }

  async move(id: number, newFolderId: number | null, newPosition: number): Promise<ApiResponse<Note>> {
    try {
      return await this.update({
        id,
        folderId: newFolderId,
        position: newPosition
      })
    } catch (error) {
      return this.handleError(error, 'Move note')
    }
  }

  async reorder(folderId: number | null, itemIds: number[]): Promise<ApiResponse<Note[]>> {
    try {
      const client = getTursoClient()
      const now = Math.floor(Date.now() / 1000)
      
      // Update positions for all notes
      for (let i = 0; i < itemIds.length; i++) {
        await client.execute({
          sql: 'UPDATE notes SET position = ?, updated_at = ? WHERE id = ?',
          args: [i, now, itemIds[i]]
        })
      }
      
      // Return updated notes
      return await this.list({ folderId })
    } catch (error) {
      return this.handleError(error, 'Reorder notes')
    }
  }

  // Helper methods
  private async getNextPositionValue(folderId: number | null): Promise<number> {
    try {
      const client = getTursoClient()
      const result = await client.execute({
        sql: folderId === null 
          ? 'SELECT COALESCE(MAX(position), -1) + 1 as next_position FROM notes WHERE folder_id IS NULL'
          : 'SELECT COALESCE(MAX(position), -1) + 1 as next_position FROM notes WHERE folder_id = ?',
        args: folderId === null ? [] : [folderId]
      })
      
      return Number(result.rows[0]?.next_position) || 0
    } catch {
      return 0
    }
  }

  private mapRowToNote(row: any): Note {
    return {
      id: Number(row.id),
      title: String(row.title),
      content: String(row.content),
      folderId: row.folder_id ? Number(row.folder_id) : null,
      position: Number(row.position),
      isPublic: Boolean(row.is_public),
      createdAt: new Date(Number(row.created_at) * 1000),
      updatedAt: new Date(Number(row.updated_at) * 1000)
    }
  }
}
